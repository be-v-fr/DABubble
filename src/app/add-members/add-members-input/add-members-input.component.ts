import { Component, inject, ViewChild, ElementRef, Input, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-add-members-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-members-input.component.html',
  styleUrl: './add-members-input.component.scss'
})
export class AddMembersInputComponent implements OnInit {
  @Input() channel?: Channel;
  usersSearch: string = '';
  filteredUsers: User[] = [];
  showUserList: boolean = false;
  @Input() selectedUsers: User[] = [];
  @Output() selectedUsersChange = new EventEmitter<User[]>();
  @ViewChild('specificPeopleInput', { read: ElementRef }) specificPeopleInput!: ElementRef<HTMLInputElement>;
  private usersService = inject(UsersService);
  userListLeft: number = 0;
  userListTop: number = 0;

  ngOnInit(): void {
    this.autofocus();
  }

  onSearch(): void {
    if (this.usersSearch.length > 0) {
      const term = this.usersSearch.toLowerCase();
      this.filteredUsers = this.usersService
        .getAllUsers()
        .filter((u: User) => u.name.toLowerCase().includes(term));
      this.openUserList();
    } else {
      this.filteredUsers = [];
      this.closeUserList();
    }
  }

  openUserList(): void {
    this.setUserListPosition();
    this.showUserList = true;
  }

  @HostListener('document:click', ['$event'])
  closeUserList() {
    this.showUserList = false;
  }

  setUserListPosition(): void {
    const inputPosition = this.specificPeopleInput.nativeElement.getBoundingClientRect();
    this.userListLeft = inputPosition.left;
    this.userListTop = inputPosition.bottom;
  }

  selectUser(user: User): void {
    this.selectedUsers.push(user);
    this.showUserList = false;
    this.usersSearch = '';
    this.autofocus();
  }

  clearSelection(user: User): void {
    const index = this.selectedUsers.indexOf(user);
    this.selectedUsers.splice(index);
  }

  onInputBackspace(): void {
    if (this.specificPeopleInput.nativeElement.value.length === 0) {
      this.selectedUsers.pop();
    }
  }

  autofocus() {
    setTimeout(() => this.specificPeopleInput.nativeElement.focus(), 200);
  }
}
