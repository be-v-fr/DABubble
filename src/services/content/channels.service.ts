import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Firestore, collection, doc, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { Post } from '../../models/post.class';
import { Thread } from '../../models/thread.class';
import { Reaction } from '../../models/reaction.class';

@Injectable({
  providedIn: 'root'
})
export class ChannelsService implements OnDestroy {
  channels$: Subject<Channel[]> = new Subject<Channel[]>();
  channels: Channel[] = [];
  unSubChannels;
  firestore: Firestore = inject(Firestore);
  router = inject(Router);

  constructor() {
    this.unSubChannels = this.subChannels();
  }

  ngOnDestroy() {
    this.unSubChannels();
  }

  subChannels() {
    return onSnapshot(this.getColRef(), (list: any) => {
      const channels: Channel[] = [];
      list.forEach((element: any) => {
        channels.push(new Channel(element.data()));
      });
      this.channels = channels;
      this.channels$.next(channels);
    });
  }

  getAllChannels(): Channel[] {
    return this.channels.slice();
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    return this.channels.find(c => c.channel_id === id);
  }

  async addChannel(channel: Channel): Promise<string> {
    await this.storeChannel(channel);
    this.channels.push(channel);
    this.channels$.next(this.channels.slice());
    return channel.channel_id;
  }

  isChannelNameAvailable(name: string): boolean {
    let isAvailable: boolean = true;
    this.channels.forEach(c => {
      if (c.name === name) { isAvailable = false }
    });
    return isAvailable;
  }

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

  async removeChannelMember(user: User, channelId: string) {
    const channel = await this.getChannel(channelId);
    if (channel) {
      channel.members = channel.members.filter(m => m.uid != user.uid);
      await this.updateChannel(channel);
    }
  }

  async addPostToChannel(channel_id: string, uid: string, message: string) {
    const newPost = new Post({
      post_id: uuidv4(),
      channel_id: channel_id,
      message: message,
      user_id: uid,
      thread: new Thread({
        thread_id: uuidv4(),
        date: Date.now(),
        posts: [],
      }),
      date: Date.now(),
      reactions: []
    });
    const channel = this.channels.find(c => c.channel_id === channel_id);
    if (channel) {
      channel.posts.push(newPost);
      await this.updateChannelInStorage(channel);
      this.channels$.next(this.channels.slice());
    } else {
      console.error(`Channel with ID ${channel_id} not found`);
    }
  }

  async addPostToPmChannel(channel_id: string, uid: string, message: string) {
    const newPost = new Post({
      post_id: uuidv4(),
      channel_id: channel_id,
      message: message,
      user_id: uid,
      date: Date.now(),
      reactions: []
    });
    const channel = this.channels.find(c => c.channel_id === channel_id);
    if (channel) {
      channel.posts.push(newPost);
      await this.updateChannelInStorage(channel);
      this.channels$.next(this.channels.slice());
    } else {
      console.error(`Channel with ID ${channel_id} not found`);
    }
  }

  async addPostToThread(channel_id: string, thread_id: string, uid: string, message: string) {
    const newPost = new Post({
      post_id: uuidv4(),
      channel_id: channel_id,
      message: message,
      user_id: uid,
      thread: new Thread(),
      date: Date.now(),
      reactions: []
    });

    const channel = this.channels.find(c => c.channel_id === channel_id);
    if (channel) {
      const post = channel.posts.find(p => p.thread.thread_id === thread_id);
      if (post) {
        post.thread.posts.push(newPost);
        await this.updateChannelInStorage(channel);
        this.channels$.next(this.channels.slice());
      } else {
        console.error(`Thread with ID ${thread_id} not found in channel ${channel_id}`);
      }
    } else {
      console.error(`Channel with ID ${channel_id} not found`);
    }
  }

