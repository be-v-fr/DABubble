import { Post } from "./post.class";

export class Thread {
    thread_id: string;
    date: number;
    posts: Post[];

    constructor(obj?: any) {
        this.thread_id = obj && obj.thread_id ? obj.thread_id : '';
        this.date = obj && obj.date ? obj.date : Date.now();
        this.posts = obj && obj.posts ? obj.posts.map((p: any) => new Post(p)) : [];
    }

    toJson() {
        return {
            thread_id: this.thread_id,
            date: this.date,
            posts: this.posts.map(p => p.toJson()) // Convert Post objects to JSON
        };
    }
}
