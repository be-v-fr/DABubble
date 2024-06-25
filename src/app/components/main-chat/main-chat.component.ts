import { Component, input } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { MessageItemComponent } from '../message-item/message-item.component';
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
  title = input.required<string>();
  messages = true;
  emojiPicker = false;
}
