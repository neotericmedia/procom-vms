import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { NgForm, FormBuilder, Validators } from '@angular/forms';
import { WCBSubdivisionService } from './../../../Services/WCBSubdivision.service';
import { CommonService } from '../../../../common/services/common.service';
import { SortArrayOfObjectsPipe } from '../../../../common/pipes/sortArrayOfObjects.pipe';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CodeValueService } from '../../../../common/services/code-value.service';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import { DialogService } from '../../../../common/services/dialog.service';
import { DialogResultType } from '../../../../common/model/index';
import { NavigationService } from '../../../../common/services/navigation.service';
import { PhxConstants } from '../../../../common';
import { AuthService } from '../../../../common/services/auth.service';

@Component({
  templateUrl: './WCBSubdivisionPage.component.html',
  styleUrls: ['./WCBSubdivisionPage.component.css'],

})
export class WCBSubdivisionPageComponent implements OnInit, OnDestroy {
  versionId: number;
  private sub: any;
  wcb: any;
  provinces: any[];
  selectableProvinces: any[];
  province: string;
  workerCompensations: any[];
  selectableWorkerCompensations: Array<any> = [];
  allInternalOrganizations: any[];
  profileTypes: any[];
  editMode: boolean;
  availableButtons: any[];
  selectedVersion: any;
  workflowAvailableActions: any[];
  ApplicationConstants: any;
  isWorkflowSceduleChange: boolean = false;
  hasModifyAccess: boolean;
  validationMessages: any;
  waitCounter: number = 0;
  selectedTab: string = 'details';
  changeHistoryBlackList: any[];
  minDate: any;

  constructor(
    private router: Router
    , private ar: ActivatedRoute
    , private APISERVICE: WCBSubdivisionService
    , private COMMON: CommonService
    , private authService: AuthService
    , private orderBy: SortArrayOfObjectsPipe
    , private $codeValue: CodeValueService
    , private dialogService: DialogService
    , private navigationService: NavigationService
  ) {
    this.editMode = false;
  }

