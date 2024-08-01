import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MessageItemComponent } from '../message-item/message-item.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { ChannelsService } from '../../../services/content/channels.service';
import { Channel } from '../../../models/channel.class';
import { EditChannelComponent } from '../../edit-channel/edit-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { ThreadComponent } from '../thread/thread.component';
import { Subscription } from 'rxjs';
import { Post } from '../../../models/post.class';
import { AuthService } from '../../../services/auth.service';
import { TimeService } from '../../../services/time.service';
import { User } from '../../../models/user.class';
import { MemberListComponent } from '../../member-list/member-list.component';
import { ActivityService } from '../../../services/activity.service';
import { UsersService } from '../../../services/users.service';
import { AddMembersComponent } from '../../add-members/add-members.component';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss'],
  imports: [
    CommonModule,
    PickerComponent,
    MessageItemComponent,
    MessageBoxComponent,
    TimeSeparatorComponent,
    ThreadComponent
  ]
})
export class MainChatComponent implements OnInit, OnDestroy {
  private authSub!: Subscription;
  private channelSub!: Subscription;

  currentUid: string | undefined;
  currentChannel = new Channel();
  currentChannelAuthorName?: string;
  currPost: Post | undefined;
  openTh = false;
  emojiPicker = false;
  activeUsers: User[] = [];
  currentDate: number = Date.now();

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private usersService: UsersService,
    private channelsService: ChannelsService,
    private activityService: ActivityService,
    public timeService: TimeService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.authSub = this.authService.user$.subscribe(() => this.currentUid = this.authService.getCurrentUid());

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.initChannel(id);
      }
    });

    this.channelSub = this.channelsService.channels$.subscribe(() => {
      if (this.currentChannel.channel_id) {
        this.setChannel(this.currentChannel.channel_id);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.channelSub.unsubscribe();
  }

  initChannel(channel_id: string): void {
    if (this.currentChannel.channel_id.length === 0) {
      this.currentChannel.channel_id = channel_id;
    }
    this.setChannel(channel_id);
  }

  setChannel(channel_id: string): void {
    const channel = this.channelsService.channels.find(c => c.channel_id === channel_id);
    if (channel) {
      this.currentChannel = channel;
      this.currentChannelAuthorName = this.usersService.getUserByUid(this.currentChannel.author_uid)?.name;
      this.activeUsers = this.activityService.getActiveUsers();
    }
  }

  isCurrentUserAuthor(index: number): boolean {
    const firstPost = this.currentChannel.posts[index];
    return this.currentUid === firstPost.user_id;
  }

  getPostUid(index: number) {
    const currentPost = this.currentChannel.posts[index];
    return currentPost.user_id;
  }

  getUserFromMembers(uid: string) {
    return this.usersService.getUserByUid(uid) || new User;
  }

  onCreatePost(message: string): void {
    if (!this.currentUid || !this.currentChannel.channel_id) {
      console.error('User ID or channel ID is not set.');
      return;
    }

    this.channelsService.addPostToChannel(this.currentChannel.channel_id, this.currentUid, message)
      .then(() => console.log('Post successfully added to the channel'))
      .catch(err => console.error('Error adding post to the channel:', err));
  }

  onEditChannel(): void {
    this.dialog.open(EditChannelComponent, { data: this.currentChannel });
  }

  openMemberList(): void {
    this.dialog.open(MemberListComponent, {
      data: { channelMembers: this.currentChannel.members, channel: this.currentChannel }
    });
  }

  openAddMembers(): void {
    this.dialog.open(AddMembersComponent, {
      data: { channelMembers: this.currentChannel.members, channel: this.currentChannel }
    });
  }

  handleThread(threadId: string): void {
    if (this.currentChannel && this.currentChannel.posts) {
      const post = this.currentChannel.posts.find(post => post.thread.thread_id === threadId);
      if (post) {
        this.currPost = post;
        this.openTh = true;
      } else {
        console.error(`Thread with ID ${threadId} not found.`);
        this.currPost = undefined;
      }
    } else {
      console.error('Current channel or posts are not defined.');
    }
  }

  closeThread(event: any) {
    this.openTh = event;
  }
}
