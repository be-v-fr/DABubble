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
    avatarSrc: 'assets/img/profile_blank.svg'
  }
  userSub = new Subscription();
  usersSub = new Subscription();
  customFile: any = '';
  loading: boolean = true;
  initializing: boolean = true;
  fileError: string | null = null;

  ngOnInit(): void {
    this.userSub = this.subUser();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.usersSub.unsubscribe();
  }

  subUser(): Subscription {
    return this.authService.user$.subscribe((user) => {
      if (user && user.displayName) {
        this.loading = false;
        this.initializing = false;
        const uid = this.authService.getCurrentUid();
        if (uid) {this.userData.uid = uid};
        this.setPreSelectionAvatar();
        this.userData.name = user.displayName;
      }
    });
  }


  setPreSelectionAvatar() {
    this.syncAvatar();
    this.usersSub = this.subUsers();
  }

  syncAvatar() {
    this.userData.avatarSrc = this.usersService.getUserByUid(this.userData.uid).avatarSrc;
  }


  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => this.syncAvatar());
  }

  selectDefaultAvatar(index: string) {
    this.resetFileError();
    this.userData.avatarSrc = `assets/img/avatar/avatar_${index}.svg`;
  }

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

  onError(err: Error) {
    this.setFileError(err.toString());
    this.loading = false;    
  }

  async onCustomUpload(response: any) {
    if (response.includes(this.userData.uid)) {
      this.userData.avatarSrc = response;
      this.usersService.updateUser(new User(this.userData))
        .then(() => this.loading = false)
        .catch((err: Error) => this.onError(err));
    }
  }

  setFileError(response?: string) {
    this.fileError = response ? this.getFileError(response) : this.getFileError();
  }

  getFileError(response?: string): string {
    if (response && response.includes('err/not-an-image')) {
      return 'Ungültiger Dateityp.'
    } else {
      return 'Upload fehlgeschlagen.'
    }
  }

  resetFileError(): void {
    this.fileError = null;
  }

  unselectAvatar() {
    this.userData.avatarSrc = 'assets/img/profile_blank.svg';
    this.resetFileError();
  }

  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) { this.router.navigateByUrl('') }
  }
}
