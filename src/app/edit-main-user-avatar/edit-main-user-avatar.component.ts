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
export class EditMainUserAvatarComponent {
    private authService = inject(AuthService);
    private storageService = inject(StorageService);
    private usersService = inject(UsersService);
    public userData: User = new User;
    public userTempData: User = new User;
    private userInput!: HTMLInputElement
    private router = inject(Router);

    @Output() avatarChanged = new EventEmitter<string>();
    userSub = new Subscription();
    usersSub = new Subscription();
    customFile: any = '';
    defaultAvatar: string = '-2';
    loading: boolean = false;
    showNewPicture: boolean = false;
    initializing: boolean = true;
    fileError: string | null = null;
    
    constructor(
        private dialogRef: MatDialogRef<EditMainUserAvatarComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.userData = this.data.mainUser;
        this.userTempData.uid = '' + this.data.mainUser.uid;
        this.userTempData.name = '' + this.data.mainUser.name;
        this.userTempData.email = '' + this.data.mainUser.email;
        this.userTempData.avatarSrc = '' + this.data.mainUser.avatarSrc;
        this.userTempData.lastActivity = 0 + this.data.mainUser.lastActivity;
    }


    /**
     * This function sets a selected avatar from the default avatars assortment.
     * @param index avatar index as in the corresponding file name
     */
    selectDefaultAvatar(index: string) {
        this.defaultAvatar = index;
        // this.resetFileError();
        // this.userTempData.avatarSrc = `assets/img/avatar/avatar_${index}.svg`;
        // this.avatarChanged.emit(this.userTempData.avatarSrc);
    }

    /**
     * This function sets a selected avatar from the custom avatars current or temp.
     * @param index avatar index as in the corresponding file name
     */
    selectCustomAvatar(index: string) {
        this.defaultAvatar = index;
        this.avatarChanged.emit(this.userTempData.avatarSrc);
    }

    /**
     * This function handles custom avatar selection by contacting the file storage service.
     * @param e click event on hidden file input element (triggered by custom upload button)
     */
    async onCustomSelection(e: Event) {
        this.resetFileError();
        this.loading = true;
        const input = e.target as HTMLInputElement;
        this.userInput = e.target as HTMLInputElement;
        if (input.files) {
            this.storageService
                .uploadTempAvatar(input.files[0], this.userTempData.uid)
                .then((response) => this.onCustomTempUpload(response))
                .catch((err: Error) => this.onError(err));
        }
    }

    
  /**
   * This function updates the user data to the custom avatar upload. 
   * @param response - upload process response
   */
  async onCustomUpload(response: any) {
    if (response.includes(this.userData.uid)) {
      this.userData.avatarSrc = response;
      this.usersService.updateUser(new User(this.userData))
        .then(() => this.loading = false)
        .catch((err: Error) => this.onError(err));
    }
  }


  /**
   * This function updates the user data to the custom avatar upload. 
   * @param response - upload process response
   */
  async onCustomTempUpload(response: any) {
    if (response.includes(this.userTempData.uid)) {
      this.userTempData.avatarSrc = response;
      this.defaultAvatar = '-1';
      this.loading = false;
      this.showNewPicture = true;
    //   this.usersService.updateUser(new User(this.userTempData))
    //     .then(() => this.loading = false)
    //     .catch((err: Error) => this.onError(err));
    }
  }



    async cancelTempAvatar() {
        this.loading = true;
        await this.storageService.cancelAvatar(this.userTempData.uid);
        this.dialogRef.close();
    }


    async closeDialog() {
        this.loading = true;
        await this.storageService.cancelAvatar(this.userTempData.uid);
        this.dialogRef.close();
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

    async saveAvatarOld() {
        if(this.defaultAvatar !== '-2') {
            // Anderes Bild ist ausgewählt worden
            switch (this.defaultAvatar) {
                case '00':
                case '01':
                case '02':
                case '03':
                case '04':
                case '05':
                    // Einer der Standard-Avatare gewählt
                    this.userData.avatarSrc = `assets/img/avatar/avatar_${this.defaultAvatar}.svg`;
                    this.avatarChanged.emit(this.userData.avatarSrc);
                    this.usersService
                        .updateUser(new User(this.userData))
                        .then(() => {
                            this.dialogRef.close(this.userData);
                        })
                        .catch((err: Error) => this.onError(err));
                    break;
            
                default:
                    // hochgeladenes Bild gewählt
                    this.loading = true;
                    this.resetFileError();
                    const input = this.userInput;
                    if (input.files) {
                        this.storageService
                            .uploadAvatar(input.files[0], this.userData.uid)
                            .then((response) => {
                                if (response.includes(this.userData.uid)) {
                                    this.userData.avatarSrc = response;
                                    this.usersService.updateUser(new User(this.userData))
                                        .then(() => {
                                            this.cancelTempAvatar()
                                        })
                                        .catch((err: Error) => this.onError(err));
                                }
                            })
                            .catch((err: Error) => this.onError(err));
                    }
                break;
            }
        }
        this.loading = false;
        this.dialogRef.close(this.userData);
    }





    async saveAvatar() {
        try {
            if (this.defaultAvatar !== '-2') {
                if (['00', '01', '02', '03', '04', '05'].includes(this.defaultAvatar)) {
                    // Einer der Standard-Avatare gewählt
                    this.userData.avatarSrc = `assets/img/avatar/avatar_${this.defaultAvatar}.svg`;
                    this.avatarChanged.emit(this.userData.avatarSrc);
                } else {
                    // Hochgeladenes Bild gewählt
                    this.loading = true;
                    this.resetFileError();
                    
                    const input = this.userInput;
                    if (input.files) {
                        const response = await this.storageService.uploadAvatar(input.files[0], this.userData.uid);
                        if (response.includes(this.userData.uid)) {
                            this.userData.avatarSrc = response;
                            await this.updateUserAndCloseDialog();
                            await this.cancelTempAvatar();
                            return;
                        }
                    }
                }
                await this.updateUserAndCloseDialog();
            }
        } catch (err) {
            this.onError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            this.loading = false;
            this.dialogRef.close(this.userData);
        }
    }
    
    private async updateUserAndCloseDialog() {
        await this.usersService.updateUser(new User(this.userData));
        this.dialogRef.close(this.userData);
    }
}
