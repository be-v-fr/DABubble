import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Thread } from '../../models/thread.class';


@Injectable({
  providedIn: 'root'
})
export class ThreadsService implements OnDestroy {
  threads: Thread[] = [];
  threads$: Subject<void> = new Subject<void>();
  unsubThreads;
  firestore: Firestore = inject(Firestore);


  /**
   * Create subscription
   */
  constructor() {
    this.unsubThreads = this.subThreads();
  }


  /**
   * Unsubscribe
   */
  ngOnDestroy() {
    this.unsubThreads();
  }


  subThreads() {
    return onSnapshot(this.getColRef(), (list: any) => {
      list.forEach((element: any) => {

      });
      this.threads$.next();
    });
  }


  /**
   * Get reference to Firestore "threads" collection
   * @returns reference
   */
  getColRef(): CollectionReference {
    return collection(this.firestore, 'threads');
  }


  /**
   * Get reference to single doc Firestore data
   * @param thread_id - Firestore thread ID
   * @returns reference
   */
  getSingleDocRef(thread_id: string): DocumentReference {
    return doc(this.getColRef(), thread_id);
  }


  /**
   * Add doc to Firestore collection.
   * The Firestore document ID will be identical to the doc's Firebase authentication ID.
   * @param doc - doc to be added
   */
  async addDoc(thread: Thread) {
    await addDoc(this.getColRef(), thread.toJson())
      .then((response: any) => {
        thread.thread_id = response.id;
        this.updateDoc(thread);
      })
      .catch((err: Error) => { console.error(err) });
  }


  /**
   * Update doc in Firestore collection.
   * The update will only be executed if the doc (i.e., its Firestore ID) exists in the Firestore collection.
   * @param doc - doc to be updated
   */
  async updateDoc(thread: Thread) {
    if (thread.thread_id) {
      const docRef = this.getSingleDocRef(thread.thread_id);
      await updateDoc(docRef, thread.toJson())
        .catch((err: Error) => { console.error(err) });
    }
  }


  /**
   * Delete doc from Firestore collection
   * @param uid - Firestore doc ID of doc to be deleted
   */
  async deleteDoc(thread_id: string) {
    const docRef = this.getSingleDocRef(thread_id);
    await deleteDoc(docRef)
      .catch((err: Error) => { console.error(err) });
  }
}
