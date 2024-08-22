import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ActivityService } from '../../../services/activity.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-activity-state-dot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-state-dot.component.html',
  styleUrl: './activity-state-dot.component.scss'
})
export class ActivityStateDotComponent {
  @Input() user: User = new User();
  private activityService = inject(ActivityService);

  getState(): 'active' | 'idle' | 'loggedOut' {
    return this.activityService.getUserState(this.user);
  }
}