import { SelectedRestrictionType } from './../share/restriction';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-restriction-summary',
  templateUrl: './restriction-summary.component.html',
  styleUrls: ['./restriction-summary.component.less']
})
export class RestrictionSummaryComponent implements OnInit {

  @Input() selectedRestrictionList: SelectedRestrictionType[] = [];
  @Input() showLabelAsHyperlink = false;

  @Output() restrictionTypeClick = new EventEmitter<{ id: number, code: string }>();

  cssGridClassValue = 'col-xs-8 col-lg-6';
  cssGridClassLabel = 'col-xs-4 col-lg-6';

  constructor() { }

  ngOnInit() {
  }

  clickRestrictionType(item: SelectedRestrictionType) {
    this.restrictionTypeClick.emit({ id: item.RestrictionTypeId, code: item.RestrictionTypeCode });
  }

}

