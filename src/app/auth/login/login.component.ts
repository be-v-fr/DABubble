import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';
import { AnimationIntroComponent } from '../../animation-intro/animation-intro.component';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent, ToastNotificationComponent, AnimationIntroComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private router = inject(Router)
  userData = {
    uid: '',
    name: '',
    email: '',
    password: ''
  }
  authError: string | null = null;
  showToast: boolean = false;
  loading: boolean = false;
  // ToDo:
  // - General Functionality
  //    - Guest Login
  //
  // Details:
  // - Password visibility options (if desired)
  // - DABubble Logo should be clickable
  redirectTo: 'home' | 'avatar' = 'home';
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) { this.logIn() }
  }

  logIn() {
    this.loading = true;
    this.showToast = true;
    this.authService.logIn(this.userData.email, this.userData.password).subscribe({
      next: () => this.onLogIn(),
      error: (err) => this.onError(err)
    });
  }

  onError(err: Error) {
    this.setAuthError(err.toString());
    this.loading = false;    
  }

  logInWithGoogle() {
    this.loading = true;
    this.authService.logInWithGoogle().subscribe({
      next: () => this.onGoogleLogin(),
      error: (err) => this.onError(err)
    });
  }


  onGoogleLogin() {
    this.showToast = true;
    const userRef = this.authService.getCurrent();
    if (userRef) {
      const userObj = this.constructUserFromGoogleAuth(userRef);
      this.handleGoogleUserRegistrationStatus(userObj)
        .then(() => this.onLogIn())
        .catch((err) => this.onError(err));
    }
  }


  constructUserFromGoogleAuth(authData: any): User {
    return new User({
      uid: authData.uid,
      name: authData.displayName,
      email: authData.email,
      avatarSrc: authData.photoURL
    });
  }


  async handleGoogleUserRegistrationStatus(user: User): Promise<void> {
    if (this.usersService.isRegisteredUser(user.uid)) {
      await this.usersService.updateUser(user);
      this.redirectTo = 'home';
    }
    else {
      await this.usersService.addUser(user);
      this.redirectTo = 'avatar';
    }
  }

  logInAsGuest() {
    this.loading = true;
    this.showToast = true;
    this.authService.logInAsGuest().subscribe({
      next: () => this.onLogIn(),
      error: (err) => this.onError(err)
    });
  }

  setAuthError(response?: string) {
    this.authError = response ? this.getAuthError(response) : this.getAuthError();
  }

  getAuthError(response?: string): string {
    if (response && response.includes('auth/invalid-credential')) {
      return 'Falsches Passwort oder E-Mail-Adresse.'
    } else {
      return 'Anmeldung fehlgeschlagen.'
    }
  }

  resetAuthError(): void {
    this.authError = null;
  }

  onLogIn() {
    if (!this.showToast) { this.redirect() }
  }

  afterToast() {
    this.showToast = false;
    this.redirect();
  }

  redirect() {
    let route = '';
    switch (this.redirectTo) {
      case 'home': break;
      case 'avatar': route = 'auth/pickAvatar';
    }
    this.router.navigateByUrl(route);
  }
}
