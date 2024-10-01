import { Component, inject, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.class';
import { EditMainUserAvatarComponent } from '../../components/edit-main-user-avatar/edit-main-user-avatar.component';
import { FormsModule, NgForm } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';

/**
 * This component is responsible for editing the current user profile.
 */

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
    public authService = inject(AuthService);
    emailAuthError: string = '';
    showEmailSentFeedback: boolean = false;
    disableForm: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<EditMainUserProfileCardComponent>,
        private dialogAvatarRef: MatDialogRef<EditMainUserAvatarComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.mainUser = this.data.mainUser;
        this.userData.name = this.data.mainUser.name;
        this.userData.email = this.data.mainUser.email;
    }

    /**
     * Close this dialog.
     */
    closeDialog() {
        this.dialogRef.close();
    }

    /**
     * Saves the edited data of the current user.
     */
    async saveMainUser() {
        this.disableForm = true;
        await this.saveName();
        this.disableForm = false;
        await this.handleEmail();
    }

    /**
     * Saves the edited data of the current user.
     */
    async saveName() {
        this.mainUser.name = this.userData.name;
        await this.usersService.updateUser(this.mainUser);
    }

    /**
     * Verifies the email address change. If the user is not a guest, redirects to send a confirmation email.
     */
    async handleEmail() {
        if (this.userData.email !== this.mainUser.email) {
            this.disableForm = true;
            if (this.authService.currentUserIsGuest()) {
                await this.updateEmail();
                this.disableForm = false;
                this.closeDialog();
            } else {
                this.requestEmailEdit();
            }
        } else { this.closeDialog() }
    }

    /**
     * Saves the edited data of the current user.
     */
    async updateEmail() {
        this.mainUser.email = this.userData.email;
        await this.usersService.updateUser(this.mainUser);
    }

    /**
     * If the email address was saved successfully, a success message will be displayed, otherwise an error message will be displayed.
     */
    requestEmailEdit() {
        this.authService.requestEmailEdit(this.userData.email).subscribe({
            next: () => this.onEmailEditRequest(),
            error: (err) => this.showEmailError(err)
        });
    }

    /**
     * This function activates the feedback after changing the email address.
     */
    onEmailEditRequest() {
        this.showEmailSentFeedback = true;
        setTimeout(() => {
            this.disableForm = false;
            this.closeDialog();
        }, 4000);
    }

    /**
     * This function is responsible for displaying a login error with the email address.
     * @param err : The detected error.
     */
    showEmailError(err: Error) {
        const error: string = err.toString();
        if (error.includes('auth/requires-recent-login')) {
            this.emailAuthError = 'Dein letzter Login liegt lange zurück. Logge dich aus Sicherheitsgründen bitte erneut ein und versuche es nochmal.';
            this.disableForm = false;
        }
    }

    /**
     * This function forwards the submission of the form.
     * @param form : The current form.
     */
    onSubmit(form: NgForm) {
        if (form.submitted && form.valid) { this.saveMainUser(); }
    }

}
