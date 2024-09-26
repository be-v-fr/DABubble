import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ActivityService } from '../../services/activity.service';
import { ChannelsService } from '../../services/content/channels.service';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { ActivityStateDotComponent } from '../components/activity-state-dot/activity-state-dot.component';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';

/**
 * Represents a user profile card component that displays user information and handles direct messaging functionality.
 */
@Component({
  selector: 'app-user-profile-card',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterLink, ActivityStateDotComponent],
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.scss'
})

export class UserProfileCardComponent implements OnInit, OnDestroy {
  private authSub = new Subscription();
  user = new User();
  currentUser?: User;
  newChannel = new Channel();

  constructor(
    private channelsService: ChannelsService,
    private authService: AuthService,
    private usersService: UsersService,
    private dialogRef: MatDialogRef<UserProfileCardComponent>,
    public activityService: ActivityService,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.user = data;
  }

  /**
   * Initializes the component by subscribing to the user authentication state.
   */
  ngOnInit(): void {
    this.authSub = this.subAuth();
  }

  /**
   * A callback method that performs custom clean-up, invoked immediately before a directive, pipe, or service instance is destroyed.
   */
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  /**
   * Subscribes to the user authentication state and updates the current user based on the UID.
   * @returns A subscription object for managing the subscription to the authentication state. 
   */
  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) {
        this.currentUser = this.usersService.getUserByUid(uid);
      }
    });
  }

  /**
   * Closes the dialog
   * @param msg - The message to be sent when closing the dialog
   */
  closeCard(msg = '') {
    this.dialogRef.close(msg);
  }

  /**
   *  Handles the user click event to open or create a direct message channel with the specified user.
   * @param user The user clicked to initiate the direct message.
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
   * Finds a private message channel containing both the current user and a specified user.
   * @param user The user to find in the private message channel.
   * @returns The matching private message channel or undefined if none exists.
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
   * Prepares a channel for private messaging by setting the author UID, adding members, 
   * and marking it as a private messages channel.
   * @param channel - The channel object to be prepared.
   * @param user - The user to be added as a member of the channel.
   * @returns The prepared channel object.
   */
  prepareChannel(channel: Channel, user: User): Channel {
    channel.author_uid = this.currentUser!.uid;
    channel.members = [this.currentUser!, user];
    channel.isPmChannel = true;
    return channel;
  }
}
