import { Component, OnInit, Inject, Input, SimpleChanges, OnChanges } from '@angular/core';


@Component({
  selector: 'app-commission-rate-workorders',
  templateUrl: './commission-rate-workorders.component.html',
  styleUrls: ['./commission-rate-workorders.component.less']
})
export class CommissionRateWorkordersComponent implements OnInit, OnChanges {
  dataSourceUrl: string;
  dataGridComponentName: string = 'commission-rate-workorders';
  @Input() commissionRateHeaderId: number;
  constructor(
  ) { }

  ngOnInit() {
    // fix me
    // const commissionRateHeaderId: number = +this.$state.params.commissionRateHeaderId;
    // const commissionRateVersionId: number = +this.$state.params.commissionRateVersionId;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.commissionRateHeaderId && changes.commissionRateHeaderId.currentValue) {
      this.commissionRateHeaderId = changes.commissionRateHeaderId.currentValue;
      this.dataSourceUrl = `assignment/searchByCommissionRateHeaderId/${this.commissionRateHeaderId}`;
    }
  }
}
