import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';

@Component({
  selector: 'app-reset-pw',
  standalone: true,
  imports: [FormsModule, RouterLink, LegalFooterComponent],
  templateUrl: './reset-pw.component.html',
  styleUrl: './reset-pw.component.scss'
})
export class ResetPwComponent {
  passwords = {
    password: '',
    passwordConfirmation: ''
  }


  validateForm(form: NgForm) {
    return form.valid && this.passwords.password == this.passwords.passwordConfirmation;
  }


  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {console.log('Conditions fulfilled.')}
    else {console.error('Request failed.')}
  }
}
