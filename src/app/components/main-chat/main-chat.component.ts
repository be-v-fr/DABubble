import { Component, input } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MessageItemComponent } from '../message-item/message-item.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
  imports: [
    CommonModule,
    PickerComponent,
    MessageItemComponent,
    MessageBoxComponent,
    TimeSeparatorComponent,
  ],
})
export class MainChatComponent {
  title = input<string>('Entwicklerteam');
  messages = true;
  emojiPicker = false;
  emojis: [{ unified: string, native: string, count: number }?] = [];


  handleStateChange(newState: boolean) {
    this.emojiPicker = newState;
  }

  addEmoji(event: any) {
    let isExist = this.emojis.find(e => e!.unified === event.emoji.unified);

    if (isExist) {
      isExist.count++;
    } else {
      this.emojis.push({
        unified: event.emoji.unified,
        native: event.emoji.native,
        count: 1
      })
    }
    this.emojiPicker = !this.emojiPicker;
    console.log(this.emojis);
  }
}
