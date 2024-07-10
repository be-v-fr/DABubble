export class Channel {
    channel_id: string;
    name: string;
    author_uid: string;
    description: string;
    members_uids: string[];
    date: number;
    isPmChannel: boolean;
    
    constructor(obj?: any) {
        this.channel_id = obj && obj.channel_id ? obj.channel_id : '';
        this.name = obj && obj.name ? obj.name : '';
        this.author_uid = obj && obj.author_uid ? obj.author_uid : '';
        this.description = obj && obj.description ? obj.description : '';
        this.members_uids = obj && obj.members_uids ? obj.members_uids : [];
        this.date = obj && obj.date ? obj.date : Date.now();
        this.isPmChannel = obj && obj.isPmChannel ? obj.isPmChannel : false;
    }

    toJson() {
        return {
            channel_id: this.channel_id,
            name: this.name,
            author_uid: this.author_uid,
            description: this.description,
            members_uids: this.members_uids,
            date: this.date,
            isPmChannel: this.isPmChannel
        };
    }
}
