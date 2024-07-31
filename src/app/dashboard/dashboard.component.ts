import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, AsyncPipe, NgClass } from '@angular/common';
import { WalletService } from '../wallet.service';
import { Observable, of } from 'rxjs';
import { RouterLink } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { CursorService } from '../cursor.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    AsyncPipe,
    RouterLink,
    NgClass,
    DetailComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent{
  public searchTerm: string = '';
  public resultSearch$: Observable<any>;
  public etfsInfoWallet$: Observable<any>;
  public test: boolean = false;

  constructor(public walletService: WalletService, private cursorService: CursorService) {
    this.resultSearch$ = of([]);
    this.etfsInfoWallet$ = this.walletService.etfCache;
  }

  trend(etf: any) {
    this.walletService.setEtfDetail(etf);
  }

  search() {
    this.resultSearch$ = this.walletService.search(this.searchTerm);
  }

  onInputChange() {
    if (!this.searchTerm) {
      this.resultSearch$ = of([]);
    }
  }

  addEtfToWallet(name: string, symbol: string) {
    this.resultSearch$ = of([]);
    this.searchTerm = '';
    this.walletService.addEtfToWallet(name, symbol).subscribe(() => {
      this.etfsInfoWallet$ = this.walletService.etfCache;
    });
  }

  removeEtfFromWallet(symbol: string) {
    this.walletService.removeEtfFromWallet(symbol).subscribe(() => {
      this.etfsInfoWallet$ = this.walletService.etfCache;
    });
  }

}
