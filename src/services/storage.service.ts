import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  listAll,
  deleteObject,
  getDownloadURL
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  storage = inject(Storage);
  storageRef = ref(this.storage);
  avatarsRef = ref(this.storage, 'avatars');

  constructor() { }

  async upload(file: File, ref: any) {
    await uploadBytesResumable(ref, file);
  }

  async uploadImage(img: File, ref: any): Promise<string> {
    if (this.isImage(img)) {
      await this.upload(img, ref);
      return this.getUrl(ref);
    } else {
      throw ('err/not-an-image');
    }
  }

  isImage(img: File): boolean {
    return img.type.includes('image');
  }


  // not in use so far
  async deleteFolder(ref: any) {
    await listAll(ref)
      .then((dir: any) => {
        dir.items.forEach((fileRef: any) => deleteObject(fileRef));
        dir.prefixes.forEach((folderRef: any) => this.deleteFolder(folderRef.fullPath))
      })
      .catch((err: Error) => console.error(err));
  }


  async getUrl(fileRef: any): Promise<string> {
    return await getDownloadURL(fileRef);
  }


  // OPTIONAL: implement file compression or maximum file size on upload
  async uploadAvatar(img: File, uid: string): Promise<string> {
    const relFilePath = 'avatars/' + this.generateAvatarName(img, uid);
    const fileRef: any = ref(this.storage, relFilePath);
    const previousAvatarRef = await this.getAvatarRef(uid)
    if (previousAvatarRef) { await deleteObject(previousAvatarRef) };
    return await this.uploadImage(img, fileRef);
  }


  generateAvatarName(img: File, uid: string): string {
    const nameParts = img.name.split('.');
    const fileExtension = nameParts[nameParts.length - 1];
    return uid + '.' + fileExtension;
  }


  async getAvatarRef(uid: string): Promise<any> {
    await listAll(this.avatarsRef)
      .then((dir: any) => {
        dir.items.forEach((fileRef: any) => { if (fileRef.name.includes(uid)) { return fileRef } });
        return undefined;
      })
      .catch((err: Error) => console.error(err));
  }
}