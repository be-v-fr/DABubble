export interface UserState {
    uid: string;
    state: 'active' | 'idle' | 'loggedOut';
}