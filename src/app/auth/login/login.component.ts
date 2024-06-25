import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent, ToastNotificationComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  user = {
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
    this.authService.logIn(this.user.email, this.user.password).subscribe({
      next: () => this.onLogIn(),
      error: (err) => this.setAuthError(err.toString())
    });
  }

  logInWithGoogle() {
    this.authService.logInWithGoogle().subscribe({
      next: () => this.onLogIn(),
      error: (err) => this.setAuthError(err.toString())
    });
  }

  logInAsGuest() {
    this.authService.logOut();
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
    this.showToast = true; // toast is only shown AFTER successful login... should it alternatively be shown when ATTEMPTING to login?
    const uid = this.authService.getCurrentUid();
    console.log(uid); // remove later
  }

  afterToast() {
    // proceed via router
    console.log('afterToast() called');
  }
}
