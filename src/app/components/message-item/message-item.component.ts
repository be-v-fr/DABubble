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
import { MainUserProfileCardComponent } from '../../main-user/main-user-profile-card/main-user-profile-card.component';
import { FormsModule, NgForm } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';


@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeSeparatorComponent],
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent implements OnInit, OnChanges, OnDestroy {

  isOnEdit = false;
  showActions = false;
  messageToUpdate = '';

  @Input() post: Post = new Post();
  @Input() lastReply = this.post?.thread.posts[this.post.thread.posts.length - 1]?.date ?? null;
  @Input() messageSender?: boolean;
  @Input() isMainPostThread = false;
  @Input() ComeFromThread = false;
  @Input() postUid: string = "";
  @Output() threadId = new EventEmitter<string>();

  author: User | undefined;
  groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};
  currentUser: User | undefined;
  postUser: User = new User();
  attachmentFileName: string | null = null;

  private authSub = new Subscription();

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private usersService: UsersService,
    private channelsService: ChannelsService,
    private reactionsService: ReactionService,
    public timeService: TimeService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.authSub = this.subAuth();
    this.messageToUpdate = this.post.message;
    this.initAttachment();
  }

  initAttachment(): void {
    if (this.post.attachmentSrc.length > 0) {
      const parsedUrl = new URL(this.post.attachmentSrc);
      const path = parsedUrl.pathname;
      const fileName = path.split('/').pop();
      if (fileName) { this.attachmentFileName = fileName }
    }
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
      if (uid == this.currentUser?.uid) {
        this.dialog.open(MainUserProfileCardComponent, {
          data: { 'mainUser': this.currentUser }
        });
      } else {
        let viewUser: User = new User(this.usersService.getUserByUid(uid));
        this.dialog.open(UserProfileCardComponent, {
          data: { 'viewUser': viewUser }
        });
      }
    }
  }

  showEditActions() {
    this.showActions = !this.showActions;
  }

  onEditMessage() {
    this.messageToUpdate = this.post.message;
    this.isOnEdit = true;
    this.showActions = false;
  }

  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {
      this.channelsService.updatePost(this.post.channel_id, this.post.post_id, this.messageToUpdate);
      this.isOnEdit = false;
      // clear form
      form.reset()
    }
  }

  cancelEditMessage() {
    this.isOnEdit = false;
  }

  onDeletePost() {
    this.channelsService.deletePost(this.post.channel_id, this.post.post_id);
    this.showActions = false;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onShowEmojiPicker() {
    this.reactionsService.reactionToMessage = false;
    this.reactionsService.currentPost = this.post;
    this.reactionsService.toggleReactionsPicker();
  }

  async onHandleReaction(emoji: any) {
    let reaction = { emoji: { native: emoji } };

    if (!this.currentUser) {
      console.error('Current user is not defined');
      return;
    }
    this.reactionsService.currentPost = this.post;

    await this.reactionsService.addReaction(reaction, this.currentUser);
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
