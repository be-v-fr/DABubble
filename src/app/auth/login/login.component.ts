import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  userData = {
    uid: '',
    name: '',
    email: '',
    password: ''
  }
  authError: string | null = null;
  showToast: boolean = false;
  // ToDo:
  // - General Functionality
  //    - Guest Login
  //
  // Details:
  // - Password visibility options (if desired)
  // - DABubble Logo should be clickable
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {this.logIn()}
  }

  logIn() {
    this.showToast = true;
    this.authService.logIn(this.userData.email, this.userData.password).subscribe({
      next: () => this.onLogIn(),
      error: (err) => this.setAuthError(err.toString())
    });
  }

  logInWithGoogle() {
    this.authService.logInWithGoogle().subscribe({
      next: () => {
        this.showToast = true;
        const userRef = this.authService.getCurrent();
        if(userRef) {
          this.usersService.addUser(new User({
            uid: userRef.uid,
            name: userRef.displayName,
            email: userRef.email
          }));
        }
        this.onLogIn();
      },
      error: (err) => this.setAuthError(err.toString())
    });
  }

  logInAsGuest() {
    this.showToast = true;
    this.authService.logInAsGuest().subscribe({
      next: () => this.onLogIn(),
      error: (err) => this.setAuthError(err.toString())
    });    
  }

  setAuthError(response?: string) {
    this.authError = response ? this.getAuthError(response) : this.getAuthError();
  }

  getAuthError(response?: string): string {
    if(response && response.includes('auth/invalid-credential')) {
      return 'Falsches Passwort oder E-Mail-Adresse.'
    } else {
      return 'Anmeldung fehlgeschlagen.'
    }
  }

  resetAuthError(): void {
    this.authError = null;
  }

  onLogIn() {
    const uid = this.authService.getCurrentUid();
    console.log(uid); // remove later
    if(!this.showToast) {this.redirect()}
  }

  afterToast() {
    this.showToast = false;
    this.redirect();
    console.log('afterToast() called'); // remove later
  }

  redirect() {

  }
}
