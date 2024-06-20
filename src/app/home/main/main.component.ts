import { Component } from '@angular/core';
import { TimeSeparatorComponent } from './time-separator/time-separator.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [TimeSeparatorComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
