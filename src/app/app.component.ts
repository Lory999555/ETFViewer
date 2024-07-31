import { AfterViewInit, Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import gsap from 'gsap-trial';
import { CursorService } from './cursor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  constructor(private cursorService: CursorService) {}

  ngAfterViewInit(): void {
    gsap.fromTo(
      '#overlay',
      { autoAlpha: 1 }, // Inizia con l'overlay visibile
      {
        autoAlpha: 0, // Finisce con l'overlay nascosto
        duration: 2, // Durata dell'animazione in secondi
        ease: 'power3.in',
        onComplete: this.displayNone,
        // Rimuove l'overlay dal DOM
      }
    );
  }

  private displayNone() {
    document.getElementById('overlay')!.style.display = 'none';
  }
}
