import { User } from "./user.class";

/**
 * Represents a reaction (i.e., emoji) to a post made by a user.
 */
export class Reaction {
    reaction_id: string;
    user: User;
    post_id: string;
    emoji: string;


    /**
     * Constructor for the `Reaction` class.
     * Initializes a new `Reaction` object with default values or from a provided object.
     * 
     * @param obj - An optional object containing initial values for the reaction properties.
     *              If no object is provided, default values are used.
     */
    constructor(obj?: any) {
        this.reaction_id = obj?.reaction_id ?? '';
        this.user = obj?.user ? new User(obj.user) : new User();
        this.post_id = obj?.post_id ?? '';
        this.emoji = obj?.emoji ?? '';
    }


    /**
     * Converts the `Reaction` instance into a plain object (JSON format) suitable for storage or transmission.
     * 
     * @returns An object containing the serialized properties of the reaction, including the user in JSON format.
     */
    toJson() {
        return {
            reaction_id: this.reaction_id,
            user: this.user.toJson(),
            post_id: this.post_id,
            emoji: this.emoji
        };
    }
}
