import { Component, inject, OnInit } from '@angular/core';
import { Channel } from '../../models/channel.class';
import { ChannelsService } from '../../services/content/channels.service';
import { Thread } from '../../models/thread.class';
import { ThreadsService } from '../../services/content/threads.service';
import { Post } from '../../models/post.class';
import { PostsService } from '../../services/content/posts.service';
import { Reaction } from '../../models/reaction.class';
import { ReactionsService } from '../../services/content/reactions.service';

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
export class PLAYGROUNDComponent implements OnInit {
  private channelsService = inject(ChannelsService);
  private threadsService = inject(ThreadsService);
  private postsService = inject(PostsService);
  private reactionsService = inject(ReactionsService);

  ngOnInit(): void {
    // this.create(new Channel(), new Thread(), new Post(), new Reaction());
  }

  async create(channel: Channel, thread: Thread, post: Post, reaction: Reaction) {
    await this.channelsService.addDoc(channel);
    await this.threadsService.addDoc(thread);
    await this.postsService.addDoc(post);
    await this.reactionsService.addDoc(reaction);
    console.log('all 4 creation processes complete');
  }
}
