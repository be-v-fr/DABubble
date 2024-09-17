import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivityService } from '../../../services/activity.service';
import { User } from '../../../models/user.class';

/**
 * Component that displays a user's activity status as a dot.
 */
@Component({
  selector: 'app-activity-state-dot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-state-dot.component.html',
  styleUrl: './activity-state-dot.component.scss'
})
export class ActivityStateDotComponent implements OnInit, OnDestroy {
  /**
   * The user whose activity status is displayed.
   * @type {User}
   */
  @Input() user: User = new User();

  /**
   * The service used to monitor user activity.
   * @type {ActivityService}
   */
  private activityService = inject(ActivityService);

  /**
   * The current status of the user.
   * @type {'active' | 'idle' | 'loggedOut'}
   */
  public state: 'active' | 'idle' | 'loggedOut' = 'active';

  /**
   * Interval ID for regularly updating the status.
   * @type {any | null}
   */
  private interval: any | null = null;

  /**
   * Initializes the component and starts the status update.
   */
  ngOnInit(): void {
    this.updateState();
    setTimeout(() => this.updateState(), 400);
    this.interval = setInterval(() => this.updateState(), 3 * 1000);
  }

  /**
   * Cleans up the interval when the component is destroyed.
   */
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  /**
   * Updates the user's activity status.
   */
  updateState(): void {
    this.state = this.activityService.getUserState(this.user);
  }
}
