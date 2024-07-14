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

  constructor() {
    this.unsubThreads = this.subThreads();
  }

  ngOnDestroy() {
    this.unsubThreads(); // Unsubscribe from Firestore snapshot
  }

  // subThreads() {
  //   return onSnapshot(this.getColRef(), (querySnapshot) => {
  //     const threads: Thread[] = [];
  //     querySnapshot.forEach((doc) => threads.push(doc.data() as Thread));
  //     this.threads = threads;
  //     this.threads$.next(threads);
  //   });
  // }

  subThreads() {
    // Abonnement auf die Firestore-Snapshot der Threads-Kollektion
    return onSnapshot(this.getColRef(), (querySnapshot) => {
      const threads: Thread[] = [];
      querySnapshot.forEach((doc) => {
        // Hier sicherstellen, dass die Daten tatsächlich vom Typ Thread sind
        const threadData = doc.data() as Thread;
        threads.push(threadData);
      });

      // Aktualisierung der lokal gespeicherten Threads
      this.threads = threads;
      
      // Aktualisierung der Subject, um Komponenten über Änderungen zu informieren
      this.threads$.next(threads);
    });
  }


  getColRef(): CollectionReference {
    return collection(this.firestore, 'threads');
  }

  getSingleDocRef(thread_id: string): DocumentReference {
    return doc(this.getColRef(), thread_id);
  }

  async addDoc(thread: Thread): Promise<string> {
    try {
      const response = await addDoc(this.getColRef(), thread.toJson());
      thread.thread_id = response.id;
      thread.date = Date.now();
      await this.updateDoc(thread);
      return response.id;
    } catch (err) {
      console.error('Fehler beim Hinzufügen des Threads:', err);
      throw err;
    }
  }

  async createThread(message: string, channel_id: string, author_id: string): Promise<string> {
    try {
      const thread = new Thread({ channel_id });
      const thread_id = await this.addDoc(thread);
      const post = new Post({ message, user_id: author_id, thread_id });
      await this.postsService.addDoc(post);
      return thread_id;
    } catch (err) {
      console.error('Fehler beim Erstellen des Threads oder Posts:', err);
      throw err;
    }
  }

  async updateDoc(thread: Thread) {
    if (thread.thread_id) {
      const docRef = this.getSingleDocRef(thread.thread_id);
      await updateDoc(docRef, thread.toJson()).catch((err: Error) => {
        console.error('Fehler beim Aktualisieren des Threads:', err);
        throw err;
      });
    }
  }

  async deleteDoc(thread_id: string) {
    const docRef = this.getSingleDocRef(thread_id);
    await deleteDoc(docRef).catch((err: Error) => {
      console.error('Fehler beim Löschen des Threads:', err);
      throw err;
    });
  }

  getChannelThreads(threads: Thread[], channel_id: string): Thread[] {
    const filteredThreads = threads.filter(t => t.channel_id === channel_id);
    filteredThreads.sort((a, b) => a.date - b.date);
    return filteredThreads.map(t => new Thread(t));
  }
}
