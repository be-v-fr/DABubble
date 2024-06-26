import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pick-avatar',
  standalone: true,
  imports: [RouterLink, LegalFooterComponent],
  templateUrl: './pick-avatar.component.html',
  styleUrl: './pick-avatar.component.scss'
})
export class PickAvatarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  user = {
    name: ''
  }
  userSub = new Subscription();
  avatarSrc: string = 'assets/img/profile_blank.svg';

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe((user) => {
      if(user && user.displayName) {
        this.user.name = user.displayName;
      }
    })
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

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
