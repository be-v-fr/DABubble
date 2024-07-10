export class User {
    uid: string;
    name: string;
    email: string;
    avatarSrc: string;
    lastActivity: number;
    
    constructor(obj?: any) {
        this.uid = obj && obj.uid ? obj.uid : '';
        this.name = obj && obj.name ? obj.name : '';
        this.email = obj && obj.email ? obj.email : '';
        this.avatarSrc = obj && obj.avatarSrc ? obj.avatarSrc : 'assets/img/profile_blank.svg';
        this.lastActivity = obj && obj.lastActivity ? obj.lastActivity : 0;        
    }

    toJson() {
        return {
            uid: this.uid,
            name: this.name,
            email: this.email,
            avatarSrc: this.avatarSrc,
            lastActivity: this.lastActivity
        };
    }

    isGuest(): boolean {
        return this.email.length == 0;
    }

    isInactive(): boolean {
        return Date.now() - this.lastActivity > 86400000;
    }
}