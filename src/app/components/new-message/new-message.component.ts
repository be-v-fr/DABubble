import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user.class';
import { Post } from '../../../models/post.class';
import { MembersOverviewComponent } from "../main-chat/members-overview/members-overview.component";
import { UsersService } from '../../../services/users.service';
import { TimeService } from '../../../services/time.service';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ChannelsService } from '../../../services/content/channels.service';
import { ReactionService } from '../../../services/content/reaction.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MessageBoxComponent, PickerComponent, MembersOverviewComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent implements OnInit, OnDestroy {
  emojiPicker = false;

  mainUser: User = new User;
  users: User[] = [];
  userChannels: Channel[] = [];

  searchInput: string = '';
  searchResultsChannels: Channel[] = [];
  searchResultsUsers: User[] = [];
  searchResultsPosts: Post[] = [];
  searchResultsPostsDisplay: string[] = [];
  searchResultsPostAuthors: string[] = [];
  postChannelIndices: number[] = [];
  hidingResults: boolean = false;

  @ViewChild('searchbar', { read: ElementRef }) searchbar!: ElementRef<HTMLInputElement>;
  public extended: 'channels' | 'users' | 'posts' | null = null;
  public reactionsPickerVisible = false;

  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private channelsService = inject(ChannelsService);
  private reactionsService = inject(ReactionService);
  public timeService = inject(TimeService);

  private channelsSub = new Subscription();
  private authSub = new Subscription();
  private usersSub = new Subscription();

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.syncCurrentUser();
    this.authSub = this.subAuth();
    this.reactionsService.reactionsPicker$.subscribe((rp) => {
      this.reactionsPickerVisible = rp;
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.usersSub.unsubscribe();
    this.channelsSub.unsubscribe();
  }

  subAuth(): Subscription {
    return this.authService.user$.subscribe((user) => {
      if (user) {
        // this.syncCurrentUser();
        // this.syncUsers();
        // this.setUserChannels(this.channelsService.channels);
        this.usersSub = this.subUsers();
      }
    });
  }

  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => {
      this.syncCurrentUser();
      this.syncUsers();
      this.setUserChannels(this.channelsService.channels);
      this.channelsSub = this.subChannels();
    });
  }

  subChannels(): Subscription {
    return this.channelsService.channels$.subscribe((channels: Channel[]) => this.setUserChannels(channels));
  }

  syncCurrentUser(): void {
    const uid = this.authService.getCurrentUid();
    if (uid) {
      const user = this.usersService.getUserByUid(uid);
      if (user) {
        this.mainUser = user;
      }
    }
  }

  syncUsers(): void {
    this.users = this.usersService.users;
  }

  setUserChannels(allChannels: Channel[]): void {
    this.userChannels = allChannels.filter(c => c.members.some(m => m.uid === this.mainUser.uid));
  }

  search(): void {
    if (this.searchInput.length > 0) {
      const term: string = this.searchInput.toLowerCase();
      this.triggerSearchCategories(term);
      this.hidingResults = false;
    } else {
      this.clearSearch();
    }
  }

  triggerSearchCategories(term: string) {
    if (term.startsWith('@')) {
      this.searchUsers(term.slice(1));
    } else if (term.startsWith('#')) {
      this.searchChannels(term.slice(1));
    } else {
      // this.searchChannels(term);
      // this.searchUsers(term);
      // this.searchPosts(term);
    }
  }

  searchChannels(term: string): void {
    if (term.startsWith(' ')) { term = term.slice(1) }
    this.searchResultsChannels = this.userChannels.filter(c => {
      return !c.isPmChannel &&
        (c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term));
    });
  }

  searchUsers(term: string): void {
    if (term.startsWith(' ')) { term = term.slice(1) }
    this.searchResultsUsers = this.users.filter(u => {
      return u.uid != this.mainUser.uid &&
        (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    });
  }

  onResultsClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.autofocusSearch();
  }

  onCloseSearchClick(): void {
    this.clearSearch();
    this.autofocusSearch();
  }

  autofocusSearch(): void {
    setTimeout(() => this.searchbar.nativeElement.focus(), 20);
  }

  toggleListExtension(list: 'channels' | 'users' | 'posts'): void {
    this.extended = (this.extended === list ? null : list);
  }

  clearSearch(): void {
    this.searchInput = '';
    this.searchResultsChannels = [];
    this.searchResultsUsers = [];
    this.searchResultsPosts = [];
    this.extended = null;
  }

  @HostListener('document:click', ['$event'])
  hideResults(): void {
    this.hidingResults = true;
  }

  openUserProfile(user: User): void {
    this.dialog.open(UserProfileCardComponent, { data: user });
    this.hideResults();
  }
}
