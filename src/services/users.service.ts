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


/**
 * The UsersService is responsible for managing user data within the application. 
 * It provides functionality to subscribe to changes in the users collection in Firestore, 
 * handle CRUD operations (create, read, update, delete) for user documents, 
 * and maintain a local list of users in memory. This service is essential for managing 
 * both registered users and guest users, and it integrates with Firestore for real-time updates.
 * 
 * The service uses RxJS subjects to emit changes to the user list, which allows other parts 
 * of the application to react to updates in real-time. It also provides several utility 
 * methods for retrieving user data based on UID, managing guest users, and cleaning up inactive guests.
 * 
 * This service is decorated with `@Injectable`, meaning it can be injected into other services 
 * or components. By setting `providedIn: 'root'`, Angular ensures this service is a singleton, 
 * meaning only one instance of the service is shared across the entire application.
 * 
 * The `UsersService` interacts with Firestore for persistent data storage and listens to changes 
 * in the users collection using Firestore's `onSnapshot` feature for real-time updates.
 * 
 * It also manages the mobile view state, allowing seamless navigation between different views like 
 * workspace, main chat, and thread on mobile devices.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService implements OnDestroy {
  users$: Subject<User[]> = new Subject<User[]>();
  users: User[] = [];
  unsubUsers;
  firestore: Firestore = inject(Firestore);
  public mainChatViewState: 'workspace' | 'mainchat' | 'thread' = 'workspace';
  private channelsService = inject(ChannelsService);
  private storageService = inject(StorageService);

  constructor() {
    this.unsubUsers = this.subUsers();
  }


  /**
   * Lifecycle hook that cleans up subscriptions after the service has been destroyed.
   */
  ngOnDestroy() {
    this.unsubUsers();
  }


  /**
   * Subscribes to changes in the 'users' collection in Firestore.
   * Whenever a document in the 'users' collection is modified, added, or removed,
   * the service updates its local `users` array and emits the updated user list through `users$`.
   * 
   * @returns A function to unsubscribe from the Firestore listener.
   */
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


  /**
   * Retrieves a copy of the current list of users managed by the service.
   * This returns a snapshot of the local `users` array, which is synchronized 
   * with the Firestore 'users' collection through `subUsers()`.
   * 
   * @returns An array of all `User` objects.
   */
  getAllUsers(): User[] {
    return this.users.slice();
  }


  /**
   * Finds and returns a user by their unique Firebase UID.
   * 
   * @param uid - The unique user ID (UID) of the user.
   * @returns The `User` object corresponding to the given UID, or `undefined` if not found.
   */
  getUserByUid(uid: string): User | undefined {
    return this.users.find(u => u.uid === uid);
  }


  /**
   * Retrieves the Firestore collection reference for the 'users' collection.
   * 
   * @returns The `CollectionReference` to the 'users' Firestore collection.
   */
  getColRef(): CollectionReference {
    return collection(this.firestore, 'users');
  }


  /**
   * Retrieves the Firestore document reference for a specific user based on their UID.
   * 
   * @param uid - The unique user ID (UID) of the user.
   * @returns The `DocumentReference` for the specified user document.
   */
  getSingleDocRef(uid: string): DocumentReference {
    return doc(this.getColRef(), uid);
  }


  /**
   * Adds a new user to the Firestore 'users' collection and initializes their channels.
   * The `lastActivity` field is set to the current timestamp.
   * 
   * @param user - The `User` object to be added.
   */
  async addUser(user: User) {
    user.lastActivity = Date.now();
    try {
      await setDoc(this.getSingleDocRef(user.uid), user.toJson());
      await this.channelsService.initUserChannels(user);
    } catch (err) {
      console.error('Error adding user:', err);
    }
  }


  /**
   * Adds a guest user to the Firestore 'users' collection.
   * The guest user receives a temporary name ('Gast') and a unique UID is stored locally.
   * 
   * @returns A promise that resolves once the guest user is added and their channels are initialized.
   */
  async addGuestUser() {
    const user = new User({
      name: 'Gast'
    });
    try {
      const response = await addDoc(collection(this.firestore, 'users'), user.toJson());
      localStorage.setItem('GUEST_uid', response.id);
      user.uid = response.id;
      await this.channelsService.initUserChannels(user);
    } catch (err) {
      console.error('Error adding guest user:', err);
    }
  }


  /**
   * Updates an existing guest user's document in Firestore.
   * 
   * @param user - The `User` object representing the guest user to be updated.
   */
  async setGuestUser(user: User) {
    try {
      await setDoc(this.getSingleDocRef(user.uid), user.toJson());
    } catch (err) {
      console.error('Error setting guest user:', err);
    }
  }


  /**
   * Updates an existing user document in Firestore.
   * This method is used to modify user properties such as `lastActivity`.
   * 
   * @param user - The `User` object to be updated.
   */
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


  /**
   * Deletes a user document from Firestore based on their UID.
   * 
   * @param uid - The unique user ID (UID) of the user to be deleted.
   */
  async deleteUser(uid: string) {
    try {
      const docRef = this.getSingleDocRef(uid);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }


  /**
   * Checks if the current user, identified by their Firebase UID, is a registered user.
   * 
   * @param authUid - The Firebase authentication UID of the user.
   * @returns `true` if the user is registered (exists in the `users` array), `false` otherwise.
   */
  isRegisteredUser(authUid: string): boolean {
    return !!this.getUserByUid(authUid);
  }


  /**
   * Clears up inactive guest users from Firestore. 
   * A guest user is considered inactive if their `lastActivity` indicates inactivity.
   * 
   * This method also deletes the guest's avatars from storage using `StorageService`.
   */
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


  /**
   * Handles the back button functionality on mobile devices.
   * This method toggles between different views such as `workspace`, `mainchat`, and `thread`.
   */
  mobileBackBtn() {
    if (this.mainChatViewState == 'thread') {
      this.mainChatViewState = 'mainchat';
    } else {
      this.mainChatViewState = 'workspace';
    }
  }


  /**
   * Sets the view state for mobile devices.
   * 
   * @param option - The view state option to be set ('workspace', 'mainchat', or 'thread').
   */
  setMobileView(option: 'workspace' | 'mainchat' | 'thread') {
    this.mainChatViewState = option;
  }
}
