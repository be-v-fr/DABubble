import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-channel',
  standalone: true,
  imports: [],
  templateUrl: './delete-channel.component.html',
  styleUrl: './delete-channel.component.scss'
})
export class DeleteChannelComponent {

constructor(
  private dialogRef: MatDialogRef<DeleteChannelComponent>,
) {}

close() {
  this.dialogRef.close();
}

}
