import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { MessageItemComponent } from "../message-item/message-item.component";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Post } from '../../../models/post.class';
import { ChannelsService } from '../../../services/content/channels.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { TimeService } from '../../../services/time.service';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { trigger, state, style,transition,animate } from '@angular/animations';

@Component({
  selector: 'app-thread',
  standalone: true,
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss'],
  imports: [CommonModule, MessageItemComponent, MessageBoxComponent, PickerComponent, TimeSeparatorComponent],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, maxHeight: '0px', overflow: 'hidden' })),
      state('*', style({ opacity: 1, maxHeight: '100%', overflow: 'hidden' })),
      transition(':enter', [
        animate('0.9s ease-in-out', style({ opacity: 1, maxHeight: '100%' })) 
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({ opacity: 0, maxHeight: '0px' })) 
      ])
    ])
  ]
})
/**
 * Component to manage and display a thread of posts in a channel.
 */
export class ThreadComponent implements OnInit, OnDestroy, AfterViewInit {

  /**
   * The current post being displayed in the thread.
   */
  @Input() post: Post | undefined;

  /**
   * Data about the channel where the thread is located.
   */
  @Input() channelData: { id: string, name: string, members: User[] } | undefined;


  /**
   * A flag indicating whether the thread is open or not.
   * When `true`, the thread is expanded; otherwise, it is closed.
   * 
   * @type {boolean}
   * @default false
   */
  @Input() isThreadOpen: boolean = false;

  /**
   * The channel object associated with the thread.
   */
  channel: Channel | null = null;

  /**
   * EventEmitter to signal when the thread should be closed.
   */
  @Output() closeTh = new EventEmitter<boolean>();

  /**
   * QueryList of MessageItemComponent elements for scrolling purposes.
   */
  @ViewChildren(MessageItemComponent, { read: ElementRef }) messageItems!: QueryList<ElementRef>;

  /**
   * The length of posts saved for comparison when scrolling.
   */
  savedPostsLength: number | null = null;

  /**
   * The ID of the currently authenticated user.
   */
  currUid: string | null = null;

  private authSub = new Subscription();
  private channelsSub = new Subscription();
  private scrollSub!: Subscription;
  private postsSub!: Subscription;

  constructor(
    private authService: AuthService,
    public channelsService: ChannelsService,
    public timeService: TimeService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  /**
   * Initializes subscriptions for authentication and channel data.
   */
  ngOnInit(): void {
    this.authSub = this.subAuth();
    this.initChannel();
    this.channelsSub = this.subChannels();
  }

  /**
   * Handles scrolling to the post specified in the query parameters after the view initializes.
   */
  ngAfterViewInit(): void {
    this.scrollSub = this.route.queryParams.subscribe(params => {
      this.goToPost(params['post']);
    });
  }

  /**
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.channelsSub.unsubscribe();
    this.scrollSub.unsubscribe();
    this.postsSub.unsubscribe();
  }

  /**
   * Subscribes to authentication changes to update the current user ID.
   * @returns Subscription for unsubscribing later.
   */
  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) { this.currUid = uid }
    });
  }

  /**
   * Initializes the channel object based on the channel data provided.
   */
  async initChannel(): Promise<void> {
    if (this.channelData?.id) {
      const channel = await this.channelsService.getChannel(this.channelData.id);
      this.channel = channel || null;
    }
  }

  /**
   * Subscribes to channel updates and initializes the channel object and posts in the thread.
   * @returns Subscription for unsubscribing later.
   */
  subChannels(): Subscription {
    return this.channelsService.channels$.subscribe(() => {
      const threadPosts = this.getPosts();
      if (this.post && threadPosts) { this.post.thread.posts = threadPosts }
      this.initChannel();
    })
  }

  /**
   * Scrolls to a specific post if the post ID is provided, or to the last post if not.
   * @param postId The ID of the post to scroll to.
   */
  goToPost(postId: string | undefined) {
    this.postsSub = this.messageItems.changes.subscribe((elements: QueryList<ElementRef>) => {
      if (this.hasPostLengthChanged(elements)) {
        (postId && postId.length > 0) ? this.autoscrollToPost(elements, postId) : this.autoscrollToLastPost(elements);
      }
    });
    this.messageItems.notifyOnChanges();
  }

  /**
   * Checks if the length of the posts has changed.
   * @param elements The current list of message item elements.
   * @returns True if the length has changed, otherwise false.
   */
  hasPostLengthChanged(elements: QueryList<ElementRef>): boolean {
    const currentLength = elements.toArray().length;
    if (currentLength != this.savedPostsLength) {
      this.savedPostsLength = currentLength;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Scrolls smoothly to a specific post.
   * @param elements The list of message item elements.
   * @param postId The ID of the post to scroll to.
   */
  autoscrollToPost(elements: QueryList<ElementRef>, postId: string) {
    const postRef = elements.find(el => el.nativeElement.id === postId);
    if (postRef) {
      postRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.router.navigate([], {
        queryParams: { 'post': null },
        queryParamsHandling: 'merge'
      });
    }
  }

  /**
   * Scrolls to the last post in the list.
   * @param elements The list of message item elements.
   */
  autoscrollToLastPost(elements: QueryList<ElementRef>) {
    const array = elements.toArray();
    const postRef = array.pop();
    if (postRef) { postRef.nativeElement.scrollIntoView({}); }
  }

  /**
   * Checks if the current user is the author of a post.
   * @param id The ID of the author.
   * @returns True if the current user is the author, otherwise false.
   */
  isCurrentUserAuthor(id: string): boolean {
    return this.currUid === id;
  }

  /**
   * Retrieves the posts for the current channel and thread.
   * @returns An array of posts or undefined if not available.
   */
  getPosts(): Post[] | undefined {
    return this.channelsService.getChannelThreadPosts(this.channelData!.id, this.post?.post_id!);
  }

  /**
   * Creates a new post in the current thread.
   * @param data The data for the new post.
   */
  onCreatePost(data: any) {
    if (!this.currUid || !this.channelData?.id) {
      console.error('User ID or channel ID is not set.');
      return;
    }

    this.channelsService.addPostToThread(this.channelData.id, this.post!.thread.thread_id, this.currUid, data.message, data.attachmentSrc)
      .then(() => { })
      .catch(err => console.error('Error adding post to the channel:', err));
  }

  /**
   * Opens the user profile dialog.
   */
  openUserProfile(): void {
    this.dialog.open(UserProfileCardComponent);
  }

  /**
   * Emits an event to close the thread view.
   */
  onClose() {
    this.closeTh.emit(false);
  }
}
