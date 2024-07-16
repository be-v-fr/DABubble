import { Component, EventEmitter, Input, Output, OnDestroy, Inject, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
import { Post } from '../../../models/post.class';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';
import { TimeService } from '../../../services/time.service';
import { Subscription } from 'rxjs';
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
export class MessageItemComponent implements OnInit, OnDestroy {

  @Input() post: Post = new Post();
  @Input() lastReply?: number;
  @Input() messageSender?: boolean;
  @Input() isMainPostThread = false;
  @Input() hideEmojiPicker = false;
  @Output() showEmojiPicker = new EventEmitter<boolean>();
  @Output() threadId = new EventEmitter<string>();

  author: User | undefined;
  emojiPicker = false;
  groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};
  currentUser: User | undefined;
  users?: User[];

  private authSub = new Subscription();

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(TimeService) public timeService: TimeService
  ) { }


  ngOnInit(): void {
    this.authSub = this.subAuth();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  onShowEmojiPicker() {
    this.emojiPicker = !this.emojiPicker;
    this.showEmojiPicker.emit(this.emojiPicker);
  }

  onOpenNewThread() {
    console.log(this.post);
    
    this.threadId.emit(this.post.thread.thread_id);
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

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // TO DO: Handle Emoji
  onHandleEmoji(emoji: string) {
    
  }

  addEmoji(event: any) {
    
    this.emojiPicker = !this.emojiPicker;
  }
}

