import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivityService } from '../../../services/activity.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-activity-state-dot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-state-dot.component.html',
  styleUrl: './activity-state-dot.component.scss'
})
export class ActivityStateDotComponent implements OnInit, OnDestroy {
  @Input() user: User = new User();
  private activityService = inject(ActivityService);
  public state: 'active' | 'idle' | 'loggedOut' = 'active';
  private interval: any | null = null;

  ngOnInit(): void {
    this.updateState();
    setTimeout(() => this.updateState(), 400);
    this.interval = setInterval(() => this.updateState(), 3 * 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  updateState(): void {
    this.state = this.activityService.getUserState(this.user);
  }
}