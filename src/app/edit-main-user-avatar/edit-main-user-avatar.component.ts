import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, Inject, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LegalFooterComponent } from '../auth/legal-footer/legal-footer.component';
import { AuthService } from './../../services/auth.service';
import { Subscription } from 'rxjs';
import { StorageService } from './../../services/storage.service';
import { UsersService } from './../../services/users.service';
import { User } from './../../models/user.class';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-edit-main-user-avatar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        LegalFooterComponent,
        MatDialogModule,
    ],
    templateUrl: './edit-main-user-avatar.component.html',
    styleUrl: './edit-main-user-avatar.component.scss',
})
export class EditMainUserAvatarComponent implements OnInit, OnDestroy {
    private authService = inject(AuthService);
    private storageService = inject(StorageService);
    private usersService = inject(UsersService);
    public userData: User = new User;   
    private router = inject(Router);

    @Inject(MAT_DIALOG_DATA) public data: any;
    @Output() avatarChanged = new EventEmitter<string>();
    userSub = new Subscription();
    usersSub = new Subscription();
    customFile: any = '';
    defaultAvatar: string = '';
    loading: boolean = true;
    initializing: boolean = true;
    fileError: string | null = null;

    constructor(private dialogRef: MatDialogRef<EditMainUserAvatarComponent>) {}

    /**
     * This function creates an authentication service subscription for user authentication.
     */
    ngOnInit(): void {
        this.userSub = this.subUser();
    }

    /**
     * This function unsubscribes all subscriptions.
     */
    ngOnDestroy(): void {
        this.userSub.unsubscribe();
        this.usersSub.unsubscribe();
    }

    subUser(): Subscription {
        return this.authService.user$.subscribe((user) => {
            if (user && user.displayName) {
                this.loading = false;
                const uid = this.authService.getCurrentUid();
                if (uid) {
                    this.userData.uid = uid;
                }
                this.userData.name = user.displayName;
                this.syncAvatar(); // Synchronize avatar when user data is retrieved
            }
        });
    }

    /**
     * This function updates the "userData" property avatar to the users service.
     */
    syncAvatar() {
        this.userData.avatarSrc = this.usersService.getUserByUid(this.userData.uid).avatarSrc;
        this.userData.email = this.usersService.getUserByUid(this.userData.uid).email;
        this.userData.lastActivity = this.usersService.getUserByUid(this.userData.uid).lastActivity;
    }

    /**
     * This function sets a selected avatar from the default avatars assortment.
     * @param index avatar index as in the corresponding file name
     */
    selectDefaultAvatar(index: string) {
        this.resetFileError();
        this.userData.avatarSrc = `assets/img/avatar/avatar_${index}.svg`;
        console.log('edit-main-user-avatar - selectDefAvatar - userData: ', this.userData);
        this.defaultAvatar = index;
        this.avatarChanged.emit(this.userData.avatarSrc);
    }

    /**
     * This function handles custom avatar selection by contacting the file storage service.
     * @param e click event on hidden file input element (triggered by custom upload button)
     */
    async onCustomSelection(e: Event) {
        this.resetFileError();
        this.loading = true;
        const input = e.target as HTMLInputElement;
        if (input.files) {
            this.storageService
                .uploadAvatar(input.files[0], this.userData.uid)
                // .then((response) => this.onCustomUpload(response))
                .catch((err: Error) => this.onError(err));
        }
    }

    /**
     * This function handles errors/exceptions during avatar picking.
     * @param err - error
     */
    onError(err: Error) {
        this.setFileError(err.toString());
        this.loading = false;
    }

    /**
     * This function sets the "fileError" property.
     * @param response - error from upload or update response
     */
    setFileError(response?: string) {
        this.fileError = response
        ? this.getFileError(response)
        : this.getFileError();
    }

    /**
     * This function translates the internal error messages to German error messages
     * to be displayed to the user.
     * @param response - error from upload or update response
     * @returns German error message for the UI
     */
    getFileError(response?: string): string {
        if (response && response.includes('err/not-an-image')) {
            return 'Ungültiger Dateityp.';
        } else {
            return 'Upload fehlgeschlagen.';
        }
    }

    /**
     * This function removes the file error message by resetting it.
     */
    resetFileError(): void {
        this.fileError = null;
    }

    /**
     * This function unselects the current avatar in favor of
     * a blank user profile picture.
     */
    unselectAvatar() {
        this.userData.avatarSrc = 'assets/img/profile_blank.svg';
        this.avatarChanged.emit(this.userData.avatarSrc);
        this.resetFileError();
    }

    saveAvatar() {
        this.usersService
            .updateUser(new User(this.userData))
            .then(() => {
                this.dialogRef.close(this.userData);
            })
        .catch((err: Error) => this.onError(err));
    }
}
