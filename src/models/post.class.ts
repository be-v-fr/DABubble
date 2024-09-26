import { Reaction } from "./reaction.class";
import { Thread } from "./thread.class";
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a single post within a channel. 
 * A post contains a message, optional attachments, and can have reactions or be part of a thread.
 */
export class Post {
    post_id: string;
    channel_id: string;
    message: string;
    user_id: string;
    thread: Thread;
    date: number;
    reactions: Reaction[];
    attachmentSrc: string;


    /**
     * Constructor for the `Post` class.
     * Initializes a new `Post` object either with default values or from a provided object (typically fetched from a database).
     * 
     * @param obj - An optional object containing initial values for the post properties.
     *              If no object is provided, default values are used.
     */
    constructor(obj?: any) {
        this.post_id = obj && obj.post_id ? obj.post_id : '';
        this.channel_id = obj && obj.channel_id ? obj.channel_id : '';
        this.message = obj && obj.message ? obj.message : '';
        this.user_id = obj && obj.user_id ? obj.user_id : '';
        this.thread = obj && obj.thread ? new Thread(obj.thread) : new Thread();
        this.date = obj && obj.date ? obj.date : -1;
        this.reactions = obj && obj.reactions ? obj.reactions.map((r: any) => new Reaction(r)) : [];
        this.attachmentSrc = obj && obj.attachmentSrc ? obj.attachmentSrc : '';
    }


    /**
     * Resets this post using a generated ID, user information, message, and optional attachment.
     * Initializes date and clears any reactions.
     * 
     * @param channel_id - The ID of the channel where the post is being created.
     * @param uid - The ID of the user creating the post.
     * @param message - The text message content of the post.
     * @param attachmentSrc - Optional URL to an attachment (e.g., image, file).
     */
    setNew(channel_id: string, uid: string, message: string, attachmentSrc: string) {
        this.post_id = uuidv4();
        this.channel_id = channel_id;
        this.message = message;
        this.user_id = uid;
        this.date = Date.now();
        this.reactions = [];
        this.attachmentSrc = attachmentSrc;
    }


    /**
     * Converts the `Post` instance into a plain object (JSON format) suitable for storage or transmission.
     * 
     * @returns An object containing the serialized properties of the post.
     *          The `thread` and `reactions` are also converted to JSON format.
     */
    toJson(): {
        post_id: string;
        channel_id: string;
        message: string;
        user_id: string;
        thread: any;
        date: number;
        reactions: any[];
        attachmentSrc: string;
    } {
        return {
            post_id: this.post_id,
            channel_id: this.channel_id,
            message: this.message,
            user_id: this.user_id,
            thread: this.thread.toJson(),
            date: this.date,
            reactions: this.reactions.map(r => r.toJson()),
            attachmentSrc : this.attachmentSrc
        };
    }
}
