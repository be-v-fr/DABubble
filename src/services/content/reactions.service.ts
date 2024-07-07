import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Reaction } from '../../models/reaction.class';
import { UsersService } from '../users.service';


@Injectable({
  providedIn: 'root'
})
export class ReactionsService implements OnDestroy {
  reactions$: Subject<Reaction[]> = new Subject<Reaction[]>();
  unsubReactions;

  firestore: Firestore = inject(Firestore);
  usersService: UsersService = inject(UsersService);


  /**
   * Create subscription
   */
  constructor() {
    this.unsubReactions = this.subReactions();
  }


  /**
   * Unsubscribe
   */
  ngOnDestroy() {
    this.unsubReactions();
  }


  subReactions() {
    return onSnapshot(this.getColRef(), (list: any) => {
      let reactions: Reaction[] = [];
      list.forEach((element: any) => {
        reactions.push(element.data());
      });
      this.reactions$.next(reactions);
    });
  }


  /**
   * Get reference to Firestore "reactions" collection
   * @returns reference
   */
  getColRef(): CollectionReference {
    return collection(this.firestore, 'reactions');
  }


  /**
   * Get reference to single doc Firestore data
   * @param id - Firestore task ID
   * @returns reference
   */
  getSingleDocRef(reaction_id: string): DocumentReference {
    return doc(this.getColRef(), reaction_id);
  }


  /**
   * Add doc to Firestore collection.
   * The Firestore document ID will be identical to the doc's Firebase authentication ID.
   * @param doc - doc to be added
   */
  async addDoc(reaction: Reaction) {

    await addDoc(this.getColRef(), reaction.toJson())
      .then((response: any) => {
        reaction.reaction_id = response.id;
        this.updateDoc(reaction);
      })
      .catch((err: Error) => { console.error(err) });
  }


  /**
   * Update doc in Firestore collection.
   * The update will only be executed if the doc (i.e., its Firestore ID) exists in the Firestore collection.
   * @param doc - doc to be updated
   */
  async updateDoc(reaction: Reaction) {
    if (reaction.reaction_id) {
      const docRef = this.getSingleDocRef(reaction.reaction_id);
      await updateDoc(docRef, reaction.toJson())
        .catch((err: Error) => { console.error(err) });
    }
  }


  /**
   * Delete doc from Firestore collection
   * @param uid - Firestore doc ID of doc to be deleted
   */
  async deleteDoc(reaction_id: string) {
    const docRef = this.getSingleDocRef(reaction_id);
    await deleteDoc(docRef)
      .catch((err: Error) => { console.error(err) });
  }


  getPostReactions(reactions: Reaction[], post_id: string): Reaction[] {
    return reactions.filter(r => r.post_id === post_id).slice();
  }

  
  getGroupedEmojis(reactions: Reaction[]): { [key: string]: { count: number, users: string[] } } {
    let groups: { [key: string]: { count: number, users: string[] } } = {};

    reactions.forEach(r => {
      if (!groups[r.emoji]) {
        groups[r.emoji] = { count: 0, users: [] };
      }
      groups[r.emoji].count++;
      if (r.user_id) {
        const user = this.usersService.getUserByUid(r.user_id);
        if (user) {
          groups[r.emoji].users.push(user.name);
        }
      }
    });

    return groups;
  }
}
