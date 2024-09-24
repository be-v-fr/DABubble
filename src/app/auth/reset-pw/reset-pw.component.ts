import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';


/**
 * This component displays the password reset page with the reset form at the center.
 */
@Component({
  selector: 'app-reset-pw',
  standalone: true,
  imports: [FormsModule, RouterLink, LegalFooterComponent, ToastNotificationComponent],
  templateUrl: './reset-pw.component.html',
  styleUrl: './reset-pw.component.scss'
})
export class ResetPwComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Form data */
  passwords = {
    password: '',
    passwordConfirmation: ''
  }

  /** Toast notification display state */
  showToast: boolean = false;

  /** Storage for any authentication error response from backend */
  authError: string | null = null;

  /** Loading state during data processing / toast notification / backend communication */
  loading: boolean = false;

  /** oobCode received from email link and transmitted via auth.guard */
  oobCode: string = '';


  /**
   * This function obtains the OOBCode from the Firebase email URL
   * and stores it in the "oobCode" property. 
   */
  ngOnInit(): void {
      this.route.queryParams.subscribe(params => this.oobCode = params['oobCode']);
  }


  /**
   * This function validates the reset form input fields.
   * @param form - password reset form
   * @returns validation result
   */
  validateForm(form: NgForm) {
    return form.valid && this.passwords.password == this.passwords.passwordConfirmation;
  }


  /**
   * This function is triggered by the reset form submission.
   * @param form - password reset form
   */
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid && this.oobCode.length > 0) {this.resetPassword() }
  }


  /**
   * This function resets the password using the authentication service.
   */
  resetPassword() {
    this.loading = true;
    this.authService.resetPassword(this.oobCode, this.passwords.password).subscribe({
      next: () => this.onPasswordReset(),
      error: () => this.onError() 
    })
  }


  /**
   * This function is triggered by the password reset.
   */
  onPasswordReset() {
    this.showToast = true;
  }


  /**
   * This function handles errors/exceptions during password reset.
   * @param err - error
   */
  onError() {
    this.setAuthError();
    this.loading = false;    
  }


  /**
   * This function sets the error message to be displayed to the user.
   */
  setAuthError() {
    this.authError = 'Zurücksetzen fehlgeschlagen. Bitte versuchen Sie es erneut.';
  }


  /**
   * This function is called when the toast notification timeout has expired.
   */
  afterToast() {
    this.router.navigateByUrl('auth/logIn');
  }
}