import { Component, input, inject } from '@angular/core';
import { TimeService } from '../../../services/time.service';

@Component({
  selector: 'app-time-separator',
  standalone: true,
  imports: [],
  templateUrl: './time-separator.component.html',
  styleUrl: './time-separator.component.scss'
})
export class TimeSeparatorComponent {
  timestamp = input.required<number>();
  public timeService = inject(TimeService);
}
