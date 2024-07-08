import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.class';
import { ActivityService } from '../../services/activity.service';
import { MemberListComponent } from '../member-list/member-list.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-members',
  standalone: true,
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss',
  imports: [CommonModule, FormsModule, MemberListComponent],
})
export class AddMembersComponent implements OnInit {
  selection: string | null = null;
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];
  showUserList: boolean = false;
  selectedUser: User | null = null;
  activeUsers: User[] = [];
  constructor(private activityService: ActivityService,private dialogRef: MatDialogRef<any>) {}

  ngOnInit(): void {
    this.filteredUsers = this.activityService.getAllUsers();
  }

  onSearch(): void {
    const term = this.selection?.toLowerCase() || '';
    if (term) {
      this.filteredUsers = this.activityService
        .getAllUsers()
        .filter((user) => user.name.toLowerCase().includes(term));
      this.showUserList = true;
    } else {
      this.filteredUsers = [];
      this.showUserList = false;
    }
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.showUserList = false;
  }

  clearSelection(): void {
    this.selectedUser = null;
    this.selection = '';
  }

  addUserToMembers() {
    
  }

  closeCard(){
    this.dialogRef.close();
  }
}
