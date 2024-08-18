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
  reactionToMessage = false;
  currentPost!: Post;

  constructor(
    private channelsService: ChannelsService
  ) { }

  toggleReactionsPicker() {
    this._reactionsPicker$.next(!this._reactionsPicker$.value);
  }

  async addReaction(event: any, user: User): Promise<void> {
    if (!user) {
      console.error('Current user is not defined');
      return;
    }

    if (!this.currentPost) {
      console.error('Current post is not defined');
      return;
    }

    const existingReaction = this.currentPost.reactions.find(
      r => r.emoji === event && r.user.uid === user.uid
    );

    try {
      if (existingReaction) {
        await this.channelsService.deleteReactionFromPost(
          this.currentPost.channel_id,
          this.currentPost.post_id,
          user.uid,
          event
        );
      } else {
        await this.channelsService.addReactionToPost(
          this.currentPost.channel_id,
          this.currentPost.post_id,
          user,
          event.emoji.native
        );
      }

      const posts = this.channelsService.getChannelThreadPosts(
        this.currentPost.channel_id,
        this.currentPost.post_id
      );

      this.currentPost = posts?.find(p => p.post_id === this.currentPost.post_id) || this.currentPost;

    } catch (error) {
      console.error('Error handling reaction for post:', error);
      // Optionally, show user feedback for errors
      // this.snackBar.open('Failed to handle reaction', 'Close', { duration: 2000 });
    } finally {
      this._reactionsPicker$.next(false);
    }
  }

}
