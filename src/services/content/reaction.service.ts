import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.class';
import { Post } from '../../models/post.class';
import { ChannelsService } from './channels.service';
import { Reaction } from '../../models/reaction.class';


/**
 * This service provides reactions (i.e. emoji) operations for a post.
 * The operations consider the active user and whether or not the respective
 * reaction already exists. 
 * The current post has to be set dynamically.
 */
@Injectable({
  providedIn: 'root'
})
export class ReactionService {
  private _reactionsPicker$ = new BehaviorSubject<boolean>(false);
  reactionsPicker$ = this._reactionsPicker$.asObservable();
  reactionToAdded$ = new BehaviorSubject<string>('');
  reactionToMessage = false;
  reactionToEditMessage = false;
  addReactionInThread = false;
  currentPost!: Post;

  constructor(
    private channelsService: ChannelsService
  ) { }


  /**
   * Sets the reaction to be added and updates the corresponding BehaviorSubject.
   * @param {string} reaction - The reaction (emoji) to be added.
   */
  setReaction(reaction: string): void {
    this.reactionToAdded$.next(reaction);
  }


  /**
   * Toggles the state of the reactions picker between open and closed.
   */
  toggleReactionsPicker() {
    this._reactionsPicker$.next(!this._reactionsPicker$.value);
  }


  /**
   * Adds or removes a reaction from a post. If the user has already reacted with the same emoji, 
   * the reaction is removed. Otherwise, the reaction is added.
   * @param {any} event - The event that contains the selected emoji.
   * @param {User} user - The user who is adding or removing the reaction.
   */
  async addReaction(event: any, user: User): Promise<void> {
    if (!this.currentPost) {
      console.error('Current post is not defined');
      return;
    }
    try {
      await this.toggleReaction(event, user);
      const posts = this.channelsService.getChannelThreadPosts(
        this.currentPost.channel_id,
        this.currentPost.post_id
      );
      this.currentPost = posts?.find(p => p.post_id === this.currentPost.post_id) || this.currentPost;
    } catch (error) {
      console.error('Error handling reaction for post:', error);
    } finally {
      this._reactionsPicker$.next(false);
    }
  }


  /**
   * Retrieves a reaction from the current post property, if it exists.
   * @param {any} event - The event that contains the selected emoji.
   * @param {User} user - The user who is adding or removing the reaction.
   * @returns {Reaction | undefined} - Search result.
   */
  findReaction(event: any, user: User): Reaction | undefined {
    return this.currentPost.reactions.find(r =>
      r.emoji === event.emoji.native && r.user.uid === user.uid
    );
  }


  /**
   * Adds or removes a reaction from a post in backend, depending an whether
   * or not the reaction already exists.
   * @param {any} event - The event that contains the selected emoji.
   * @param {User} user - The user who is adding or removing the reaction.
   */
  async toggleReaction(event: any, user: User) {
    const existingReaction = this.findReaction(event, user);
    if (existingReaction) {
      await this.channelsService.deleteReactionFromPost(
        this.currentPost.channel_id,
        this.currentPost.post_id,
        user.uid,
        event.emoji.native
      );
    } else {
      await this.channelsService.addReactionToPost(
        this.currentPost.channel_id,
        this.currentPost.post_id,
        user,
        event.emoji.native
      );
    }
  }
}
