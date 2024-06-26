import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, listAll, deleteObject } from '@angular/fire/storage';

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

  async uploadImage(img: File, ref: any): Promise<string | null> {
    if (this.isImage(img)) {
      await this.upload(img, ref);
      return null;
    } else {
      return 'err/not-an-image'; // use "catch" or "throw" instead ??
    }
  }

  isImage(img: File): boolean {
    return img.type.includes('image'); // check if all image file extensions are actually noted as "image/[extension]"
  }

  async uploadAvatar(img: File, uid: string) {
    if (this.isImage(img)) {
      const relFolderPath = uid + '/avatar';
      const folderRef: any = ref(this.storage, relFolderPath);
      const relFilePath = relFolderPath + '/' + img.name;
      const fileRef: any = ref(this.storage, relFilePath);
      await this.deleteFolder(folderRef);
      await this.uploadImage(img, fileRef);
    } else {
      console.error('not an image');
    }
  }

  async deleteFolder(ref: any) {
    await listAll(ref)
      .then((dir: any) => {
        dir.items.forEach((fileRef: any) => deleteObject(fileRef));
        dir.prefixes.forEach((folderRef: any) => this.deleteFolder(folderRef.fullPath))
      })
      .catch((error: Error) => console.log(error));
  }
}
