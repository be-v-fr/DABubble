import { Component, Inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.class';
import { EditMainUserProfileCardComponent } from '../edit-main-user-profile-card/edit-main-user-profile-card.component';
import { EditMainUserAvatarComponent } from '../../main-user/edit-main-user-avatar/edit-main-user-avatar.component';
import { ActivityService } from '../../../services/activity.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-main-user-profile-card',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './main-user-profile-card.component.html',
    styleUrl: './main-user-profile-card.component.scss'
})
export class MainUserProfileCardComponent {
    public mainUser: User = new User;

    constructor (
        private dialogRef: MatDialogRef<MainUserProfileCardComponent>,
        private dialogAvatarRef: MatDialogRef<EditMainUserAvatarComponent>,
        public dialogUserRef: MatDialogRef<EditMainUserProfileCardComponent>,
        public activityService: ActivityService,
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

    openEditAvatar() {
        this.dialogAvatarRef = this.dialog.open(EditMainUserAvatarComponent, {
            data: {
                mainUser: this.mainUser
            }
        });

        this.dialogAvatarRef.afterOpened().subscribe( () => {
            this.closeDialog();
        });

        this.dialogAvatarRef.afterClosed().subscribe(result => {
            console.log('The dialog "EditMainUserAvatar" was Closed.', result);
        });
    }



}
