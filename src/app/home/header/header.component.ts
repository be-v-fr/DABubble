import { Component, Inject, inject, Input, input } from '@angular/core';
import { EditUserLogOutCardComponent } from '../../edit-user-log-out-card/edit-user-log-out-card.component';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HomeComponent } from '../home.component';
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
  @Input() mainuser!: User;

  // readonly dialog = inject(MatDialog);
  constructor(public dialogRef: MatDialogRef<EditUserLogOutCardComponent>, 
    public dialog: MatDialog, 
    private router: Router,
    private authService: AuthService
  ) {}

  openUserLogoutCard(): void {
    this.dialogRef = this.dialog.open(EditUserLogOutCardComponent);

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog "EditUserLogOutCard" was Closed.', result);
      if (result == 'logout') {
        this.authService.logOut();
        this.router.navigate(['auth']);
      }
    });

    // this.dialogref = this.dialog.open(EditUserLogOutCardComponent);

    // // Wenn Dialog geschlossen wird, auf das Schliessen reagieren
    // this.dialogref.afterClosed().subscribe(result => {
    //   console.log('The dialog "EditUserLogOutCard" was Closed.', result);
    // });
  }
}
