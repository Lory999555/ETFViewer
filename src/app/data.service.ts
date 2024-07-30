import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DateService } from './date.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = '/api';

  constructor(private http: HttpClient, private dateService: DateService) {}

  getETFTickers(search: string): Observable<any> {
    const url = `${this.baseUrl}/v3/reference/tickers`;
    const params = {
      type: 'ETF',
      search,
      active: 'true',
      limit: '10',
    };
    return this.http.get(url, { params }).pipe(
      map((response: any) => response.results),
      shareReplay(1) // Cache the response
    );
  }

  getTickerDetails(ticker: string, fromDate: string, toDate: string): Observable<any> {
    const url = `${this.baseUrl}/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}`;
    const params = {
      adjusted: 'true',
      sort: 'asc',
    };
    return this.http.get(url, { params }).pipe(
      map((response: any) => 
        response.results.map((element: any) => ({
          value: element.c,
          date: this.dateService.convertTimestampToDate(element.t),
        }))
      ),
      shareReplay(1) // Cache the response
    );
  }

  getOpenClose(ticker: string, date: string): Observable<any> {
    const url = `${this.baseUrl}/v1/open-close/${ticker}/${date}`;
    const params = {
      adjusted: 'true',
    };
    return this.http.get(url, { params }).pipe(
      map((response: any) => {
        const percentageChange = ((response.close - response.open) / response.open) * 100;
        return {
          ...response,
          percentageChange: (percentageChange > 0)?'+' + percentageChange.toFixed(3): percentageChange.toFixed(3),
        };
      }),
      shareReplay(1) // Cache the response
    );
  }
}
