import { Component, EventEmitter, Input, Output, OnDestroy, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
import { ThreadsService } from '../../../services/content/threads.service';
import { Post } from '../../../models/post.class';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';
import { TimeService } from '../../../services/time.service';
import { Subscription } from 'rxjs';
import { Reaction } from '../../../models/reaction.class';
import { ReactionsService } from '../../../services/content/reactions.service';
import { AuthService } from '../../../services/auth.service';
import { ClickStopPropagationDirective } from '../../shared/click-stop-propagation.directive';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [
    CommonModule,
    TimeSeparatorComponent,
    PickerComponent,
    ClickStopPropagationDirective
  ],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss'
})
export class MessageItemComponent implements OnChanges, OnDestroy {

  @Input() post: Post = new Post();
  @Input() lastReply?: number;
  @Input() messageSender?: boolean;
  @Input() isMainPostThread = false;
  @Input() hideEmojiPicker = false;
  @Output() showEmojiPicker = new EventEmitter<boolean>();
  @Output() threadId = new EventEmitter<string>();

  author: User | undefined;
  emojiPicker = false;
  postReactions: Reaction[] = [];
  groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};
  currentUser: User | undefined;

  private usersSub = new Subscription();
  private emojiSub = new Subscription();

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private usersService: UsersService,
    private reactionsService: ReactionsService,
    @Inject(TimeService) public timeService: TimeService
  ) {
    this.usersSub = this.subUsers();
    this.subAuth();
    this.emojiSub = this.subEmoji();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post'] && changes['post'].currentValue) {
      this.author = this.getAuthor();
    }
  }


  ngOnDestroy(): void {
    this.usersSub.unsubscribe();
    this.emojiSub.unsubscribe();
  }


  onShowEmojiPicker() {
    this.emojiPicker = !this.emojiPicker;
    this.showEmojiPicker.emit(this.emojiPicker);
  }


  onOpenNewThread() {
    this.threadId.emit(this.post.thread.thread_id);
  }


  getAuthor(): User | undefined {
    if (this.post && this.post.user_id) {
      const user = this.usersService.getUserByUid(this.post.user_id);
      if (!user) {
        console.error(`Benutzer mit der UID ${this.post.user_id} wurde nicht gefunden.`);
      }
      return user;
    }
    return undefined; // Falls this.post undefined ist oder this.post.user_id nicht gesetzt ist
  }


  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => this.author = this.getAuthor());
  }


  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) {
        this.currentUser = this.usersService.getUserByUid(uid);
      }
    });
  }


  openUserProfile(uid: string): void {
    if (uid) {
      this.dialog.open(UserProfileCardComponent);
      // TO DO: Übertragung der UID an ProfileCardComponent
    }
  }


  subEmoji(): Subscription {
    return this.reactionsService.reactions$.subscribe((reactions) => {
      this.postReactions = this.reactionsService.getPostReactions(reactions, this.post.post_id);
      this.groupedEmojis = this.reactionsService.getGroupedEmojis(this.postReactions);
    });
  }


  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }


  onHandleEmoji(emoji: string) {
    let currentEmoji = this.postReactions?.find(r => r.emoji === emoji && r.user_id === this.currentUser?.uid);
    if (currentEmoji) {
      this.reactionsService.deleteDoc(currentEmoji.reaction_id);
    } else {
      this.reactionsService.addDoc(new Reaction({
        user_id: this.currentUser?.uid,
        post_id: this.post.post_id,
        emoji: emoji
      }));
    }
  }


  addEmoji(event: any) {
    let currentEmoji = this.postReactions?.find(r => r.emoji === event.emoji.native && r.user_id === this.currentUser?.uid);
    if (!currentEmoji) {
      this.reactionsService.addDoc(new Reaction({
        user_id: this.currentUser?.uid,
        post_id: this.post.post_id,
        emoji: event.emoji.native
      }));
    }
    this.emojiPicker = !this.emojiPicker;
  }
}

