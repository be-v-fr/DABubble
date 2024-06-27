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
      return 'err/not-an-image'; // use "catch" or "throw" instead ??
    }
  }

  isImage(img: File): boolean {
    return img.type.includes('image'); // check if all image file extensions are actually noted as "image/[extension]"
  }


  // not in use so far
  async deleteFolder(ref: any) {
    await listAll(ref)
      .then((dir: any) => {
        dir.items.forEach((fileRef: any) => deleteObject(fileRef));
        dir.prefixes.forEach((folderRef: any) => this.deleteFolder(folderRef.fullPath))
      })
      .catch((error: Error) => console.log(error));
  }


  async getUrl(fileRef: any): Promise<string> {
    return await getDownloadURL(fileRef);
  }


  // implement file compression or maximum file size on upload
  async uploadAvatar(img: File, uid: string): Promise<string> {
    const relFilePath = 'avatars/' + this.generateAvatarName(img, uid);
    const fileRef: any = ref(this.storage, relFilePath);
    const previousAvatarRef = await this.getAvatarRef(uid)
    if(previousAvatarRef) {await deleteObject(previousAvatarRef)};
    return await this.uploadImage(img, fileRef);
  }


  generateAvatarName(img: File, uid: string): string {
    const nameParts = img.name.split('.');
    const fileExtension = nameParts[nameParts.length - 1];
    console.log('new avatar file name:', uid + '.' + fileExtension); // remove later
    return uid + '.' + fileExtension;
  }


  async getAvatarRef(uid: string): Promise<any> {
    await listAll(this.avatarsRef)
      .then((dir: any) => {
        dir.items.forEach((fileRef: any) => {
          console.log(fileRef);
          if (fileRef.name.includes(uid)) {
            console.log('previous avatar ref:', fileRef.name); // remove later 
            return fileRef;
          }
        });
        return undefined;
      })
      .catch((error: Error) => console.log(error));
  }
}