  ngOnInit() {

    this.hasModifyAccess = false;

    this.ApplicationConstants = this.COMMON.ApplicationConstants;


    this.sub = this.ar.params.subscribe(params => {
      this.versionId = +params['versionId']; // (+) converts string 'id' to a number


      if (this.versionId === 0) {
        this.editMode = true;
        this.createNewWCB();
        this.getProvinces();
        this.getInternalOrgs();
        this.getProfileTypes();
        this.getCompensations(false);
        this.getFirstCommand();
      } else {
        this.getProvinces();
        this.getWCBSubdivisionHeaderByVersionId(this.versionId);

      }
    });
    this.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'SourceId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'WCBSubdivisionVersionId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'WCBSubdivisionHeaderId' },
      // { TableSchemaName: '', TableName: '', ColumnName: 'WorkerCompensationId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'WCBSubdivisionDetailId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationInternalRoleId' },





    ];

    this.navigationService.setTitle('workercompensation-rate-manage');
  }
  // CREATE NEW SUBDIVISION ------------------------------------------------------------------------------------------------------------------------

  createNewWCB() {
    this.wcb = {
      Id: 0,
      SubdivisionId: null,
      WCBSubdivisionVersion: [{
        Id: 0,
        Status: 'Draft',
        WCBSubdivisionDetail: [{
          WCBSubdivisionDetailOrganizationInternalRole: [],
          WCBSubdivisionDetailWorkerTypeDefault: []
        }]
      }]

    };
    // select first version for new forms.
    this.selectedVersion = this.wcb.WCBSubdivisionVersion[0];
  }
  getProvinces() {
    const CodeValueGroups = this.COMMON.CodeValueGroups;
    const ApplicationConstants = this.ApplicationConstants;
    const provincesCAD = this.$codeValue.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.CountryCanada, CodeValueGroups.Country);
    const provincesUSA = this.$codeValue.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.CountryUSA, CodeValueGroups.Country);
    this.provinces = provincesCAD.concat(provincesUSA).sort((a, b) => a.description.localeCompare(b.description));

    // Deep copy of provinces for filtered list
    this.selectableProvinces = Object.assign([], this.provinces);
    this.APISERVICE.getWCBSubdivisionIds().then(
      (obj: any) => {
        this.selectableProvinces = _.difference(this.provinces, this.provinces.filter(item => obj.Items.some(d => d.SubdivisionId === item.id)));
      }

    );



  }


  getInternalOrgs() {

    if (this.wcb && this.wcb.OrgInternalRoles && this.wcb.OrgInternalRoles.length > 0) {
      this.allInternalOrganizations = this.wcb.OrgInternalRoles;
      this.selectedVersion.WCBSubdivisionDetail.forEach(detail => { this.populateInternalOrgs(detail); });
    } else {
      this.waitCounter++;
      this.APISERVICE.getInternalOrgs().then(
        (obj: any) => {
          this.allInternalOrganizations = obj.Items;
          this.selectedVersion.WCBSubdivisionDetail.forEach(detail => {
            this.populateInternalOrgs(detail);
          }
          );

        }).catch((err) => { this.validationMessages = err; });
        // fix me .finally(() => { this.waitCounter--; });
    }
  }

  populateInternalOrgs(detail) {
    const wcbiOrgs = detail.WCBSubdivisionDetailOrganizationInternalRole;

    this.allInternalOrganizations.forEach(itm => {
      const ci = wcbiOrgs.length > 0 ?
        wcbiOrgs.filter(item => item.OrganizationInternalRoleId === (itm.OrganizationInternalRoles ? itm.OrganizationInternalRoles[0].Id : itm.Id)) :
        [];
      if (ci.length === 0) {
        detail.WCBSubdivisionDetailOrganizationInternalRole.push(
          {
            Id: 0,
            OrganizationInternalRoleId: (itm.OrganizationInternalRoles ? itm.OrganizationInternalRoles[0].Id : itm.Id),
            WCBSubdivisionDetailId: detail.Id,
            RatePercent: null,
            LegalName: itm.LegalName
          }
        );

      } else {
        ci[0].LegalName = itm.LegalName;
      }
    });

  }

  getProfileTypes() {

    // this is only due to my inability to do a left outer join using CQL
    if (this.wcb && this.wcb.ProfileTypes && this.wcb.ProfileTypes.length > 0) {

      this.profileTypes = this.wcb.ProfileTypes;
      this.selectedVersion.WCBSubdivisionDetail.forEach(detail => { this.populateProfileTypes(detail); });
    } else {
      this.waitCounter++;
      this.APISERVICE.getProfileTypes().then(
        (obj: any) => {
          this.profileTypes = obj.Items;
          this.selectedVersion.WCBSubdivisionDetail.forEach(detail => {
            this.populateProfileTypes(detail);

          });
        }).catch((err) => { this.validationMessages = err; }); // fix me .finally(() => { this.waitCounter--; });
    }
  }
  populateProfileTypes(detail) {
    const wcbiProfiles = detail.WCBSubdivisionDetailWorkerTypeDefault;

    this.profileTypes.forEach(itm => {
      const pt = wcbiProfiles.length > 0 ? wcbiProfiles.filter(item => item.ProfileTypeIdWorker === itm.Id) : [];
      if (pt.length === 0) {
        detail.WCBSubdivisionDetailWorkerTypeDefault.push(
          {
            Id: 0,
            ProfileTypeIdWorker: itm.Id,
            Value: itm.Value,
            IsSelected: false
          }
        );

      } else {
        pt[0].Value = itm.Value;
      }
    });
  }

  provinceChanged(id) {
    this.wcb.SubdivisionId = id;
    this.getCompensations(true);
  }


  getCompensations(provinceChange) {
    if (this.wcb.SubdivisionId === 0) { return; }
    this.waitCounter++;
    this.APISERVICE.getWorkerCompensations(this.wcb.SubdivisionId).then(
      (obj: any) => {
        this.workerCompensations = obj.Items;
        this.selectableWorkerCompensations = _.difference(
          this.workerCompensations,
          this.workerCompensations
            .filter(item => obj.Items.some(d => d.WorkerCompensationId === item.Id))
        );
        this.selectedVersion.WCBSubdivisionDetail.forEach(detail => {
          if (provinceChange) { detail.WorkerCompensationId = null; } else {
            detail.WorkerCompensationName = this.workerCompensations.find(wc => wc.Id === detail.WorkerCompensationId);
          }

        });


      }).catch((err) => { this.validationMessages = err; }); // fix me .finally(() => { this.waitCounter--; });

  }


  // Service CAll
  getFirstCommand() {// TODO - figure out TaskTemplate enum
    this.waitCounter++;
    this.APISERVICE.getFirstWorkflowCommand('320001').then(
      (obj: any) => {
        if (!this.availableButtons) { this.availableButtons = []; }
        this.availableButtons.push(obj);
      }).catch((err) => { this.validationMessages = err; }); // fix me .finally(() => { this.waitCounter--; });

  }

  // CREATE NEW SUBDIVISION ------------------------------------------------------------------------------------------------------------------------



  // GET WCBSUBDIVISION BY VERSION With Access and Workflow buttons ------------------------------

  getWCBSubdivisionHeaderByVersionId(versionId) {
    this.waitCounter++;
    this.APISERVICE.getWCBSubdivisionHeaderByVersionId(versionId).then(
      (obj: any) => {
        this.wcb = obj;
        if (obj && obj.WCBSubdivisionVersion.length > 0) { obj.WCBSubdivisionVersion.forEach(v => { v.EffectiveDate = moment(v.EffectiveDate).toDate(); }); }

        this.wcb.WCBSubdivisionVersion = this.sortNVersion(obj.WCBSubdivisionVersion);

        this.selectedVersion = Object.assign({}, this.wcb.WCBSubdivisionVersion.filter(v => v.Id === this.versionId)[0]);

        this.getCompensations(false);

        this.province = this.provinces.filter(item => item.id === obj.SubdivisionId)[0].text;
        this.getInternalOrgs();
        this.getProfileTypes();

        this.hasModifyAccessCheck();
        this.getWorkflowAvailableActions(this.versionId);

        this.navigationService.setTitle('workercompensation-rate-manage', [this.province]);

      }).catch((err) => { this.validationMessages = err; }); // fix me .finally(() => { this.waitCounter--; });
  }

  getWorkflowAvailableActions(versionId) {

    this.waitCounter++;
    this.APISERVICE.getWorkflowAvailableActions(this.ApplicationConstants.EntityType.WCBSubdivisionVersion, versionId).then(
      (obj: any) => {

        this.workflowAvailableActions = obj.Items.length > 0 ? obj.Items[0].WorkflowAvailableActions : null;
        this.isWorkflowSceduleChange = false;
        // only the active verion with the greatest date will have the ability to schedule a change
        if (!(this.getLatestActiveVersionId() === this.selectedVersion.Id) && this.workflowAvailableActions && this.workflowAvailableActions.length > 0) {
          const o = this.workflowAvailableActions.find(a => a.CommandName === 'WCBSubdivisionVersionScheduleChange');
          const indx = this.workflowAvailableActions.indexOf(o);
          this.workflowAvailableActions.splice(indx, 1);
        }

        if ((this.wcb.WCBSubdivisionVersion.filter(a => a.Status === 'Active').length < 2 ||
          !(this.getLatestActiveVersionId() === this.selectedVersion.Id)) && this.workflowAvailableActions) {
          const o = this.workflowAvailableActions.find(a => a.CommandName === 'WCBSubdivisionVersionCancel');
          const indx = this.workflowAvailableActions.indexOf(o);
          this.workflowAvailableActions.splice(indx, 1);
        }

      }).catch((err) => { this.validationMessages = err; }); // fix me .finally(() => { this.waitCounter--; });

  }

  hasModifyAccessCheck() {
    if (!this.wcb) { return; }
      this.hasModifyAccess = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.WCBSubdivisionHeaderSave);

  }

  // sort & new version property attached is done here because the ui displays version numbers always starting from 1
  sortNVersion(ary): any[] {
    ary.sort((a, b) => { return b.Id - a.Id; });
    let i = 0;
    ary.forEach(detail => { detail.version = ary.length - i; i++; });
    return ary;
  }

  // GET WCBSUBDIVISION BY VERSION With Access and Workflow buttons --------------------------



  // BUTTONS  ------------------------------------------------------------------------------------------------------------------------


  addDetail() {
    this.selectedVersion.WCBSubdivisionDetail.push({
      Id: 0,
      WorkerCompensationId: null,
      WCBSubdivisionDetailOrganizationInternalRole: [],
      WCBSubdivisionDetailWorkerTypeDefault: []
    });
    const detail = this.selectedVersion.WCBSubdivisionDetail[this.selectedVersion.WCBSubdivisionDetail.length - 1];
    this.setSelectableWorkerCompensations();
    this.populateInternalOrgs(detail);
    this.populateProfileTypes(detail);

  }
  setSelectableWorkerCompensations() {
    this.selectableWorkerCompensations = _.difference(this.workerCompensations, this.workerCompensations.filter(item =>
      this.selectedVersion.WCBSubdivisionDetail.some(d => d.WorkerCompensationId === item.Id)));

  }

  // SET PAGE STATE
  onActionSelect(action) {
    this.selectedTab = 'details';
    const selectedWorkflowAction = this.workflowAvailableActions.filter(a => a.TaskResultId === action.TaskResultId);
    this.isWorkflowSceduleChange = selectedWorkflowAction[0].CommandName.contains('ScheduleChange');

    // Schedule Change
    if (this.isWorkflowSceduleChange) { this.selectedVersion.EffectiveDate = ''; this.minDate = this.getLatestActiveVersionDate(); }

    // Cancel Button Pressed
    if (selectedWorkflowAction[0].CommandName.contains('Cancel')) {
      this.dialogService.confirm('WCB Subdivision Board Management', 'Are you sure you want to cancel this Workers Compensation Version?')
        .then((btn) => {
          if (btn === DialogResultType.Yes) {
            this.callWorkflowCommand(selectedWorkflowAction[0]);
          }
        }, (btn) => {

        });
      return;
    }

    this.editMode = true;
    this.availableButtons = selectedWorkflowAction;
  }

  viewVersion(v) {
    if (this.versionId === 0 || this.versionId === v.Id) { return; }
    this.viewReset();
    this.router.navigate(['/next', 'payroll', 'wcbsubdivision', 'details', v.Id]);
  }

  getLatestActiveVersionDate(): any {
    let shortList = this.wcb.WCBSubdivisionVersion.filter(v => v.Status === 'Active');
    const ascending = shortList.length === 0;
    shortList = shortList.length === 0 ? this.wcb.WCBSubdivisionVersion.filter(v => v.Status === 'Active') : shortList;
    this.orderBy.transform(shortList, ascending ? 'EffectiveDate' : '-EffectiveDate');
    const thisDate = shortList.length > 0 ? shortList[0].EffectiveDate : new Date();
    return thisDate.setDate(thisDate.getDate() + 1); // Must be atleast one day in the future of this value.
  }

  getLatestActiveVersionId(): any {
    const shortList = this.wcb.WCBSubdivisionVersion.filter(v => v.Status === 'Active');
    this.orderBy.transform(shortList, '-EffectiveDate');
    return shortList[0].Id; // Must be atleast one day in the future of this value.
  }

  // CALL SERVER
  callWorkflowCommand(o) {// from buttons
    // Cancel o==undefined
    if (!o) {
      this.dialogService.confirm('WCB Subdivision Board Management', 'Are you sure you want to discard this Workers Compensation Rate?')
        .then((btn) => {
          if (btn === DialogResultType.Yes) {
            if (this.versionId === 0) {
              this.router.navigate(['/next', 'payroll', 'wcbsubdivision']);
            } else {
              this.viewReset();
              this.getWCBSubdivisionHeaderByVersionId(this.versionId);
            }
          }
        }, function (btn) {

        });
      return;
    }
    // Create new
    if (this.selectedVersion.Id === 0) {
      this.createWCBSubdivision(o);
      return;
    }

    const subdivisions = []; subdivisions.push(this.selectedVersion);
    // Update
    const c = {
      CommandName: o.CommandName,
      WorkflowPendingTaskId: o.WorkflowPendingTaskId,
      WCBSubdivisionVersionId: this.selectedVersion.Id,
      WCBSubdivisionVersion: subdivisions
    };
    this.waitCounter++;
    this.APISERVICE.callWorkflowCommand(c).then((res) => {
      this.viewReset();
      let goToVersion = res.EntityId;

      // When Cancelling, load the current active version.
      if (this.versionId === goToVersion) { goToVersion = this.getLatestActiveVersionId(); }

      this.router.navigate(['/next', 'payroll', 'wcbsubdivision', 'details', goToVersion]);

      console.log('Handle Redirect');
    }).catch((err) => { this.validationMessages = err; }); // fix me .finally(() => { this.waitCounter--; });

  }

  createWCBSubdivision(o) {
    this.waitCounter++;
    this.APISERVICE.callWorkflowCommandWithCommandName(o.CommandName, this.wcb).then((res) => {
      this.viewReset();
      this.router.navigate(['/next', 'payroll', 'wcbsubdivision', 'details', res.EntityId]);
      console.log('Handle Redirect');
    }).catch((err) => { this.validationMessages = err; }); // fix me .finally(() => { this.waitCounter--; });

  }

  // BUTTONS  ------------------------------------------------------------------------------------------------------------------------

  viewReset() {
    this.editMode = false;
    this.availableButtons = null;
    this.workerCompensations = null;
    this.hasModifyAccess = false;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
