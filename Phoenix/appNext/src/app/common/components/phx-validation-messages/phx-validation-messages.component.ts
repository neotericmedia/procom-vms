import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from '../../index';
import * as _ from 'lodash';

@Component({
  selector: 'app-phx-validation-messages',
  templateUrl: './phx-validation-messages.component.html',
  styleUrls: ['./phx-validation-messages.component.css']
})
export class PhxValidationMessagesComponent implements OnInit {

  private _messages: any;
  public validationMessageBox: any;

  constructor(private commonService: CommonService) {
    this.validationMessageBox = { items: [], visible: false };
  }
  ngOnInit() {

  }

  @Input()
  set messages(error: any) {
    this._messages = ( error ) ? this.parseMessages( error || {}) : {};
    this.assignItems(this._messages);
  }
  get messages(): any {
    return this._messages;
  }

  private assignItems(msgs: any) {
    const boxItems = [];
    let boxIsVisible = false;
    Object.keys(msgs).map(function(key) {
      const o = msgs[key];
      key = key || '';
      key = key.replace('Hide Property Name', '');
      const tempArr = key.split('.');
      const k = tempArr[tempArr.length - 1];
      boxItems.push({ propertyName: k , messages: o });
      boxIsVisible = true;
    });
    this.validationMessageBox.items = boxItems;
    this.validationMessageBox.visible = boxIsVisible;
  }

  parseMessages(err: any) {

    const msg = this.commonService.parseResponseError(err);
      const grouped: any = _.groupBy(msg, 'PropertyName');
      Object.keys(grouped).forEach((key: string) => {
        grouped[key] = grouped[key].map(value => value.Message);
      });
      return grouped || [];
  }

}
