import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditMainUserProfileCardComponent } from '../edit-main-user-profile-card/edit-main-user-profile-card.component';

@Component({
  selector: 'app-main-user-profile-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-user-profile-card.component.html',
  styleUrl: './main-user-profile-card.component.scss'
})
export class MainUserProfileCardComponent {

  constructor (
    private dialogRef: MatDialogRef<MainUserProfileCardComponent>,
    public dialogUserRef: MatDialogRef<EditMainUserProfileCardComponent>,
    public dialog: MatDialog
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }

  openEditProfile() {
    this.dialogUserRef = this.dialog.open(EditMainUserProfileCardComponent);

    this.dialogUserRef.afterOpened().subscribe( () => {
      this.closeDialog();
    });

    this.dialogUserRef.afterClosed().subscribe(result => {
      console.log('The dialog "EditMainUserProfileCard" was Closed.', result);
      
    });
  }




}
