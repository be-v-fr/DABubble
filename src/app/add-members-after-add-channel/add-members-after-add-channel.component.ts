import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-members-after-add-channel',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './add-members-after-add-channel.component.html',
  styleUrl: './add-members-after-add-channel.component.scss'
})
export class AddMembersAfterAddChannelComponent {
  selection = null;
  specificPeople: string = '';
}
