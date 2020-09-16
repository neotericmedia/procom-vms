import { Component, OnInit, OnDestroy, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { LoadingSpinnerService } from '../../..';

@Component({
  selector: 'app-loading-spinner-overlay',
  templateUrl: './loading-spinner-overlay.component.html',
  styleUrls: ['./loading-spinner-overlay.component.less']
})
export class LoadingSpinnerOverlayComponent implements OnDestroy, OnChanges, OnInit {
  /**
   * Text to display, or Translation Code for display text.
   * If translate is false, value will be displayed as-is.
   * If translate is true, value will be fed through translation service to find matching translation.
   */
  @Input() text: string;
  @Input() translate: boolean = true;
  progressText: string;

  loadingStatusSubscription: any;
  progressTextSubscription: any;
  isVisible = false;
  constructor(private loadingSpinnerService: LoadingSpinnerService, private cdr: ChangeDetectorRef) {
  }
  ngOnInit() {
    this.loadingStatusSubscription = this.loadingSpinnerService.loadingChanged.subscribe((value) => {
      this.isVisible = value;
      this.cdr.detectChanges();
    });
    this.progressTextSubscription = this.loadingSpinnerService.progressTextChanged.subscribe((value) => {
      this.progressText = value;
      this.cdr.detectChanges();
    });

  }

  ngOnDestroy() {
    if (this.loadingStatusSubscription) {
      this.loadingStatusSubscription.unsubscribe();
    }
  }

  ngOnChanges() {

  }
}
