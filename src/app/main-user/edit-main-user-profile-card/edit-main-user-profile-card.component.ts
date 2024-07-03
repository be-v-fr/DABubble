import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user.class';
import { EditMainUserAvatarComponent } from '../../edit-main-user-avatar/edit-main-user-avatar.component';

@Component({
  selector: 'app-edit-main-user-profile-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './edit-main-user-profile-card.component.html',
  styleUrl: './edit-main-user-profile-card.component.scss',
})
export class EditMainUserProfileCardComponent {
  public mainUser: User = new User();

  constructor(
    private dialogRef: MatDialogRef<EditMainUserProfileCardComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('Edit MainUser Card..constr. data:', data);

    this.mainUser = this.data.mainUser;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveMainUser() {
    this.closeDialog();
  }

  openPickAvatar(): void {
    const dialogRef = this.dialog.open(EditMainUserAvatarComponent, {
      data: { mainUser: this.mainUser },
    });

    dialogRef.componentInstance.avatarChanged.subscribe((newAvatar: string) => {
      this.mainUser.avatarSrc = newAvatar;
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.mainUser.avatarSrc = result.avatarSrc;
      }
    });
  }
}
