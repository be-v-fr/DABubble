import { Reaction } from "./reaction.class";
import { Thread } from "./thread.class";

export class Post {
    post_id: string;
    channel_id: string;
    message: string;
    user_id: string;
    thread: Thread;
    date: number;
    reactions: Reaction[];

    constructor(obj?: any) {
        this.post_id = obj && obj.post_id ? obj.post_id : '';
        this.channel_id = obj && obj.channel_id ? obj.channel_id : '';
        this.message = obj && obj.message ? obj.message : '';
        this.user_id = obj && obj.user_id ? obj.user_id : '';
        this.thread = obj && obj.thread ? new Thread(obj.thread) : new Thread();
        this.date = obj && obj.date ? obj.date : -1;
        this.reactions = obj && obj.reactions ? obj.reactions.map((r: any) => new Reaction(r)) : [];
    }

    toJson(): {
        post_id: string;
        channel_id: string;
        message: string;
        user_id: string;
        thread: any;
        date: number;
        reactions: any[];
    } {
        return {
            post_id: this.post_id,
            channel_id: this.channel_id,
            message: this.message,
            user_id: this.user_id,
            thread: this.thread.toJson(),
            date: this.date,
            reactions: this.reactions.map(r => r.toJson())
        };
    }
}
