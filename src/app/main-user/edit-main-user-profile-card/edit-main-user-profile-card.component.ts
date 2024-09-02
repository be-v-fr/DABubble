import { Component, inject, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.class';
import { EditMainUserAvatarComponent } from '../edit-main-user-avatar/edit-main-user-avatar.component';
import { FormsModule, NgForm } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';


@Component({
    selector: 'app-edit-main-user-profile-card',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './edit-main-user-profile-card.component.html',
    styleUrl: './edit-main-user-profile-card.component.scss'
})
export class EditMainUserProfileCardComponent {
    public mainUser: User = new User;
    public userData: User = new User;
    private usersService = inject(UsersService);
    private authService = inject(AuthService);
    emailAuthError: string = '';
    showEmailSentFeedback: boolean = false;
    disableForm: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<EditMainUserProfileCardComponent>,
        private dialogAvatarRef: MatDialogRef<EditMainUserAvatarComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        console.log('Edit MainUser Card..constr. data:', data);

        this.mainUser = this.data.mainUser;
        this.userData.name = this.data.mainUser.name;
        this.userData.email = this.data.mainUser.email;
    }

    closeDialog() {
        this.dialogRef.close();
    }

    async saveMainUser() {
        this.disableForm = true;
        await this.saveName();
        this.disableForm = false;
        await this.handleEmail();
    }

    async saveName() {
        this.mainUser.name = this.userData.name;
        await this.usersService.updateUser(this.mainUser);
    }

    async handleEmail() {
        if (this.userData.email !== this.mainUser.email) {
            if (this.authService.currentUserIsGuest()) {
                await this.updateEmail();
                this.disableForm = false;
                this.closeDialog();
            } else {
                this.disableForm = true;
                this.authService.requestEmailEdit(this.userData.email).subscribe({
                    next: () => this.onEmailEditRequest(),
                    error: (err) => this.showEmailError(err)
                });
            }
        } else { this.closeDialog() }
    }


    async updateEmail() {
        this.mainUser.email = this.userData.email;
        await this.usersService.updateUser(this.mainUser);
    }


    onEmailEditRequest() {
        this.showEmailSentFeedback = true;
        setTimeout(() => {
            this.disableForm = false;
            this.closeDialog();
        }, 4000);
    }


    showEmailError(err: Error) {
        const error: string = err.toString();
        if (error.includes('auth/requires-recent-login')) {
            this.emailAuthError = 'Dein letzter Login liegt lange zurück. Logge dich aus Sicherheitsgründen bitte erneut ein und versuche es nochmal.';
            this.disableForm = false;
        }
    }


    onSubmit(form: NgForm) {
        if (form.submitted && form.valid) { this.saveMainUser(); }
    }

    openPickAvatar() {
        this.dialogAvatarRef = this.dialog.open(EditMainUserAvatarComponent, {
            data: {
                mainUser: this.mainUser
            }
        });

        this.dialogAvatarRef.afterOpened().subscribe(() => {
            this.closeDialog();
        });

        this.dialogAvatarRef.afterClosed().subscribe(result => {
            console.log('The dialog "EditMainUserAvatar" was Closed.', result);
        });
    }

}
