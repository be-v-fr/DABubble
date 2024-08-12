import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChildren, AfterViewInit } from '@angular/core';
import { MessageItemComponent } from "../message-item/message-item.component";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Post } from '../../../models/post.class';
import { ChannelsService } from '../../../services/content/channels.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { TimeService } from '../../../services/time.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss'],
  imports: [CommonModule, MessageItemComponent, MessageBoxComponent, PickerComponent, TimeSeparatorComponent]
})
export class ThreadComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() post: Post | undefined;
  @Input() channelData: { id: string, name: string } | undefined;
  @Output() closeTh = new EventEmitter<boolean>();
  @ViewChildren(MessageItemComponent, { read: ElementRef }) messageItems!: QueryList<ElementRef>;

  currUid: string | null = null;
  reactionPicker = false;

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

  ngOnInit(): void {
    this.authSub = this.subAuth();
    this.channelsSub = this.subChannels();
  }

  ngAfterViewInit(): void {
    this.scrollSub = this.route.queryParams.subscribe(params => {
      this.goToPost(params['post']);
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.channelsSub.unsubscribe();
    this.scrollSub.unsubscribe();
    this.postsSub.unsubscribe();
  }

  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) { this.currUid = uid }
    });
  }

  subChannels(): Subscription {
    return this.channelsService.channels$.subscribe(() => {
      const threadPosts = this.getPosts();
      if (this.post && threadPosts) {this.post.thread.posts = threadPosts}
    })
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
      postRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.router.navigate([], {
        queryParams: { 'post': null },
        queryParamsHandling: 'merge'
      });
    }
  }

  autoscrollToLastPost(elements: QueryList<ElementRef>) {
    if (this.post) {
      const lastPost: Post = this.post.thread.posts[this.post.thread.posts.length - 1];
      this.autoscrollToPost(elements, this.post.thread.posts[this.post.thread.posts.length - 1].post_id);
    }
  }

  isCurrentUserAuthor(id: string): boolean {
    // const firstPost = this.post.thread.posts.thread[index];
    return this.currUid === id;
  }

  getPosts(): Post[] | undefined {
    return this.channelsService.getChannelThreadPosts(this.channelData!.id, this.post?.post_id!);
  }

  onCreatePost(message: string) {
    if (!this.currUid) {
      console.error('Current user ID is not set.');
      return;
    }
    if (!this.channelData?.id) {
      console.error('Current channel ID is not set.');
      return;
    }
    this.channelsService.addPostToThread(this.channelData.id, this.post!.thread.thread_id, this.currUid, message)
      .then(() => console.log('Post successfully added to the channel'))
      .catch(err => console.error('Error adding post to the channel:', err));
  }

  openUserProfile(): void {
    this.dialog.open(UserProfileCardComponent);
  }

  onClose() {
    this.closeTh.emit(false);
  }
}
