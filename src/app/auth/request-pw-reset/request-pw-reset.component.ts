import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';

@Component({
  selector: 'app-request-pw-reset',
  standalone: true,
  imports: [RouterLink, LegalFooterComponent],
  templateUrl: './request-pw-reset.component.html',
  styleUrl: './request-pw-reset.component.scss'
})
export class RequestPwResetComponent {

}
