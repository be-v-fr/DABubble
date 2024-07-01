export class User {
    reaction_id: string;
    uid: string;
    post_id: string;
    emoji: string;
    
    constructor(obj?: any) {
        this.reaction_id = obj && obj.reaction_id ? obj.reaction_id : '';
        this.uid = obj && obj.uid ? obj.uid : '';
        this.post_id = obj && obj.post_id ? obj.post_id : '';
        this.emoji = obj && obj.emoji ? obj.emoji : '';        
    }

    toJson() {
        return {
            reaction_id: this.reaction_id,
            uid: this.uid,
            post_id: this.post_id,
            emoji: this.emoji
        };
    }
}