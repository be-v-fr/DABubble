import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, TimeSeparatorComponent, PickerComponent],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss'
})
export class MessageItemComponent {
  constructor(private dialog: MatDialog) { }

  @Input() emojis: { unified: string, native: string, count: number }[] = [];
  @Input() messageSender = false;
  @Input() hideEmojiPicker = false;
  @Output() showEmojiPicker = new EventEmitter<boolean>();

  emojiPicker = false;

  onShowEmojiPicker() {
    this.emojiPicker = !this.emojiPicker;
    this.showEmojiPicker.emit(this.emojiPicker);
  }

  openUserProfile(): void {
    this.dialog.open(UserProfileCardComponent);
  }
  }

