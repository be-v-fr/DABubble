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

  ngOnInit(): void {
    this.authSub = this.subAuth();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) {
        this.currentUser = this.usersService.getUserByUid(uid);
      }
    });
  }

  closeCard() {
    this.dialogRef.close();
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
