import { Component, Inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditMainUserProfileCardComponent } from '../edit-main-user-profile-card/edit-main-user-profile-card.component';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-main-user-profile-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-user-profile-card.component.html',
  styleUrl: './main-user-profile-card.component.scss'
})
export class MainUserProfileCardComponent {
  public mainUser: User = new User;

  constructor (
    private dialogRef: MatDialogRef<MainUserProfileCardComponent>,
    public dialogUserRef: MatDialogRef<EditMainUserProfileCardComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('MainUser Profile-Card..constr. data:', data);
    
    this.mainUser = this.data.mainUser;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openEditProfile(profile: User) {
    this.dialogUserRef = this.dialog.open(EditMainUserProfileCardComponent, {
      data: {
        mainUser: this.mainUser
      }
    });

    this.dialogUserRef.afterOpened().subscribe( () => {
      this.closeDialog();
    });

    this.dialogUserRef.afterClosed().subscribe(result => {
      console.log('The dialog "EditMainUserProfileCard" was Closed.', result);
      
    });
  }




}
