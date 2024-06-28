import { Component, EventEmitter, Output, input, output } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, TimeSeparatorComponent, PickerComponent],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss'
})
export class MessageItemComponent {
  emojis = input.required<[{ unified: string, native: string, count: number }?]>();
  hideEmojiPicker = input<boolean>(false);
  @Output() showEmojiPicker = new EventEmitter<boolean>();

  emojiPicker = false;
  emojiCount: number = 0;

  onShowEmojiPicker() {
    this.emojiPicker = !this.emojiPicker;
    this.showEmojiPicker.emit(this.emojiPicker)
  }

}
