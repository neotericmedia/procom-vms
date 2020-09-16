import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService, NavigationService, ValidationExtensions } from '../../common/index';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationBranchService } from './../organization.branch.service';
import { Branch, BranchManager, BranchPhone, BranchAddress } from '../state/organization.interface';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import * as _ from 'lodash';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-organization-branch-details',
  templateUrl: './organization-branch-details.component.html',
  styleUrls: ['./organization-branch-details.component.less']
})

export class OrganizationBranchDetailsComponent implements OnInit, OnDestroy {

  branchId: number;
  isAlive: boolean = true;
  branch: Branch;
  form: FormGroup;
  editable: boolean = false;
  branchName: string;
  isCreateMode: boolean = false;
  branchManagerList: Array<BranchManager>;
  currentBranchCode: string;
  codeValueGroups: any;

  constructor(
    private navigationService: NavigationService
    , private activatedRoute: ActivatedRoute
    , private branchService: OrganizationBranchService
    , private fb: FormBuilder
    , private commonService: CommonService
    , private router: Router
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.getUserProfileInternalList();
    this.validateCodeUniqueness = this.validateCodeUniqueness.bind(this);
    this.buildBranchForm();
    this.updateModalOnFormValueChange();

    this.activatedRoute.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.branchId = +params['branchId'];
        this.isCreateMode = this.branchId === 0;
        this.getBranchDetails();
      });
  }

  buildBranchForm() {
    this.form = this.fb.group({
      Id: [''],
      Code: ['', [ValidationExtensions.required(' ')], [this.validateCodeUniqueness.bind(this)]],
      Name: ['', Validators.required],
      Description: [''],
      BranchManagers: this.fb.array([]),
      BranchPhones: this.fb.array([]),
      BranchAddresses: this.fb.array([]),
    });
  }

  updateModalOnFormValueChange() {
    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => {
        Object.assign(this.branch, value);
      });
  }

  getBranchDetails() {
    if (!this.isCreateMode) {
      this.branchService.getBranchById(this.branchId)
        .takeWhile(() => this.isAlive)
        .distinctUntilChanged()
        .subscribe((data: Branch) => {
          this.branch = data;
          this.branchName = data.Name;
          this.currentBranchCode = data.Code;
          this.navigationService.setTitle('branch-viewedit', [this.branchName]);
          this.form.patchValue(data, { emitEvent: false });
          this.branch.BranchManagers.forEach(element => {
            (this.form.get('BranchManagers') as FormArray).push(this.fb.group({
              Id: [element.Id, Validators.required],
              UserProfileInternalId: [element.UserProfileInternalId, Validators.required]
            }));
          });

          this.branch.BranchPhones.forEach(element => {
            (this.form.get('BranchPhones') as FormArray).push(this.fb.group({
              Id: [element.Id, Validators.required],
              PhoneType: [element.PhoneType, Validators.required],
              Phone: [element.Phone, Validators.compose([Validators.required, Validators.pattern('^[0-9]{7,15}$')])],
              Extension: [element.Extension, Validators.pattern('^[0-9]{0,10}$')]
            }));
          });

          this.branch.BranchAddresses.forEach((address, index) => {
            (this.form.get('BranchAddresses') as FormArray).push(this.fb.group({
              Id: [address.Id],
              Description: [address.Description, Validators.compose([Validators.minLength(3), Validators.maxLength(128), Validators.required])],
              IsPrimary: [index === 0, Validators.required],
              AddressLine1: [address.AddressLine1, Validators.compose([Validators.minLength(3), Validators.maxLength(50), Validators.required])],
              AddressLine2: [address.AddressLine2, Validators.compose([Validators.minLength(3), Validators.maxLength(128)])],
              CityName: [address.CityName, Validators.compose([Validators.minLength(3), Validators.maxLength(128), Validators.required])],
              CountryId: [address.CountryId, Validators.required],
              SubdivisionId: [address.SubdivisionId, Validators.required],
              PostalCode: [address.PostalCode, Validators.compose([Validators.minLength(3), Validators.maxLength(128), Validators.required])]
            }));
          });
        });
    } else {
      this.navigationService.setTitle('branch-viewedit', ['New']);
      this.editable = this.isCreateMode;
      this.branch = {} as Branch;
      this.branch.Id = this.branchId;
      this.branch.BranchManagers = <BranchManager[]>Array();
      this.branch.BranchPhones = <BranchPhone[]>Array();
      this.branch.BranchAddresses = <BranchAddress[]>Array();
      this.form.patchValue(this.branch, { emitEvent: false });
    }
  }

  getUserProfileInternalList() {
    this.branchService.getUserProfileInternalList().subscribe((data: any) => {
      this.branchManagerList = <Array<BranchManager>>data.Items;
    });
  }

  addBranchManager() {
    (<FormArray>this.form.get('BranchManagers')).push(this.fb.group({
      Id: [''],
      UserProfileInternalId: ['', Validators.required]
    }));
  }

  addBranchPhone() {
    (<FormArray>this.form.get('BranchPhones')).push(this.fb.group({
      Id: [''],
      PhoneType: ['', Validators.required],
      Phone: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{7,15}$')])],
      Extension: ['', Validators.pattern('^[0-9]{0,10}$')],
    }));
  }

  addBranchAddress() {
    (<FormArray>this.form.get('BranchAddresses')).push(this.fb.group({
      Id: [''],
      Description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(128), Validators.required])],
      IsPrimary: [false],
      AddressLine1: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(50), Validators.required])],
      AddressLine2: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(128)])],
      CityName: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(128), Validators.required])],
      CountryId: ['', Validators.required],
      SubdivisionId: ['', Validators.required],
      PostalCode: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(128), Validators.required])]
    }));
  }

  editBranch() {
    this.editable = true;
  }

  discardChanges() {
    if (this.isCreateMode) {
      this.router.navigate(['/next', 'organization', 'branch']);
    } else {
      this.editable = false;
      this.clearFormArray((<FormArray>this.form.get('BranchManagers')));
      this.clearFormArray((<FormArray>this.form.get('BranchPhones')));
      this.clearFormArray((<FormArray>this.form.get('BranchAddresses')));
      this.getBranchDetails();
    }
  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  saveBranch() {
    if (this.branch.BranchAddresses.length > 0) {
      this.branch.BranchAddresses[0].IsPrimary = true;
    }

    this.branchService.saveBranch(this.branch).subscribe((response: any) => {
      this.branchId = response.EntityId;

      this.clearFormArray((<FormArray>this.form.get('BranchManagers')));
      this.clearFormArray((<FormArray>this.form.get('BranchPhones')));
      this.clearFormArray((<FormArray>this.form.get('BranchAddresses')));

      if (this.isCreateMode) {
        this.commonService.logSuccess('Branch created successfully');
        this.editable = this.isCreateMode = false;
        this.router.navigate(['/next', 'organization', 'branch', this.branchId]);
      } else {
        this.commonService.logSuccess('Branch updated successfully');
        this.editable = this.isCreateMode = false;
        this.getBranchDetails();
      }
    });
  }

  removeBranchItem(index: number, arrayName: string) {
    (<FormArray>this.form.get(arrayName)).removeAt(index);
  }

  validateCodeUniqueness(control: AbstractControl) {
    if (control.value != null && control.value !== '') {
      return new Promise((resolve) => {
        if (control.value !== this.currentBranchCode) {
          this.branchService.isCodeUnique(control.value)
            .subscribe((isCodeUnique) => {
              if (!isCodeUnique) {
                resolve({
                  codeIsNotUnique: {
                    message: 'This branch code is not unique.'
                  }
                });
              } else {
                resolve(null);
              }
            });
        } else {
          resolve(null);
        }
      });
    }
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;

    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
