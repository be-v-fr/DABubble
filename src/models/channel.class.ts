export class Channel {
    channel_id: string;
    channel_name: string;
    uid: string;
    description: string;
    users: string[];
    
    constructor(obj?: any) {
        this.channel_id = obj && obj.channel_id ? obj.channel_id : '';
        this.channel_name = obj && obj.channel_name ? obj.channel_name : '';
        this.uid = obj && obj.uid ? obj.uid : '';
        this.description = obj && obj.description ? obj.description : '';
        this.users = obj && obj.users ? obj.users : [];        
    }

    toJson() {
        return {
            channel_id: this.channel_id,
            name: this.channel_name,
            uid: this.uid,
            description: this.description,
            users: this.users
        };
    }
}
