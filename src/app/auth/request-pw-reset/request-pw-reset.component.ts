import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';


/**
 * This component displays the password reset request page with the request form at the center.
 */
@Component({
  selector: 'app-request-pw-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent, ToastNotificationComponent],
  templateUrl: './request-pw-reset.component.html',
  styleUrl: './request-pw-reset.component.scss'
})
export class RequestPwResetComponent {
  private authService = inject(AuthService);

  /** Form data */
  data = {
    email: ''
  }

  /** Toast notification display state */
  showToast: boolean = false;

  /** Loading state during data processing / toast notification / backend communication */
  loading: boolean = false;


  /**
   * This function is triggered by the request form submission.
   * @param form - request form
   */
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) { this.requestPasswordReset() }
  }


  /**
   * This function requests the password reset using the authentication service.
   */
  requestPasswordReset() {
    this.loading = true;
    this.authService.requestPasswordReset(this.data.email).subscribe({
      next: () => this.onRequest(),
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }


  /**
   * This function is triggered by the password reset request.
   */
  onRequest() {
    this.showToast = true;
  }


  /**
   * This function is called when the toast notification timeout has expired.
   */
  afterToast() {
    this.loading = false;
  }
}
