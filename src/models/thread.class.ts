import { Post } from "./post.class";

/**
 * Represents a thread of posts within a channel or conversation.
 * A thread can contain multiple posts and is identified by a unique thread ID.
 */
export class Thread {
    thread_id: string;
    date: number;
    posts: Post[];


    /**
     * Constructor for the `Thread` class.
     * Initializes a new `Thread` object with default values or from a provided object.
     * 
     * @param obj - An optional object containing initial values for the thread properties.
     *              If no object is provided, default values are used.
     */
    constructor(obj?: any) {
        this.thread_id = obj && obj.thread_id ? obj.thread_id : '';
        this.date = obj && obj.date ? obj.date : Date.now();
        this.posts = obj && obj.posts ? obj.posts.map((p: any) => new Post(p)) : [];
    }


    /**
     * Converts the `Thread` instance into a plain object (JSON format) suitable for storage or transmission.
     * 
     * @returns An object containing the serialized properties of the thread, including its posts in JSON format.
     */
    toJson() {
        return {
            thread_id: this.thread_id,
            date: this.date,
            posts: this.posts.map(p => p.toJson()) // Convert Post objects to JSON
        };
    }
}