  async addReactionToPost(channelId: string, postId: string, user: User, reaction: string): Promise<void> {
    try {
      const newReaction = new Reaction({
        reaction_id: uuidv4(),
        user: user,
        post_id: postId,
        emoji: reaction
      });

      const channel = this.channels.find(c => c.channel_id === channelId);
      if (!channel) {
        console.error(`Channel with ID ${channelId} not found`);
        return;
      }

      const post = this.findPost(channel, postId);
      if (!post) {
        console.error(`Post with ID ${postId} not found in channel ${channelId}`);
        return;
      }

      post.reactions.push(newReaction);

      await this.updateChannelInStorage(channel);

      this.channels$.next([...this.channels]);
    } catch (error) {
      console.error('An error occurred while adding reaction to post:', error);
    }
  }

  async deleteReactionFromPost(channelId: string, postId: string, userId: string, emoji: string): Promise<void> {
    try {
      const channel = this.channels.find(c => c.channel_id === channelId);
      if (!channel) {
        console.error(`Channel with ID ${channelId} not found`);
        return;
      }

      const post = this.findPost(channel, postId);
      if (!post) {
        console.error(`Post with ID ${postId} not found in channel ${channelId}`);
        return;
      }

      const reactionIndex = post.reactions.findIndex(r => r.user.uid === userId && r.emoji === emoji);
      if (reactionIndex === -1) {
        console.error(`Reaction not found for user ${userId} with emoji ${emoji}`);
        return;
      }

      post.reactions.splice(reactionIndex, 1);

      await this.updateChannelInStorage(channel);

      this.channels$.next(this.channels.slice());
    } catch (error) {
      console.error('An error occurred while deleting reaction from post:', error);
    }
  }

  private findPost(channel: Channel, postId: string): Post | undefined {
    return channel.posts.find(p => p.post_id === postId)
      || channel.posts.flatMap(p => p.thread?.posts || []).find(tp => tp.post_id === postId);
  }

  async updateChannel(channel: Channel) {
    const channelIndex = this.channels.findIndex(c => c.channel_id === channel.channel_id);
    if (channelIndex !== -1) {
      this.channels[channelIndex] = channel;
      this.channels$.next(this.channels.slice());
      await this.updateChannelInStorage(channel);
    }
  }

  async deleteChannel(channel: Channel) {
    const channelIndex = this.channels.indexOf(channel);
    this.channels.splice(channelIndex, 1);
    this.channels$.next(this.channels.slice());
    await this.deleteChannelInStorage(channel.channel_id);
  }

  getColRef(): CollectionReference {
    return collection(this.firestore, 'channels');
  }

  getSingleDocRef(uid: string): DocumentReference {
    return doc(this.getColRef(), uid);
  }

  async storeChannel(channel: Channel): Promise<string> {
    const response = await addDoc(this.getColRef(), channel.toJson());
    channel.channel_id = response.id;
    this.updateChannelInStorage(channel);
    return channel.channel_id;
  }

  async updateChannelInStorage(channel: Channel) {
    if (channel.channel_id) {
      const docRef = this.getSingleDocRef(channel.channel_id);
      await updateDoc(docRef, channel.toJson()).catch((err: Error) => { console.error(err) });
    }
  }

  async deleteChannelInStorage(channel_id: string) {
    const docRef = this.getSingleDocRef(channel_id);
    await deleteDoc(docRef).catch((err: Error) => { console.error(err) });
  }

  async initUserChannels(user: User) {
    await this.initTeamChannel(user);
  }

  async initTeamChannel(user: User) {
    const teamChannel: Channel | undefined = this.channels.find(c => c.name === 'Team');
    if (teamChannel) { await this.addMemberToChannel(user, teamChannel.channel_id) }
    else { await this.storeChannel(new Channel(this.getTeamChannelData(user))) }
  }

  getTeamChannelData(user: User): any {
    return {
      name: 'Team',
      description: 'Dieser Channel steht dem gesamten Team offen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.',
      author_uid: '',
      members: [user.toJson()], // Convert User object to JSON
      date: Date.now(),
      isPmChannel: false
    };
  }

  addChannelToRoute(parent: 'main-chat' | 'direct-message', channel_id: string): void {
    this.router.navigate([`/${parent}`, channel_id], {
      queryParamsHandling: 'merge'
    });
  }
}
