import { Component } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';

import { TimeSeparatorComponent } from './time-separator/time-separator.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, PickerComponent, TimeSeparatorComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  showEmojiPicker = false;

}
