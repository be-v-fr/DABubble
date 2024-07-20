import { User } from "./user.class";

export class Reaction {
    reaction_id: string;
    user: User;
    post_id: string;
    emoji: string;

    constructor(obj?: any) {
        this.reaction_id = obj?.reaction_id ?? '';
        this.user = obj?.user ? new User(obj.user) : new User();
        this.post_id = obj?.post_id ?? '';
        this.emoji = obj?.emoji ?? '';
    }

    toJson() {
        return {
            reaction_id: this.reaction_id,
            user: this.user.toJson(),
            post_id: this.post_id,
            emoji: this.emoji
        };
    }
}
