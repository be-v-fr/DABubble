import { Component, ElementRef, HostListener, inject, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { UsersService } from '../../../../services/users.service';
import { Post } from '../../../../models/post.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeService } from '../../../../services/time.service';
import { RouterLink } from '@angular/router';
import { MembersOverviewComponent } from '../../../components/main-chat/members-overview/members-overview.component';
import { UserProfileCardComponent } from '../../../components/user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
import { MobileViewService } from '../../../../services/mobile-view.service';
import { AuthService } from '../../../../services/auth.service';
import { ChannelsService } from '../../../../services/content/channels.service';
import { Subscription } from 'rxjs';


/**
 * This component displays an interactive search bar.
 * Search results dynamically show channels, users and posts.
 * 
 * Channels should be filtered in the parent component to only
 * include channels featuring the current user as member. Posts
 * are automatically pre-filtered that way as well.
 */
@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, MembersOverviewComponent],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss'
})
export class SearchComponent {
    mainUser: User = new User;
    users: User[] = [];
    userChannels: Channel[] = [];
    @Input() placeholder: string = 'Devspace durchsuchen';
    @Input() inHeader: boolean = true;
    searchInput: string = '';
    searchResultsChannels: Channel[] = [];
    searchResultsUsers: User[] = [];
    searchResultsPosts: Post[] = [];
    searchResultsPostsDisplay: string[] = [];
    searchResultsPostAuthors: string[] = [];
    postChannelIndices: number[] = [];
    hidingResults: boolean = false;
    @ViewChild('searchbar', { read: ElementRef }) searchbar!: ElementRef<HTMLInputElement>;
    public extended: 'channels' | 'users' | 'posts' | null = null;
    private authService = inject(AuthService);
    private usersService = inject(UsersService);
    private channelsService = inject(ChannelsService);
    public mobileViewService = inject(MobileViewService);
    public timeService = inject(TimeService);
    private authSub = new Subscription();
    private usersSub = new Subscription();
    private channelsSub = new Subscription();


    constructor(
        private dialog: MatDialog,
        private cd: ChangeDetectorRef,
    ) { }


    /**
     * Initializes the component by subscribing to user authentication and data services.
     */
    ngOnInit(): void {
        const uid = this.authService.getCurrentUid();
        if (uid) {
            this.syncUsers(this.usersService.users, uid);
            this.syncChannels(this.channelsService.channels, uid);
        }
        this.authSub = this.authService.user$.subscribe(user => this.onAuthUserChange(user));
    }


    /**
     * Initializes users and channels subscriptions using the current user's UID.
     * @param user - Value transmitted by authService.user$ observable.
     */
    onAuthUserChange(user: any) {
        if (user) {
            this.usersSub = this.subUsers(user.uid);
            this.channelsSub = this.subChannels(user.uid);
            this.cd.detectChanges();
        }
    }


    /**
     * Subscribes to user data updates and sets the current user and users list.
     * @param uid - The user ID of the current user.
     * @returns The subscription to user data updates.
     */
    subUsers(uid: string): Subscription {
        return this.usersService.users$.subscribe(users => this.syncUsers(users, uid));
    }


    /**
     * Synchronizes local users array with input users array.
     * @param users - users array
     * @param uid - current user UID
     */
    syncUsers(users: User[], uid: string) {
        const mainUser = users.find(u => u.uid === uid)
        if (mainUser) {
            this.mainUser = mainUser;
            this.users = users;
            this.cd.detectChanges();
        }
    }

    /**
     * Subscribes to channel data updates and filters channels based on user membership.
     * @param uid - The user ID of the current user.
     * @returns The subscription to channel data updates.
     */
    subChannels(uid: string): Subscription {
        return this.channelsService.channels$.subscribe(channels => this.syncChannels(channels, uid));
    }


    /**
     * Synchronizes local channels array with input channels array.
     * @param channels - channels array
     * @param uid - current user UID
     */
    syncChannels(channels: Channel[], uid: string) {
        this.userChannels = channels.filter(c => c.members.find(m => m.uid === uid));
        this.cd.detectChanges();
    }


    /**
     * Unsubscribes from all subscriptions to avoid memory leaks.
     */
    ngOnDestroy(): void {
        this.authSub.unsubscribe();
        this.usersSub.unsubscribe();
        this.channelsSub.unsubscribe();
    }


    /**
     * Triggers search across all categories (users, channels, and posts).
     */
    search(): void {
        if (this.searchInput.length > 0) {
            const term: string = this.searchInput.toLowerCase();
            this.triggerSearchCategories(term);
            this.hidingResults = false;
        } else {
            this.clearSearch();
        }
    }


    /**
     * Determines whether to search users, channels, or posts based on the search input.
     */
    triggerSearchCategories(term: string) {
        if (term.startsWith('@')) {
            this.searchUsers(term.slice(1));
        } else if (term.startsWith('#')) {
            this.searchChannels(term.slice(1));
        } else {
            this.searchChannels(term);
            this.searchUsers(term);
            this.searchPosts(term);
        }
    }


