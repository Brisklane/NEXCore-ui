import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-panel.html',
  styleUrl: './ai-panel.css',
})
export class AiPanel {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  /** Quick-suggestion chips shown in the teaser. */
  readonly suggestions = ['Sales summary', 'Top customers', 'Low stock', 'Draft an email'];

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open) this.onClose();
  }
}
