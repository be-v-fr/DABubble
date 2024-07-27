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

  async addReaction(event: { emoji: { native: string } }, user: User) {
    if (!user) {
      console.error('Current user is not defined');
      return;
    }

    if (!this.currentPost) {
      console.error('Current post is not defined');
      return;
    }

    const existingReaction = this.currentPost.reactions.find(r => r.emoji === event.emoji.native && r.user.uid === user.uid);
    if (!existingReaction) {
      try {
        await this.channelsService.addReactionToPost(this.currentPost.channel_id, this.currentPost.post_id, user, event.emoji.native);
      } catch (error) {
        console.error('Error adding reaction to post:', error);
      }
    }

    this._reactionsPicker$.next(false);
  }
}
