import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-members',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss'
})
export class AddMembersComponent {
  selection = null;
}
