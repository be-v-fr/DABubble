export class User {
    uid: string;
    name: string;
    email: string;
    avatarSrc: string;
    
    constructor(obj?: any) {
        this.uid = obj && obj.uid ? obj.uid : '';
        this.name = obj && obj.name ? obj.name : '';
        this.email = obj && obj.email ? obj.email : '';
        this.avatarSrc = obj && obj.avatarSrc ? obj.avatarSrc : 'assets/img/profile_blank.svg';        
    }

    toJson() {
        return {
            uid: this.uid,
            name: this.name,
            email: this.email,
            avatarSrc: this.avatarSrc
        };
    }
}