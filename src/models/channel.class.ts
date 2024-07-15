import { Post } from "./post.class";
import { User } from "./user.class";

export class Channel {
    channel_id: string;
    name: string;
    author_uid: string;
    description: string;
    members: User[];
    date: number;
    isPmChannel: boolean;
    posts: Post[];

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

    toJson() {
        return {
            channel_id: this.channel_id,
            name: this.name,
            author_uid: this.author_uid,
            description: this.description,
            members: this.members.map(m => m.toJson()), // Ensure to convert User objects to JSON
            date: this.date,
            isPmChannel: this.isPmChannel,
            posts: this.posts.map(p => p.toJson()) // Ensure to convert Post objects to JSON
        };
    }
}
