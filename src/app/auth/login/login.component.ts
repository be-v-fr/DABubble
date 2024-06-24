import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent],
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
  // ToDo:
  // - General Functionality
  //    - Guest Login
  //    - Google Login
  //
  // Details:
  // - Password visibility options (if desired)
  // - DABubble Logo should be clickable
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {this.logIn()}
  }

  logIn() {
    this.authService.logIn(this.user.email, this.user.password).subscribe({
      next: () => {
        const uid = this.authService.getCurrentUid();
        console.log(uid);
      },
      error: (err) => this.setAuthError(err.toString())
    });
  }

  logInWithGoogle() {
    this.authService.logInWithGoogle();
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
}
