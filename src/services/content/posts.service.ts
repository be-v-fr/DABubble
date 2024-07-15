import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Post } from '../../models/post.class';
import { Thread } from '../../models/thread.class';


@Injectable({
  providedIn: 'root'
})
export class PostsService implements OnDestroy {
  posts: Post[] = [];
  posts$: Subject<Post[]> = new Subject<Post[]>();
  unsubPosts;
  firestore: Firestore = inject(Firestore);


  /**
   * Create subscription
   */
  constructor() {
    this.unsubPosts = this.subPosts();
  }


  /**
   * Unsubscribe
   */
  ngOnDestroy() {
    this.unsubPosts();
  }


  subPosts() {
    return onSnapshot(this.getColRef(), (list: any) => {
      let posts: Post[] = [];
      list.forEach((element: any) => posts.push(element.data()));
      this.posts = posts;
      this.posts$.next(posts);
    });
  }


  /**
   * Get reference to Firestore "posts" collection
   * @returns reference
   */
  getColRef(): CollectionReference {
    return collection(this.firestore, 'posts');
  }


  /**
   * Get reference to single doc Firestore data
   * @param post_id - Firestore post ID
   * @returns reference
   */
  getSingleDocRef(post_id: string): DocumentReference {
    return doc(this.getColRef(), post_id);
  }


  /**
   * Add doc to Firestore collection.
   * The Firestore document ID will be identical to the doc's Firebase authentication ID.
   * @param doc - doc to be added
   */
  async addDoc(post: Post) {
    await addDoc(this.getColRef(), post.toJson())
      .then((response: any) => {
        post.post_id = response.id;
        post.date = Date.now();
        this.updateDoc(post);
      })
      .catch((err: Error) => { console.error(err) });
  }


  /**
   * Update doc in Firestore collection.
   * The update will only be executed if the doc (i.e., its Firestore ID) exists in the Firestore collection.
   * @param doc - doc to be updated
   */
  async updateDoc(post: Post) {
    if (post.post_id) {
      const docRef = this.getSingleDocRef(post.post_id);
      await updateDoc(docRef, post.toJson())
        .catch((err: Error) => { console.error(err) });
    }
  }


  /**
   * Delete doc from Firestore collection
   * @param post_id - Firestore doc ID of doc to be deleted
   */
  async deleteDoc(post_id: string) {
    const docRef = this.getSingleDocRef(post_id);
    await deleteDoc(docRef)
      .catch((err: Error) => { console.error(err) });
  }

  // getThreadPosts(posts: Post[], thread_id: string): Post[] {
  //   return posts
  //     .filter(p => p.thread_id === thread_id)
  //     .sort((a, b) => a.date - b.date);
  // }

  // getFirstPost(posts: Post[], thread_id: string): Post | undefined {
  //   return this.getThreadPosts(posts, thread_id)[0];
  // }

  // getThreadsFirstPosts(posts: Post[], threads: Thread[]): Post[] {
  //   return threads
  //     .map(thread => this.getFirstPost(posts, thread.thread_id))
  //     .filter(post => post !== undefined) as Post[];
  // }

  getThreadPosts(posts: Post[], thread_id: string): Post[] {
    posts = posts.filter(p => p.thread.thread_id === thread_id);
    posts.sort((a, b) => a.date - b.date);
    posts.forEach(p => p = new Post(p))
    return posts;
  }


  getFirstPost(posts: Post[], thread_id: string): Post {
    const threadPosts = this.getThreadPosts(posts, thread_id);
    return threadPosts[0];
  }


  getThreadsFirstPosts(posts: Post[], threads: Thread[]): Post[] {
    let firstPosts: Post[] = new Array(threads.length);
    for (let i = 0; i < threads.length; i++) {
      firstPosts[i] = this.getFirstPost(posts, threads[i].thread_id);
    }
    return firstPosts;
  }
}