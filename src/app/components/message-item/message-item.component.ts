import { Component, EventEmitter, Input, Output, OnDestroy, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
import { Post } from '../../../models/post.class';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';
import { TimeService } from '../../../services/time.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ChannelsService } from '../../../services/content/channels.service';
import { Reaction } from '../../../models/reaction.class';
import { ReactionService } from '../../../services/content/reaction.service';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, TimeSeparatorComponent],
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent implements OnInit, OnChanges, OnDestroy {

  @Input() post: Post = new Post();
  @Input() lastReply = this.post?.thread.posts[this.post.thread.posts.length - 1]?.date ?? null;
  @Input() messageSender?: boolean;
  @Input() isMainPostThread = false;
  @Input() postUid: string = "";
  @Output() threadId = new EventEmitter<string>();

  author: User | undefined;
  groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};
  currentUser: User | undefined;
  postUser: User = new User();

  private authSub = new Subscription();

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private usersService: UsersService,
    private channelsService: ChannelsService,
    private reactionsService: ReactionService,
    public timeService: TimeService
  ) { }

  async ngOnInit(): Promise<void> {
    this.authSub = this.subAuth();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post'] && changes['post'].currentValue) {
      this.updateGroupedEmojis();
    }
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  private async updateGroupedEmojis(): Promise<void> {
    if (this.post.reactions) {
      this.groupedEmojis = await this.getGroupedEmojis(this.post.reactions);
    }
  }

  private subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) {
        this.currentUser = this.usersService.getUserByUid(uid);
        if (this.postUid) {
          this.postUser = this.usersService.getUserByUid(this.postUid) || new User();
        }
      }
    });
  }

  onOpenNewThread() {
    this.threadId.emit(this.post.thread.thread_id);
  }

  openUserProfile(uid: string): void {
    if (uid) {
      this.dialog.open(UserProfileCardComponent, {
        data: { uid }
      });
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onShowEmojiPicker() {
    this.reactionsService.currentPost = this.post;
    this.reactionsService.toggleReactionsPicker();
  }

  async onHandleReaction(emoji: any) {
    if (!this.currentUser) {
      console.error('Current user is not defined');
      return;
    }

    const existingReaction = this.post.reactions.find(r => r.emoji === emoji && r.user.uid === this.currentUser?.uid);
    if (!existingReaction) {
      try {
        await this.channelsService.addReactionToPost(this.post.channel_id, this.post.post_id, this.currentUser, emoji);
      } catch (error) {
        console.error('Error adding reaction to post:', error);
      }
    } else {
      await this.channelsService.deleteReactionFromPost(this.post.channel_id, this.post.post_id, this.currentUser.uid, emoji);
    }
  }

  async getGroupedEmojis(reactions: Reaction[]): Promise<{ [key: string]: { count: number, users: string[] } }> {
    let groups: { [key: string]: { count: number, users: string[] } } = {};

    for (const reaction of reactions) {
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = { count: 0, users: [] };
      }
      groups[reaction.emoji].count++;

      if (reaction.user) {
        try {
          groups[reaction.emoji].users.push(reaction.user.name);
        } catch (error) {
          console.error(`Failed to get user with ID ${reaction.user.uid}`, error);
        }
      }
    }

    return groups;
  }
}
