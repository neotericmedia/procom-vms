import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.less']
})
export class LoadingSpinnerComponent implements OnInit {
  @Input() color: string = '#FFFFFF';
  /**
   * Text to display, or Translation Code for display text.
   * If translate is false, value will be displayed as-is.
   * If translate is true, value will be fed through translation service to find matching translation.
   */
  @Input() text: string = 'common.generic.loadingText';
  @Input() translate: boolean = true;
  @Input() progressText: string;

  constructor() {}

  ngOnInit() {}
}
