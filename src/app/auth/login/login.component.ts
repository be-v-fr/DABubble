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
  // ToDo:
  // - General Functionality
  //    - Guest Login
  //    - Google Login
  // - Error: "Login failed"
  //
  // Details:
  // - Password visibility options (if desired)
  // - DABubble Logo should be clickable
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {this.logIn()}
    else {console.error('Sign up failed.')}
  }

  logIn() {
    this.authService.logIn(this.user.email, this.user.password).subscribe({
      next: () => {
        const uid = this.authService.getCurrentUid();
        console.log(uid);
      },
      error: (err) => console.error(err)
    });
  }
}
