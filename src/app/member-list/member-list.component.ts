import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent {
  isMenuExpanded = true;
  online = true;
}
