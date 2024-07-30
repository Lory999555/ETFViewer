import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { DateService } from './date.service';
import { Observable, of, forkJoin, BehaviorSubject } from 'rxjs';
import { catchError, tap,map } from 'rxjs/operators';

export interface etf {
  name: string;
  ticker: string;
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private storageKey = 'userWallet'; // Local storage key
  private cacheLS: etf[] = []; // Mirror of the local storage content for optimization
  private etfCache$ = new BehaviorSubject<any[]>([]);
  private etfDetail: any;

  constructor(
    private dataService: DataService,
    private dateService: DateService
  ) {
    this.cacheLS = this.getWallet();
    this.loadSavedEtfsDetails().subscribe(); // Pre-load the ETF details
  }

  getETFTickerDetails(): Observable<any> {
    const fromDate = this.dateService.getYearAgo();
    const toDate = this.dateService.getYesterday();
    return this.dataService.getTickerDetails(this.etfDetail.symbol, fromDate, toDate);
  }

  setEtfDetail(etf: any) {
    this.etfDetail = etf;
  }

  getEtfDetail() {
    return this.etfDetail;
  }

  search(value: string): Observable<any[]> {
    if (value.trim().length > 0) {
      return this.dataService.getETFTickers(value);
    } else {
      return of([]);
    }
  }

  addEtfToWallet(name: string, ticker: string): Observable<any> {
    if (this.cacheLS.some((etf) => etf.ticker === ticker)) {
      console.log('ETF already in the wallet');
      return of(null);
    }

    const etf: etf = { name, ticker };
    this.addToWallet(etf);

    return this.dataService.getOpenClose(ticker, this.dateService.getYesterday()).pipe(
      map((data) => ({
        ...data,
        name,
      })),
      tap((data) => {
        const updatedCache = [...this.etfCache$.value, data];
        this.etfCache$.next(updatedCache); // Update the cache with the new ETF details
      }),
      catchError((error) => {
        if (error.status === 404) {
          const fallback = {
            symbol: ticker,
            open: 'N/A',
            close: 'N/A',
            percentageChange: 'N/A',
            name,
          };
          this.etfCache$.next([...this.etfCache$.value, fallback]);
          return of(fallback);
        } else {
          throw error;
        }
      })
    );
  }

  removeEtfFromWallet(ticker: string): Observable<void> {
    this.removeFromWallet(ticker);
    const updatedCache = this.etfCache$.value.filter(
      (etf) => etf.symbol !== ticker
    );
    this.etfCache$.next(updatedCache); // Update the cache after removal
    return of();
  }

  private loadSavedEtfsDetails(): Observable<any[]> {
    const requests = this.cacheLS.map((etf) =>
      this.dataService.getOpenClose(etf.ticker, this.dateService.getYesterday()).pipe(
        map((data) => ({
          ...data,
          name: etf.name,
        })),
        catchError((error) => {
          if (error.status === 404) {
            return of({
              symbol: etf.ticker,
              open: 'N/A',
              close: 'N/A',
              percentageChange: 'N/A',
              name: etf.name,
            });
          } else {
            throw error;
          }
        })
      )
    );

    return forkJoin(requests).pipe(
      tap((results) => {
        this.etfCache$.next(results); // Populate the cache with the initial ETF details
      })
    );
  }

  get etfCache(): Observable<any[]> {
    return this.etfCache$.asObservable();
  }

  private getWallet(): etf[] {
    const wallet = localStorage.getItem(this.storageKey);
    return wallet ? JSON.parse(wallet) : [];
  }

  private addToWallet(etf: etf): void {
    const exists = this.cacheLS.some((item) => item.ticker === etf.ticker);
    if (!exists) {
      this.cacheLS.push(etf);
      localStorage.setItem(this.storageKey, JSON.stringify(this.cacheLS));
    }
  }

  private removeFromWallet(ticker: string): void {
    this.cacheLS = this.cacheLS.filter((item) => item.ticker !== ticker);
    localStorage.setItem(this.storageKey, JSON.stringify(this.cacheLS));
  }

  private clearWallet(): void {
    this.cacheLS = [];
    localStorage.removeItem(this.storageKey);
  }
}
