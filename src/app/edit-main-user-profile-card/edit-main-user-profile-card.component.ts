import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-edit-main-user-profile-card',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './edit-main-user-profile-card.component.html',
    styleUrl: './edit-main-user-profile-card.component.scss'
})

export class EditMainUserProfileCardComponent {

    constructor (
        private dialogRef: MatDialogRef<EditMainUserProfileCardComponent>,
        public dialog: MatDialog
    ) {}
    
    closeDialog() {
        this.dialogRef.close();
    }
    
    saveMainUser() {
        
        this.closeDialog();
    }
    
}
