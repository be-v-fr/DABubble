import { Component, EventEmitter, Input, Output, inject, OnDestroy } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
import { ThreadsService } from '../../../services/content/threads.service';
import { Thread } from '../../../models/thread.class';
import { Post } from '../../../models/post.class';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';
import { TimeService } from '../../../services/time.service';
import { Subscription } from 'rxjs';

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
  @Input() emojis: { unified: string, native: string, count: number }[] = [];
  @Input() messageSender = false;
  @Input() hideEmojiPicker = false;
  @Output() showEmojiPicker = new EventEmitter<boolean>();
  @Output() id = new EventEmitter<string>();
  author: User;
  public timeService = inject(TimeService);
  private usersSub = new Subscription();

  constructor(
    private dialog: MatDialog,
    private threadsService: ThreadsService,
    private usersService: UsersService
  ) {
    this.author = this.getAuthor();
    this.usersSub = this.subUsers();
  }

  emojiPicker = false;

  onShowEmojiPicker() {
    this.emojiPicker = !this.emojiPicker;
    this.showEmojiPicker.emit(this.emojiPicker);
  }

  async onOpenNewThread() {
    try {
      const threadId = await this.threadsService.addDoc(new Thread({
        channel_id: 'test2-ljbkjvkjvkjv',
        date: new Date().getTime(),
      }));
      this.id.emit(threadId);
    } catch (err) {
      console.error('Error adding document:', err);
    }
  }


  getAuthor(): User {
    return this.usersService.getUserByUid(this.post.user_id);
  }


  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => this.author = this.getAuthor());
  }


  openUserProfile(uid: string): void {
    if (uid) {
      this.dialog.open(UserProfileCardComponent);
      // TO DO: transfer UID to ProfileCardComponent
    }
  }

  ngOnDestroy(): void {
    this.usersSub.unsubscribe();
  }
}

