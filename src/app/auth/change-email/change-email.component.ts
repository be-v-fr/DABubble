import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';


/**
 * This component displays the change email page,
 * where the requested email change is confirmed.
 */
@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './change-email.component.html',
  styleUrl: './change-email.component.scss'
})
export class ChangeEmailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private authSub = new Subscription();

  /** oobCode received from email link and transmitted via auth.guard */
  oobCode: string = '';

  /** Email update state */
  emailUpdated: boolean = false;


  /**
   * This function reads the oobCode from the query parameters in the URL
   * and initializes the user authentication subscription.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
      this.authSub = this.subAuth();
    });
  }


  /**
   * This function unsubscribes all subscriptions.
   */
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }


  /**
   * Within the subscription, the user is being authenticated and the oobCode is being checked.
   * If the conditions are fulfilled, the email change is being communicated to the backend and
   * the user is getting logged out (to log in again).
   * @returns {Subscription} user authentication subscription
   */
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
