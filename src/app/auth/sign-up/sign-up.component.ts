import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, LegalFooterComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  // ToDo:
  // - Checkbox with Style (Material Design?)
  // - Hover effect privacy policy
  // - Impressum: Input-Variable, um Back-Button auszublenden?? Oder stattdessen beim Aufrufen der Privacy Policy Login-Daten zwsischenspeichern (z.B. als Service)
}
