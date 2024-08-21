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

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickStopPropagationDirective, PickerComponent],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent implements OnInit, AfterViewInit, OnDestroy {
  private reactionSub = new Subscription();
  loading: boolean = false;
  public reactionsPickerVisible = false;

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
  errorMsg: string | null = null;

  constructor(public reactionsService: ReactionService) {}

  ngOnInit(): void {
    this.reactionsService.reactionsPicker$.subscribe((rp) => {
      this.reactionsPickerVisible = rp;
    });
    this.reactionSub = this.subReaction();
  }

  ngAfterViewInit(): void {
    this.autofocus();
  }

  ngOnDestroy(): void {
    this.reactionSub.unsubscribe();
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
    const empty = this.isFormEmpty();
    if (form.submitted && form.valid && !empty) {
      this.resetError();
      (this.channel || this.inThread) ? this.completeForm(form) : this.showError('Die Nachricht ist an niemanden adressiert.');
    } else if(empty) {
      this.showError('Schreibe eine Nachricht oder wähle eine Datei.');
    }
  }

  completeForm(form: NgForm) {
    this.sent.emit({ message: this.data.message, attachmentSrc: this.data.attachmentSrc });
    this.resetAll(form);    
  }

  resetAll(form: NgForm) {
    form.reset();
    this.data.message = '';
    this.resetFile();
  }

  isFormEmpty(): boolean {
    console.log('message:', this.data.message);
    console.log('attachment:', this.data.attachmentSrc);
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
    this.reactionsService.reactionToMessage = true;
    this.reactionsService.toggleReactionsPicker();
  }


  subReaction(): Subscription {
    return this.reactionsService.reactionToAdded$.subscribe((reaction) => {
      if (reaction && this.reactionsService.reactionToMessage) {
        this.addToMessage(reaction);
        this.reactionsService.setReaction('');
      }
    });
  };

  async onFileSelection(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];
      if(this.isValidFile(file)) {await this.uploadFile(file)}
      input.value = '';
    }
  }

  isValidFile(file: File): boolean {
    if(!this.isImgOrPdf(file)) {
      this.showError('Bitte wähle ein Bild oder eine PDF-Datei.');
      return false;
    } else if(!this.hasValidSize(file)) {
      this.showError('Die Datei darf nicht größer als 500kB sein.');
      return false;
    } else {
      return true;
    }
  }

  isImgOrPdf(file: File): boolean {
    return this.storageService.isImage(file) || this.storageService.isPdf(file);
  }

  hasValidSize(file: File): boolean {
    return file.size <= 500 * 1024;
  }

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

  showError(msg: string): void {
    this.errorMsg = msg;
  }

  resetError(): void {
    this.errorMsg = null;
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