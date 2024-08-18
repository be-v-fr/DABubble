import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener, inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Post } from '../../../models/post.class';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { StorageService } from '../../../services/storage.service';
import { StorageReference, deleteObject } from 'firebase/storage';
import { ReactionService } from '../../../services/content/reaction.service';

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
    attachmentRef: null as any,
    attachmentSrc: '',
    attachmentName: ''
  };
  @Input() replying: boolean = false;
  @Input() channel?: Channel;
  @Input() recipient?: string;
  @Input() inThread: boolean = false;
  @Output() sent = new EventEmitter<{}>();
  @ViewChild('messageBox') messageBoxInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  showingMembersList: boolean = false;
  public storageService = inject(StorageService);

  constructor(private reactionsService: ReactionService) { }

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
    if (form.submitted && form.valid && !this.isFormEmpty()) {
      if (this.channel || this.inThread) {
        this.loading = true;
        this.sent.emit({ message: this.data.message, attachmentSrc: this.data.attachmentSrc });
        form.reset();
        this.resetFile();
        this.loading = false;
      } else {
        console.error('No channel selected!'); // add user feedback (at least in new message component)
      }
    }
  }

  isFormEmpty(): boolean {
    return this.data.message.length == 0 && this.data.attachmentSrc.length == 0;
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

  onShowEmojiPicker() {
    this.reactionsService.toggleReactionsPicker();
  }

  async onFileSelection(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loading = true;
      const file: File = input.files[0];
      const ref = this.channel ? this.channel.channel_id : 'general';
      this.storageService.uploadAttachment(file, ref)
        .then(async (response) => {
          await this.onFileUpload(response, file.name);
          this.loading = false;
        })
        .catch((err: Error) => console.error(err));
    }
  }

  async onFileUpload(fileRef: StorageReference, fileName: string) {
    this.data.attachmentRef = fileRef;
    this.data.attachmentName = fileName;
    this.data.attachmentSrc = await this.storageService.getUrl(fileRef);
  }

  resetFile(): void {
    this.data.attachmentRef = null;
    this.data.attachmentSrc = '';
    this.data.attachmentName = '';
  }

  deleteFile(): void {
    deleteObject(this.data.attachmentRef);
    this.resetFile();
  }
}