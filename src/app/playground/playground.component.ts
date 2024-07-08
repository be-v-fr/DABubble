import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Channel } from '../../models/channel.class';
import { ChannelsService } from '../../services/content/channels.service';
import { Thread } from '../../models/thread.class';
import { ThreadsService } from '../../services/content/threads.service';
import { Post } from '../../models/post.class';
import { PostsService } from '../../services/content/posts.service';
import { Reaction } from '../../models/reaction.class';
import { ReactionsService } from '../../services/content/reactions.service';
import { Subscription } from 'rxjs';

/**
 * This component exists solely for TESTING purposes.
 * DELETE before production. Also delete the ROUTING to this component. 
 */
@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PLAYGROUNDComponent implements OnInit, OnDestroy {
  public channelsService = inject(ChannelsService);
  public threadsService = inject(ThreadsService);
  public postsService = inject(PostsService);
  public reactionsService = inject(ReactionsService);
  channelsSub = new Subscription();
  threadsSub = new Subscription();
  postsSub = new Subscription();
  reactionsSub = new Subscription();

  /**
   * Array of channels.
   */
  channels: Channel[] = [];
  
  threads: Thread[] = [];
  posts: Post[] = [];
  reactions: Reaction[] = [];

  currentChannel = new Channel();
  currentThreads: Thread[] | null = null;


  ngOnInit(): void {
    this.channelsSub = this.subChannels();
    this.threadsSub = this.subThreads();
    this.postsSub = this.subPosts();
    this.reactionsSub = this.subReactions();
  }

  ngOnDestroy(): void {
    this.channelsSub.unsubscribe();
    this.threadsSub.unsubscribe();
    this.postsSub.unsubscribe();
    this.reactionsSub.unsubscribe();
  }

  subChannels(): Subscription {
    return this.channelsService.channels$.subscribe((channels: Channel[]) => {
      this.channels = channels;
    })
  }

  subThreads(): Subscription {
    return this.threadsService.threads$.subscribe((threads: Thread[]) => {
      this.threads = threads;
    })
  }

  subPosts(): Subscription {
    return this.postsService.posts$.subscribe((posts: Post[]) => {
      this.posts = posts;
    })
  }

  subReactions(): Subscription {
    return this.reactionsService.reactions$.subscribe((reactions: Reaction[]) => {
      this.reactions = reactions;
    })
  }

  selectChannel(channel_id: string) {
      this.currentChannel = new Channel(this.channels.find(c => c.channel_id == channel_id));
  }
}