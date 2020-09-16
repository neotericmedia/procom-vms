import { Component, OnInit } from '@angular/core';
import { ApiService, CommonService } from '../common';
declare var $; // fix me
@Component({
  selector: 'app-view-email-in-browser',
  templateUrl: './view-email-in-browser.component.html',
  styleUrls: ['./view-email-in-browser.component.less']
})
export class ViewEmailInBrowserComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private commonService: CommonService) {
  }

  ngOnInit() {
    const code = this.commonService.getUrlParams('code');
    this.apiService.query<string>('viewemail/' + code, true, false, 'text/html').then(res => {
      $('html').html(res);
    });
  }
}
