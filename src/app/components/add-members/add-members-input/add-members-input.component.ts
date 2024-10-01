import { Component, inject, ViewChild, ElementRef, Input, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { UsersService } from '../../../../services/users.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-add-members-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-members-input.component.html',
  styleUrl: './add-members-input.component.scss'
})
export class AddMembersInputComponent implements OnInit {
  @Input() channel!: Channel;
  usersSearch: string = '';
  filteredUsers: User[] = [];
  currentFilterSelection: number | null = null;
  showUserList: boolean = false;
  @Input() selectedUsers: User[] = [];
  @Output() selectedUsersChange = new EventEmitter<User[]>();
  @Output() submit = new EventEmitter<void>();
  @ViewChild('specificPeopleInput', { read: ElementRef }) specificPeopleInput!: ElementRef<HTMLInputElement>;
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  currentUser: User | null = null;

  ngOnInit(): void {
    const uid = this.authService.getCurrentUid();
    if (uid) {
      const user = this.usersService.getUserByUid(uid);
      if (user) { this.currentUser = user }
      this.autofocus();
    }
  }

  onSearch(): void {
    if (this.usersSearch.length > 0) {
      const term = this.usersSearch.toLowerCase();
      this.filteredUsers = this.usersService.users
        .filter((u: User) => this.meetsFilterConditions(u, term));
      this.filteredUsers.length > 0 ? this.openUserList() : this.closeUserList();
    } else {
      this.filteredUsers = [];
      this.closeUserList();
    }
  }

  meetsFilterConditions(user: User, term: string): boolean {
    return user.name.toLowerCase().includes(term) &&
      user.uid != this.currentUser?.uid &&
      !this.selectedUsers.some(u => u.uid === user.uid) &&
      !this.channel.members.some(u => u.uid === user.uid);
  }

  openUserList(): void {
    this.currentFilterSelection = 0;
    this.showUserList = true;
  }

  @HostListener('document:click', ['$event'])
  closeUserList() {
    this.currentFilterSelection = null;
    this.showUserList = false;
  }

  selectUser(user: User): void {
    this.selectedUsers.push(user);
    this.showUserList = false;
    this.usersSearch = '';
    this.autofocus();
  }

  clearSelection(user: User): void {
    const index = this.selectedUsers.indexOf(user);
    this.selectedUsers.splice(index, 1);
  }

  onInputBackspace(): void {
    if (this.specificPeopleInput.nativeElement.value.length === 0) { this.selectedUsers.pop() }
  }


  /**
   * This function handles arrow up and down keyboard events. If the user list is showing,
   * users can be selected using the up and down arrows (without blurring the input field).
   * The current selection of the filtered users list works in a circular manner,
   * i.e. it jumps between the first and last user, hence the modulo calculation.
   * @param e keyboard event
   */
  selectByArrowKey(e: Event) {
    if (this.showUserList && this.currentFilterSelection != null) {
      e.preventDefault();
      e.stopPropagation();
      const keyEv = e as KeyboardEvent;
      const length = this.filteredUsers.length;
      keyEv.key === 'ArrowUp' ? this.currentFilterSelection-- : this.currentFilterSelection++;
      this.currentFilterSelection += length;
      this.currentFilterSelection %= length;
    }
  }

  handleEnterKey(e: Event) {
    if (this.showUserList && this.currentFilterSelection != null) {
      e.preventDefault();
      e.stopPropagation();
      this.selectUser(this.filteredUsers[this.currentFilterSelection]);
    } else {this.submit.emit()}
  }

  handleUserHover(filterIndex: number) {
    this.currentFilterSelection = filterIndex;
  }

  /**
   * This function focuses the user selection input field after a short timeout.
   */
  autofocus() {
    setTimeout(() => this.specificPeopleInput.nativeElement.focus(), 200);
  }
}
