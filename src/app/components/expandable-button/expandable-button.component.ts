import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AddChannelComponent } from '../../add-channel/add-channel.component';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { Subscription, combineLatest } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { ChannelsService } from '../../../services/content/channels.service';
import { AuthService } from '../../../services/auth.service';
import { ActivityService } from '../../../services/activity.service';
import { ActivityStateDotComponent } from '../activity-state-dot/activity-state-dot.component';

@Component({
  selector: 'app-expandable-button',
  standalone: true,
  imports: [CommonModule, RouterLink, ActivityStateDotComponent],
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
  private userSub!: Subscription;
  private channelsSub = new Subscription();

  userChannels: Channel[] = [];
  newChannel = new Channel();
  currChannel?: Channel;
  currentUser?: User;

  isMenuExpanded = true;
  isOpen = true;
  online = true;
  users?: User[];
  isRotated = false;
  title = input.required<string>();
  icon = input.required<string>();
  showBtn = input.required<boolean>();

  @Output() userClick = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    public userService: UsersService,
    private channelsService: ChannelsService,
    private activityService: ActivityService
  ) {
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd && window.innerWidth <= 768) {
    //     this.isMenuExpanded = false;
    //   }
    // });
  }

  ngOnInit(): void {
    this.authSub = this.subAuth();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.userSub.unsubscribe();
    this.channelsSub.unsubscribe();
  }

  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) {
        this.userSub = this.subUsers(uid)
        this.channelsSub = this.subChannels();
      }
    });
  }

  subUsers(uid: string): Subscription {
    return this.userService.users$.subscribe((users) => {
      this.currentUser = users.find(u => u.uid === uid);
      if (this.currentUser) {
        this.users = [this.currentUser].concat(users.filter(u => u.uid !== uid));   //  && u.name !== 'Gast'
        this.updateUserChannels(this.channelsService.channels);
      }
    });
  }

  subChannels(): Subscription {
    return this.channelsService.channels$.subscribe((channels) => this.updateUserChannels(channels));
  }

  updateUserChannels(channels: Channel[]) {
    this.userChannels = channels.filter(c => !c.isPmChannel && c.members.some(m => m.uid === this.currentUser?.uid));
  }

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
    this.isRotated = !this.isRotated;
  }

  //  @HostListener('window:resize', ['$event'])
  // onResize(event: Event) {
  //   if (window.innerWidth <= 768) {
  //     this.isMenuExpanded = false;
  //     this.userClick.emit();
  //   }
  // }

  onAddChannelClick(): void {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.componentInstance.channel.author_uid = this.currentUser!.uid;
    dialogRef.componentInstance.channel.members.push(this.currentUser!);
  }

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
   * This function checks whether the requested channel already exists. It checks
   * - if the channel is a private channel
   * - if the channel includes both the current user and the selected user
   * - if the selected user is different from the current user OR if the channel only includes the current user
   * @param user - user clicked in menu
   * @returns the requested channel, if it exists, OR undefined
   */
  requestDirectMessageChannel(user: User): Channel | undefined {
    return this.channelsService.getAllChannels().find(c =>
      c.isPmChannel === true &&
      c.members.some(m => m.uid === this.currentUser?.uid) &&
      c.members.some(m => m.uid === user.uid) &&
      (user.uid != this.currentUser?.uid || !c.members.some(m => m.uid != user.uid))
    );
  }

  prepareChannel(channel: Channel, user: User): Channel {
    channel.author_uid = this.currentUser!.uid;
    channel.members = [this.currentUser!, user];
    channel.isPmChannel = true;
    return channel;
  }
}
