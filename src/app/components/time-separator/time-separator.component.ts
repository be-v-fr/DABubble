import { Component, input, inject, Input, OnInit } from '@angular/core';
import { TimeService } from '../../../services/time.service';
import { CommonModule } from '@angular/common';

/**
 * Component for displaying a time separator.
 * Displays a separator line if the current timestamp and the previous timestamp
 * are on different days.
 */
@Component({
  selector: 'app-time-separator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-separator.component.html',
  styleUrl: './time-separator.component.scss'
})
export class TimeSeparatorComponent implements OnInit {
  /**
   * The timestamp used to determine whether to display the separator.
   * @type {number}
   */
  timestamp = input.required<number>();

  /**
   * The previous timestamp used for comparison.
   * @type {number | null}
   */
  @Input() previous: number | null = null;

  /**
   * The TimeService used to compare timestamps.
   * @type {TimeService}
   */
  public timeService = inject(TimeService);

  /**
   * Flag indicating whether the time separator should be displayed.
   * @type {boolean}
   */
  hide: boolean = false;

  /**
   * Initializes the time separator and checks whether to display the separator.
   */
  ngOnInit(): void {
    if (this.previous) {
      this.hide = this.timeService.isOnSameDay(this.timestamp(), this.previous);
    }
  }
}
