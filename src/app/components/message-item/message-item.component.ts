import { Component, EventEmitter, Input, Output, inject, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, TimeSeparatorComponent, PickerComponent],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss'
})
export class MessageItemComponent implements OnDestroy {

  @Input() post: Post = new Post();
  @Input() threadLength?: number;
  @Input() lastReply?: number;
  @Input() messageSender = false;
  @Input() hideEmojiPicker = false;
  @Output() showEmojiPicker = new EventEmitter<boolean>();

  author: User;
  emojiPicker = false;
  postReactions?: Reaction[];
  groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};
  currentUser?: User;

  public timeService = inject(TimeService);
  private usersSub = new Subscription();
  private emojiSub = new Subscription();


  constructor(
    private dialog: MatDialog,
    private threadsService: ThreadsService,
    private authService: AuthService,
    private usersService: UsersService,
    private reactionsService: ReactionsService,
  ) {
    this.author = this.getAuthor();
    this.usersSub = this.subUsers();
    this.subAuth();
    this.emojiSub = this.subEmoji();
  }


  onShowEmojiPicker() {
    this.emojiPicker = !this.emojiPicker;
    this.showEmojiPicker.emit(this.emojiPicker);
  }


  onOpenNewThread() {

  }


  getAuthor(): User {
    return this.usersService.getUserByUid(this.post.user_id);
  }


  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => this.author = this.getAuthor());
  }


  subAuth() {
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
      // TO DO: transfer UID to ProfileCardComponent
    }
  }


  subEmoji() {
    return this.reactionsService.reactions$.subscribe((reactions) => {
      this.postReactions = this.reactionsService.getPostReactions(reactions, this.post.post_id);
      this.groupedEmojis = this.reactionsService.getGroupedEmojis(this.postReactions);
    });
  }

  // Hilfsfunktion, um die Schlüssel eines Objekts zu bekommen
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }


  onHandleEmoji(emoji: string) {
    let curremoji = this.postReactions?.find(r => r.emoji === emoji && r.user_id === this.currentUser?.uid);
    if (curremoji) {
      this.reactionsService.deleteDoc(curremoji.reaction_id);
    } else {
      this.reactionsService.addDoc(new Reaction({
        user_id: this.currentUser?.uid,
        post_id: this.post.post_id,
        emoji: emoji
      }))
    }
  }


  addEmoji(event: any) {
    this.reactionsService.addDoc(new Reaction(
      {
        user_id: this.currentUser?.uid,
        post_id: this.post.post_id,
        emoji: event.emoji.native
      }
    ));

    this.emojiPicker = !this.emojiPicker;
  }


  ngOnDestroy(): void {
    this.usersSub.unsubscribe();
    this.emojiSub.unsubscribe();
  }
}

