import { Component, ElementRef, HostListener, inject, Input, ViewChild } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { ChannelsService } from '../../../../services/content/channels.service';
import { User } from '../../../../models/user.class';
import { UsersService } from '../../../../services/users.service';
import { Post } from '../../../../models/post.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeService } from '../../../../services/time.service';


@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss'
})
export class SearchComponent {
    @Input() mainUser: User = new User;
    @Input() users: User[] = [];
    @Input() userChannels: Channel[] = [];
    searchInput: string = '';
    searchResultsChannels: Channel[] = [];
    searchResultsUsers: User[] = [];
    searchResultsPosts: Post[] = [];
    searchResultsPostsDisplay: string[] = [];
    searchResultsPostAuthors: string[] = [];
    searchResultsPostChannels: string[] = [];
    hidingResults: boolean = false;
    @ViewChild('searchbar', { read: ElementRef }) searchbar!: ElementRef<HTMLInputElement>;
    public extended: 'channels' | 'users' | 'posts' | null = null;
    private channelsService = inject(ChannelsService);
    private usersService = inject(UsersService);
    public timeService = inject(TimeService);

    search(): void {
        if (this.searchInput.length > 0) {
            const term: string = this.searchInput.toLowerCase();
            this.searchChannels(term);
            this.searchUsers(term);
            this.searchPosts(term);
            this.hidingResults = false;
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
        this.searchResultsUsers = this.users.filter(u => {
            return u.uid != this.mainUser.uid &&
                (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
        });
    }

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

    filterPostsToResults(posts: Post[], term: string): void {
        this.searchResultsPosts = this.searchResultsPosts.concat(this.filterSinglePostsArray(posts, term));
    }

    filterSinglePostsArray(posts: Post[], term: string): Post[] {
        return posts.filter(p => p.message.toLowerCase().includes(term));
    }

    setResultsPostsDisplay(term: string): void {
        this.searchResultsPostsDisplay = [];
        this.searchResultsPosts.forEach(p => {
            const displayedMessage = this.getResultsSinglePostDisplay(p.message, term);
            this.searchResultsPostsDisplay.push(displayedMessage);
        });
    }

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

    addEllipsis(message: string, prependEllipsis: boolean, appendEllipsis: boolean): string {
        if (prependEllipsis) { message = '...' + message; }
        if (appendEllipsis) { message = message + '...'; }
        return message;
    }

    setResultsPostInfo(): void {
        this.searchResultsPostAuthors = [];
        this.searchResultsPostChannels = [];
        this.searchResultsPosts.forEach(p => {
            const author: User | undefined = this.usersService.getUserByUid(p.user_id);
            const channel: Channel | undefined = this.channelsService.channels.find(c => c.channel_id === p.channel_id);
            author ? this.searchResultsPostAuthors.push(author.name) : this.searchResultsPostAuthors.push('Unbekannter Nutzer');
            channel ? this.searchResultsPostChannels.push(channel.name) : this.searchResultsPostChannels.push('');
        })
    }

    onSearchClick(e: Event): void {
        e.stopPropagation();
        e.preventDefault();
        this.hidingResults = false;
        this.autofocusSearch();
    }

    onCloseSearchClick(): void {
        this.clearSearch();
        this.autofocusSearch();
    }

    onResultsClick(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        this.autofocusSearch();
    }

    clearSearch(): void {
        this.searchInput = '';
        this.searchResultsChannels = [];
        this.searchResultsUsers = [];
        this.searchResultsPosts = [];
        this.extended = null;
    }

    @HostListener('document:click', ['$event'])
    hideResults(): void {
        this.hidingResults = true;
    }

    autofocusSearch(): void {
        setTimeout(() => this.searchbar.nativeElement.focus(), 20);
    }

    toggleListExtension(list: 'channels' | 'users' | 'posts'): void {
        this.extended = (this.extended === list ? null : list);
    }
}
