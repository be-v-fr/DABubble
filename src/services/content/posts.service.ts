import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Post } from '../../models/post.class';


@Injectable({
  providedIn: 'root'
})
export class PostsService implements OnDestroy {
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
      list.forEach((element: any) => {
        posts.push(element.data());
      });
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
}
