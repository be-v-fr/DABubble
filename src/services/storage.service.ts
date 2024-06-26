import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  storage = inject(Storage);
  storageRef = ref(this.storage);
  avatarsRef = ref(this.storage, 'avatars');

  constructor() { }

  upload(file: File, relDestinationFolder: any) {
    uploadBytesResumable(relDestinationFolder, file);
  }
}
