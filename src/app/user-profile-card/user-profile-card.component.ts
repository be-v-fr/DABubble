import { Component, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-user-profile-card',
  standalone: true,
  imports: [RouterModule,RouterLink],
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.scss'
})
export class UserProfileCardComponent {
  constructor(
    private dialogRef: MatDialogRef<UserProfileCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    console.log(data);
   }
  
  closeCard(){
    this.dialogRef.close();
  }
}
