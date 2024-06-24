import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  private authService = inject(AuthService);
  user = {
    name: '',
    email: '',
    password: ''
  }
  // ToDo:
  // - Impressum: Input-Variable, um Back-Button auszublenden?? Oder stattdessen beim Aufrufen der Privacy Policy Login-Daten zwischenspeichern (z.B. als Service)
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) { this.signUp() }
    else { console.error('Sign up failed.') }
  }

  signUp() {
    this.authService.register(this.user.name, this.user.email, this.user.password).subscribe({
      next: () => {
        const uid = this.authService.getCurrentUid();
        console.log(uid);
      },
      error: (err) => console.error(err)
    });
  }
}
