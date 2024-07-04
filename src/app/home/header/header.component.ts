import { Component, Input } from '@angular/core';
import { LogOutCardComponent } from '../../main-user/log-out-card/log-out-card.component';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    LogOutCardComponent,
    MatDialogModule
  ],
  providers: [
     {
       provide: MatDialogRef,
       useValue: {}
     }
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() mainUser: User = new User;

  constructor(
    public dialogRef: MatDialogRef<LogOutCardComponent>, 
    public dialog: MatDialog, 
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  openUserLogoutCard(): void {
    this.dialogRef = this.dialog.open(LogOutCardComponent, {
      data: {
        mainUser: this.mainUser
      }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog "LogOutCard" was Closed.', result); // remove later
      if (result == 'logout') {
        const user = new User(this.mainUser);
        user.lastActivity = -1;
        this.usersService.updateUser(user);
        this.authService.logOut();
        this.router.navigate(['auth/logIn']);
      }
    });
  }
}
