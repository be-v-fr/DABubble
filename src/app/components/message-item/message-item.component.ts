import { Component, EventEmitter, Input, Output, OnDestroy, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
import { Post } from '../../../models/post.class';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';
import { TimeService } from '../../../services/time.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ChannelsService } from '../../../services/content/channels.service';
import { Reaction } from '../../../models/reaction.class';
import { ReactionService } from '../../../services/content/reaction.service';
import { MainUserProfileCardComponent } from '../../main-user/main-user-profile-card/main-user-profile-card.component';
import { FormsModule, NgForm } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';

/**
 * Component responsible for displaying individual messages in a chat, including editing, deleting, and reacting.
 */
@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeSeparatorComponent],
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent implements OnInit, OnChanges, OnDestroy {

  /** Indicates if the message is in edit mode */
  isOnEdit = false;

  /** Indicates if actions (edit, delete) should be shown */
  showActions = false;

  /** The message content to update */
  messageToUpdate = '';

  /** The message post data */
  @Input() post: Post = new Post();

  /** Date of the last reply in the thread */
  @Input() lastReply = this.post?.thread.posts[this.post.thread.posts.length - 1]?.date ?? null;

  /** Indicates if the message sender is the current user */
  @Input() messageSender?: boolean;

  /** Indicates if the message is in a direct message */
  @Input() isInDirectMessage = false;

  /** Indicates if the message is in the main post thread */
  @Input() isMainPostThread = false;

  /** Indicates if the message is coming from a thread */
  @Input() ComeFromThread = false;

  /** The UID of the post */
  @Input() postUid: string = "";

  /**
   * A flag indicating whether the thread is open or not.
   * When `true`, the thread is expanded; otherwise, it is closed.
   * 
   * @type {boolean}
   * @default false
   */
  @Input() isThreadOpen: boolean = false;

  /** Emits the thread ID when opening a new thread */
  @Output() threadId = new EventEmitter<string>();

  /** Grouped emojis and their counts */
  groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};

  /** Current user data */
  currentUser: User | undefined;

  /** User data of the post creator */
  postUser: User = new User({ name: 'Unbekannter Nutzer' });

  /** Name of the attachment file, if any */
  attachmentFileName: string | null = null;

  /** Subscription for authentication state changes */
  private authSub = new Subscription();

  /** Subscription for reaction updates */
  private reactionSub = new Subscription();

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private usersService: UsersService,
    private channelsService: ChannelsService,
    private reactionsService: ReactionService,
    public timeService: TimeService,
    private storageService: StorageService
  ) { }

  /**
   * Initializes the component by subscribing to necessary services and setting up the message for editing.
   */
  ngOnInit(): void {
    this.authSub = this.subAuth();
    this.reactionSub = this.subReaction();
    this.messageToUpdate = this.post.message;
    this.initAttachment();
  }

  /**
   * Initializes the attachment file name based on the post's attachment source.
   */
  initAttachment(): void {
    if (this.post.attachmentSrc.length > 0) {
      const parsedUrl = new URL(this.post.attachmentSrc);
      const path = parsedUrl.pathname;
      const fileName = path.split('/').pop();
      if (fileName) { this.attachmentFileName = fileName }
    }
  }

  /**
   * Responds to changes in input properties.
   * @param changes - The changes to input properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post'] && changes['post'].currentValue) {
      this.updateGroupedEmojis();
    }
  }

  /**
   * Unsubscribes from all subscriptions to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.reactionSub.unsubscribe();
  }

  /**
   * Updates the grouped emojis with counts and user names based on post reactions.
   */
  private async updateGroupedEmojis(): Promise<void> {
    if (this.post.reactions) {
      this.groupedEmojis = await this.getGroupedEmojis(this.post.reactions);
    }
  }

  /**
   * Subscribes to authentication state changes and updates user information.
   * @returns The subscription to authentication state changes.
   */
  private subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) {
        this.currentUser = this.usersService.getUserByUid(uid);
        if (this.postUid) {
          this.postUser = this.usersService.getUserByUid(this.postUid) || new User();
        }
      }
    });
  }

  /**
   * Emits the thread ID to open a new thread.
   */
  onOpenNewThread() {
    this.threadId.emit(this.post.thread.thread_id);
    this.isThreadOpen = true;
  }

  /**
   * Opens the user profile in a dialog.
   * @param uid - The UID of the user whose profile is to be opened.
   */
  openUserProfile(uid: string): void {
    if (uid) {
      if (uid == this.currentUser?.uid) {
        this.dialog.open(MainUserProfileCardComponent, {
          data: { 'mainUser': this.currentUser }
        });
      } else {
        let viewUser: User = new User(this.usersService.getUserByUid(uid));
        this.dialog.open(UserProfileCardComponent, {
          data: viewUser
        });
      }
    }
  }

  /**
   * Toggles the display of edit actions (edit, delete).
   */
  showEditActions() {
    this.showActions = !this.showActions;
  }

  /**
   * Enables message editing mode and sets the message to be updated.
   */
  onEditMessage() {
    this.messageToUpdate = this.post.message;
    this.isOnEdit = true;
    this.showActions = false;
  }

  /**
   * Submits the edited message and updates the post.
   * @param form - The form containing the edited message.
   */
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {
      this.channelsService.updatePost(this.post.channel_id, this.post.post_id, this.messageToUpdate);
      this.isOnEdit = false;
      // clear form
      form.reset()
    }
  }

  /**
   * Cancels the message editing mode.
   */
  cancelEditMessage() {
    this.isOnEdit = false;
  }

  /**
   * Deletes the post and hides the edit actions.
   */
  onDeletePost() {
    this.channelsService.deletePost(this.post.channel_id, this.post.post_id);
    this.showActions = false;
  }

  /**
   * Returns the keys of an object as an array of strings.
   * @param obj - The object to get keys from.
   * @returns An array of keys.
   */
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  /**
   * Opens the emoji picker for adding reactions to the post.
   */
  onShowEmojiPicker() {
    this.reactionsService.currentPost = this.post;
    this.reactionsService.toggleReactionsPicker();
  }

  /**
   * Opens the emoji picker for adding reactions while editing a message.
   */
  onShowEmojiPickerInEdit() {
    this.reactionsService.currentPost = this.post;
    this.reactionsService.reactionToEditMessage = true;
    this.reactionsService.toggleReactionsPicker();
  }

  /**
   * Adds a reaction to the message being updated.
   * @param reaction - The reaction to add.
   */
  addReactionToUpdateMessage(reaction: string) {
    this.messageToUpdate += reaction;
  }

  /**
   * Subscribes to reaction updates and handles new reactions.
   * @returns The subscription to reaction updates.
   */
  subReaction(): Subscription {
    return this.reactionsService.reactionToAdded$.subscribe((reaction) => {
      if (reaction && this.reactionsService.reactionToEditMessage) {
        this.addReactionToUpdateMessage(reaction);
        this.reactionsService.setReaction('');
      }
    });
  };

  /**
   * Handles adding a reaction to the post.
   * @param emoji - The emoji to be added as a reaction.
   */
  async onHandleReaction(emoji: any) {
    let reaction = { emoji: { native: emoji } };

    if (!this.currentUser) {
      console.error('Current user is not defined');
      return;
    }
    this.reactionsService.currentPost = this.post;

    await this.reactionsService.addReaction(reaction, this.currentUser);
  }

  /**
   * Groups emojis from reactions and counts them, including user names who reacted.
   * @param reactions - The list of reactions to process.
   * @returns An object with grouped emojis, their counts, and users.
   */
  async getGroupedEmojis(reactions: Reaction[]): Promise<{ [key: string]: { count: number, users: string[] } }> {
    let groups: { [key: string]: { count: number, users: string[] } } = {};

    for (const reaction of reactions) {
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = { count: 0, users: [] };
      }
      groups[reaction.emoji].count++;

      if (reaction.user) {
        try {
          groups[reaction.emoji].users.push(reaction.user.name);
        } catch (error) {
          console.error(`Failed to get user with ID ${reaction.user.uid}`, error);
        }
      }
    }

    return groups;
  }
}
