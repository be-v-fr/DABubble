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
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ClickStopPropagationDirective } from '../shared/click-stop-propagation.directive';
import { ReactionService } from '../../services/content/reaction.service';
import { ChannelsService } from '../../services/content/channels.service';
import { Channel } from '../../models/channel.class';
import { MobileViewService } from '../../services/mobile-view.service';


/**
 * This component represents the main home screen of the application, 
 * handling navigation, router outlet with chat channels, and
 * the emoji reaction picker.
 */
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
    public reactionsService = inject(ReactionService);
    public mobileViewService = inject(MobileViewService);
    private authSub = new Subscription();
    private usersSub = new Subscription();
    private channelsSub = new Subscription();
    public currentUser = new User();
    public users: User[] = [];
    public userChannels: Channel[] = [];
    public showNav = true;
    public reactionsPickerVisible = false;

    constructor() { }


    /**
     * Lifecycle hook called when the component is initialized.
     * Subscribes to various data streams and syncs the current user and reactions.
     */
    ngOnInit(): void {
        this.syncCurrentUser();
        this.authSub = this.subAuth();
        this.reactionsService.reactionsPicker$.subscribe((rp) => {
            this.reactionsPickerVisible = rp;
        });
    }


    /**
     * Lifecycle hook called when the component is destroyed.
     * Unsubscribes from all active subscriptions to prevent memory leaks.
     */
    ngOnDestroy(): void {
        this.authSub.unsubscribe();
        this.usersSub.unsubscribe();
        this.channelsSub.unsubscribe();
    }


    /**
     * Subscribes to authentication changes. 
     * Updates user and channel data when the authentication state changes.
     */
    subAuth(): Subscription {
        return this.authService.user$.subscribe((user) => {
            if (user) {
                this.syncCurrentUser();
                this.syncUsers();
                this.setUserChannels(this.channelsService.channels);
                this.usersSub = this.subUsers();
                this.authService.isGoogleUser = user.providerData[0].providerId.includes('google');
            }
        });
    }


    /**
     * Subscribes to changes in the list of users.
     * Updates user and channel data whenever the users change.
     */
    subUsers(): Subscription {
        return this.usersService.users$.subscribe(() => {
            this.syncCurrentUser();
            this.syncUsers();
            this.setUserChannels(this.channelsService.channels);
            this.channelsSub = this.subChannels();
        });
    }


    /**
     * Subscribes to changes in the list of channels.
     * Filters and updates the channels relevant to the current user.
     */
    subChannels(): Subscription {
        return this.channelsService.channels$.subscribe((channels: Channel[]) => this.setUserChannels(channels));
    }


    /**
     * Filters the list of all channels to include only the channels 
     * the current user is a member of.
     */
    setUserChannels(allChannels: Channel[]): void {
        this.userChannels = allChannels.filter(c => c.members.some(m => m.uid === this.currentUser.uid));
    }


    /**
     * Syncs the list of users from the UsersService.
     */
    syncUsers(): void {
        this.users = this.usersService.users;
    }


    /**
     * Syncs the current user based on their UID from the authentication service.
     */
    syncCurrentUser(): void {
        const uid = this.authService.getCurrentUid();
        if (uid) {
            const user = this.usersService.getUserByUid(uid);
            if (user) {
                this.currentUser = user;
            }
        }
    }


    /**
     * Toggles the visibility of the navigation panel.
     */
    onShowNavigation() {
        this.showNav = !this.showNav;
    }


    /**
     * Handles the addition of an emoji reaction. 
     * Either sets a new reaction to a message or adds a reaction
     * which is already present.
     */
    async onAddReaction(event: { emoji: { native: string } }) {
        if (this.reactionsService.reactionToMessage || this.reactionsService.reactionToEditMessage) {
            this.reactionsService.setReaction(event.emoji.native);
        } else {
            this.reactionsService.addReaction(event, this.currentUser);
        }
        this.reactionsService.reactionToMessage = false;
        this.reactionsService.reactionToEditMessage = false;
    }


    /**
     * Closes the emoji reactions picker.
     */
    closeReactionsPicker() {
        this.reactionsService.reactionToMessage = false;
        this.reactionsService.reactionToEditMessage = false;
        this.reactionsService.toggleReactionsPicker();
    }
}
