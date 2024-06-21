import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';

@Component({
  selector: 'app-pick-avatar',
  standalone: true,
  imports: [RouterLink, LegalFooterComponent],
  templateUrl: './pick-avatar.component.html',
  styleUrl: './pick-avatar.component.scss'
})
export class PickAvatarComponent {
  // ToDo:
  // - Avatar Picker
}
