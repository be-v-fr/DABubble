import { Injectable, inject, OnDestroy } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Firestore, collection, doc, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { Post } from '../../models/post.class';
import { Thread } from '../../models/thread.class';

@Injectable({
  providedIn: 'root'
})
export class ChannelsService implements OnDestroy {
  channels$: Subject<Channel[]> = new Subject<Channel[]>();
  channels: Channel[] = [];
  unsubChannels;
  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubChannels = this.subChannels();
  }

  ngOnDestroy() {
    this.unsubChannels();
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

  getChannel(id: string): Channel {
    return this.channels.find(c => c.channel_id === id)!;
  }

  async addChannel(channel: Channel): Promise<string> {
    await this.storeChannel(channel);
    this.channels.push(channel);
    this.channels$.next(this.channels.slice());
    return channel.channel_id;
  }

  async addPostToChannel(channel_id: string, uid: string, message: string) {
    const newPost = new Post({
      post_id: uuidv4(),
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

  async addPostToThread(channel_id: string, thread_id: string, uid: string, message: string) {
    const newPost = new Post({
      post_id: uuidv4(),
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


  async updateChannel(newChannel: Channel) {
    const channelIndex = this.channels.findIndex(c => c.channel_id === newChannel.channel_id);
    if (channelIndex !== -1) {
      this.channels[channelIndex] = newChannel;
      this.channels$.next(this.channels.slice());
      await this.updateChannelInStorage(newChannel);
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
    const teamChannel: Channel | undefined = this.getTeamChannel();
    if (teamChannel) { await this.addUserToChannel(user, teamChannel) }
    else { await this.storeChannel(new Channel(this.getTeamChannelData(user))) }
  }

  getTeamChannel(): Channel | undefined {
    const teamChannels: Channel[] = this.channels.filter(c => c.name == 'Team');
    if (teamChannels.length > 0) {
      teamChannels.sort((a, b) => a.date - b.date);
      return teamChannels[0];
    } else { return undefined }
  }

  getTeamChannelData(user: User): any {
    return {
      name: 'Team',
      description: 'Dieser Channel steht dem gesamten Team offen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.',
      author_uid: user.uid,
      members: [user.toJson()], // Convert User object to JSON
      date: Date.now(),
      isPmChannel: false
    };
  }

  async addUserToChannel(user: User, channel: Channel) {
    channel.members.push(user);
    await this.updateChannelInStorage(channel);
  }
}
