import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LegalFooterComponent } from './legal-footer/legal-footer.component';
import { AnimationIntroService } from '../animation-intro/service/animation-intro.service';


/**
 * This components displays all authentication components as children via router outlet.
 * It also contains their shared style.
 */
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LegalFooterComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  public introService = inject(AnimationIntroService);
}
