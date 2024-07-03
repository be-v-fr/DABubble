import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user.class';
import { EditMainUserAvatarComponent } from '../../edit-main-user-avatar/edit-main-user-avatar.component';
import { UsersService } from '../../../services/users.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
    selector: 'app-edit-main-user-profile-card',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './edit-main-user-profile-card.component.html',
    styleUrl: './edit-main-user-profile-card.component.scss'
})
export class EditMainUserProfileCardComponent {
    public mainUser: User = new User;
    private usersService = inject(UsersService);
    userData = {
        uid: '',
        name: '',
        email: '',
        password: ''
      }
    
    constructor (
        private dialogRef: MatDialogRef<EditMainUserProfileCardComponent>,
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
            console.log('Update email necessary');
        }
        this.mainUser.name = this.userData.name;
        this.mainUser.email = this.userData.email;
        await this.usersService.updateUser(this.mainUser);
        this.closeDialog();
    }
    
    onSubmit(form: NgForm) {
        if (form.submitted && form.valid) { this.saveMainUser(); }
    }

    openPickAvatar() {
        
    }
    
}
