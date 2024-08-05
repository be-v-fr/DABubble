import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ChannelsService } from '../../../services/content/channels.service';
import { Channel } from '../../../models/channel.class';
import { Post } from '../../../models/post.class';
import { Subscription } from 'rxjs';


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
export class HeaderComponent implements OnInit, OnDestroy {
    @Input() mainUser: User = new User;
    @Input() users: User[] = [];
    searchInput: string = '';
    userChannels: Channel[] = [];
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
        private channelsService: ChannelsService,
        private channelsSub: Subscription,
        public introService: AnimationIntroService
    ) { }

    ngOnInit(): void {
        this.setUserChannels(this.channelsService.channels);
        this.channelsSub = this.subChannels();
    }

    ngOnDestroy(): void {
        this.channelsSub.unsubscribe();
    }

    subChannels(): Subscription {
        return this.channelsService.channels$.subscribe((channels: Channel[]) => this.setUserChannels(channels));
    }

    setUserChannels(allChannels: Channel[]): void {
        this.userChannels = allChannels.filter(c => c.members.some(m => m.uid === this.mainUser.uid));
    }

    search(): void {
        if (this.searchInput.length > 0) {
            this.searchChannels();
            this.searchUsers();
            this.searchPosts();
        } else {
            this.clearSearch();
        }
    }

    searchChannels(): void {

    }

    searchUsers(): void {

    }

    searchPosts(): void {

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
