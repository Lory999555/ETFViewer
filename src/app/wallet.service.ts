import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { DateService } from './date.service';
import { Observable, of, forkJoin, BehaviorSubject, from } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export interface etf {
  symbol: string;
  name: string;
  open: number;
  close: number;
  percentageChange: string;
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private storageKey = 'userWallet'; // Local storage key
  private cacheLS: any[] = []; // Mirror of the local storage content for optimization
  private etfCache$ = new BehaviorSubject<any[]>([]);
  private etfDetail: etf | null;

  constructor(
    private dataService: DataService,
    private dateService: DateService
  ) {
    this.etfDetail = null;
    this.cacheLS = this.getWallet();
    this.loadSavedEtfsDetails().subscribe(); // Pre-load the ETF details
  }

  getETFTickerDetails(): Observable<any> {
    const fromDate = this.dateService.getYearAgo();
    const toDate = this.dateService.getYesterday();
    return this.dataService.getTickerDetails(
      this.etfDetail!.symbol,
      fromDate,
      toDate
    );
  }

  setEtfDetail(etf: etf): void {
    this.etfDetail = etf;
  }

  clearEtfDetail():void{
    this.etfDetail = null;
  }

  getEtfDetail(): etf | null{
    return this.etfDetail;
  }

  search(value: string): Observable<any[]> {
    if (value.trim().length > 0) {
      return this.dataService.getETFTickers(value);
    } else {
      return of([]);
    }
  }

  addEtfToWallet(name: string, symbol: string): Observable<any> {
    if (this.cacheLS.some((etf) => etf.symbol === symbol)) {
      console.log('ETF already in the wallet');
      return of(null);
    }

    const etf: any = { name, symbol };
    this.addToWallet(etf);

    return this.dataService
      .getOpenClose(symbol, this.dateService.getYesterday())
      .pipe(
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
              symbol: symbol,
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

  removeEtfFromWallet(symbol: string): Observable<void> {
    this.removeFromWallet(symbol);
    const updatedCache = this.etfCache$.value.filter(
      (etf) => etf.symbol !== symbol
    );
    this.etfCache$.next(updatedCache); // Update the cache after removal
    return of();
  }

  private loadSavedEtfsDetails(): Observable<any[]> {
    const yesterday: string = this.dateService.getYesterday();
    const requests = this.cacheLS.map((etf) =>
      this.dataService
        .getOpenClose(etf.symbol, yesterday)
        .pipe(
          map((data) => ({
            ...data,
            name: etf.name,
          })),
          catchError((error) => {
            if (error.status === 404) {
              return of({
                symbol: etf.symbol,
                open: 'N/A',
                close: 'N/A',
                percentageChange: 'N/A',
                name: etf.name,
                from: yesterday
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
    const exists = this.cacheLS.some((item) => item.symbol === etf.symbol);
    if (!exists) {
      this.cacheLS.push(etf);
      localStorage.setItem(this.storageKey, JSON.stringify(this.cacheLS));
    }
  }

  private removeFromWallet(symbol: string): void {
    this.cacheLS = this.cacheLS.filter((item) => item.symbol !== symbol);
    localStorage.setItem(this.storageKey, JSON.stringify(this.cacheLS));
  }
}
