import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.class';
import { Post } from '../../models/post.class';
import { ChannelsService } from './channels.service';

@Injectable({
  providedIn: 'root'
})
export class ReactionService {
  private _reactionsPicker$ = new BehaviorSubject<boolean>(false);
  reactionsPicker$ = this._reactionsPicker$.asObservable();
  currentPost!: Post;

  constructor(
    private channelsService: ChannelsService
  ) { }

  toggleReactionsPicker() {
    this._reactionsPicker$.next(!this._reactionsPicker$.value);
  }

  async addReaction(event: { emoji: { native: string } }, user: User): Promise<void> {
    if (!user) {
      console.error('Current user is not defined');
      return;
    }

    if (!this.currentPost) {
      console.error('Current post is not defined');
      return;
    }

    // Check if the user already reacted with the same emoji
    const existingReaction = this.currentPost.reactions.find(r => r.emoji === event.emoji.native && r.user.uid === user.uid);

    if (existingReaction) {
      console.warn('User has already reacted with this emoji');
      this._reactionsPicker$.next(false); // Close the picker if the reaction already exists
      return;
    }

    try {
      // Add the reaction
      await this.channelsService.addReactionToPost(this.currentPost.channel_id, this.currentPost.post_id, user, event.emoji.native);

      // Optionally, you can update `currentPost` here if necessary
      // Fetch the updated post from the server
      const posts = await this.channelsService.getChannelThreadPosts(this.currentPost.channel_id, this.currentPost.post_id);

      this.currentPost = posts?.find(p => p.post_id === this.currentPost.post_id) || this.currentPost;

    } catch (error) {
      console.error('Error adding reaction to post:', error);
      // Optionally, show user feedback for errors
      // this.snackBar.open('Failed to add reaction', 'Close', { duration: 2000 });
    } finally {
      // Always close the picker
      this._reactionsPicker$.next(false);
    }
  }
}
