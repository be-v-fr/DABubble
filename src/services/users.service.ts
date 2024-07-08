import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { User } from '../models/user.class';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { ChannelsService } from './content/channels.service';


/**
 * This injectable handles generic users operations.
 * This includes Firestore communication.
 * However, Firebase authentication is not included here
 * (see "authService" for user authentication). 
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService implements OnDestroy {
  users: User[] = [];
  users$: Subject<void> = new Subject<void>();
  unsubUsers;
  firestore: Firestore = inject(Firestore);
  private channelsService = inject(ChannelsService);


  /**
   * Create subscription
   */
  constructor() {
    this.unsubUsers = this.subUsers();
  }


  /**
   * Unsubscribe
   */
  ngOnDestroy() {
    this.unsubUsers();
  }


  /**
   * Subscribe to Firestore "users" collection to synchronize "users" array.
   * Also trigger "users$" observable on snapshot.
   * @returns subscription
   */
  subUsers() {
    return onSnapshot(this.getColRef(), (list: any) => {
      this.users = [];
      list.forEach((element: any) => {
        this.users.push(new User(element.data()));
      });
      this.users$.next();
    });
  }


  /**
   * Get reference to Firestore "users" collection
   * @returns reference
   */
  getColRef(): CollectionReference {
    return collection(this.firestore, 'users');
  }


  /**
   * Get reference to single user Firestore data
   * @param id - Firestore task ID
   * @returns reference
   */
  getSingleDocRef(uid: string): DocumentReference {
    return doc(this.getColRef(), uid);
  }


  /**
   * Add user to Firestore collection.
   * The Firestore document ID will be identical to the user's Firebase authentication ID.
   * @param user - user to be added
   */
  async addUser(user: User) {
    user.lastActivity = Date.now();
    await setDoc(this.getSingleDocRef(user.uid), user.toJson())
      .then(() => this.channelsService.initUserChannels(user))
      .catch((err: Error) => { console.error(err) });
  }


  /**
   * Update user in Firestore collection.
   * The update will only be executed if the user (i.e., its Firestore ID) exists in the Firestore collection.
   * @param user - user to be updated
   */
  async updateUser(user: User) {
    if (user.uid) {
      const docRef = this.getSingleDocRef(user.uid);
      await updateDoc(docRef, user.toJson())
        .catch((err: Error) => { console.error(err) });
    }
  }


  /**
   * Delete user from Firestore collection
   * @param uid - Firestore user ID of user to be deleted
   */
  async deleteUser(uid: string) {
    const docRef = this.getSingleDocRef(uid);
    await deleteDoc(docRef)
      .catch((err: Error) => { console.error(err) });
  }


  /**
   * Retrieve a complete user object from user ID
   * @param uid - Firestore user ID
   * @returns user object
   */
  getUserByUid(uid: string): User {
    let user = new User();
    this.users.forEach(u => { if (u.uid == uid) { user = u } });
    return user;
  }


  /**
   * This function checks whether a user is registered. It checks if
   * a given UID is included in the users array.
   * @param authUid - UID to be checked
   * @returns check result
   */
  isRegisteredUser(authUid: string): boolean {
    return this.getUserByUid(authUid).uid.length > 0;
  }
}