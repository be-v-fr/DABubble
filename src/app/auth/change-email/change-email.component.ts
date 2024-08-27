import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsersService } from '../../../services/users.service';

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
  private usersService = inject(UsersService);
  private usersSub = new Subscription();

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
      this.authSub = this.subAuth();
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.usersSub.unsubscribe();
  }

  subAuth(): Subscription {
    console.log('sub!');
    return this.authService.user$.subscribe(async user => {
      console.log('triggered!', user);
      if (user && this.oobCode.length > 0) {
        console.log('new email verified (before)?', user.emailVerified);
        await this.authService.confirmEmailEdit(this.oobCode);
        console.log('new email verified (after)?', user.emailVerified);
        if(user.emailVerified) {
          this.usersSub = this.subUsers(user.uid);
        }
      }
    });
  }

  subUsers(uid: string): Subscription {
    return this.usersService.users$.subscribe(async () => {
      const user = this.usersService.getUserByUid(uid);
      if(user) {
        await this.usersService.updateUser(user);
        this.emailUpdated = true;      
      }
    })
  }
}
