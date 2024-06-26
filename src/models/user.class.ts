export class User {
    uid: string;
    name: string;
    email: string;
    // avatar --> string or class "Avatar" ?? (depends on how Firebase Cloud Storage works...)
    
    constructor(obj?: any) {
        this.uid = obj && obj.uid ? obj.uid : '';
        this.name = obj && obj.name ? obj.name : '';
        this.email = obj && obj.email ? obj.email : '';        
    }

    toJson() {
        return {
            uid: this.uid,
            name: this.name,
            email: this.email,
        };
    }
}