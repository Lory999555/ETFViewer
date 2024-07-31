import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { etf, WalletService } from '../../wallet.service';
import { Observable } from 'rxjs';
import {
  Chart,
  Colors,
  LinearScale,
  Legend,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { AsyncPipe } from '@angular/common';

Chart.register(
  Colors,
  LineController,
  LineElement,
  LinearScale,
  Legend,
  PointElement,
  TimeScale,
  Tooltip
);

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private etfValues$: Observable<any> | undefined;
  public etfDetail: etf | null;
  private data: { x: number; y: number }[] = [];
  private chart: Chart | undefined;

  constructor(public walletService: WalletService) {
    this.etfDetail = null;
    console.log('construct');
  }

  ngOnInit(): void {
    console.log('init');
    this.etfDetail = this.walletService.getEtfDetail();
  }

  ngOnDestroy(): void {
    console.log('destroy');
  }

  ngAfterViewInit(): void {
    console.log('view');
    this.etfValues$ = this.walletService.getETFTickerDetails();
    this.etfValues$.subscribe((elements) => {
      elements.forEach((element: any) => {
        this.data.push({
          x: new Date(element.date).getTime(),
          y: element.value,
        });
      });
      this.initializeChart(this.data);
    });
  }

  private initializeChart(data: { x: number; y: number }[]) {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    const totalDuration = 2000;
    const delayBetweenPoints = totalDuration / this.data.length;
    const previousY = (ctx: any) =>
      ctx.index === 0
        ? ctx.chart.scales.y.getPixelForValue(100)
        : ctx.chart
            .getDatasetMeta(ctx.datasetIndex)
            .data[ctx.index - 1].getProps(['y'], true).y;
    const animation: any = {
      x: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay(ctx: any) {
          if (ctx.type !== 'data' || ctx.xStarted) {
            return 0;
          }
          ctx.xStarted = true;
          return ctx.index * delayBetweenPoints;
        },
      },
      y: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx: any) {
          if (ctx.type !== 'data' || ctx.yStarted) {
            return 0;
          }
          ctx.yStarted = true;
          return ctx.index * delayBetweenPoints;
        },
      },
    };

    const config: any = {
      type: 'line',
      data: {
        datasets: [
          {
            borderColor: '#03DAC6',
            borderWidth: 2,
            radius: 0,
            data: data,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation,
        interaction: {
          intersect: false,
        },
        plugins: {
          legend: false,
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(data: { x: number; y: number }[]) {
    this.chart!.data.datasets[0].data = data;
    this.chart?.update('none'); // Utilizza 'none' per evitare un'animazione ogni volta che si aggiorna
  }

  filterData(period: string) {
    const now = new Date();
    let filteredData: { x: number; y: number }[];

    switch (period) {
      case '6M':
        filteredData = this.data.filter((d) => d.x >= this.addMonths(now, -6));
        break;
      case '3M':
        filteredData = this.data.filter((d) => d.x >= this.addMonths(now, -3));
        break;
      case '1M':
        filteredData = this.data.filter((d) => d.x >= this.addMonths(now, -1));
        break;
      default:
        filteredData = this.data;
    }

    this.updateChart(filteredData);
  }

  addMonths(date: Date, months: number) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result.getTime();
  }
}
