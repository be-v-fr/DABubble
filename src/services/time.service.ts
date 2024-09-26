import { Injectable } from '@angular/core';


/**
 * The TimeService is a utility service that provides various methods for converting and formatting timestamps.
 * It includes functions to format timestamps into time strings (e.g., "14:30"), human-readable date strings 
 * (e.g., "Montag, 1 März"), and relative dates (e.g., "heute", "gestern", or "vor 4 Tagen").
 * 
 * This service is marked with the `@Injectable` decorator, making it available for dependency injection across
 * the entire Angular application. By setting `providedIn: 'root'`, Angular ensures that the service is a singleton,
 * meaning that one instance of this service will be created and shared across the app. 
 * This makes the TimeService efficient and reusable wherever date and time formatting is needed.
 * 
 * The service is stateless and focuses solely on timestamp manipulation, making it useful in a wide variety of 
 * contexts where time-related data needs to be presented in a user-friendly manner.
 */
@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor() { }


  /**
   * Converts a timestamp to a time string in the format "HH:mm".
   * @param timestamp The timestamp to convert.
   * @returns The formatted time as a string.
   */
  toClock(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return formattedHours + ':' + formattedMinutes;
  }


  /**
   * Converts a timestamp to a human-readable date string.
   * Example format: "Montag, 1 März".
   * @param timestamp The timestamp to convert.
   * @returns The formatted date as a string.
   */
  toDate(timestamp: number): string {
    const date = new Date(timestamp);
    const daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${dayOfWeek}, ${day} ${month}`;
  }


  /**
   * Converts a timestamp to a relative date string like "heute", "gestern", or "vor X Tagen".
   * @param timestamp The timestamp to convert.
   * @returns The relative date as a string.
   */
  toRelativeDate(timestamp: number): string {
    const diffInDays = this.getDifferenceInDays(timestamp);
    return this.getRelativeDay(diffInDays);
  }


  /**
   * Calculates the difference in days between the current date and a given timestamp.
   * @param timestamp The timestamp to compare.
   * @returns The number of days difference.
   */
  getDifferenceInDays(timestamp: number) {
    const now = new Date();
    const date = new Date(timestamp);
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msInDay = 86400000;
    const diffInMs = midnight.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / msInDay) + 1;
    return diffInDays;    
  }


  /**
   * Checks if two timestamps fall on the same calendar day.
   * @param timestamp_1 First timestamp.
   * @param timestamp_2 Second timestamp.
   * @returns True if both timestamps are on the same day, otherwise false.
   */
  isOnSameDay(timestamp_1: number, timestamp_2: number) {
    const date_1 = new Date(timestamp_1).toISOString().split('T')[0];
    const date_2 = new Date(timestamp_2).toISOString().split('T')[0];
    return date_1 === date_2;
  }


  /**
   * Converts the difference in days to a human-readable relative time string.
   * @param diffInDays The number of days difference.
   * @returns A string representing the relative day ("heute", "gestern", etc.).
   */
  getRelativeDay(diffInDays: number): string {
    switch(diffInDays) {
      case 0: return 'heute';
      case 1: return 'gestern';
      case 2: return 'vorgestern';
      default: return `vor ${diffInDays} Tagen`;
    }
  }


  /**
   * Combines relative date logic with the clock time to show either the time or a relative date.
   * If the timestamp is within today, it shows the time; otherwise, it shows the relative day.
   * @param timestamp The timestamp to convert.
   * @returns A string representing either the clock time or a relative day.
   */
  toRelativeDateWithClock(timestamp: number): string {
    const now = new Date();
    const date = new Date(timestamp);
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msInDay = 86400000;
    const diffInMs = midnight.getTime() - date.getTime();
    if (diffInMs < msInDay) {
      return this.toClock(timestamp);
    } else {
      const diffInDays = Math.floor(diffInMs / msInDay);
      return this.getRelativeDay(diffInDays);
    }
  }
}
