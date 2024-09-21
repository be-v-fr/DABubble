import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterLink, Router } from '@angular/router';
import { MainUserProfileCardComponent } from '../main-user-profile-card/main-user-profile-card.component';
import { AuthService } from '../../../services/auth.service';
import { ActivityService } from '../../../services/activity.service';
import { User } from '../../../models/user.class';


@Component({
    selector: 'app-edit-user-log-out-card',
    standalone: true,
    imports: [
        RouterLink,
        MatDialogModule
    ],
    providers: [],
    templateUrl: './log-out-card.component.html',
    styleUrl: './log-out-card.component.scss'
})
export class LogOutCardComponent {
    constructor(
        private router: Router,
        private authService: AuthService,
        private activityService: ActivityService,
        public dialogRef: MatDialogRef<LogOutCardComponent>,
        public dialogUserRef: MatDialogRef<MainUserProfileCardComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}

    openProfile() {
        this.dialogUserRef = this.dialog.open(MainUserProfileCardComponent, {
            data: {
                mainUser: this.data.mainUser
            }
        });
    }

    close() {
        this.dialogRef.close();
    }
  
    logMeOut() {
        try {
            this.authService.logOut();
            this.dialogRef.close('logout');
            this.router.navigate(['/auth/logIn']);
            this.activityService.currentUser = new User();
        } catch (error) {
            console.error('Error at Logout', error);
            this.dialogRef.close('logout');
        }
    }
  
    openImpress() {
        this.router.navigate(['impress']);
        this.dialogRef.close();
    }
  
    openPriPol() {
        this.router.navigate(['privacypolicy']);
        this.dialogRef.close();
    }
}
