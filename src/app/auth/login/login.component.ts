import { Component } from '@angular/core';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LegalFooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // ToDo:
  // - General Functionality
  //
  // Details:
  // - On Input, both text color and icon color should turn to black
  // - Click on form field surrounding input should focus input
  // - Password visibility options
  // - DABubble Logo should be clickable
}
