import { Component, HostListener, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ExpandableButtonComponent } from '../expandable-button/expandable-button.component';
import { RouterLink } from '@angular/router';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';
import { ChannelsService } from '../../../services/content/channels.service';
import { UsersService } from '../../../services/users.service';
import { SearchComponent } from '../../home/header/search/search.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, ExpandableButtonComponent, SearchComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit, OnDestroy {

  @Input() showNav: boolean = true;
  isVisible = true;

  private authSub = new Subscription();
  private usersSub = new Subscription();
  private channelsSub = new Subscription();

  currentUser?: User;
  users?: User[];
  userChannels?: Channel[];

  constructor(
    private authService: AuthService,
    public usersService: UsersService,
    private channelsService: ChannelsService
  ) { }

  ngOnInit(): void {
    this.authSub = this.authService.user$.subscribe(user => {
      if(user) {
        this.usersSub = this.subUsers(user.uid);
        this.channelsSub = this.subChannels(user.uid);
      }
    });
  }

  subUsers(uid: string): Subscription {
    return this.usersService.users$.subscribe(users => {
      this.currentUser = users.find(u => u.uid === uid);
      this.users = users;
    });
  }

  subChannels(uid: string): Subscription {
    return this.channelsService.channels$.subscribe(channels => {
      this.userChannels = channels.filter(c => c.members.find(m => m.uid === uid));
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.channelsSub.unsubscribe();
  }

  closeNavigation() {
    if (window.innerWidth <= 768) {
      this.isVisible = false;
    }
  }
}
