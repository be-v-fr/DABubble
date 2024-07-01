import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LegalFooterComponent } from './legal-footer/legal-footer.component';


/**
 * This components displays all authentication components as children via router outlet.
 * It also contains their shared style.
 */
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet, LegalFooterComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

}
