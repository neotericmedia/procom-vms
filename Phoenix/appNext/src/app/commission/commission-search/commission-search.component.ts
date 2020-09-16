import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { NavigationService } from '../../common/services/navigation.service';
import { WindowRefService } from '../../common/index';
declare var oreq: any;
@Component({
  selector: 'app-commission-search',
  templateUrl: './commission-search.component.html',
  styleUrls: ['./commission-search.component.less']
})
export class CommissionSearchComponent implements OnInit {
  oDataParams: any;
  commissions: any;

  public summary = null; // fix me

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'CommissionUserProfileId',
      caption: 'ID',
      dataType: 'number',
      width: '100px'
    }),
    new PhxDataTableColumn({
      dataField: 'CommissionUserProfileFirstName',
      caption: 'First Name',
    }),
    new PhxDataTableColumn({
      dataField: 'CommissionUserProfileLastName',
      caption: 'Last Name',
    }),
    new PhxDataTableColumn({
      dataField: 'CommissionRateHeadersCountOfActive',
      caption: 'Number of Active Commissions',
      dataType: 'number',
      alignment: 'right'
    })
  ];

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private navigationService: NavigationService,
      private winRef: WindowRefService,
  ) { }

  public onRowClick(event: any) {
    if (event && event.data) {
      this.viewCommissionDetail(event.data);
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }
  viewCommissionDetail(rowdata) {
    this.router.navigate(['rates-search', rowdata.CommissionUserProfileId], { relativeTo: this.route.parent });
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/next/commission/rates-search/${item.CommissionUserProfileId}`, '_blank');
  }

  createComm() {
    this.router.navigate(['next/commission/ratesetup/0']);
  }

  ngOnInit() {
      this.navigationService.setTitle('commission-manage');
    this.oDataParams = oreq.request().withSelect([
      'CommissionUserProfileId',
      'CommissionUserProfileFirstName',
      'CommissionUserProfileLastName',
      'CommissionRateHeadersCountOfActive'
    ]).url();

  }
}
