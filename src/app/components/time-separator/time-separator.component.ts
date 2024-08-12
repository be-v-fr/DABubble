import { Component, input, inject, Input, OnInit } from '@angular/core';
import { TimeService } from '../../../services/time.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-time-separator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-separator.component.html',
  styleUrl: './time-separator.component.scss'
})
export class TimeSeparatorComponent implements OnInit {
  timestamp = input.required<number>();
  @Input() previous: number | null = null;
  public timeService = inject(TimeService);
  hide: boolean = false;

  ngOnInit(): void {
    if(this.previous) {this.hide = this.timeService.isOnSameDay(this.timestamp(), this.previous)}
  }
}
