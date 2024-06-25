import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-request-pw-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent],
  templateUrl: './request-pw-reset.component.html',
  styleUrl: './request-pw-reset.component.scss'
})
export class RequestPwResetComponent {
  private authService = inject(AuthService);
  data = {
    email: ''
  }
  

  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {this.requestPasswordReset()}
  }


  requestPasswordReset() {
    this.authService.requestPasswordReset(this.data.email);
    // Notification: Email sent ??
  }
}
