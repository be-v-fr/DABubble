import { Component, inject, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.class';
import { EditMainUserAvatarComponent } from '../edit-main-user-avatar/edit-main-user-avatar.component';
import { FormsModule, NgForm } from '@angular/forms';
import { UsersService } from '../../../services/users.service';

@Component({
    selector: 'app-edit-main-user-profile-card',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './edit-main-user-profile-card.component.html',
    styleUrl: './edit-main-user-profile-card.component.scss'
})
export class EditMainUserProfileCardComponent {
    public mainUser: User = new User;
    public userData: User = new User;   
    private usersService = inject(UsersService);

    constructor (
        private dialogRef: MatDialogRef<EditMainUserProfileCardComponent>,
        private dialogAvatarRef: MatDialogRef<EditMainUserAvatarComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        console.log('Edit MainUser Card..constr. data:', data);
    
        this.mainUser = this.data.mainUser;
        this.userData.name = this.data.mainUser.name;
        this.userData.email = this.data.mainUser.email;
    }
    
    closeDialog() {
        this.dialogRef.close();
    }
    
    async saveMainUser() {
        if (this.userData.email !== this.mainUser.email) {
            console.log('Update email necessary', this.mainUser);
        }
        this.mainUser.name = this.userData.name;
        this.mainUser.email = this.userData.email;
        console.log('mainUser: ', this.mainUser);
        await this.usersService.updateUser(this.mainUser);
        this.closeDialog();
    }
    
    onSubmit(form: NgForm) {
        if (form.submitted && form.valid) { this.saveMainUser(); }
    }

    openPickAvatar() {
        this.dialogAvatarRef = this.dialog.open(EditMainUserAvatarComponent, {
            data: {
                mainUser: this.mainUser
            }
        });
      
        this.dialogAvatarRef.afterOpened().subscribe( () => {
            this.closeDialog();
        });
      
        this.dialogAvatarRef.afterClosed().subscribe(result => {
            console.log('The dialog "EditMainUserAvatar" was Closed.', result);
        });
    }
    
}
