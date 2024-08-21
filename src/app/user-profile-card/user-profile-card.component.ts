import { Component, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { User } from '../../models/user.class';
import { ActivityService } from '../../services/activity.service';
import { CommonModule } from '@angular/common';
import { ActivityStateDotComponent } from '../components/activity-state-dot/activity-state-dot.component';

@Component({
  selector: 'app-user-profile-card',
  standalone: true,
  imports: [RouterModule,CommonModule,RouterLink,ActivityStateDotComponent],
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.scss'
})
export class UserProfileCardComponent {
  user = new User();
  constructor(
    private dialogRef: MatDialogRef<UserProfileCardComponent>,
    public activityService: ActivityService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.user = data.viewUser;
    console.log('user-profile-card [data]: ', data);
   }
  
  closeCard(){
    this.dialogRef.close();
  }
}
