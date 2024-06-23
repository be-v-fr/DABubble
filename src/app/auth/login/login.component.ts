import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, LegalFooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  // ToDo:
  // - General Functionality
  // - Validation + messages
  //
  // Details:
  // - On Input, both text color and icon color should turn to black
  // - Input style details (including "focus" in Figma\Components)
  // - Click on form field surrounding input should focus input
  // - Password visibility options
  // - DABubble Logo should be clickable
  // - Hover effect Google Button (check out Figma\Components)
}
