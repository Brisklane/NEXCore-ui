import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  /** Apply the saved theme at startup so EVERY page (incl. login/register, before the
   *  header loads) gets the correct theme class on <body>. */
  ngOnInit(): void {
    const saved = localStorage.getItem('ui_theme');
    document.body.classList.remove('theme-dark', 'theme-midnight');
    if (saved === 'Dark') document.body.classList.add('theme-dark');
    else if (saved === 'Midnight') document.body.classList.add('theme-midnight');
  }
}
