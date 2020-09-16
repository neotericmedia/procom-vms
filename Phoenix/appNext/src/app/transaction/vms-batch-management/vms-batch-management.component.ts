import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../transaction.service';
import { UserInfo } from '../../common/model/user';
import { AuthService } from '../../common/services/auth.service';
import { ActivatedRoute, Router} from '@angular/router';
import { NavigationService } from '../../common';

@Component({
  selector: 'app-vms-batch-management',
  templateUrl: './vms-batch-management.component.html',
  styleUrls: ['./vms-batch-management.component.less']
})
export class VmsBatchManagementComponent implements OnInit {

  batchList: Array<any>;
  DataParams: string = '';
  batchLength: number = -1;
  UserDetails: UserInfo;

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router,
    private navigationService: NavigationService,
    private activatedRoute: ActivatedRoute,
  ) {
     this.getUserDetails();
     this.getBatchItems();
    }

  ngOnInit() {
    this.navigationService.setTitle('thirdpartybatch-manage');
  }

  getUserDetails() {
    this.authService.getCurrentUser().subscribe((user: UserInfo) => {
    this.UserDetails = user;
    });
  }

  getBatchItems() {
  this.transactionService.getVmsBatchSummary(this.DataParams).subscribe((result: any) => {
    this.batchList = result.Items;
    this.batchLength = this.batchList.length;
    this.batchList.forEach (eachItem => {
      if (eachItem.OrganizationIdInternal === this.UserDetails.Profiles[0].OrganizationId) {
        eachItem.isOpen = true;
      }
    });

    this.batchList = this.batchList.sort((a, b) => {
    if (a.OrganizationIdInternal === this.UserDetails.Profiles[0].OrganizationId && b.OrganizationIdInternal !== this.UserDetails.Profiles[0].OrganizationId) {
      return -1;
    } else if (a.OrganizationIdInternal !== this.UserDetails.Profiles[0].OrganizationId && b.OrganizationIdInternal === this.UserDetails.Profiles[0].OrganizationId) {
      return 1;
    } else {
      return a.InternalOrgDisplayName < b.InternalOrgDisplayName ? -1 : b.InternalOrgDisplayName < a.InternalOrgDisplayName ? 1 : 0;
    }
    });

  });
}

showRecords(org) {
  const isOpen = org.isOpen;
  this.batchList.forEach(eachOrg => {
    eachOrg.isOpen = false;
  });
  org.isOpen = !isOpen;
}


gotoProfile(id, type) {
  let navigatePath = '';
  if (type === 'Timesheet') {
     navigatePath = `/next/transaction/vms-timesheet/org/${id}`;
  } else if (type === 'Discount') {
     navigatePath = `/next/transaction/vms-discount/org/${id}`;
  } else if (type === 'SourceDeduction') {
     navigatePath = `/next/transaction/vms-ussourcededuction/org/${id}`;
  } else if (type === 'Expense') {
     navigatePath = `/next/transaction/vms-expense/org/${id}`;
  } else if (type === 'Commission') {
     navigatePath = `/next/transaction/vms-commission/org/${id}`;
  } else {
     navigatePath = `/next/transaction/vms-fixedprice/org/${id}`;
  }
  this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
    console.error(`error in navigation`, err);
  });
}
}
