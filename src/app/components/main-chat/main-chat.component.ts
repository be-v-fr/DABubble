import { Component, OnDestroy, OnInit, input } from '@angular/core';
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
import { ThreadComponent } from "../thread/thread.component";
import { ThreadsService } from '../../../services/content/threads.service';
import { Thread } from '../../../models/thread.class';
import { Subscription } from 'rxjs';
import { PostsService } from '../../../services/content/posts.service';
import { Post } from '../../../models/post.class';
import { AuthService } from '../../../services/auth.service';
import { TimeService } from '../../../services/time.service';
import { User } from '../../../models/user.class';
import { MemberListComponent } from '../../member-list/member-list.component';
import { ActivityService } from '../../../services/activity.service';
@Component({
  selector: 'app-main-chat',
  standalone: true,
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
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

  private authSub = new Subscription();
  private channelSub = new Subscription();
  private threadsSub: Subscription | null = null;
  private postsSub: Subscription | null = null;
  currentUid: string | null = null;
  currentChannel = new Channel();
  currentPost?: Post;
  channelThreads?: Thread[];
  channelThreadsFirstPosts: Post[] = [];
  emojiPicker = false;
  activeUsers: User[] = [];

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private channelsService: ChannelsService,
    private threadsService: ThreadsService,
    private postsService: PostsService,
    private activityService: ActivityService,
    public timeService: TimeService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.authSub = this.subAuth();
    this.route.queryParams.subscribe(params => {
      if (params['channel']) { this.initChannel(params['channel']) }
    });
    this.activeUsers = this.activityService.getActiveUsers();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.channelSub.unsubscribe();
    this.threadsSub?.unsubscribe();
    this.postsSub?.unsubscribe();
  }

  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) { this.currentUid = uid; }
    });
  }

  initChannel(channel_id: string): void {
    this.channelSub.unsubscribe();
    this.channelSub = this.subChannel(channel_id);
  }

  subChannel(channel_id: string): Subscription {
    return this.channelsService.channels$.subscribe(() => {
      this.setChannel(channel_id);
      this.subThreads();
    });
  }

  setChannel(channel_id: string): void {
    const channel = this.channelsService.channels.find(c => c.channel_id === channel_id);
    if (channel) { this.currentChannel = channel; }
  }

  subThreads(): void {
    this.threadsSub = this.threadsService.threads$.subscribe((threads) => {
      this.channelThreads = this.threadsService.getChannelThreads(threads, this.currentChannel.channel_id);
      this.setFirstPosts(this.postsService.posts);
      this.postsSub?.unsubscribe();
      this.postsSub = this.subPosts();
    });
  }

  setFirstPosts(posts: Post[]): void {
    if (this.channelThreads) {
      this.channelThreadsFirstPosts = this.postsService.getThreadsFirstPosts(posts, this.channelThreads);
    }
  }

  subPosts(): Subscription {
    return this.postsService.posts$.subscribe((posts) => {
      this.setFirstPosts(posts);
    });
  }

  getFirstPost(thread_id: string): Post {
    const post: Post | undefined = this.channelThreadsFirstPosts.find(p => p.thread_id === thread_id);
    return post ? post : new Post();
  }

  isCurrentUserAuthor(thread_id: string): boolean {
    const firstPost = this.getFirstPost(thread_id);
    return this.currentUid === firstPost.user_id;
  }

  getThreadLength(thread_id: string): number {
    return this.postsService.getThreadPosts(this.postsService.posts, thread_id).length;
  }

  getLastReplyTime(thread_id: string): number {
    const threadPosts = this.postsService.getThreadPosts(this.postsService.posts, thread_id);
    const lastIndex = threadPosts.length - 1;
    return threadPosts[lastIndex].date;
  }

  handleEmojiStateChange(newState: boolean): void {
    this.emojiPicker = newState;
  }

  onEditChannel(): void {
    this.dialog.open(EditChannelComponent);
  }

  openMemberList(): void {
    this.dialog.open(MemberListComponent, {
      data: { activeUsers: this.activeUsers }
    });
  }

  handleThread(event: string): void {
    this.currentPost = this.postsService.posts.find(p => p.thread_id === event);
  }

  createThread(message: string): void {
    if (this.currentUid) {
      this.threadsService.createThread(message, this.currentChannel.channel_id, this.currentUid);
    }
  }
}
