import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  private emojis: { unified: string, native: string, count: number }[] = [];

  getEmojis() {
    return this.emojis;
  }

  addEmoji(emoji: { unified: string, native: string }) {
    let isExist = this.emojis.find(e => e.unified === emoji.unified);

    if (isExist) {
      isExist.count++;
    } else {
      this.emojis.push({
        unified: emoji.unified,
        native: emoji.native,
        count: 1
      });
    }
  }
}

