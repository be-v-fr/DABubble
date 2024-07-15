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
            if (user && !(this.currentUser.uid.length > 0)) {
                this.syncUsers();
                this.usersSub.unsubscribe();
                this.usersSub = this.subUsers();
                this.channelsSub.unsubscribe();
                this.channelsSub = this.subChannels();
            }
        });
    }

    subUsers(): Subscription {
        return this.usersService.users$.subscribe(() => {
            this.syncCurrentUser();
            this.syncUsers();
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
        if (uid) {
            const user = this.usersService.getUserByUid(uid);
            if (user) {
                this.currentUser = user;
                if (this.userChannels.length === 0) {
                    this.setUserChannels(this.channelsService.channels);
                }
            }
        }
    }


    setUserChannels(channels: Channel[]): void {
        channels = channels.filter(c => c.members_uids.includes(this.currentUser.uid));
        this.userChannels = channels.sort((a, b) => {
            const textA = a.name.toLowerCase();
            const textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    }

    onShowNavigation() {
        this.showNav = !this.showNav;
    }


}
