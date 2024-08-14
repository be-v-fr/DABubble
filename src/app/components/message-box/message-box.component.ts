import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener, inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Post } from '../../../models/post.class';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { StorageService } from '../../../services/storage.service';
import { StorageReference } from 'firebase/storage';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent implements AfterViewInit {
  loading: boolean = false;
  data = {
    message: '',
    attachmentTempRef: null as any,
    attachmentTempSrc: '',
    attachmentTempName: '',
    attachmentRef: null as any
  };
  @Input() replying: boolean = false;
  @Input() channel?: Channel;
  @Input() recipient?: string;
  @Output() sent = new EventEmitter<{}>();
  @ViewChild('messageBox') messageBoxInput!: ElementRef<HTMLInputElement>;
  showingMembersList: boolean = false;
  public storageService = inject(StorageService);

  ngAfterViewInit(): void {
    this.autofocus();
  }

  autofocus() {
    setTimeout(() => this.messageBoxInput.nativeElement.focus(), 200);
  }

  getPlaceholder() {
    if (this.replying) {
      return 'Antworten...';
    } else if (this.channel && this.channel.name) {
      return `Nachricht an # ${this.channel.name}`;
    } else if (this.recipient) {
      return `Nachricht an @${this.recipient}`;
    } else {
      return 'Neue Nachricht';
    }
  }

  onContainerClick() {
    this.messageBoxInput.nativeElement.focus();
  }

  /**
   * This function is triggered by the login form submission.
   * @param form - login form
   */
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {
      // if attachment, upload attachment; set attachmentRef property 
      this.sent.emit({ message: this.data.message, attachmentRef: this.data.attachmentRef });
      form.reset();
    }
  }

  toggleMembersList(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.showingMembersList = !this.showingMembersList;
    this.messageBoxInput.nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  hideMembersList(): void {
    this.showingMembersList = false;
  }

  addToMessage(string: string) {
    this.data.message += string;
    this.messageBoxInput.nativeElement.focus();
  }

  async onFileSelection(e: Event) {
    this.loading = true;
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const file: File = input.files[0];
      this.storageService.uploadTempAttachment(file)
        .then(async (response) => await this.onTempFileUpload(response, file.name))
        .catch((err: Error) => console.error(err));
    }
  }

  async onTempFileUpload(fileRef: StorageReference, fileName: string) {
    this.data.attachmentTempRef = fileRef;
    this.data.attachmentTempSrc = await this.storageService.getUrl(fileRef);
    this.data.attachmentTempName = fileName;
  }

  deleteTempFile() {
    this.data.attachmentTempRef = null;
    this.data.attachmentTempSrc = '';
    this.data.attachmentTempName = '';    
  }

  //   onFileUpload(response: any) {
  //     if (response.includes(this.userData.uid)) {
  //       add src to post
  //     }
  //   }
}
