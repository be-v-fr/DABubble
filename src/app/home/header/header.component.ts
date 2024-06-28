import { Component, Input } from '@angular/core';
import { EditUserLogOutCardComponent } from '../../edit-user-log-out-card/edit-user-log-out-card.component';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    EditUserLogOutCardComponent,
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

  // readonly dialog = inject(MatDialog);
  constructor(public dialogRef: MatDialogRef<EditUserLogOutCardComponent>, 
    public dialog: MatDialog, 
    private router: Router,
    private authService: AuthService
  ) {
      if (this.mainUser.uid == '') {
        console.info('mainuser is empty!'); // remove later
        // this.authService.logOut();
        // this.router.navigate(['auth']);
      } else {
        console.info('mainuser has data!'); // remove later
      }
  }
    

  openUserLogoutCard(): void {
    this.dialogRef = this.dialog.open(EditUserLogOutCardComponent, {
      data: {
        mainUser: this.mainUser
      }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog "EditUserLogOutCard" was Closed.', result); // remove later
      if (result == 'logout') {
        this.authService.logOut();
        this.router.navigate(['auth']);
      }
    });
  }
}
