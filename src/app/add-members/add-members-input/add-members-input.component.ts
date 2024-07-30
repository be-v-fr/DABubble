import { Component, inject, Inject, ViewChild, ElementRef, Input, OnInit, HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { ChannelsService } from '../../../services/content/channels.service';
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
  specificPeopleSearch: string = '';
  filteredUsers: User[] = [];
  showUserList: boolean = false;
  specificPeopleSelected: User[] = [];
  @ViewChild('specificPeopleInput', { read: ElementRef }) specificPeopleInput!: ElementRef<HTMLInputElement>;
  private channelsService = inject(ChannelsService);
  private usersService = inject(UsersService);
  userListLeft: number = 0;
  userListTop: number = 0;

  constructor(private eRef: ElementRef) {

  }

  ngOnInit(): void {
    this.autofocus();
  }

  onSearch(): void {
    if (this.specificPeopleSearch.length > 0) {
      const term = this.specificPeopleSearch.toLowerCase();
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
    this.specificPeopleSelected.push(user);
    this.showUserList = false;
    this.specificPeopleSearch = '';
    this.autofocus();
  }

  clearSelection(user: User): void {
    const index = this.specificPeopleSelected.indexOf(user);
    this.specificPeopleSelected.splice(index);
  }

  onInputBackspace(): void {
    if (this.specificPeopleInput.nativeElement.value.length === 0) {
      this.specificPeopleSelected.pop();
    }
  }

  autofocus() {
    setTimeout(() => this.specificPeopleInput.nativeElement.focus(), 200);
  }
}
