import { Component, EventEmitter, inject, Output } from '@angular/core';
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
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ClickStopPropagationDirective } from '../shared/click-stop-propagation.directive';
import { ReactionService } from '../../services/content/reaction.service';
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
        ThreadComponent,
        PickerComponent,
        ClickStopPropagationDirective,
    ]
})
export class HomeComponent {
    private authService = inject(AuthService);
    public usersService = inject(UsersService);
    private channelsService = inject(ChannelsService);
    public activityService = inject(ActivityService);
    public reactionsPicker = inject(ReactionService);

    private authSub = new Subscription();
    private usersSub = new Subscription();
    private channelsSub = new Subscription();
    public currentUser = new User();
    public users: User[] = [];
    public userChannels: Channel[] = [];

    public showNav = true;
    public reactionsPickerVisible = false;

    constructor(public reactionsService: ReactionService) { }


    ngOnInit(): void {
        this.syncCurrentUser();
        this.authSub = this.subAuth();
        this.reactionsService.reactionsPicker$.subscribe((rp) => {
            this.reactionsPickerVisible = rp;
        })
    }

    ngOnDestroy(): void {
        this.authSub.unsubscribe();
        this.usersSub.unsubscribe();
        this.channelsSub.unsubscribe();
    }

    subAuth(): Subscription {
        return this.authService.user$.subscribe((user) => {
            if (user) {
                this.syncCurrentUser();
                this.syncUsers();
                this.setUserChannels(this.channelsService.channels);
                this.usersSub = this.subUsers();
            }
        });
    }

    subUsers(): Subscription {
        return this.usersService.users$.subscribe(() => {
            this.syncCurrentUser();
            this.syncUsers();
            this.setUserChannels(this.channelsService.channels);
            this.channelsSub = this.subChannels();
        });
    }

    subChannels(): Subscription {
        return this.channelsService.channels$.subscribe((channels: Channel[]) => this.setUserChannels(channels));
    }

    setUserChannels(allChannels: Channel[]): void {
        this.userChannels = allChannels.filter(c => c.members.some(m => m.uid === this.currentUser.uid));
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
            }
        }
    }

    onShowNavigation() {
        this.showNav = !this.showNav;
    }

    async onAddReaction(event: { emoji: { native: string } }) {
        if (this.reactionsService.reactionToMessage || this.reactionsService.reactionToEditMessage) {
            this.reactionsService.setReaction(event.emoji.native);
        } else {
            this.reactionsService.addReaction(event, this.currentUser); 
        }
        this.reactionsService.reactionToMessage = false;
        this.reactionsService.reactionToEditMessage = false;
    }

    closeReactionsPicker() {
        this.reactionsService.reactionToMessage = false;
        this.reactionsService.reactionToEditMessage = false;
        this.reactionsService.toggleReactionsPicker();
    }
}
