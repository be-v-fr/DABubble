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

/**
 * Component responsible for navigation, including user and channel information.
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, ExpandableButtonComponent, SearchComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit, OnDestroy {

  /** Determines if the navigation menu is shown */
  @Input() showNav: boolean = true;

  /** Indicates if the navigation menu is visible */
  isVisible = true;

  /** Subscription for authentication state changes */
  private authSub = new Subscription();

  /** Subscription for user data changes */
  private usersSub = new Subscription();

  /** Subscription for channel data changes */
  private channelsSub = new Subscription();

  /** Current user data */
  currentUser?: User;

  /** List of users */
  users?: User[];

  /** List of channels the user is a member of */
  userChannels?: Channel[];

  constructor(
    private authService: AuthService,
    public usersService: UsersService,
    private channelsService: ChannelsService
  ) { }

  /**
   * Initializes the component by subscribing to user authentication and data services.
   */
  ngOnInit(): void {
    this.authSub = this.authService.user$.subscribe(user => {
      if(user) {
        this.usersSub = this.subUsers(user.uid);
        this.channelsSub = this.subChannels(user.uid);
      }
    });
  }

  /**
   * Subscribes to user data updates and sets the current user and users list.
   * @param uid - The user ID of the current user.
   * @returns The subscription to user data updates.
   */
  subUsers(uid: string): Subscription {
    return this.usersService.users$.subscribe(users => {
      this.currentUser = users.find(u => u.uid === uid);
      this.users = users;
    });
  }

  /**
   * Subscribes to channel data updates and filters channels based on user membership.
   * @param uid - The user ID of the current user.
   * @returns The subscription to channel data updates.
   */
  subChannels(uid: string): Subscription {
    return this.channelsService.channels$.subscribe(channels => {
      this.userChannels = channels.filter(c => c.members.find(m => m.uid === uid));
    });
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
   * Closes the navigation menu if the window width is less than or equal to 768 pixels.
   */
  closeNavigation() {
    if (window.innerWidth <= 768) {
      this.isVisible = false;
    }
  }
}
