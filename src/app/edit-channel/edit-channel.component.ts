import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [FormsModule, CommonModule,],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent {
  constructor(private dialogRef: MatDialogRef<EditChannelComponent>) { }
  editMode: boolean = false;
  editDescriptionMode: boolean = false;
  editName: boolean = false;
  channelName: string = 'Entwicklerteam';

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  saveChanges() {
    this.editMode = false;
  }

  toggleEditDescriptionMode() {
    this.editDescriptionMode = !this.editDescriptionMode;
  }
  toggleEditName() {
    this.editName = !this.editName;
  }

  saveNameChanges() {
    this.editName = false;
  }

  saveDescriptionChanges() {
    this.editDescriptionMode = false;
  }

  closeChannel(){
    this.dialogRef.close();
  }

}
