import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener, inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Post } from '../../../models/post.class';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { StorageService } from '../../../services/storage.service';
import { StorageReference, deleteObject } from 'firebase/storage';

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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
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
  async onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {
      if (this.channel) {
        this.loading = true;
        await this.handleAttachmentSubmission();
        this.sent.emit({ message: this.data.message, attachmentRef: this.data.attachmentRef });
        form.reset();
        this.loading = false;
      } else {
        console.error('No channel selected!'); // add user feedback (at least in new message component)
      }
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
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loading = true;
      const file: File = input.files[0];
      this.storageService.uploadTempAttachment(file)
        .then(async (response) => {
          await this.onTempFileUpload(response, file.name);
          this.loading = false;
        })
        .catch((err: Error) => console.error(err));
    }
  }

  async onTempFileUpload(fileRef: StorageReference, fileName: string) {
    this.data.attachmentTempRef = fileRef;
    this.data.attachmentTempName = fileName;
    this.data.attachmentTempSrc = await this.storageService.getUrl(fileRef);
  }

  deleteTempFile(): void {
    deleteObject(this.data.attachmentTempRef);
    this.data.attachmentTempRef = null;
    this.data.attachmentTempSrc = '';
    this.data.attachmentTempName = '';
  }

  async handleAttachmentSubmission(): Promise<void> {
    if (this.channel && this.data.attachmentTempRef && this.fileInput.nativeElement.files) {
      const file = this.fileInput.nativeElement.files[0];
      await this.storageService.uploadAttachment(file, this.channel.channel_id)
        .then(async (response) => this.onFileUpload(response))
        .catch((err: Error) => console.error(err));
    }
  }

  onFileUpload(fileRef: StorageReference) {
    this.data.attachmentRef = fileRef;
    this.deleteTempFile();
    console.log('attachment uploaded:', fileRef);
  }
}