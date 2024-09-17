import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../services/storage.service';
import { StorageReference, deleteObject } from 'firebase/storage';
import { ReactionService } from '../../../services/content/reaction.service';
import { ClickStopPropagationDirective } from '../../shared/click-stop-propagation.directive';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user.class';

/**
 * Component for sending messages, including text, reactions, and file attachments.
 */
@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickStopPropagationDirective, PickerComponent],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent implements OnInit, AfterViewInit, OnDestroy {
  private reactionSub = new Subscription();

  /** Indicates if a message is being sent or if it's loading */
  loading: boolean = false;

  /** Indicates if the members list is currently being shown */
  showingMembersList: boolean = false;

  /** Error message to be displayed to the user */
  errorMsg: string | null = null;

  /** Indicates if the emoji picker is visible */
  public reactionsPickerVisible = false;

  /** Data for the message box, including message content and file attachment details */
  data = {
    message: '',
    messageInThread: '',
    attachmentRef: null as any,
    attachmentSrc: '',
    attachmentName: ''
  };

  /** List of channels available to the user */
  @Input() channelList!: Channel[];

  /** List of users available to the user */
  @Input() userList!: User[];

  /** Indicates if the message is a reply */
  @Input() replying: boolean = false;

  /** The current channel */
  @Input() channel?: Channel;

  /** The recipient of the message */
  @Input() recipient?: string;

  /** Indicates if the message is part of a thread */
  @Input({ required: true }) inThread?: boolean | undefined;

  /** Event emitted when a message is sent */
  @Output() sent = new EventEmitter<{}>();

  /** Reference to the message input element */
  @ViewChild('messageBox') messageBoxInput!: ElementRef<HTMLInputElement>;

  /** Reference to the file input element */
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** Injected service for handling file storage */
  public storageService = inject(StorageService);

  constructor(public reactionsService: ReactionService) { }

  /**
   * Initializes the component and subscribes to reaction service updates.
   */
  ngOnInit(): void {
    this.reactionsService.reactionsPicker$.subscribe((rp) => {
      this.reactionsPickerVisible = rp;
    });
    this.reactionSub = this.subReaction();
  }

  /**
   * Focuses the message input field after the view is initialized.
   */
  ngAfterViewInit(): void {
    this.autofocus();
  }

  /**
   * Unsubscribes from all subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.reactionSub.unsubscribe();
  }

  /**
   * Gets or sets the current message based on whether it is in a thread or not.
   */
  get message(): string {
    return this.inThread ? this.data.messageInThread : this.data.message;
  }

  set message(value: string) {
    if (this.reactionsService.addReactionInThread === true) {
      this.data.messageInThread = value;
    } else if (this.reactionsService.addReactionInThread === false) {
      this.data.message = value;
    }
  }

  /**
   * Focuses the message input field with a slight delay.
   */
  autofocus() {
    setTimeout(() => this.messageBoxInput.nativeElement.focus(), 200);
  }

  /**
   * Returns a placeholder text for the message input field based on the current context.
   * @returns The placeholder text.
   */
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

  /**
   * Handles a click event on the message box container, adjusting the reaction context.
   */
  onContainerClick() {
    if (this.inThread === true) {
      this.reactionsService.addReactionInThread = true;
    } else if (this.inThread === false) {
      this.reactionsService.addReactionInThread = false;
    }
    // this.messageBoxInput.nativeElement.focus();
  }

  /**
   * Handles form submission, validating and processing the message.
   * @param form - The form to be processed.
   */
  onSubmit(form: NgForm) {
    const empty = this.isFormEmpty();
    if (form.submitted && form.valid && !empty) {
      this.resetError();
      (this.channel || this.inThread || this.channelList!.length > 0 || this.userList!.length > 0) ? this.completeForm(form) : this.showError('Die Nachricht ist an niemanden adressiert.');
    } else if (empty) {
      this.showError('Schreibe eine Nachricht oder wähle eine Datei.');
    }
  }

  /**
   * Emits the message data and resets the form.
   * @param form - The form to be reset.
   */
  completeForm(form: NgForm) {
    if (this.inThread) {
      this.sent.emit({ message: this.data.messageInThread, attachmentSrc: this.data.attachmentSrc });
    } else {
      this.sent.emit({ message: this.data.message, attachmentSrc: this.data.attachmentSrc });
    }
    this.resetAll(form);
  }

  /**
   * Resets the form and message data.
   * @param form - The form to be reset.
   */
  resetAll(form: NgForm) {
    form.reset();
    this.data.message = '';
    this.resetFile();
  }

  /**
   * Checks if the form is empty based on the current message and attachment data.
   * @returns True if the form is empty, otherwise false.
   */
  isFormEmpty(): boolean {
    console.log('message:', this.data.message);
    console.log('attachment:', this.data.attachmentSrc);
    if (this.inThread) {
      return (this.data.messageInThread.length == 0 && this.data.attachmentSrc.length == 0);
    } else {
      return (this.data.message.length == 0 && this.data.attachmentSrc.length == 0);
    }
  }

  /**
   * Toggles the visibility of the members list and focuses the message input field.
   * @param e - The click event.
   */
  toggleMembersList(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.showingMembersList = !this.showingMembersList;
    this.messageBoxInput.nativeElement.focus();
  }

  /**
   * Hides the members list when a click is detected outside of the component.
   * @param event - The click event.
   */
  @HostListener('document:click', ['$event'])
  hideMembersList(): void {
    this.showingMembersList = false;
  }

  /**
   * Adds a string to the current message and focuses the message input field.
   * @param string - The string to be added.
   */
  addToMessage(string: string) {
    this.message += string;
    this.messageBoxInput.nativeElement.focus();
  }

  /**
   * Shows the emoji picker and sets the reaction context to the message.
   */
  onShowEmojiPicker() {
    this.reactionsService.reactionToMessage = true;
    this.reactionsService.toggleReactionsPicker();
  }

  /**
   * Subscribes to reactions service updates and adds reactions to the message.
   * @returns The subscription to the reactions service.
   */
  subReaction(): Subscription {
    return this.reactionsService.reactionToAdded$.subscribe((reaction) => {
      if (reaction && this.reactionsService.reactionToMessage) {
        this.addToMessage(reaction);
        this.reactionsService.setReaction('');
      }
    });
  };

  /**
   * Handles file selection and uploads the file if valid.
   * @param e - The file selection event.
   */
  async onFileSelection(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];
      if (this.isValidFile(file)) { await this.uploadFile(file) }
      input.value = '';
    }
  }

  /**
   * Checks if the selected file is valid based on type and size.
   * @param file - The file to be checked.
   * @returns True if the file is valid, otherwise false.
   */
  isValidFile(file: File): boolean {
    if (!this.isImgOrPdf(file)) {
      this.showError('Bitte wähle ein Bild oder eine PDF-Datei.');
      return false;
    } else if (!this.hasValidSize(file)) {
      this.showError('Die Datei darf nicht größer als 500kB sein.');
      return false;
    } else {
      return true;
    }
  }

  /**
   * Checks if the file is an image or PDF.
   * @param file - The file to be checked.
   * @returns True if the file is an image or PDF, otherwise false.
   */
  isImgOrPdf(file: File): boolean {
    return this.storageService.isImage(file) || this.storageService.isPdf(file);
  }

  /**
   * Checks if the file size is valid.
   * @param file - The file to be checked.
   * @returns True if the file size is valid, otherwise false.
   */
  hasValidSize(file: File): boolean {
    return file.size <= 500 * 1024;
  }

  /**
   * Uploads the selected file to storage and updates the message data.
   * @param file - The file to be uploaded.
   */
  async uploadFile(file: File) {
    this.resetError();
    this.loading = true;
    const ref = this.channel ? this.channel.channel_id : 'general';
    this.storageService.uploadAttachment(file, ref)
      .then(async (response) => {
        await this.onFileUpload(response, file.name);
        this.loading = false;
      })
      .catch((err: Error) => console.error(err));
  }

  /**
   * Displays an error message to the user.
   * @param msg - The error message to be displayed.
   */
  showError(msg: string): void {
    this.errorMsg = msg;
  }

  /**
   * Resets the error message.
   */
  resetError(): void {
    this.errorMsg = null;
  }

  /**
   * Updates the message data with the uploaded file's reference and URL.
   * @param fileRef - The file reference.
   * @param fileName - The file name.
   */
  async onFileUpload(fileRef: StorageReference, fileName: string) {
    this.data.attachmentRef = fileRef;
    this.data.attachmentName = fileName;
    this.data.attachmentSrc = await this.storageService.getUrl(fileRef);
  }

  /**
   * Resets the file-related data.
   */
  resetFile(): void {
    this.data.attachmentRef = null;
    this.data.attachmentSrc = '';
    this.data.attachmentName = '';
  }

  /**
   * Deletes the uploaded file from storage and resets file-related data.
   */
  deleteFile(): void {
    deleteObject(this.data.attachmentRef);
    this.resetFile();
  }
}
