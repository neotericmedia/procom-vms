import { CustomValidators } from './../../../common/validators/CustomValidators';
import { Router } from '@angular/router';
import { WorkerCompensationService } from './../../Services/WorkerCompensation.service';
import { WorkerCompensation } from './../WorkerCompensation';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../common/services/common.service';
import { CodeValueService } from '../../../common/services/code-value.service';
import { DialogService } from '../../../common/services/dialog.service';
@Component({
  selector: 'app-WorkerCompensationSetup',
  templateUrl: './WorkerCompensationSetup.component.html',
  styleUrls: ['./WorkerCompensationSetup.component.css']
})
export class WorkerCompensationSetupComponent implements OnInit, OnDestroy {
  id: number;

  viewMode: string = 'new';
  private sub: any;
  subdivisions: any[];
  wc = new WorkerCompensation(0, '', '', null, 0, null);
  form: FormGroup;
  validationMessages: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private $codeValue: CodeValueService,
    private dialogService: DialogService,
    private commonService: CommonService,
    private wcService: WorkerCompensationService
  ) {
    route.url.subscribe(urls => {
      const routename = urls[0].path;
      if (routename === 'details') {
        this.viewMode = 'details';
      } else if (routename === 'edit') {
        this.viewMode = 'edit';
      }
    });
  }


  ngOnInit() {
    const CodeValueGroups = this.commonService.CodeValueGroups;
    const ApplicationConstants = this.commonService.ApplicationConstants;
    const subdivisionsCAD = this.$codeValue.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.Country.CA, CodeValueGroups.Country);
    const subdivisionsUSA = this.$codeValue.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.Country.US, CodeValueGroups.Country);
    this.subdivisions = subdivisionsCAD.concat(subdivisionsUSA).sort((a, b) => a.description.localeCompare(b.description));
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      if (this.id) {
        this.fetchDataAndUpdateForm(this.id);
      } else {

      }
    });
    this.buildForm();
  }

  fetchDataAndUpdateForm(id: number) {
    return new Promise((resolve, reject) => {
      // fix me
      // this.$rootScope.activateGlobalSpinner = true;
      this.wcService.getWorkerCompensationById(id)
        .then((data) => {
          this.wc = this.mapData(data);
          this.updateForm();
          this.form.markAsPristine();
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
        // fix me
        // .finally(() => {
        //   this.$rootScope.activateGlobalSpinner = false;
        // });
    });

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  mapData(data: any): WorkerCompensation {
    const retVal = new WorkerCompensation(data.Id, data.Name, data.Code, data.SubdivisionId, data.StatusId, data.LastModifiedDatetime);
    return retVal;
  }


  mapModelFromData(data: any) {
    this.wc.Id = data.id || this.wc.Id;
    this.wc.SubdivisionId = data.subdivisionid || this.wc.SubdivisionId;
    this.wc.Name = (data.name && data.name.trim()) || this.wc.Name;
    this.wc.Code = (data.code && data.code.trim()) || this.wc.Code;
  }

  getCommandFromModel(data: WorkerCompensation) {
    const retVal: any = {};
    retVal.Id = data.Id;
    if (data.LastModifiedDatetime) { retVal.LastModifiedDatetime = data.LastModifiedDatetime; }
    retVal.Code = data.Code;
    retVal.Name = data.Name;
    retVal.SubdivisionId = data.SubdivisionId;
    return retVal;
  }

  buildForm(): void {
    this.form = this.fb.group({
      'name': [this.wc.Name, [
        CustomValidators.required
      ]],
      'code': [this.wc.Code, [
        CustomValidators.required
      ]],
      'subdivisionid': [this.wc.SubdivisionId, [
        Validators.required
      ]],
    });

  }

  updateForm(): void {
    this.form.patchValue({
      name: this.wc.Name,
      code: this.wc.Code,
      subdivisionid: this.wc.SubdivisionId
    });

  }

  onSubmit() {
    this.mapModelFromData(this.form.value);
    const commandObj = this.getCommandFromModel(this.wc);
    // fix me
    // this.$rootScope.activateGlobalSpinner = true;
    this.wcService.saveWorkerCompensation(commandObj)
      .then((data) => {
        this.validationMessages = null;
        const id = data.EntityId;
        this.fetchDataAndUpdateForm(id)
          .then((dt) => {
            this.viewMode = 'details';
          });
      })
      .catch((err) => {
        this.validationMessages = err;
      });
      // fix me
      // .finally(() => {
      //   this.$rootScope.activateGlobalSpinner = false;
      // })
  }


  onCancel() {
    // this._navigateToSearch();
    this.onDiscard();
  }
  private _navigateToSearch() {
    this.router.navigate(['/next', 'payroll', 'workercompensation']);
  }
  onDiscard() {
    if (this.form.dirty) {
      this.dialogService.confirm('WCB Code', 'Are you sure you want to discard these changes?')
        .then((btn) => {
        if (this.id) {
          this.viewMode = 'details';
          } else {
          this._navigateToSearch();
        }

      }, function (btn) {

      });
    } else {
      if (this.id) {
        this.viewMode = 'details';
      } else {
        this._navigateToSearch();
      }
    }

  }

  onDeactivate() {
    this.dialogService.confirm('WCB Code', 'Are you sure you want to deactivate this Workers Compensation Code?')
      .then((btn) => {
        // fix me
      //this.$rootScope.activateGlobalSpinner = true;
      this.wcService.deactivateWorkerCompensation(this.wc)
        .then((data) => {
            // this.wc.StatusId = 2;
            this.validationMessages = null;
          this.fetchDataAndUpdateForm(this.wc.Id);
        })
        .catch((err) => {
          console.error(err);
          // fix me
          //this.$rootScope.activateGlobalSpinner = false;
          this.validationMessages = err;
        });
        // fix me
        // .finally(() => {
        //     // this.$rootScope.activateGlobalSpinner = false;
        // });
    }, function (btn) {

    });
  }

  onActivate() {
    this.dialogService.confirm('WCB Code', 'Are you sure you want to activate this Workers Compensation Code?').then((btn) => {
      // fix me
      // this.$rootScope.activateGlobalSpinner = true;
      this.wcService.activateWorkerCompensation(this.wc)
        .then((data) => {
          this.validationMessages = null;
          // this.wc.StatusId = 1;
          this.fetchDataAndUpdateForm(this.wc.Id);
        })
        .catch((err) => {
          console.error(err);
          // fix me
          //this.$rootScope.activateGlobalSpinner = false;
          this.validationMessages = err;
        });
        // fix me
        // .finally(() => {
        //   // this.$rootScope.activateGlobalSpinner = false;
        // });
    }, function (btn) {

    });
  }

  onEdit() {
    this.updateForm();
    this.form.markAsPristine();
    this.viewMode = 'edit';
  }
}
