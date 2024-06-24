import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';

@Component({
  selector: 'app-request-pw-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent],
  templateUrl: './request-pw-reset.component.html',
  styleUrl: './request-pw-reset.component.scss'
})
export class RequestPwResetComponent {
  data = {
    email: ''
  }
  

  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {console.log('Conditions fulfilled.')}
    else {console.error('Request failed.')}
  }
}
