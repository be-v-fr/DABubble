import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Thread } from '../../models/thread.class';
import { PostsService } from './posts.service';
import { Post } from '../../models/post.class';


@Injectable({
  providedIn: 'root'
})
export class ThreadsService implements OnDestroy {
  threads: Thread[] = [];
  threads$: Subject<Thread[]> = new Subject<Thread[]>();
  unsubThreads;

  firestore: Firestore = inject(Firestore);
  private postsService = inject(PostsService);

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
    // this.unsubThreads();
  }

  subThreads() {
    return onSnapshot(this.getColRef(), (list: any) => {
      let threads: Thread[] = [];
      list.forEach((element: any) => threads.push(element.data()));
      this.threads = threads;
      this.threads$.next(threads);
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
  async addDoc(thread: Thread): Promise<string> {
    try {
      const response = await addDoc(this.getColRef(), thread.toJson());
      thread.thread_id = response.id;
      thread.date = Date.now();
      await this.updateDoc(thread);
      return response.id;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async createThread(message: string, channel_id: string, author_id: string): Promise<string> {
    try {
      const thread = new Thread({ channel_id: channel_id });
      const thread_id = await this.addDoc(thread);
      const post = new Post({ message: message, user_id: author_id, thread_id: thread_id });
      await this.postsService.addDoc(post);
      return thread_id;
    } catch (err) {
      console.error(err);
      throw err;  
    }
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

  
  getChannelThreads(threads: Thread[], channel_id: string): Thread[] {
    threads = threads.filter(t => t.channel_id == channel_id);
    threads.sort((a, b) => a.date - b.date);
    threads.forEach(t => t = new Thread(t));
    return threads;
  }
}
