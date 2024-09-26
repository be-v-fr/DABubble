/**
 * Represents a user in the system.
 * This class stores user details such as their unique ID, name, email, avatar, and last activity timestamp.
 */
export class User {
    uid: string;
    name: string;
    email: string;
    avatarSrc: string;
    lastActivity: number;
    

    /**
     * Constructor for the `User` class.
     * Initializes a new `User` object with the provided data or default values.
     * 
     * @param obj - An optional object containing initial values for the user properties.
     *              If no object is provided, default values are used.
     */
    constructor(obj?: any) {
        this.uid = obj && obj.uid ? obj.uid : '';
        this.name = obj && obj.name ? obj.name : '';
        this.email = obj && obj.email ? obj.email : '';
        this.avatarSrc = obj && obj.avatarSrc ? obj.avatarSrc : 'assets/img/profile_blank.svg';
        this.lastActivity = obj && obj.lastActivity ? obj.lastActivity : Date.now();        
    }


    /**
     * Converts the `User` instance into a plain object (JSON format) suitable for storage or transmission.
     * 
     * @returns An object containing the serialized properties of the user.
     */
    toJson() {
        return {
            uid: this.uid,
            name: this.name,
            email: this.email,
            avatarSrc: this.avatarSrc,
            lastActivity: this.lastActivity
        };
    }


    /**
     * Checks if the user is a guest.
     * A guest user is defined as one without an email address.
     * 
     * @returns `true` if the user is a guest, otherwise `false`.
     */
    isGuest(): boolean {
        return this.email.length == 0;
    }


    /**
     * Checks if the user is inactive.
     * A user is considered inactive if their last activity was more than 24 hours ago.
     * 
     * @returns `true` if the user is inactive, otherwise `false`.
     */
    isInactive(): boolean {
        return Date.now() - this.lastActivity > 86400000;
    }
}