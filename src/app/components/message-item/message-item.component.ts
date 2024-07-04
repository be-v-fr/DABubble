import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
import { ThreadsService } from '../../../services/content/threads.service';
import { Thread } from '../../../models/thread.class';
@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, TimeSeparatorComponent, PickerComponent],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss'
})
export class MessageItemComponent {

  @Input() emojis: { unified: string, native: string, count: number }[] = [];
  @Input() messageSender = false;
  @Input() hideEmojiPicker = false;
  @Output() showEmojiPicker = new EventEmitter<boolean>();
  @Output() id = new EventEmitter<string>();

  constructor(
    private dialog: MatDialog,
    private threadService: ThreadsService
  ) { }

  emojiPicker = false;

  onShowEmojiPicker() {
    this.emojiPicker = !this.emojiPicker;
    this.showEmojiPicker.emit(this.emojiPicker);
  }

  async onOpenNewThread() {
    try {
      const threadId = await this.threadService.addDoc(new Thread({
        channel_id: 'test2-ljbkjvkjvkjv',
        date: new Date().getTime(),
      }));
      this.id.emit(threadId);
    } catch (err) {
      console.error('Error adding document:', err);
    }
  }


  openUserProfile(): void {
    this.dialog.open(UserProfileCardComponent);
  }
}

