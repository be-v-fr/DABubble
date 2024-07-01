import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-profile-card',
  standalone: true,
  imports: [RouterModule,RouterLink],
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.scss'
})
export class UserProfileCardComponent {
  constructor(private dialogRef: MatDialogRef<UserProfileCardComponent>) { }
  closeCard(){
    this.dialogRef.close();
  }
}
