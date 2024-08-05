import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { LogOutCardComponent } from '../../main-user/log-out-card/log-out-card.component';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { ActivityService } from '../../../services/activity.service';
import { User } from '../../../models/user.class';
import { AnimationIntroComponent } from '../../animation-intro/animation-intro.component';
import { AnimationIntroService } from '../../animation-intro/service/animation-intro.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../models/channel.class';
import { Post } from '../../../models/post.class';


@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        LogOutCardComponent,
        MatDialogModule,
        AnimationIntroComponent,
        FormsModule
    ],
    providers: [
        {
            provide: MatDialogRef,
            useValue: {}
        }
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    @Input() mainUser: User = new User;
    @Input() users: User[] = [];
    @Input() userChannels: Channel[] = [];
    searchInput: string = '';
    searchResultsChannels: Channel[] = [];
    searchResultsUsers: User[] = [];
    searchResultsPosts: Post[] = [];
    @ViewChild('searchbar', { read: ElementRef }) searchbar!: ElementRef<HTMLInputElement>;

    constructor(
        public dialogRef: MatDialogRef<LogOutCardComponent>,
        public dialog: MatDialog,
        private router: Router,
        private authService: AuthService,
        private usersService: UsersService,
        public activityService: ActivityService,
        public introService: AnimationIntroService
    ) { }

    search(): void {
        if (this.searchInput.length > 0) {
            const term: string = this.searchInput.toLowerCase();
            this.searchChannels(term);
            this.searchUsers(term);
            this.searchPosts(term);
        } else {
            this.clearSearch();
        }
    }

    searchChannels(term: string): void {
        this.searchResultsChannels = this.userChannels.filter(c => {
            return !c.isPmChannel && (
                c.name.toLowerCase().includes(term) ||
                c.description.toLowerCase().includes(term)
            );
        });
    }

    searchUsers(term: string): void {

    }

    searchPosts(term: string): void {

    }

    onCloseSearchClick(): void {
        this.clearSearch();
        this.autofocusSearch();
    }

    clearSearch(): void {
        this.searchInput = '';
        this.searchResultsChannels = [];
        this.searchResultsUsers = [];
        this.searchResultsPosts = [];
    }

    autofocusSearch(): void {
        setTimeout(() => this.searchbar.nativeElement.focus(), 20);
    }

    openUserLogoutCard(): void {
        this.dialogRef = this.dialog.open(LogOutCardComponent, {
            data: {
                mainUser: this.mainUser
            }
        });

        this.dialogRef.afterClosed().subscribe(result => {
            if (result == 'logout') {
                const user = new User(this.mainUser);
                user.lastActivity = -1;
                this.usersService.updateUser(user);
                this.authService.logOut();
                this.router.navigate(['auth/logIn']);
            }
        });
    }
}
