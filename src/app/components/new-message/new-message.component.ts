import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user.class';
import { MembersOverviewComponent } from "../main-chat/members-overview/members-overview.component";
import { UsersService } from '../../../services/users.service';
import { TimeService } from '../../../services/time.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ChannelsService } from '../../../services/content/channels.service';
import { ReactionService } from '../../../services/content/reaction.service';
import { FormsModule } from '@angular/forms';

/**
 * Component responsible for composing and sending new messages, including search and user/channel selection.
 */
@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MessageBoxComponent, PickerComponent, MembersOverviewComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent implements OnInit, OnDestroy {

  /** Indicates if the emoji picker is visible */
  emojiPicker = false;

  /** Main user data */
  mainUser: User = new User();

  /** List of all users */
  users: User[] = [];

  /** List of channels the user is a member of */
  userChannels: Channel[] = [];

  /** List of selected channels for posting messages */
  channelList: Channel[] = [];

  /** List of selected users for posting messages */
  userList: User[] = [];

  /** Search input value */
  searchInput: string = '';

  /** Search results for channels */
  searchResultsChannels: Channel[] = [];

  /** Search results for users */
  searchResultsUsers: User[] = [];

  /** Search results for post authors */
  searchResultsPostAuthors: string[] = [];

  /** Reference to the search input element */
  @ViewChild('searchbar', { read: ElementRef }) searchbar!: ElementRef<HTMLInputElement>;

  /** Extended list type (channels, users, posts) */
  public extended: 'channels' | 'users' | 'posts' | null = null;

  /** Indicates if the reactions picker is visible */
  public reactionsPickerVisible = false;

  /** Services injected into the component */
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private channelsService = inject(ChannelsService);
  private reactionsService = inject(ReactionService);
  public timeService = inject(TimeService);

  /** Subscriptions for various observables */
  private channelsSub = new Subscription();
  private authSub = new Subscription();
  private usersSub = new Subscription();

  constructor() { }

  /**
   * Initializes the component by syncing the current user and subscribing to observables.
   */
  ngOnInit(): void {
    this.syncCurrentUser();
    this.authSub = this.subAuth();
    this.reactionsService.reactionsPicker$.subscribe((rp) => {
      this.reactionsPickerVisible = rp;
    });
    this.mobilePlaceholder();
  }

  /**
   * Sets the placeholder for the search input based on window width.
   */
  mobilePlaceholder() {
    if (this.searchbar) {
      const placeholder = window.innerWidth <= 480 ? 'An: #channel, oder @jemand' : 'An: #channel, oder @jemand oder E-Mail Adresse';
      this.searchbar.nativeElement.placeholder = placeholder;
    }
  }

  /**
   * Adjusts the placeholder text when the window is resized.
   */
  @HostListener('window:resize')
  onResize() {
    this.mobilePlaceholder();
  }

  /**
   * Unsubscribes from all subscriptions to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.usersSub.unsubscribe();
    this.channelsSub.unsubscribe();
  }

  /**
   * Creates posts in the selected channels and user channels.
   * @param data - The data for the new post, including message and attachment source.
   */
  onCreatePost(data: any): void {
    if (this.channelList.length > 0) {
      this.channelList.forEach(c => {
        this.channelsService.addPostToChannel(c.channel_id, this.mainUser.uid, data.message, data.attachmentSrc);
      });
    }

    if (this.userList.length > 0) {
      let channelsToPostOn: Channel[] = [];

      this.userList.forEach(u => {
        const filteredChannels = this.userChannels.filter(c =>
          c.isPmChannel && c.members.some(m => m.uid === u.uid)
        );
        channelsToPostOn.push(...filteredChannels);
      });

      if (channelsToPostOn.length > 0) {
        channelsToPostOn.forEach(c => {
          this.channelsService.addPostToPmChannel(c.channel_id, this.mainUser.uid, data.message, data.attachmentSrc);
        });
      }
    }
    this.clearLists();
  }

  /**
   * Subscribes to authentication state changes.
   * @returns The subscription to authentication state changes.
   */
  subAuth(): Subscription {
    return this.authService.user$.subscribe((user) => {
      if (user) {
        this.usersSub = this.subUsers();
      }
    });
  }

  /**
   * Subscribes to user updates and channels.
   * @returns The subscription to user updates.
   */
  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => {
      this.syncCurrentUser();
      this.syncUsers();
      this.setUserChannels(this.channelsService.channels);
      this.channelsSub = this.subChannels();
    });
  }

  /**
   * Subscribes to channel updates.
   * @returns The subscription to channel updates.
   */
  subChannels(): Subscription {
    return this.channelsService.channels$.subscribe((channels: Channel[]) => this.setUserChannels(channels));
  }

  /**
   * Syncs the current user information based on the authenticated user's UID.
   */
  syncCurrentUser(): void {
    const uid = this.authService.getCurrentUid();
    if (uid) {
      const user = this.usersService.getUserByUid(uid);
      if (user) {
        this.mainUser = user;
      }
    }
  }

  /**
   * Syncs the list of all users.
   */
  syncUsers(): void {
    this.users = this.usersService.users;
  }

  /**
   * Sets the user's channels based on the list of all channels.
   * @param allChannels - The list of all channels.
   */
  setUserChannels(allChannels: Channel[]): void {
    this.userChannels = allChannels.filter(c => c.members.some(m => m.uid === this.mainUser.uid));
  }

  /**
   * Triggers a search based on the input value.
   */
  search(): void {
    if (this.searchInput.length > 0) {
      const term: string = this.searchInput.toLowerCase();
      this.triggerSearchCategories(term);
    } else {
      this.clearSearch();
    }
  }

  /**
   * Triggers search in different categories based on the input term.
   * @param term - The search term.
   */
  triggerSearchCategories(term: string) {
    if (term.startsWith('@')) {
      this.searchUsers(term.slice(1));
    } else if (term.startsWith('#')) {
      this.searchChannels(term.slice(1));
    } else {
      this.searchByEmail(term);
    }
  }

  /**
   * Searches for users by email.
   * @param term - The search term.
   */
  searchByEmail(term: string) {
    this.searchResultsUsers = this.users.filter(u => {
      return u.uid != this.mainUser.uid &&
        (u.email.toLowerCase().includes(term));
    });
  }

  /**
   * Searches for channels based on the search term.
   * @param term - The search term.
   */
  searchChannels(term: string): void {
    if (term.startsWith(' ')) { term = term.slice(1) }
    this.searchResultsChannels = this.userChannels.filter(c => {
      return !c.isPmChannel &&
        (c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term));
    });
  }

  /**
   * Searches for users based on the search term.
   * @param term - The search term.
   */
  searchUsers(term: string): void {
    if (term.startsWith(' ')) { term = term.slice(1) }
    this.searchResultsUsers = this.users.filter(u => {
      return u.uid != this.mainUser.uid &&
        (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    });
  }

  /**
   * Prevents default action and stops event propagation for result click events.
   * @param e - The click event.
   */
  onResultsClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Closes the search results and refocuses the search input.
   */
  onCloseSearchClick(): void {
    this.clearSearch();
    this.autofocusSearch();
  }

  /**
   * Focuses the search input after a short delay.
   */
  autofocusSearch(): void {
    setTimeout(() => this.searchbar.nativeElement.focus(), 20);
  }

  /**
   * Toggles the extension of the specified list.
   * @param list - The list to toggle ('channels', 'users', 'posts').
   */
  toggleListExtension(list: 'channels' | 'users' | 'posts'): void {
    this.extended = (this.extended === list ? null : list);
  }

  /**
   * Clears the search input and results.
   */
  clearSearch(): void {
    this.searchInput = '';
    this.searchResultsChannels = [];
    this.searchResultsUsers = [];
    this.extended = null;
  }

  /**
   * Clears the selected channels and users lists.
   */
  clearLists(): void {
    this.channelList = [];
    this.userList = [];
  }

  /**
   * Adds a channel to the list of selected channels.
   * @param channel - The channel to add.
   */
  addChannelToList(channel: Channel) {
    this.channelList.push(channel);
    this.clearSearch();
  }

  /**
   * Removes a channel from the list of selected channels.
   * @param channel - The channel to remove.
   */
  removeChannel(channel: Channel) {
    let indexToRemove = this.channelList.findIndex(c => c.channel_id === channel.channel_id);
    this.channelList.splice(indexToRemove, 1);
  }

  /**
   * Adds a user to the list of selected users.
   * @param user - The user to add.
   */
  addUserToList(user: User): void {
    this.userList.push(user);
    this.clearSearch();
  }

  /**
   * Removes a user from the list of selected users.
   * @param user - The user to remove.
   */
  removeUser(user: User) {
    let indexToRemove = this.userList.findIndex(u => u.uid === user.uid);
    this.userList.splice(indexToRemove, 1);
  }
}
