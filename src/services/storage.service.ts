import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Channel } from '../models/channel.class';
import {
  Storage,
  ref,
  uploadBytesResumable,
  listAll,
  deleteObject,
  getDownloadURL,
  StorageReference
} from '@angular/fire/storage';
import { v4 as uuidv4 } from 'uuid';


/**
 * This service provides mainly backend communication (with both Firebase database,
 * aka "Firestore", and Firebase file storage).
 * It also provides some additional file operations.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  firestore: Firestore = inject(Firestore);
  storage = inject(Storage);
  storageRef = ref(this.storage);
  avatarsRef = ref(this.storage, 'avatars');
  tempAvatarsRef = ref(this.storage, 'tempAvatars');

  constructor() { }

  /**
     * Returns a reference to the 'channels' collection in Firestore.
     * @returns {CollectionReference} The reference to the 'channels' collection.
     */
  getColRef(): CollectionReference {
    return collection(this.firestore, 'channels');
  }


  /**
   * Returns a document reference for a specific channel in Firestore.
   * @param {string} channelId - The ID of the channel.
   * @returns {DocumentReference} The document reference for the channel.
   */
  getSingleDocRef(uid: string): DocumentReference {
    return doc(this.getColRef(), uid);
  }


  /**
   * Stores a new channel in Firestore.
   * @param {Channel} channel - The channel object to store.
   * @returns {Promise<string>} A promise that resolves when the channel is stored.
   */
  async storeChannel(channel: Channel): Promise<string> {
    try {
      const response = await addDoc(this.getColRef(), channel.toJson())
      channel.channel_id = response.id;
      await this.updateChannelInStorage(channel);
    } catch (e) {
      console.error(e);
    }
    return channel.channel_id;
  }


  /**
   * Updates a channel in Firestore.
   * @param {Channel} channel - The channel object to update.
   * @returns {Promise<void>} A promise that resolves when the channel is updated.
   */
  async updateChannelInStorage(channel: Channel) {
    if (channel.channel_id) {
      try {
        const docRef = this.getSingleDocRef(channel.channel_id);
        await updateDoc(docRef, channel.toJson()).catch((err: Error) => { console.error(err) });
      } catch (e) {
        console.error(e);
      }
    }
  }


  /**
   * Deletes a channel from Firestore.
   * @param {string} channel_id - The ID of the channel to delete.
   * @returns {Promise<void>} A promise that resolves when the channel is deleted from Firestore.
   */
  async deleteChannelInStorage(channel_id: string) {
    try {
      const docRef = this.getSingleDocRef(channel_id);
      await deleteDoc(docRef).catch((err: Error) => { console.error(err) });
    } catch (e) {
      console.error(e);
    }
  }


  /**
   * Uploads a file to the specified storage reference using a resumable upload.
   * @param {File} file - The file to be uploaded.
   * @param {any} ref - The storage reference where the file will be uploaded.
   * @returns {Promise<void>} A promise that resolves when the file upload is complete.
   */
  async upload(file: File, ref: any) {
    await uploadBytesResumable(ref, file);
  }


  /**
   * Uploads an image file and returns the URL to the uploaded image.
   * @param {File} img - The image file to be uploaded.
   * @param {any} ref - The storage reference where the image will be uploaded.
   * @returns {Promise<string>} A promise that resolves with the download URL of the uploaded image.
   * @throws Will throw an error if the provided file is not an image.
   */
  async uploadImage(img: File, ref: any): Promise<string> {
    if (this.isImage(img)) {
      await this.upload(img, ref);
      return this.getUrl(ref);
    } else {
      throw ('err/not-an-image');
    }
  }


  /**
   * Checks if a file is an image based on its MIME type.
   * @param {File} img - The file to be checked.
   * @returns {boolean} True if the file is an image, false otherwise.
   */
  isImage(img: File): boolean {
    return img.type.includes('image');
  }


  /**
   * Checks if a file is a PDF based on its MIME type.
   * @param {File} file - The file to be checked.
   * @returns {boolean} True if the file is a PDF, false otherwise.
   */
  isPdf(file: File): boolean {
    return file.type.includes('pdf');
  }


  /**
   * Retrieves the download URL for a file in the storage.
   * @param {any} fileRef - Storage reference.
   * @returns {string} Download URL
   */
  async getUrl(fileRef: any): Promise<string> {
    return await getDownloadURL(fileRef);
  }


  /**
   * Function to upload a temporary avatar image
   * 
   * @param img - A reference of image file
   * @param uid - the ID of current MainUser
   * @returns 
   */
  async uploadTempAvatar(img: File, uid: string): Promise<string> {
    const relFilePath = 'tempAvatars/' + this.generateAvatarName(img, uid);
    const fileRef = ref(this.storage, relFilePath);
    return await this.uploadImage(img, fileRef);
  }


  /**
   * Deletes a file with the main user ID in the Temp folder
   * 
   * @param uid - the ID of current MainUser
   */
  async cancelAvatar(uid: string): Promise<void> {
    const tempAvatarRef = await this.getTempAvatarRef(uid);
    if (tempAvatarRef) {
      await deleteObject(tempAvatarRef);
    }
  }


  /**
   * Searches the Temp folder for files with the main user ID
   * 
   * @param uid - the ID of current MainUser
   * @returns - A reference of image file or undefined
   */
  async getTempAvatarRef(uid: string): Promise<any> {
    return await listAll(this.tempAvatarsRef)
      .then((dir: any) => {
        for (const fileRef of dir.items) {
          if (fileRef.name.includes(uid)) { return fileRef }
        }
        return undefined;
      })
      .catch((err: Error) => console.error(err));
  }


  /**
   * Uploads a new avatar for the user, deletes any previous avatar, and returns the URL of the new avatar.
   * @param {File} img - The image file to be used as the new avatar.
   * @param {string} uid - The user ID for which the avatar is being uploaded.
   * @returns {Promise<string>} A promise that resolves with the download URL of the uploaded avatar.
   */
  async uploadAvatar(img: File, uid: string): Promise<string> {
    const relFilePath = 'avatars/' + this.generateAvatarName(img, uid);
    const fileRef: any = ref(this.storage, relFilePath);
    const previousAvatarRef = await this.getAvatarRef(uid)
    if (previousAvatarRef) { await deleteObject(previousAvatarRef) };
    return await this.uploadImage(img, fileRef);
  }


  /**
   * Generates a unique avatar filename based on the user ID and the original file extension.
   * @param {File} img - The image file to be uploaded.
   * @param {string} uid - The user ID to associate with the avatar.
   * @returns {string} A string representing the generated avatar filename (e.g., "uid.jpg").
   */
  generateAvatarName(img: File, uid: string): string {
    const nameParts = img.name.split('.');
    const fileExtension = nameParts[nameParts.length - 1];
    return uid + '.' + fileExtension;
  }


  /**
   * Retrieves the reference to the user's current avatar from the avatar directory, if it exists.
   * @param {string} uid - The user ID whose avatar reference is to be retrieved.
   * @returns {Promise<any>} A promise that resolves with the avatar reference, or undefined if no avatar is found.
   */
  async getAvatarRef(uid: string): Promise<any> {
    return await listAll(this.avatarsRef)
      .then((dir: any) => {
        dir.items.forEach((fileRef: any) => { if (fileRef.name.includes(uid)) { return fileRef } });
        return undefined;
      })
      .catch((err: Error) => console.error(err));
  }


  /**
   * Deletes all avatars associated with a given user ID from both the avatars and temp avatars directories.
   * @param {string} uid - The user ID whose avatars are to be deleted.
   * @returns {Promise<void>} A promise that resolves once the deletion is complete.
   */
  async deleteUserAvatars(uid: string): Promise<void> {
    await listAll(this.avatarsRef)
      .then((dir: any) => this.deleteAvatarFromDirectory(dir, uid));
    await listAll(this.tempAvatarsRef)
      .then((dir: any) => this.deleteAvatarFromDirectory(dir, uid));
  }


  /**
   * Deletes a specific user's avatar from a given directory based on their user ID.
   * @param {any} dir - The directory from which avatars will be deleted.
   * @param {string} uid - The user ID whose avatar should be deleted.
   */
  deleteAvatarFromDirectory(dir: any, uid: string) {
    dir.items.forEach((fileRef: any) => {
      if (fileRef.toString().includes(uid)) { deleteObject(fileRef) }
    });
  }


  /**
   * Uploads a file as an attachment to a specific channel, and returns the file's storage reference.
   * @param {File} attach - The attachment file to be uploaded.
   * @param {string} channel_id - The ID of the channel where the file is being uploaded.
   * @returns {Promise<StorageReference>} A promise that resolves with the reference to the uploaded file in storage.
   */
  async uploadAttachment(attach: File, channel_id: string): Promise<StorageReference> {
    const relFilePath = 'attach/' + channel_id + '/' + uuidv4().substring(0, 6) + '_' + attach.name;
    const fileRef = ref(this.storage, relFilePath);
    await this.upload(attach, fileRef);
    return fileRef;
  }
}