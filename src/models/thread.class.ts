import { Post } from "./post.class";

export class Thread {
    thread_id: string;
    channel_id: string;
    date: number;
    
    constructor(obj?: any) {
        this.thread_id = obj && obj.thread_id ? obj.thread_id : '';
        this.channel_id = obj && obj.channel_id ? obj.channel_id : '';
        this.date = obj && obj.date ? obj.date : '';
    }

    toJson() {
        return {
            thread_id: this.thread_id,
            channel_id: this.channel_id,
            date: this.date
        };
    }

    getPosts(posts: Post[]) {
        return posts.filter(p => p.thread_id == this.thread_id);
    }
}