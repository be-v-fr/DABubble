import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './change-email.component.html',
  styleUrl: './change-email.component.scss'
})
export class ChangeEmailComponent implements OnInit, OnDestroy {
  oobCode: string = '';
  emailUpdated: boolean = false;
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private authSub = new Subscription();

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
      this.authSub = this.subAuth();
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  subAuth(): Subscription {
    return this.authService.user$.subscribe(async user => {
      if (user && this.oobCode.length > 0) {
        this.authService.confirmEmailEdit(this.oobCode)
          .then(() => {
            this.emailUpdated = true;
            this.authService.logOut();
          });
      }
    });
  }
}
