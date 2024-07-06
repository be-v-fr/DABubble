import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainChatComponent } from '../components/main-chat/main-chat.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { AddMembersComponent } from '../add-members/add-members.component';
@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent  {
  activeUsers: User[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { activeUsers: User[] }, private dialog:MatDialog) {
    this.activeUsers = data.activeUsers;
  }



  addmember():void{
    this.dialog.open(AddMembersComponent);
  }
}
