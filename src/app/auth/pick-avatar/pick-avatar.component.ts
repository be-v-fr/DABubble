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
  avatarSrc: string = 'assets/img/profile_blank.svg';

  selectDefaultAvatar(index: string) {
    this.avatarSrc = `assets/img/avatar/avatar_${index}.svg`;
  }

  selectCustomAvatar() {
    // implement Firebase Cloud Storage
  }

  unselectAvatar() {
    this.avatarSrc = 'assets/img/profile_blank.svg';    
  }
}
