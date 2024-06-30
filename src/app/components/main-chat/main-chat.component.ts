import { Component, input } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MessageItemComponent } from '../message-item/message-item.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';

import { EmojiService } from '../../../services/emoji-service/emoji-service';

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

  constructor(private emojiService: EmojiService) { }

  handleStateChange(newState: boolean) {
    this.emojiPicker = newState;
  }

  addEmoji(event: any) {
    this.emojiService.addEmoji({
      unified: event.emoji.unified,
      native: event.emoji.native
    });
    this.emojiPicker = !this.emojiPicker;
    console.log(this.emojiService.getEmojis());
  }

  get emojis() {
    return this.emojiService.getEmojis();
  }
}
