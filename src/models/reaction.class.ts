export class Reaction {
    reaction_id: string;
    user_id: string;
    post_id: string;
    emoji: any;

    constructor(obj?: any) {
        this.reaction_id = obj && obj.reaction_id ? obj.reaction_id : '';
        this.user_id = obj && obj.user_id ? obj.user_id : '';
        this.post_id = obj && obj.post_id ? obj.post_id : '';
        this.emoji = obj && obj.emoji ? obj.emoji : '';
    }

    toJson() {
        return {
            reaction_id: this.reaction_id,
            user_id: this.user_id,
            post_id: this.post_id,
            emoji: this.emoji
        };
    }
}