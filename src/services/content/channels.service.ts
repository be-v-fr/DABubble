import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { onSnapshot } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { Post } from '../../models/post.class';
import { Reaction } from '../../models/reaction.class';
import { StorageService } from '../storage.service';
import { MobileViewService } from '../mobile-view.service';


/**
 * This services hanydles mostly frontend channels operations. 
 * Channels data includes threads, posts and reactions.
 * Regarding backend communication, C, U, and D operations are defined in the StorageService,
 * which has been injected into this service. R operations are defined in this service.
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelsService implements OnDestroy {
  channels$: Subject<Channel[]> = new Subject<Channel[]>();
  channels: Channel[] = [];
  unSubChannels;
  storageService = inject(StorageService);
  mobileViewService = inject(MobileViewService);
  router = inject(Router);

  /**
   * Constructor initializes the subscription to the Firestore channel collection.
   */
  constructor() {
    this.unSubChannels = this.subChannels();
  }


  /**
   * Lifecycle hook that unsubscribes from the Firestore subscription when the service is destroyed.
   */
  ngOnDestroy() {
    this.unSubChannels();
  }


  /**
   * Subscribes to Firestore 'channels' collection and updates the local channels array.
   * @returns {Function} A function to unsubscribe from the Firestore listener.
   */
  subChannels() {
    return onSnapshot(this.storageService.getColRef(), (list: any) => {
      const channels: Channel[] = [];
      list.forEach((element: any) => {
        channels.push(new Channel(element.data()));
      });
      this.channels = channels;
      this.channels$.next(channels);
    });
  }


  /**
   * Returns a shallow copy of the current channels array.
   * @returns {Channel[]} The list of channels.
   */
  getAllChannels(): Channel[] {
    return this.channels.slice();
  }


  /**
   * Retrieves all replies across all threads in a given channel.
   * @param {Channel} channel - The channel object.
   * @returns {Post[]} The list of all replies.
   */
  getAllThreadsReplies(channel: Channel): Post[] {
    let replies: Post[] = [];
    channel.posts.forEach(p => replies.push(...p.thread.posts));
    return replies;
  }


  /**
   * Checks if a post exists within a thread of a given channel.
   * @param {Channel} channel - The channel object.
   * @param {string} postId - The ID of the post.
   * @returns {boolean} True if the post exists, false otherwise.
   */
  isPostInThread(channel: Channel, postId: string): boolean {
    if (this.getAllThreadsReplies(channel).find(r => r.post_id === postId)) {
      return true;
    }
    return false;
  }


  /**
   * Finds a channel by its ID.
   * @param {string} id - The ID of the channel.
   * @returns {Promise<Channel | undefined>} A promise that resolves with the found channel or undefined.
   */
  async getChannel(id: string): Promise<Channel | undefined> {
    return this.channels.find(c => c.channel_id === id);
  }


  /**
   * Retrieves the posts of a thread in a specific channel.
   * @param {string} channel_id - The ID of the channel.
   * @param {string} post_id - The ID of the parent post.
   * @returns {Post[] | undefined} The list of thread posts, or undefined if not found.
   */
  getChannelThreadPosts(channel_id: string, post_id: string): Post[] | undefined {
    const channel = this.channels.find(c => c.channel_id === channel_id);
    const post = channel?.posts.find(p => p.post_id === post_id);
    return post?.thread.posts;
  }


  /**
   * Retrieves a post within a thread by post ID.
   * @param {Channel} channel - The channel object.
   * @param {string} post_id - The ID of the post.
   * @returns {{ postInThread: Post | undefined, thread_id: string }} The post and its thread ID.
   */
  getPostInThread(channel: Channel, post_id: string): { postInThread: Post | undefined, thread_id: string } {
    let postInThread: Post | undefined = undefined;
    let thread_id: string = '';
    channel.posts.forEach(p => {
      if (postInThread === undefined) {
        postInThread = p.thread.posts.find(p => p.post_id === post_id);
        if (postInThread) { thread_id = p.thread.thread_id }
      }
    });
    return { postInThread, thread_id };
  }


  /**
   * Adds a new channel and updates the Firestore database.
   * @param {Channel} channel - The channel object.
   * @returns {Promise<string>} A promise that resolves with the ID of the added channel.
   */
  async addChannel(channel: Channel): Promise<string> {
    await this.storageService.storeChannel(channel);
    this.channels.push(channel);
    this.channels$.next(this.channels.slice());
    return channel.channel_id;
  }


  /**
   * Checks if a channel name is available.
   * @param {string} name - The name of the channel.
   * @returns {boolean} True if the name is available, false otherwise.
   */
  isChannelNameAvailable(name: string): boolean {
    let isAvailable: boolean = true;
    this.channels.forEach(c => {
      if (c.name === name) { isAvailable = false }
    });
    return isAvailable;
  }


  /**
   * Adds a member to a channel.
   * @param {User} user - The user to add.
   * @param {string} channelId - The ID of the channel.
   */
  async addMemberToChannel(user: User, channelId: string) {
    const channel = await this.getChannel(channelId);
    if (channel) {
      const userExists = channel.members.some(member => member.uid === user.uid);
      if (!userExists) {
        channel.members.push(user);
        await this.updateChannel(channel);
      } else {
        console.error(`User with ID ${user.uid} is already a member of the channel.`);
      }
    } else {
      console.error(`Channel with ID ${channelId} not found`);
    }
  }


  /**
   * Removes a member from a channel.
   * @param {User} user - The user to remove.
   * @param {string} channelId - The ID of the channel.
   */
  async removeChannelMember(user: User, channelId: string) {
    const channel = await this.getChannel(channelId);
    if (channel) {
      channel.members = channel.members.filter(m => m.uid != user.uid);
      await this.updateChannel(channel);
    }
  }


  /**
   * Adds a new post to a channel.
   * @param {string} channel_id - The ID of the channel.
   * @param {string} uid - The user ID of the post creator.
   * @param {string} message - The content of the post.
   * @param {string} attachmentSrc - Optional attachment source URL.
   */
  async addPostToChannel(channel_id: string, uid: string, message: string, attachmentSrc: string) {
    const newPost = new Post();
    newPost.setNew(channel_id, uid, message, attachmentSrc);
    newPost.thread.thread_id = uuidv4();
    const channel = this.channels.find(c => c.channel_id === channel_id);
    if (channel) {
      channel.posts.push(newPost);
      await this.storageService.updateChannelInStorage(channel);
      this.channels$.next(this.channels.slice());
    } else {
      console.error(`Channel with ID ${channel_id} not found`);
    }
  }


  /**
   * Updates an existing post in a channel.
   * @param {string} channel_id - The ID of the channel.
   * @param {string} post_id - The ID of the post to update.
   * @param {string} updatedMessage - The updated message content.
   */
  async updatePost(channel_id: string, post_id: string, updatedMessage: string) {
    const { post, channel } = this.findPostByChannelId(channel_id, post_id);
    if (channel && post) {
      post.message = updatedMessage;
      await this.storageService.updateChannelInStorage(channel);
      this.channels$.next(this.channels.slice());
    }
  }


  /**
   * Deletes a post from a channel, including any thread posts.
   * @param {string} channel_id - The ID of the channel.
   * @param {string} post_id - The ID of the post to delete.
   */
  async deletePost(channel_id: string, post_id: string) {
    try {
      const channel = this.channels.find(c => c.channel_id === channel_id);
      if (!channel) {
        console.error(`Channel with ID ${channel_id} not found`);
        return;
      }
      const deleted = await this.deletePostFromChannelTopLevel(channel, post_id);
      if (!deleted) { await this.deletePostFromChannelThreadLevel(channel, post_id) }
    } catch (error) {
      console.error('An error occurred while deleting post from channel:', error);
    }
  }


  /**
   * Deletes a post from a channel on the top level, i.e. in the posts array stored as channel.posts.
   * @param {string} channel_id - The ID of the channel.
   * @param {string} post_id - The ID of the post to delete.
   */
  async deletePostFromChannelTopLevel(channel: Channel, post_id: string): Promise<boolean> {
    const postIndex = channel.posts.findIndex(p => p.post_id === post_id);
    if (postIndex !== -1) {
      channel.posts.splice(postIndex, 1);
      await this.storageService.updateChannelInStorage(channel);
      this.channels$.next(this.channels.slice());
      return true;
    } else {
      return false;
    }
  }


  /**
   * Deletes a post from a channel on the thread level, i.e. in the posts array stored as channel.posts[x].thread.posts.
   * @param {string} channel_id - The ID of the channel.
   * @param {string} post_id - The ID of the post to delete.
   */
  async deletePostFromChannelThreadLevel(channel: Channel, post_id: string): Promise<void> {
    let postFoundInThread = false;
    for (const post of channel.posts) {
      const threadPostIndex = post.thread.posts.findIndex(tp => tp.post_id === post_id);
      if (threadPostIndex !== -1) {
        post.thread.posts.splice(threadPostIndex, 1);
        postFoundInThread = true;
        break;
      }
    }

    if (postFoundInThread) {
      await this.storageService.updateChannelInStorage(channel);
      this.channels$.next(this.channels.slice());
    } else {
      console.error(`Post with ID ${post_id} not found in channel ${channel.channel_id}`);
    }
  }


  /**
   * Adds a new post to a private message (PM) channel.
   * @param {string} channel_id - The ID of the channel where the post will be added.
   * @param {string} uid - The ID of the user adding the post.
   * @param {string} message - The content of the post.
   * @param {string} attachmentSrc - The source URL of an optional attachment for the post.
   * @returns {Promise<void>} A promise that resolves when the post is added.
   */
  async addPostToPmChannel(channel_id: string, uid: string, message: string, attachmentSrc: string) {
    const newPost = new Post();
    newPost.setNew(channel_id, uid, message, attachmentSrc);
    newPost.thread.thread_id = uuidv4();
    const channel = this.channels.find(c => c.channel_id === channel_id);
    if (channel) {
      channel.posts.push(newPost);
      await this.storageService.updateChannelInStorage(channel);
      this.channels$.next(this.channels.slice());
    } else {
      console.error(`Channel with ID ${channel_id} not found`);
    }
  }


  /**
   * Adds a new post to a thread within a channel.
   * @param {string} channel_id - The ID of the channel where the thread exists.
   * @param {string} thread_id - The ID of the thread where the post will be added.
   * @param {string} uid - The ID of the user adding the post.
   * @param {string} message - The content of the post.
   * @param {string} attachmentSrc - The source URL of an optional attachment for the post.
   * @returns {Promise<void>} A promise that resolves when the post is added.
   */
  async addPostToThread(channel_id: string, thread_id: string, uid: string, message: string, attachmentSrc: string) {
    const newPost = new Post();
    newPost.setNew(channel_id, uid, message, attachmentSrc);
    const channel = this.channels.find(c => c.channel_id === channel_id);
    if (channel) {
      const post = channel.posts.find(p => p.thread.thread_id === thread_id);
      if (post) {
        post.thread.posts.push(newPost);
        await this.storageService.updateChannelInStorage(channel);
        this.channels$.next(this.channels.slice());
      } else {
        console.error(`Thread with ID ${thread_id} not found in channel ${channel_id}`);
      }
    } else {
      console.error(`Channel with ID ${channel_id} not found`);
    }
  }


  /**
   * Adds a reaction to a post within a channel.
   * @param {string} channelId - The ID of the channel where the post exists.
   * @param {string} postId - The ID of the post to which the reaction will be added.
   * @param {User} user - The user adding the reaction.
   * @param {string} reaction - The emoji representing the reaction.
   * @returns {Promise<void>} A promise that resolves when the reaction is added.
   */
  async addReactionToPost(channelId: string, postId: string, user: User, emoji: string): Promise<void> {
    const reaction = new Reaction({
      reaction_id: uuidv4(),
      user: user,
      post_id: postId,
      emoji: emoji
    });
    const { post, channel } = this.findPostByChannelId(channelId, postId);
    if (channel && post) {
      post.reactions.push(reaction);
      await this.storageService.updateChannelInStorage(channel);
      this.channels$.next([...this.channels]);
    }
  }


  /**
   * Deletes a reaction from a post within a channel.
   * @param {string} channelId - The ID of the channel where the post exists.
   * @param {string} postId - The ID of the post from which the reaction will be deleted.
   * @param {string} userId - The ID of the user whose reaction will be deleted.
   * @param {string} emoji - The emoji representing the reaction to be deleted.
   * @returns {Promise<void>} A promise that resolves when the reaction is deleted.
   */
  async deleteReactionFromPost(channelId: string, postId: string, userId: string, emoji: string): Promise<void> {
    const { post, channel } = this.findPostByChannelId(channelId, postId);
    if (channel && post) {
      const reactionIndex = post.reactions.findIndex(r => r.user.uid === userId && r.emoji === emoji);
      if (reactionIndex === -1) {
        console.error(`Reaction not found for user ${userId} with emoji ${emoji}`);
        return;
      }
      post.reactions.splice(reactionIndex, 1);
      await this.storageService.updateChannelInStorage(channel);
      this.channels$.next(this.channels.slice());
    }
  }


  /**
   * Finds a post within a channel or within the threads of a channel's posts.
   * @param {Channel} channel - The channel where the post exists.
   * @param {string} postId - The ID of the post to find.
   * @returns {Post | undefined} The found post or undefined if not found.
   */
  private findPost(channel: Channel, postId: string): Post | undefined {
    return channel.posts.find(p => p.post_id === postId)
      || channel.posts.flatMap(p => p.thread?.posts || []).find(tp => tp.post_id === postId);
  }


  /**
   * Finds a post within a channel or within the threads of a channel's posts by the channel ID..
   * @param {string} channelId - The ID of the channel where the post exists.
   * @param {string} postId - The ID of the post to find.
   * @returns {Post | undefined} The found post or undefined if not found.
   */
  private findPostByChannelId(channelId: string, postId: string): { post: Post | undefined, channel: Channel | undefined } {
    const channel = this.channels.find(c => c.channel_id === channelId);
    if (channel) {
      const post = this.findPost(channel, postId);
      if (!post) {
        console.error(`Post with ID ${postId} not found in channel ${channelId}`);
      }
      return { post, channel };
    } else {
      console.error(`Channel with ID ${channelId} not found`);
      return { post: undefined, channel: undefined };
    }
  }


  /**
   * Updates a channel's information in memory and in Firestore.
   * @param {Channel} channel - The channel object to update.
   * @returns {Promise<void>} A promise that resolves when the channel is updated.
   */
  async updateChannel(channel: Channel) {
    const channelIndex = this.channels.findIndex(c => c.channel_id === channel.channel_id);
    if (channelIndex !== -1) {
      this.channels[channelIndex] = channel;
      this.channels$.next(this.channels.slice());
      await this.storageService.updateChannelInStorage(channel);
    }
  }


  /**
   * Deletes a channel from memory and Firestore.
   * @param {Channel} channel - The channel object to delete.
   * @returns {Promise<void>} A promise that resolves when the channel is deleted.
   */
  async deleteChannel(channel: Channel) {
    const channelIndex = this.channels.indexOf(channel);
    this.channels.splice(channelIndex, 1);
    this.channels$.next(this.channels.slice());
    await this.storageService.deleteChannelInStorage(channel.channel_id);
  }


  /**
   * Initializes user channels, including the creation of a team channel.
   * @param {User} user - The user for whom the channels will be initialized.
   * @returns {Promise<void>} A promise that resolves when the user channels are initialized.
   */
  async initUserChannels(user: User) {
    await this.initTeamChannel(user);
    await this.initWelcomeChannel(user);
  }


  /**
   * Initializes the team channel for a user.
   * @param {User} user - The user for whom the team channel will be initialized.
   * @returns {Promise<void>} A promise that resolves when the team channel is initialized.
   */
  async initTeamChannel(user: User) {
    const teamChannel: Channel | undefined = this.channels.find(c => c.name === 'Team');
    if (teamChannel) {
      await this.addMemberToChannel(user, teamChannel.channel_id)
    }
    else { await this.storageService.storeChannel(new Channel(this.getTeamChannelData(user))) }
  }


  /**
   * Returns the data structure for the team channel.
   * @param {User} user - The user for whom the team channel data is being generated.
   * @returns {any} The data for the team channel.
   */
  getTeamChannelData(user: User): any {
    return {
      name: 'Team',
      description: 'Dieser Channel steht dem gesamten Team offen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.',
      author_uid: '',
      members: [user.toJson()],
      date: Date.now(),
      isPmChannel: false
    };
  }


  /**
  * Initializes the welcome channel for a user.
  * @param {User} user - The user for whom the welcome channel will be initialized.
  * @returns {Promise<void>} A promise that resolves when the welcome channel is initialized.
  */
  async initWelcomeChannel(user: User): Promise<void> {
    const welcomeChannel = this.channels.find(channel => channel.name === 'Welcome');
    if (welcomeChannel) {
      const isMember = welcomeChannel.members.some(member => member.uid === user.uid);
      if (!isMember) {
        await this.addMemberToChannel(user, welcomeChannel.channel_id);
      }
    }
  }


  /**
   * Navigates to a specific channel route within the app.
   * @param {'main-chat' | 'direct-message'} parent - The parent route to navigate to.
   * @param {string} channel_id - The ID of the channel to navigate to.
   */
  addChannelToRoute(parent: 'main-chat' | 'direct-message', channel_id: string): void {
    this.router.navigate([`/${parent}`, channel_id], {
      queryParamsHandling: 'merge'
    });
    this.mobileViewService.mainChatViewState = 'mainchat';
  }
}
