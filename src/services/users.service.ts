import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  addDoc
} from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { User } from '../models/user.class';
import { ChannelsService } from './content/channels.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService implements OnDestroy {
  users$: Subject<User[]> = new Subject<User[]>();
  users: User[] = [];
  unsubUsers;
  firestore: Firestore = inject(Firestore);

  private channelsService = inject(ChannelsService);
  private storageService = inject(StorageService);

  constructor() {
    this.unsubUsers = this.subUsers();
  }

  ngOnDestroy() {
    this.unsubUsers();
  }

  subUsers() {
    return onSnapshot(this.getColRef(), (list: any) => {
      const users: User[] = [];
      list.forEach((element: any) => {
        users.push(new User(element.data()));
      });
      this.users = users;
      this.users$.next(users);
    });
  }

  getColRef(): CollectionReference {
    return collection(this.firestore, 'users');
  }

  getSingleDocRef(uid: string): DocumentReference {
    return doc(this.getColRef(), uid);
  }

  async addUser(user: User) {
    user.lastActivity = Date.now();
    try {
      await setDoc(this.getSingleDocRef(user.uid), user.toJson());
      await this.channelsService.initUserChannels(user);
    } catch (err) {
      console.error('Error adding user:', err);
    }
  }

  async addGuestUser() {
    const user = new User({
      name: 'Gast' // OPTIONAL: Add Guest counter for unique name
    });
    try {
      const response = await addDoc(collection(this.firestore, 'users'), user.toJson());
      localStorage.setItem('GUEST_uid', response.id);
      await this.channelsService.initUserChannels(user);
    } catch (err) {
      console.error('Error adding guest user:', err);
    }
  }

  async setGuestUser(user: User) {
    try {
      await setDoc(this.getSingleDocRef(user.uid), user.toJson());
    } catch (err) {
      console.error('Error setting guest user:', err);
    }
  }

  async updateUser(user: User) {
    if (user.uid) {
      try {
        const docRef = this.getSingleDocRef(user.uid);
        await updateDoc(docRef, user.toJson());
      } catch (err) {
        console.error('Error updating user:', err);
      }
    }
  }

  async deleteUser(uid: string) {
    try {
      const docRef = this.getSingleDocRef(uid);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }

  getUserByUid(uid: string): User | undefined {
    return this.users.find(u => u.uid === uid);
  }

  isRegisteredUser(authUid: string): boolean {
    return !!this.getUserByUid(authUid);
  }

  async clearUpInactiveGuests() {
    this.users.forEach(async (u) => {
      if (u.isGuest() && u.isInactive()) {
        try {
          await this.deleteUser(u.uid);
          this.storageService.deleteUserAvatars(u.uid);
        } catch (err) {
          console.error('Error clearing up inactive guests:', err);
        }
      }
    });
  }
}
