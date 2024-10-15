import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { StorageService } from '../../../services/storage.service';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';


/**
 * This component displays the avatar picking page
 * with the avatar picking form at the center.
 */
@Component({
  selector: 'app-pick-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent],
  templateUrl: './pick-avatar.component.html',
  styleUrl: './pick-avatar.component.scss'
})
export class PickAvatarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  userData = {
    uid: '',
    name: '...',
    email: '',
    avatarSrc: 'assets/img/profile_blank.svg'
  }
  userSub = new Subscription();
  usersSub = new Subscription();
  customFile: any = '';
  loading: boolean = true;
  initializing: boolean = true;
  fileError: string | null = null;


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


  /**
   * This function defines the user authentication process.
   * @returns authentication service subscription
   */
  subUser(): Subscription {
    return this.authService.user$.subscribe((user) => {
      if (user && user.displayName) {
        this.loading = false;
        this.initializing = false;
        const uid = this.authService.getCurrentUid();
        if (uid) { this.userData.uid = uid };
        this.setPreSelectionAvatar();
        this.userData.name = user.displayName;
        this.userData.email = user.email;
      }
    });
  }


  /**
   * This function sets the avatar which is displayed to the user
   * before the user has selected any avatar. (Google users are being
   * displayed their Google avatar.)
   */
  setPreSelectionAvatar() {
    this.syncAvatar();
    this.usersSub = this.subUsers();
  }


  /**
 * Diese Funktion aktualisiert die "avatarSrc"-Eigenschaft des "userData"-Objekts im Benutzerservice.
 */
  syncAvatar() {
    const user = this.usersService.getUserByUid(this.userData.uid);
    if (user) {
      this.userData.avatarSrc = user.avatarSrc;
    } else {
      console.error(`Benutzer mit der UID ${this.userData.uid} wurde nicht gefunden.`);
    }
  }



  /**
   * This function defines the users synchronization process.
   * @returns users service subscription
   */
  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => this.syncAvatar());
  }


  /**
   * This function sets a selected avatar from the default avatars assortment.
   * @param index avatar index as in the corresponding file name
   */
  async selectDefaultAvatar(index: string) {
    this.loading = true;
    this.resetFileError();
    const user = this.usersService.getUserByUid(this.userData.uid);
    if (user) {
      user.avatarSrc = (index === 'blank' ? 'assets/img/profile_blank.svg' : `assets/img/avatar/avatar_${index}.svg`);
      await this.usersService.updateUser(user);
      this.userData.avatarSrc = user.avatarSrc;
    }
    this.loading = false;
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
      this.storageService.uploadAvatar(input.files[0], this.userData.uid)
        .then((response) => this.onCustomUpload(response))
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
   * This function sets the "fileError" property.
   * @param response - error from upload or update response
   */
  setFileError(response?: string) {
    this.fileError = response ? this.getFileError(response) : this.getFileError();
  }


  /**
   * This function translates the internal error messages to German error messages
   * to be displayed to the user.
   * @param response - error from upload or update response
   * @returns German error message for the UI
   */
  getFileError(response?: string): string {
    if (response && response.includes('err/not-an-image')) {
      return 'Ungültiger Dateityp.'
    } else {
      return 'Upload fehlgeschlagen.'
    }
  }


  /**
   * This function removes the file error message by resetting it.
   */
  resetFileError(): void {
    this.fileError = null;
  }


  /**
   * This function is triggered by the pick avatar form submission.
   * @param form - pick avatar form
   */
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) { this.router.navigateByUrl('') }
  }
}