    /**
     * Filters channels based on the search term.
     */
    searchChannels(term: string): void {
        if (term.startsWith(' ')) { term = term.slice(1) }
        this.searchResultsChannels = this.userChannels.filter(c => {
            return !c.isPmChannel &&
                (c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term));
        });
    }


    /**
     * Filters users based on the search term.
     */
    searchUsers(term: string): void {
        if (term.startsWith(' ')) { term = term.slice(1) }
        this.searchResultsUsers = this.users.filter(u => {
            return u.uid != this.mainUser.uid &&
                (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
        });
    }


    /**
     * Searches for posts containing the search term in the user's channels.
     */
    searchPosts(term: string): void {
        this.searchResultsPosts = [];
        this.userChannels.forEach(c => {
            const posts: Post[] = c.posts;
            const postsWithThread: Post[] = posts.filter(p => p.thread.posts.length > 0);
            this.filterPostsToResults(posts, term);
            postsWithThread.forEach(p => this.filterPostsToResults(p.thread.posts, term));
        });
        this.setResultsPostsDisplay(term);
        this.setResultsPostInfo();
    }


    /**
     * Filters posts to find matches based on the search term.
     */
    filterPostsToResults(posts: Post[], term: string): void {
        this.searchResultsPosts = this.searchResultsPosts.concat(this.filterSinglePostsArray(posts, term));
    }


    /**
     * Filters a single array of posts to find matches based on the search term.
     */
    filterSinglePostsArray(posts: Post[], term: string): Post[] {
        return posts.filter(p => p.message.toLowerCase().includes(term));
    }


    /**
     * Formats the search results for posts, truncating them for better display.
     */
    setResultsPostsDisplay(term: string): void {
        this.searchResultsPostsDisplay = [];
        this.searchResultsPosts.forEach(p => {
            const displayedMessage = this.getResultsSinglePostDisplay(p.message, term);
            this.searchResultsPostsDisplay.push(displayedMessage);
        });
    }


    /**
     * Truncates a post message to display only a portion around the search term.
     */
    getResultsSinglePostDisplay(message: string, term: string): string {
        const termIndex = message.toLowerCase().indexOf(term.toLowerCase());
        let { start, prependEllipsis } = this.adjustPostDisplayStart(message, termIndex);
        let { end, appendEllipsis } = this.adjustPostDisplayEnd(message, termIndex, term);
        let displayedMessage = message.slice(start, end);
        if (displayedMessage.length > 80) {
            displayedMessage = displayedMessage.slice(0, 80);
            appendEllipsis = true;
        }
        displayedMessage = this.addEllipsis(displayedMessage, prependEllipsis, appendEllipsis);
        return displayedMessage;
    }


    /**
     * Adjusts the start index for displaying part of a post message.
     */
    adjustPostDisplayStart(message: string, termIndex: number): { start: number, prependEllipsis: boolean } {
        let start = Math.max(0, termIndex - 32);
        let prependEllipsis = false;
        if (start > 0) {
            const firstSpace = message.slice(start).search(/[ \.,!?]/);
            if (firstSpace !== -1) { start += firstSpace + 1; }
            prependEllipsis = true;
        }
        return { start, prependEllipsis };
    }


    /**
     * Adjusts the end index for displaying part of a post message.
     */
    adjustPostDisplayEnd(message: string, termIndex: number, term: string): { end: number, appendEllipsis: boolean } {
        let end = Math.min(message.length, termIndex + term.length + 32);
        let appendEllipsis = false;
        if (end < message.length) {
            const lastSpace = message.slice(0, end).lastIndexOf(' ');
            if (lastSpace !== -1) { end = lastSpace; }
            appendEllipsis = true;
        }
        return { end, appendEllipsis };
    }


    /**
     * Adds ellipses to the displayed message if it's truncated.
     */
    addEllipsis(message: string, prependEllipsis: boolean, appendEllipsis: boolean): string {
        if (prependEllipsis) { message = '...' + message; }
        if (appendEllipsis) { message = message + '...'; }
        return message;
    }


    /**
     * Gathers additional information (author and channel) for each post result.
     */
    setResultsPostInfo(): void {
        this.searchResultsPostAuthors = [];
        this.postChannelIndices = [];
        this.searchResultsPosts.forEach(p => {
            const author: User | undefined = this.usersService.getUserByUid(p.user_id);
            const channel: Channel | undefined = this.userChannels.find(c => c.channel_id === p.channel_id);
            this.searchResultsPostAuthors.push(author ? author.name : 'Unbekannter Nutzer');
            this.postChannelIndices.push(channel ? this.userChannels.indexOf(channel) : -1);
        })
    }


    /**
     * Handles clicking the search bar, preventing event propagation.
     */
    onSearchClick(e: Event): void {
        e.stopPropagation();
        e.preventDefault();
        this.hidingResults = false;
        this.autofocusSearch();
    }


    /**
     * Clears the search input and results.
     */
    onCloseSearchClick(): void {
        this.clearSearch();
        this.autofocusSearch();
    }


    /**
     * Handles clicks on the search results to focus the search bar.
     */
    onResultsClick(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        this.autofocusSearch();
    }


    /**
     * Clears the search results and resets the input field.
     */
    clearSearch(): void {
        this.searchInput = '';
        this.searchResultsChannels = [];
        this.searchResultsUsers = [];
        this.searchResultsPosts = [];
        this.extended = null;
    }


    /**
     * Hides the search results when clicking outside the search component.
     */
    @HostListener('document:click', ['$event'])
    hideResults(): void {
        this.hidingResults = true;
    }


    /**
     * Focuses the search bar after a short delay.
     */
    autofocusSearch(): void {
        setTimeout(() => this.searchbar.nativeElement.focus(), 20);
    }


    /**
     * Toggles the extension of the result lists (channels, users, posts).
     */
    toggleListExtension(list: 'channels' | 'users' | 'posts'): void {
        this.extended = (this.extended === list ? null : list);
    }


    /**
     * Opens a dialog with the user's profile information.
     */
    openUserProfile(user: User): void {
        this.dialog.open(UserProfileCardComponent, { data: user });
        this.hideResults();
    }
}