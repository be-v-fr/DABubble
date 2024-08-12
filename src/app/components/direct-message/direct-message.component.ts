import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ForbiddenChannelFeedbackComponent } from '../main-chat/forbidden-channel-feedback/forbidden-channel-feedback.component';
import { AuthService } from '../../../services/auth.service';
import { TimeService } from '../../../services/time.service';
import { Post } from '../../../models/post.class';

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
    MessageItemComponent,
    ForbiddenChannelFeedbackComponent
  ],
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private scrollSub!: Subscription;
  private postsSub!: Subscription;

  channelId?: string;
  channel?: Channel; // Directly use Channel type
  savedPostsLength: number | null = null;
  currUser?: User;
  recipient?: User;

  online: boolean = true;
  emojiPicker: boolean = false;
  onInvalidOrForbiddenRoute: boolean = false;
  @ViewChildren(MessageItemComponent, { read: ElementRef }) messageItems!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private channelService: ChannelsService,
    public activityService: ActivityService,
    private authService: AuthService,
    public timeService: TimeService
  ) { }

  ngOnInit(): void {
    this.auth();
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
          this.handlePostsLength();
        }
      })
    );
  }

  auth() {
    const uid = this.authService.getCurrentUid();
    if (uid) { this.currUser = new User({ uid: uid }) }
    else { this.subAuth() }
  }

  subAuth() {
    this.subscriptions.add(
      this.authService.user$.subscribe((user) => {
        if (user) {
          if (!this.currUser) { this.currUser = new User({ uid: user.uid }) }
          if (this.channelId && !this.channel) { this.initChannel(this.channelId) }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.scrollSub.unsubscribe();
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
        this.scrollSub = this.route.queryParams.subscribe(params => {
          setTimeout(() => this.goToPost(params['post']), 20);
        });
      } else {
        this.onInvalidOrForbiddenRoute = true;
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
    }
  }

  goToPost(postId: string | undefined) {
    this.postsSub = this.messageItems.changes.subscribe((elements: QueryList<ElementRef>) => {
      (postId && postId.length > 0) ? this.autoscrollToPost(elements, postId) : this.autoscrollToLastPost(elements);
    });
    this.messageItems.notifyOnChanges();
  }

  autoscrollToPost(elements: QueryList<ElementRef>, postId: string) {
    const postRef = elements.find(el => el.nativeElement.id === postId);
    if (postRef) {
      this.postsSub.unsubscribe();
      postRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.router.navigate([], {
        queryParams: { 'post': null },
        queryParamsHandling: 'merge'
      });
    }
  }

  autoscrollToLastPost(elements: QueryList<ElementRef>) {
    const array = elements.toArray();
    const postRef = array.pop();
    if (postRef) { postRef.nativeElement.scrollIntoView({}); }
  }

  handlePostsLength(): void {
    if (this.channel) {
      const currentLength = this.channel.posts.length;
      if (!this.savedPostsLength || (this.savedPostsLength && this.savedPostsLength < currentLength)) {
        const lastPost: Post = this.channel.posts[currentLength - 1];
        this.goToPost(lastPost.post_id);
      }
      this.savedPostsLength = currentLength;
    }
  }

  initUsers(channel: Channel): void {
    if (channel.members.length > 1) {
      this.currUser = channel.members.find(m => m.uid === this.currUser?.uid);
      if (this.currUser) {
        this.onInvalidOrForbiddenRoute = false;
        this.recipient = channel.members.find(m => m.uid != this.currUser?.uid) || this.currUser;
      } else {
        this.onInvalidOrForbiddenRoute = true;
      }
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
