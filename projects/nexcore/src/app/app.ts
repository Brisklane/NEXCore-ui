import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@nexcore/core';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly themeService = inject(ThemeService);

  /** Apply the saved theme at startup so EVERY page (incl. login/register, before the
   *  header loads) gets the correct theme class on <body>. */
  ngOnInit(): void {
    this.themeService.init();
  }
}
