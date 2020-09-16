import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  DialogService,
  LoadingSpinnerService,
  CommonService,
  NavigationService
} from '../../common';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommissionService } from '../commission.service';
import { CommissionSalesPattern } from '../model';
import { CustomValidators } from '../../common/validators/CustomValidators';
import { clone, sortBy, chain } from 'lodash';

@Component({
  selector: 'app-commission-sales-pattern-details',
  templateUrl: './commission-sales-pattern-details.component.html',
  styleUrls: ['./commission-sales-pattern-details.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CommissionSalesPatternDetailsComponent implements OnInit {

  CodeValueGroups: any;
  ApplicationConstants: any;
  alljobOwners: any[] = [];
  jobOwners: any[] = [];
  commissionSupporters: any[] = [];
  salesPatternId: number;
  salesPattern: CommissionSalesPattern;
  isJobOwnersLoaded = false;
  form: FormGroup;
  isAlive = true;
  supporters: FormArray;
  previousHasSupportValue: boolean;

  constructor(protected commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private commissionService: CommissionService,
    protected fb: FormBuilder, protected dialog: DialogService, protected loaderService: LoadingSpinnerService) {
    this.CodeValueGroups = this.commonService.CodeValueGroups;
    this.ApplicationConstants = this.commonService.ApplicationConstants;
  }

  ngOnInit() {
    this.navigationService.setTitle('commission-patterns-viewedit');

    this.activatedRoute.params.subscribe(res => {
      this.salesPatternId = +res['salesPatternId'];

      this.salesPattern = {
        Id: 0,
        SalesPatternStatusId: this.ApplicationConstants.CommissionRateHeaderStatus.New,
        Description: '',
        CommissionSalesPatternSupporters: [{
          Id: 0,
          UserProfileId: null,
          CommissionRoleId: this.ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport
        }],
        LastModifiedDatetime: new Date((new Date()).toUTCString())
      };

      this.salesPattern['SalesPatternWithSupport'] = false;

      this.initForm(this.salesPattern, true);
      if (this.salesPatternId) {
        this.loadSalesPattern(this.salesPatternId);
      } else {
        this.loadCommissionRateHeaderUsers(false);
        this.initForm(this.salesPattern, false);
      }

    });
  }

  private loadCommissionRateHeaderUsers(hasSupport: boolean): Promise<any> {
    return new Promise((resolve) => {
      this.commissionService.getCommissionRateHeaderUsers().subscribe(x => {
        this.alljobOwners = x.Items.map(user => {
          const userx: any = clone(user);
          userx.Name = `${user.CommissionUserProfileFirstName} ${user.CommissionUserProfileLastName}`;
          return userx;
        });

        this.commissionSupporters.push([]);

        this.filterJobOwnersList(hasSupport);

        this.isJobOwnersLoaded = true;
        resolve(0);
      });
    });
  }

  private filterJobOwnersList(hasSupport: boolean) {
    this.jobOwners = chain(this.alljobOwners.filter(user => {
      if (hasSupport) {
        return user.CommissionRoleId === this.ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport;
      } else {
        return user.CommissionRoleId === this.ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport;
      }
    })).uniqBy('CommissionUserProfileId').value();
  }

  private filterCommissionOwnersList() {
    const usersToExclude: number[] = this.salesPattern.CommissionSalesPatternSupporters.map(s => s.UserProfileId);
    usersToExclude.splice(0, 1);
    this.commissionSupporters.push(chain(this.alljobOwners.filter(user => {
      return user.CommissionRoleId === this.ApplicationConstants.CommissionRole.SupportingJobOwner &&
        !(usersToExclude.includes(user.CommissionUserProfileId));
    })).uniqBy('CommissionUserProfileId').value());
  }

  private initForm(pattern: CommissionSalesPattern, isFirstime: boolean = false) {
    this.form = this.fb.group({
      LastModifiedDatetime: this.fb.control(null, []),
      Description: this.fb.control('', [CustomValidators.requiredCharLength(3), Validators.maxLength(65)]),
      SalesPatternStatusId: this.fb.control(this.ApplicationConstants.CommissionRateHeaderStatus.New, []),
      Id: this.fb.control(0, []),
      SalesPatternWithSupport: this.fb.control(false),
      CommissionSalesPatternSupporters: this.fb.array([])
    });

    if (pattern.CommissionSalesPatternSupporters) {
      this.supporters = this.form.get('CommissionSalesPatternSupporters') as FormArray;
      this.salesPattern.CommissionSalesPatternSupporters.forEach((supporter, index) => {
        this.supporters.push(this.fb.group({
          CommissionRoleId: [
            (index === 0 && this.salesPattern.CommissionSalesPatternSupporters.length > 1) ?
            this.ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport :
            (index === 0 && this.salesPattern.CommissionSalesPatternSupporters.length === 1) ?
              this.ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport :
              this.ApplicationConstants.CommissionRole.SupportingJobOwner, []],
          UserProfileId: [null, [Validators.required]],
          Id: [0, []]
        }));
      });
    }

    this.form.valueChanges.takeWhile(() => this.isAlive)
      .debounceTime(100)
      .distinctUntilChanged()
      .subscribe(value => {
        if (isFirstime) {
          isFirstime = false;
          return;
        }
        Object.assign(this.salesPattern, value);
        if (value.SalesPatternWithSupport !== null) {
          if (this.previousHasSupportValue !== value.SalesPatternWithSupport) {
            this.filterJobOwnersList(value.SalesPatternWithSupport);
          }
        }
        this.previousHasSupportValue = value.SalesPatternWithSupport;
      });
  }

  loadSalesPattern(salesPatternId: number) {
    this.commissionService.getSalesPattern(salesPatternId).subscribe(x => {
      this.salesPattern = x;
      this.salesPattern['SalesPatternWithSupport'] = this.salesPattern.CommissionSalesPatternSupporters.length > 1;
      let hasSupporters = false;

      this.loadCommissionRateHeaderUsers(this.salesPattern.CommissionSalesPatternSupporters.length > 1).then(done => {
        if (this.salesPattern.CommissionSalesPatternSupporters) {
          this.supporters = this.form.get('CommissionSalesPatternSupporters') as FormArray;
          this.salesPattern.CommissionSalesPatternSupporters.forEach((supporter, index) => {
            if (index > 0) {
              hasSupporters = true;
              this.supporters.push(this.fb.group({
                CommissionRoleId: [this.ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport, []],
                UserProfileId: [null, [Validators.required]],
                Id: [0, []]
              }));
            }
          });
        }

        this.salesPattern.CommissionSalesPatternSupporters = sortBy(this.salesPattern.CommissionSalesPatternSupporters, cp => cp.CommissionRoleId);

        const usersToExclude: number[] = this.salesPattern.CommissionSalesPatternSupporters.map(s => s.UserProfileId);
        usersToExclude.splice(0, 1);
        this.salesPattern.CommissionSalesPatternSupporters.forEach((supporter, index) => {
          if (index > 0) {
            this.commissionSupporters.push(this.alljobOwners.filter(user => {
              const sIndex = usersToExclude.findIndex(k => k === supporter.UserProfileId);
              const tempExclude = [...usersToExclude];
              tempExclude.splice(sIndex, 1);
              return user.CommissionRoleId === this.ApplicationConstants.CommissionRole.SupportingJobOwner &&
                !(tempExclude.includes(user.CommissionUserProfileId));
            }));
          }
        });

        this.form.patchValue(this.salesPattern, { emitEvent: false });

        this.previousHasSupportValue = hasSupporters;
        this.form.get('SalesPatternWithSupport').setValue(hasSupporters);
      });
    });
  }

  onHasSupportChange(hasSupporters: boolean) {
    this.supporters.at(0).get('UserProfileId').setValue(null);
    if (this.supporters.length === 1 && hasSupporters) {
      this.addNewSupporter(null);
    }
    this.supporters.at(0).get('CommissionRoleId')
      .setValue(hasSupporters ? this.ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport
        : this.ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport);
    this.form.updateValueAndValidity();
  }

  onJobOwnerSupportChnage($event) {
    this.form.updateValueAndValidity();
  }

  removeSupporter(index: number) {
    this.supporters.removeAt(index);
    this.commissionSupporters.splice(index, 1);
  }

  validateSupporters() {
    const actualSupporters = chain(this.salesPattern.CommissionSalesPatternSupporters.filter(x => x.UserProfileId)).uniqBy('UserProfileId').value();

    if (actualSupporters.length === 1 && this.salesPattern['SalesPatternWithSupport'] === false) {
      return actualSupporters[0].UserProfileId !== null;
    }

    if (this.salesPattern.CommissionSalesPatternSupporters.length > 1) {
      return (actualSupporters && actualSupporters.length === this.salesPattern.CommissionSalesPatternSupporters.filter(x => x.UserProfileId).length);
    } else {
      return true;
    }
  }

  get validateForm() {
    if (this.form.get('SalesPatternWithSupport').value) {
      return this.form.valid;
    } else {
      return this.form.get('Description').valid && (this.form.get('CommissionSalesPatternSupporters') as FormArray).at(0).valid;
    }
  }

  cancel($event) {
    const self = this;
    this.dialog.confirm('Cancel Sales Pattern', 'Are you sure you want to cancel this Sales Pattern?').then(
      function (btn) {
        self.router.navigate(['/next', 'commission', 'salespatterns']);
      }, function (btn) { });
  }

  save($event) {
    const hasSupport: boolean = this.form.get('SalesPatternWithSupport').value;
    const saveCommand = {
      LastModifiedDatetime: this.salesPattern.LastModifiedDatetime ? this.salesPattern.LastModifiedDatetime : new Date((new Date()).toUTCString()),
      SalesPatternId: this.salesPattern.Id,
      SalesPatternWithSupport: hasSupport,
      Description: this.salesPattern.Description,
      SalesPatternSupporters: hasSupport ? this.salesPattern.CommissionSalesPatternSupporters : [this.salesPattern.CommissionSalesPatternSupporters[0]]
    };
    const self = this;
    this.commissionService.saveCommissionSalesPattern(saveCommand).then(
      success => {
        self.router.navigate(['/next', 'commission', 'salespatterns']);
        if (this.salesPattern.SalesPatternStatusId !== this.ApplicationConstants.CommissionRateHeaderStatus.InActive) {
          self.commonService.logSuccess('Sales Pattern has been saved successfully');
        } else if (this.salesPattern.SalesPatternStatusId === this.ApplicationConstants.CommissionRateHeaderStatus.InActive) {
          self.commonService.logSuccess('Sales Pattern has been ReActivated successfully');
        }
      },
      function (error) {
        self.commonService.logError('Unable perform the action');
        console.log(error);
      });
  }

  cancelAndDiscard($event) {
    const self = this;
    this.dialog.confirm('Deactivate Sales Pattern', 'Are you sure you want to Deactivate this Sales Pattern?').then(
      function (btn) {
        const salesPatternId = self.salesPattern.Id;
        if (salesPatternId > 0) {
          self.commissionService.discardCommissionSalesPattern({ LastModifiedDatetime: self.salesPattern.LastModifiedDatetime, SalesPatternId: salesPatternId }).then(
            function (success) {
              self.router.navigate(['/next', 'commission', 'salespatterns']);
            },
            function (error) {
              console.log(error);
            });
        } else {
          self.router.navigate(['/next', 'commission', 'salespatterns']);
        }
      }, function (btn) { });
  }

  addNewSupporter($event) {
    this.filterCommissionOwnersList();
    this.supporters.push(this.fb.group({
      CommissionRoleId: [this.ApplicationConstants.CommissionRole.SupportingJobOwner, []],
      UserProfileId: [null, [Validators.required]],
      Id: [0, []]
    }));
  }
}
