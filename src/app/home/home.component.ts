import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { ThreadComponent } from '../components/thread/thread.component';
import { NavigationComponent } from '../components/navigation/navigation.component';

import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.class';
import { ActivityService } from '../../services/activity.service';
import { Subscription } from 'rxjs';
import { MainChatComponent } from '../components/main-chat/main-chat.component';
import { ChannelsService } from '../../services/content/channels.service';
import { Channel } from '../../models/channel.class';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [
        CommonModule,
        RouterOutlet,
        HeaderComponent,
        NavigationComponent,
        MainChatComponent,
        ThreadComponent
    ]
})
export class HomeComponent {
    private authService = inject(AuthService);
    private usersService = inject(UsersService);
    private channelsService = inject(ChannelsService);
    public activityService = inject(ActivityService);
    private authSub = new Subscription();
    private usersSub = new Subscription();
    private channelsSub = new Subscription();
    public currentUser = new User();
    public users: User[] = [];
    public userChannels: Channel[] = [];
    public showNav = true;

    ngOnInit(): void {
        this.syncCurrentUser();
        this.authSub = this.subAuth();
    }

    ngOnDestroy(): void {
        this.authSub.unsubscribe();
        this.usersSub.unsubscribe();
        this.channelsSub.unsubscribe();
    }

    subAuth(): Subscription {
        return this.authService.user$.subscribe((user) => {
            if (user) {
                this.syncUsers();
                this.usersSub = this.subUsers();
                this.channelsSub = this.subChannels();
            }
        });
    }

    subUsers(): Subscription {
        return this.usersService.users$.subscribe(() => {
            this.syncCurrentUser();
            console.log('current user:', this.currentUser); // remove later
            this.syncUsers();
            console.log('full users array:', this.users); // remove later
        });
    }

    subChannels(): Subscription {
        return this.channelsService.channels$.subscribe(channels => this.setUserChannels(channels));
    }

    syncUsers(): void {
        this.users = this.usersService.users;
    }

    syncCurrentUser(): void {
        const uid = this.authService.getCurrentUid();
        if (uid) { this.currentUser = this.usersService.getUserByUid(uid) }
    }

    setUserChannels(channels: Channel[]): void {
        this.userChannels = channels.filter(c => c.members_uids.includes(this.currentUser.uid));
    }

    onShowNavigation() {
        this.showNav = !this.showNav;
    }

}
