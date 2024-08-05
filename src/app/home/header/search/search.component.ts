import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { Post } from '../../../../models/post.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


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
    hidingResults: boolean = false;
    @ViewChild('searchbar', { read: ElementRef }) searchbar!: ElementRef<HTMLInputElement>;
    public extended: 'channels' | 'users' | 'posts' | null = null;

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
            return u.uid != this.mainUser.uid && u.name.toLowerCase().includes(term);
        });
    }

    searchPosts(term: string): void {
        this.searchResultsPosts = [];
        this.userChannels.forEach(c => {
            this.searchResultsPosts = this.searchResultsPosts.concat(this.filterSinglePostsArray(c.posts, term));
            // search threads
        });
    }

    filterSinglePostsArray(posts: Post[], term: string): Post[] {
        return posts.filter(p => p.message.toLowerCase().includes(term));
    }

    onSearchClick(): void {
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
