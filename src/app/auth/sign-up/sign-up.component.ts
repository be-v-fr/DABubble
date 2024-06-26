import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';
import { User } from '../../../models/user.class';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent, ToastNotificationComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  user = {
    name: '',
    email: '',
    password: ''
  }
  showToast: boolean = false;
  authError: string | null = null;
  // ToDo:
  // - Während Signup disablen, um zweifaches Absenden zu unterbinden
  // - Impressum: Input-Variable, um Back-Button auszublenden?? Oder stattdessen beim Aufrufen der Privacy Policy Login-Daten zwischenspeichern (z.B. als Service)
  // - Validation: This email address is already taken
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) { this.signUp() }
    else { console.error('Sign up failed.') }
  }

  signUp() {
    this.authService.register(this.user.name, this.user.email, this.user.password).subscribe({
      next: () => this.onSignUp(),
      error: () => this.setAuthError()
    });    
  }

  onSignUp() {
    this.showToast = true;
    const uid = this.authService.getCurrentUid();
    if (uid) {
      const user = new User({
        uid: uid,
        name: this.user.name,
        email: this.user.email
      });
      this.usersService.addUser(user);
    }
  }

  setAuthError() {
    this.authError = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
  }

  afterToast() {
    this.router.navigateByUrl('auth/pickAvatar');
  }
}
