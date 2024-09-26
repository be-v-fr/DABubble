import { Post } from "./post.class";
import { User } from "./user.class";

/**
 * Represents a communication channel in the application.
 * A channel can be either a public or private messaging (PM) channel, consisting of members (users), posts, and additional metadata.
 */
export class Channel {
    channel_id: string;
    name: string;
    author_uid: string;
    description: string;
    members: User[];
    date: number;
    isPmChannel: boolean;
    posts: Post[];


    /**
     * Constructor for the `Channel` class.
     * Initializes a new `Channel` object, either from a provided object (typically fetched from a database) or as an empty instance.
     * 
     * @param obj - An optional object containing initial values for the channel properties.
     *              If no object is provided, default values are used.
     */
    constructor(obj?: any) {
        this.channel_id = obj && obj.channel_id ? obj.channel_id : '';
        this.name = obj && obj.name ? obj.name : '';
        this.author_uid = obj && obj.author_uid ? obj.author_uid : '';
        this.description = obj && obj.description ? obj.description : '';
        this.members = obj && obj.members ? obj.members.map((m: any) => new User(m)) : [];
        this.date = obj && obj.date ? obj.date : Date.now();
        this.isPmChannel = obj && obj.isPmChannel ? obj.isPmChannel : false;
        this.posts = obj && obj.posts ? obj.posts.map((p: any) => new Post(p)) : [];
    }


    /**
     * Converts the `Channel` instance into a plain object (JSON format) suitable for storage or transmission.
     * 
     * @returns An object containing the serialized properties of the channel.
     *          The `members` and `posts` are also converted to JSON format.
     */
    toJson() {
        return {
            channel_id: this.channel_id,
            name: this.name,
            author_uid: this.author_uid,
            description: this.description,
            members: this.members.map(m => m.toJson()),
            date: this.date,
            isPmChannel: this.isPmChannel,
            posts: this.posts.map(p => p.toJson())
        };
    }
}
