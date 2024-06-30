import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ExpandableButtonComponent } from '../components/expandable-button/expandable-button.component';
@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {
  constructor(public dialogRef: MatDialogRef<ExpandableButtonComponent>) { }

  onCancel() {
    this.dialogRef.close();
  }
}
