export class POst {
    post_id: string;
    message: string;
    uid: string;
    thread_id: string;
    date: number;
    
    constructor(obj?: any) {
        this.post_id = obj && obj.post_id ? obj.post_id : '';
        this.message = obj && obj.message ? obj.message : '';
        this.uid = obj && obj.uid ? obj.uid : '';
        this.thread_id = obj && obj.thread_id ? obj.thread_id : '';        
        this.date = obj && obj.date ? obj.date : '';
    }

    toJson() {
        return {
            post_id: this.post_id,
            message: this.message,
            uid: this.uid,
            thread_id: this.thread_id,
            date: this.date
        };
    }
}