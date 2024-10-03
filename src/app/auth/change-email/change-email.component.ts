import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
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
export class ChangeEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  /** oobCode received from email link and transmitted via auth.guard */
  oobCode: string = '';

  /** Email update state */
  emailUpdated: boolean = false;


  /**
   * This function reads the oobCode from the query parameters in the URL
   * and confirms the email change.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
      this.authService.confirmEmailEdit(this.oobCode)
        .then(() => {
          this.emailUpdated = true;
          this.authService.logOut();
        });
    });
  }
}