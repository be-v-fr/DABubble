import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';

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
  passwords = {
    password: '',
    passwordConfirmation: ''
  }
  showToast: boolean = false;
  authError: string | null = null;
  loading: boolean = false;
  oobCode: string = '';

  ngOnInit(): void {
      this.route.queryParams.subscribe(params => this.oobCode = params['oobCode']);
  }


  validateForm(form: NgForm) {
    return form.valid && this.passwords.password == this.passwords.passwordConfirmation;
  }


  onSubmit(form: NgForm) {
    if (form.submitted && form.valid && this.oobCode.length > 0) {this.resetPassword() }
  }

  resetPassword() {
    this.loading = true;
    this.authService.resetPassword(this.oobCode, this.passwords.password).subscribe({
      next: () => this.onPasswordReset(),
      error: () => this.onError() 
    })
  }

  onPasswordReset() {
    this.showToast = true;
  }

  onError() {
    this.setAuthError();
    this.loading = false;    
  }

  setAuthError() {
    this.authError = 'Zurücksetzen fehlgeschlagen. Bitte versuchen Sie es erneut.';
  }

  afterToast() {
    this.router.navigateByUrl('auth');
  }
}