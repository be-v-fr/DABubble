import { Component } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';

import { TimeSeparatorComponent } from './time-separator/time-separator.component';
import { CommonModule } from '@angular/common';
import { MessageBoxComponent } from '../../components/message-box/message-box.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, PickerComponent, TimeSeparatorComponent, MessageBoxComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  showEmojiPicker = false;

}
