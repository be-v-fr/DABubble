import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AddChannelComponent } from '../add-channel/add-channel.component';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { ChannelsService } from '../../../services/content/channels.service';
import { AuthService } from '../../../services/auth.service';
import { ActivityService } from '../../../services/activity.service';
import { ActivityStateDotComponent } from '../activity-state-dot/activity-state-dot.component';
import { LoadingCircleComponent } from './loading-circle/loading-circle.component';

/**
 * Component for an expandable button that displays menus for users and channels.
 */
@Component({
  selector: 'app-expandable-button',
  standalone: true,
  imports: [CommonModule, RouterLink, ActivityStateDotComponent, LoadingCircleComponent],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ],
  templateUrl: './expandable-button.component.html',
  styleUrls: ['./expandable-button.component.scss'],
})
export class ExpandableButtonComponent implements OnInit, OnDestroy {
  private authSub = new Subscription();
  private userSub = new Subscription();
  private channelsSub = new Subscription();

  /**
   * List of the user's channels.
   * @type {Channel[]}
   */
  userChannels: Channel[] = [];

  /**
   * New channel instance.
   * @type {Channel}
   */
  newChannel = new Channel();

  /**
   * Current channel.
   * @type {Channel | undefined}
   */
  currChannel?: Channel;

  /**
   * Current user.
   * @type {User | undefined}
   */
  currentUser?: User;

  /**
   * Flag indicating whether the menu is expanded.
   * @type {boolean}
   */
  isMenuExpanded: boolean = true;

  /**
   * Flag indicating whether the menu is open.
   * @type {boolean}
   */
  isOpen: boolean = true;

  /**
   * Flag indicating whether the user is online.
   * @type {boolean}
   */
  online: boolean = true;

  /**
   * Flag indicating whether data is being loaded.
   * @type {boolean}
   */
  loading: boolean = true;

  /**
   * List of users.
   * @type {User[] | undefined}
   */
  users?: User[];

  /**
   * Flag indicating whether the icon is rotated.
   * @type {boolean}
   */
  isRotated = false;

  /**
   * Button title.
   * @type {string}
   */
  title = input.required<string>();

  /**
   * Button icon.
   * @type {string}
   */
  icon = input.required<string>();

  /**
   * Type of the instance, either 'channels' or 'users'.
   * @type {'channels' | 'users'}
   */
  instance = input.required<'channels' | 'users'>();

  /**
   * EventEmitter that is emitted when a user is clicked.
   * @type {EventEmitter<void>}
   */
  @Output() userClick = new EventEmitter<void>();

  /**
   * Constructs the component with the required services.
   * @param {MatDialog} dialog - The Angular Material dialog service.
   * @param {Router} router - The Angular router.
   * @param {AuthService} authService - The authentication service.
   * @param {UsersService} userService - The user service.
   * @param {ChannelsService} channelsService - The channels service.
   * @param {ActivityService} activityService - The activity service.
   */
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    public userService: UsersService,
    private channelsService: ChannelsService,
    private activityService: ActivityService
  ) { }

  /**
   * Initializes the component and subscribes to authentication updates.
   */
  ngOnInit(): void {
    this.authSub = this.subAuth();
  }

  /**
   * Cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.userSub.unsubscribe();
    this.channelsSub.unsubscribe();
  }

  /**
   * Subscribes to authentication updates and initializes user data and channels.
   * @returns {Subscription} - The authentication subscription object.
   */
  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) {
        this.initData(uid);
        this.userSub = this.subUsers(uid);
        this.channelsSub = this.subChannels();
      }
    });
  }

  /**
   * Initializes user data and channels.
   * @param {string} uid - The user ID of the current user.
   */
  initData(uid: string) {
    if (this.userService.users.length > 0) {
      this.syncUsers(this.userService.users, uid);
    }
    if (this.channelsService.channels.length > 0) {
      this.syncUserChannels(this.channelsService.channels);
    }
  }

  /**
   * Subscribes to user data updates.
   * @param {string} uid - The user ID of the current user.
   * @returns {Subscription} - The user subscription object.
   */
  subUsers(uid: string): Subscription {
    return this.userService.users$.subscribe((users) => this.syncUsers(users, uid));
  }

  /**
   * Subscribes to channel updates.
   * @returns {Subscription} - The channels subscription object.
   */
  subChannels(): Subscription {
    return this.channelsService.channels$.subscribe((channels) => this.syncUserChannels(channels));
  }

  /**
   * Stops loading if the specified instance matches.
   * @param {'channels' | 'users'} instance - The instance to stop loading for.
   */
  stopLoading() {
    if (this.loading) {this.loading = false}
  }

  /**
   * Synchronizes the user list and the current user.
   * @param {User[]} users - The list of users.
   * @param {string} uid - The user ID of the current user.
   */
  syncUsers(users: User[], uid: string) {
    this.stopLoading();
    this.currentUser = users.find(u => u.uid === uid);
    if (this.currentUser) {
      this.users = [this.currentUser].concat(users.filter(u => u.uid !== uid));
      this.syncUserChannels(this.channelsService.channels);
    }
  }

  /**
   * Synchronizes the user's channel list.
   * @param {Channel[]} channels - The list of channels.
   */
  syncUserChannels(channels: Channel[]) {
    this.stopLoading();
    this.userChannels = channels.filter(c => !c.isPmChannel && c.members.some(m => m.uid === this.currentUser?.uid));
  }

  /**
   * Toggles the menu's expanded/collapsed state.
   */
  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
    this.isRotated = !this.isRotated;
  }

  /**
   * Opens the dialog to add a new channel.
   */
  onAddChannelClick(): void {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.componentInstance.channel.author_uid = this.currentUser!.uid;
    dialogRef.componentInstance.channel.members.push(this.currentUser!);
  }

  /**
   * Handles user click by either opening an existing channel or creating a new one.
   * @param {User} user - The user that was clicked.
   * @returns {Promise<void>}
   */
  async onUserClick(user: User): Promise<void> {
    const channelExist: Channel | undefined = this.requestDirectMessageChannel(user);
    if (channelExist) {
      this.channelsService.addChannelToRoute('direct-message', channelExist.channel_id);
    } else {
      const preparedChannel = this.prepareChannel(this.newChannel, user);
      await this.channelsService.addChannel(preparedChannel)
        .then(res => this.channelsService.addChannelToRoute('direct-message', res));
    }
  }

  /**
   * Checks if a direct message channel already exists for the given user.
   * @param {User} user - The user for whom to check the channel.
   * @returns {Channel | undefined} - The existing channel or undefined if none found.
   */
  requestDirectMessageChannel(user: User): Channel | undefined {
    return this.channelsService.getAllChannels().find(c =>
      c.isPmChannel === true &&
      c.members.some(m => m.uid === this.currentUser?.uid) &&
      c.members.some(m => m.uid === user.uid) &&
      (user.uid != this.currentUser?.uid || !c.members.some(m => m.uid != user.uid))
    );
  }

  /**
   * Prepares a new channel for direct messaging.
   * @param {Channel} channel - The channel to prepare.
   * @param {User} user - The user to include in the channel.
   * @returns {Channel} - The prepared channel.
   */
  prepareChannel(channel: Channel, user: User): Channel {
    channel.author_uid = this.currentUser!.uid;
    channel.members = [this.currentUser!, user];
    channel.isPmChannel = true;
    return channel;
  }
}
