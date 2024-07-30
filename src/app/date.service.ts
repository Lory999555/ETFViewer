import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private datePipe = new DatePipe('en-US');

  constructor() {}

  convertTimestampToDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getDateWithOffset(daysOffset: number = 0): string {
    if (daysOffset < 0) throw Error('offset not allowed');
    const date = new Date();
    date.setDate(date.getDate() - daysOffset);
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  getYesterday(): string {
    return this.getDateWithOffset(1);
  }

  getWeekAgo(): string {
    return this.getDateWithOffset(7);
  }

  getMonthAgo(): string {
    return this.getDateWithOffset(31);
  }

  getTwoMonthAgo(): string {
    return this.getDateWithOffset(62);
  }

  getYearAgo():string {
    return this.getDateWithOffset(365);
  }
}
