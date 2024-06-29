import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterLink, Router } from '@angular/router';
import { MainUserProfileCardComponent } from '../main-user-profile-card/main-user-profile-card.component';


@Component({
  selector: 'app-edit-user-log-out-card',
  standalone: true,
  imports: [
    RouterLink,
    MatDialogModule
  ],
  providers: [
    //  {
    //    provide: MatDialogRef,
    //    useValue: []
    //  }
  ],
  templateUrl: './log-out-card.component.html',
  styleUrl: './log-out-card.component.scss'
})
export class LogOutCardComponent {
  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<LogOutCardComponent>,
    public dialogUserRef: MatDialogRef<MainUserProfileCardComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    console.log('LogOut-Card..constr. data:', data);
  }

  openProfile() {
    this.dialogUserRef = this.dialog.open(MainUserProfileCardComponent, {
      data: {
        mainUser: this.data.mainUser
      }
    });

    this.dialogUserRef.afterClosed().subscribe(result => {
      console.log('The dialog "MainUserProfileCard" was Closed.', result); // remove later
    });
  }

  logMeOut() {
    this.dialogRef.close('logout');
  }
  
  openImpress() {
    this.router.navigate(['impress']);
    this.dialogRef.close();
  }
  
  openPriPol() {
    this.router.navigate(['privacypolicy']);
    this.dialogRef.close();
  }
}
