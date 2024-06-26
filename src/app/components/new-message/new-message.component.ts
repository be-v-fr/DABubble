import { Component } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [CommonModule, MessageBoxComponent, PickerComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {
  emojiPicker = false;

}
