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

@Component({
  selector: 'app-direct-message',
  standalone: true,
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss'],
  imports: [CommonModule, MessageBoxComponent, PickerComponent],
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  channelId?: string;
  channel?: Promise<Channel | undefined>;
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

    this.channel = this.channelService.getChannel(channelId);
    if (this.channel) {
      await this.initRecipient(this.channel);
    } else {
      console.error('Channel not found');
    }
  }

  async initRecipient(channelPromise: Promise<Channel | undefined>): Promise<void> {
    try {
      const channel = await channelPromise;
      if (channel && channel.members.length > 1) {
        this.recipient = channel.members[1];
      } else {
        console.error('Recipient not found in channel members');
      }
    } catch (error) {
      console.error('Error initializing recipient:', error);
    }
  }
}
