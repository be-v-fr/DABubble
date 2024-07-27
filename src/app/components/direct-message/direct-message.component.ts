import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { ChannelsService } from '../../../services/content/channels.service';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { ActivityService } from '../../../services/activity.service';
import { Subscription } from 'rxjs';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { MessageItemComponent } from '../message-item/message-item.component';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss'],
  imports: [
    CommonModule,
    MessageBoxComponent,
    PickerComponent,
    TimeSeparatorComponent,
    MessageItemComponent
  ],
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  channelId?: string;
  channel?: Channel; // Directly use Channel type
  currUser?: User;
  recipient?: User;

  online = true;
  emojiPicker = false;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private channelService: ChannelsService,
    public activityService: ActivityService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        this.channelId = params.get('id') ?? undefined;
        if (this.channelId) {
          this.initChannel(this.channelId);
        }
      })
    );

    this.subscriptions.add(
      this.channelService.channels$.subscribe(() => {
        if (this.channelId) {
          this.initChannel(this.channelId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openUserProfile(): void {
    this.dialog.open(UserProfileCardComponent);
  }

  async initChannel(channelId: string): Promise<void> {
    if (!channelId) {
      console.error('Channel ID is not defined');
      return;
    }

    try {
      const channel = await this.channelService.getChannel(channelId);
      if (channel) {
        this.channel = channel;
        this.initUsers(channel);
      } else {
        console.error('Channel not found');
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
    }
  }

  initUsers(channel: Channel): void {
    if (channel.members.length > 1) {
      this.currUser = channel.members[0];
      this.recipient = channel.members[1];
    } else {
      console.error('Recipient not found in channel members');
    }
  }

  async onCreatePost(message: string): Promise<void> {
    try {
      if (!this.currUser?.uid || !this.channel?.channel_id) {
        console.error('User ID or channel is not set.');
        return;
      }

      await this.channelService.addPostToPmChannel(this.channel.channel_id, this.currUser.uid, message);
      console.log('Post successfully added to the channel');
    } catch (err) {
      console.error('Error adding post to the channel:', err);
    }
  }

  isCurrentUserAuthor(): boolean {
    const firstPost = this.channel!.posts[0];
    return this.currUser?.uid === firstPost.user_id;
  }
}
