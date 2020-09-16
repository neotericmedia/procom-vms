// angular
import { Component, OnInit } from '@angular/core';
// common
import { CommonService, PhxConstants } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
// organization
import { OrganizationApiService } from './../organization.api.service';
import { OrganizationObservableService } from '../state/organization.observable.service';
import { OrganizationContactColumnsKey, TableFilterConfiguration, IOrganization } from '../state/index';
import { InputFilter, CheckBoxFilter, TextBoxFilter } from './../../common/model/advance-filter/phx-advance-filter';
import { isEqual, cloneDeep } from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../common/services/auth.service';

declare var oreq;

@Component({
  selector: 'app-organization-tab-contacts',
  templateUrl: './organization-tab-contacts.component.html',
  styleUrls: ['./organization-tab-contacts.component.less']
})

export class OrganizationTabContactsComponent extends BaseComponentActionContainer implements OnInit {
  organizationId: number;
  organization: IOrganization;
  currentSelectedColumn: string;
  sortNumber: number = 0;
  previousTableState: any;
  selectedPredicateKey: any;
  scrollProgress: boolean;
  inputFilterForName: InputFilter;
  inputFilterForProfile: InputFilter;
  inputFilterForProfilePrimaryEmail: InputFilter;
  inputFilterForStatus: InputFilter;
  html: {
    codeValueGroups: any;
    organizationContactColumnsKey: any;
    scrollConfig: {
      infiniteScrollDistance: number;
      scrollWindow: boolean;
      infiniteScrollThrottle: number;
    };
    commonLists: {
      profileStatusesList: any;
      profileTypeList: any;
      contactList: {
        Count: number;
        Items: Array<any>;
        NextPageLink: any;
      };
    };
    filterSelectedStatus: {
      isNameClicked: boolean;
      isProfileClicked: boolean;
      isProfilePrimaryEmailClicked: boolean;
      isStatusClicked: boolean;
    };
    filterTextbox: {
      nameText: string;
      profileText: string;
      emailText: string;
      statusText: string;
    };
    tableState: {
      isLoadedFromPreviousState: boolean;
      pagination: {
        currentPage: number;
        number: number;
        pageSize: number;
        start: number;
      };
      search: {
        predicateObject: any;
      };
      sort: {
        predicate: any;
        reverse: boolean;
      };
    };
  } = {
      codeValueGroups: null,
      organizationContactColumnsKey: null,
      scrollConfig: {
        infiniteScrollDistance: 2,
        scrollWindow: false,
        infiniteScrollThrottle: 750
      },
      commonLists: {
        profileStatusesList: [],
        profileTypeList: [],
        contactList: {
          Count: null,
          Items: [],
          NextPageLink: null
        }
      },
      filterSelectedStatus: {
        isNameClicked: false,
        isProfileClicked: false,
        isProfilePrimaryEmailClicked: false,
        isStatusClicked: false
      },
      filterTextbox: {
        nameText: null,
        profileText: null,
        emailText: null,
        statusText: null
      },
      tableState: {
        isLoadedFromPreviousState: false,
        pagination: {
          currentPage: 1,
          number: 20,
          pageSize: 20,
          start: 0
        },
        search: {
          predicateObject: {}
        },
        sort: {
          predicate: OrganizationContactColumnsKey.Name,
          reverse: false
        }
      }
    };
  tableFilterConfiguration: TableFilterConfiguration = {
    filterList: {
      list: [],
      displayText: 'text',
      valueField: 'value'
    },
    filterType: null,
    selectedValue: {
      inputText: null,
      selectedValue: null,
      selectedValues: []
    }
  };

  constructor(private commonService: CommonService,
    private organizationObservableService: OrganizationObservableService,
    private organizationApiService: OrganizationApiService,
    private router: Router,
    private codeValueService: CodeValueService,
    private authService: AuthService
  ) {
    super();
    this.html.organizationContactColumnsKey = OrganizationContactColumnsKey;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.html.commonLists.profileStatusesList = this.codeValueService.getCodeValues(this.html.codeValueGroups.ProfileStatus, true);
    this.html.commonLists.profileTypeList = this.codeValueService.getCodeValues(this.html.codeValueGroups.ProfileType, true);
    this.html.tableState.search.predicateObject[this.html.organizationContactColumnsKey.Name] = null;
    this.html.tableState.search.predicateObject[this.html.organizationContactColumnsKey.Profile] = [];
    this.html.tableState.search.predicateObject[this.html.organizationContactColumnsKey.ProfilePrimaryEmail] = null;
    this.html.tableState.search.predicateObject[this.html.organizationContactColumnsKey.Status] = [];
    this.organizationObservableService
      .organizationOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(organization => {
        if (organization) {
          this.organization = organization;
          this.organizationId = organization.Id;
          this.resetTableStateConfig();
          this.getContactList();
        }
      });
  }

  public get canAddProfile() {
    return this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationAddContact) &&
      this.organization.OrganizationInternalRoles &&
      this.organization.OrganizationInternalRoles.length === 0 &&
      ((this.organization.OrganizationIndependentContractorRoles && this.organization.OrganizationIndependentContractorRoles.length > 0) ||
        (this.organization.OrganizationClientRoles && this.organization.OrganizationClientRoles.length > 0) ||
        (this.organization.OrganizationSubVendorRoles && this.organization.OrganizationSubVendorRoles.length > 0) ||
        (this.organization.OrganizationLimitedLiabilityCompanyRoles && this.organization.OrganizationLimitedLiabilityCompanyRoles.length > 0));
  }

  onAddProfile($event) {
    this.router.navigate(['next', 'contact', 'wizardorganizationalprofile', 'organization', this.organizationId]);
  }

  getContactList() {
    const oDataParams = oreq
      .request()
      .withSelect(['Contact/FullName', 'ProfileTypeId', 'ProfileStatusId', 'PrimaryEmail', 'IsDraft', 'ContactId', 'Id'])
      .withExpand(['Contact'])
      .url();
    const newTableState = this.filterTableState();
    let isPreviousStateIsEquelToNewState: boolean;
    if (this.previousTableState) {
      const prevStateValues = { search: { ...this.previousTableState.search }, sort: { ...this.previousTableState.sort } };
      const currentStateValues = { search: { ...newTableState.search }, sort: { ...newTableState.sort } };
      isPreviousStateIsEquelToNewState = isEqual(prevStateValues, currentStateValues);
      if (!isPreviousStateIsEquelToNewState) {
        isPreviousStateIsEquelToNewState = true;
        newTableState.pagination.currentPage = 1;
        newTableState.pagination.start = 0;
        this.resetTableStateConfig();
      }
    }

    this.organizationApiService.getProfilesForOrganization(this.organizationId, newTableState, oDataParams).subscribe(result => {
      if (isPreviousStateIsEquelToNewState) {
        result.Items = this.html.commonLists.contactList.Items.concat(result.Items);
      }
      const filterVal = this.filterTableState();
      this.previousTableState = cloneDeep(newTableState);
      this.html.commonLists.contactList = result;
      this.scrollProgress = false;
    });
  }

  filterTableState() {
    const tableStateFilter: any = cloneDeep(this.html.tableState);
    const output: any = {};
    Object.keys(cloneDeep(this.html.tableState.search.predicateObject)).forEach(key => {
      if (this.html.tableState.search.predicateObject[key] && typeof this.html.tableState.search.predicateObject[key] === 'object' && this.html.tableState.search.predicateObject[key].length > 0) {
        output[key] = this.html.tableState.search.predicateObject[key];
      } else if (this.html.tableState.search.predicateObject[key] && typeof this.html.tableState.search.predicateObject[key] !== 'object') {
        output[key] = this.html.tableState.search.predicateObject[key];
      }
    });
    tableStateFilter.sort = tableStateFilter.sort.predicate === null ? {} : tableStateFilter.sort; // || filter status false
    tableStateFilter.search.predicateObject = output;
    return cloneDeep(tableStateFilter);
  }

  onScroll() {
    if (this.html.commonLists.contactList.Count > this.html.commonLists.contactList.Items.length && !this.scrollProgress) {
      this.scrollProgress = true;
      this.html.tableState.pagination.currentPage = this.html.tableState.pagination.currentPage + 1;
      this.html.tableState.pagination.start = this.html.tableState.pagination.start + 20;
      this.getContactList();
    }
  }

  sortBy(key: any) {
    if (this.html.tableState.sort.predicate === key) {
      this.sortNumber++;
      this.sortNumber = this.sortNumber > 2 ? 0 : this.sortNumber;
      switch (this.sortNumber) {
        case 0:
          this.html.tableState.sort.reverse = false;
          break;
        case 1:
          this.html.tableState.sort.reverse = true;
          break;
        case 2:
          this.html.tableState.sort.predicate = null;
          this.html.tableState.sort.reverse = false;
          break;
        default:
          break;
      }
    } else {
      this.html.tableState.sort.predicate = key;
      this.sortNumber = 0;
    }
    this.resetTableStateConfig();
    this.getContactList();
  }

  resetTableStateConfig() {
    this.html.commonLists.contactList = {
      Count: null,
      Items: [],
      NextPageLink: null
    };
    this.html.tableState.pagination.currentPage = 1;
    this.html.tableState.pagination.start = 0;
  }

  setTableStatePredicateObjectFromFilterOutput(event) {
    this.html.tableState.search.predicateObject[event.columnId] = this.processResult(event);
  }

  processResult(event) {
    if (event.columnId === this.html.organizationContactColumnsKey.Status || event.columnId === this.html.organizationContactColumnsKey.Profile) {
      return event.result.map(i => i.value);
    } else {
      return event.result.inputText ? '\'' + event.result.inputText + '\'' + event.result.selectedDropdownValue : null;
    }
  }

  onColumnClicked(event) {
    this.closeAllFilterPopup(event.columnId);
    switch (event) {
      case this.html.organizationContactColumnsKey.Name:
        this.inputFilterForName = {
          filterType: PhxConstants.FilterType.Dropdown,
          filterConfiguration: <TextBoxFilter>{
            inputText: null,
            selectedDropdownValue: null,
            usePrefix: false,
            items: {
              dropDownList: [
                {
                  valueField: '000',
                  textField: 'Found within'
                },
                {
                  valueField: '100',
                  textField: 'Start\'s with'
                },
                {
                  valueField: '200',
                  textField: 'Ends\'s with'
                }
              ],
              textField: 'textField',
              valueField: 'valueField',
              prefixField: null
            }
          }
        };
        this.html.filterSelectedStatus.isNameClicked = true;
        break;
      case this.html.organizationContactColumnsKey.Profile:
        this.inputFilterForProfile = {
          filterType: PhxConstants.FilterType.Checkbox,
          filterConfiguration: <CheckBoxFilter>{
            selectedValues: [],
            items: {
              list: [
                {
                  text: 'Organizational',
                  value: '1'
                },
                {
                  text: 'Internal',
                  value: '2'
                },
                {
                  text: 'Temp',
                  value: '3'
                },
                {
                  text: 'Canadian SP',
                  value: '4'
                },
                {
                  text: 'LLC Worker',
                  value: '5'
                },
                {
                  text: 'System',
                  value: '6'
                }
              ],
              textField: 'text',
              valueField: 'value'
            }
          }
        };
        this.html.filterSelectedStatus.isProfileClicked = true;
        break;
      case this.html.organizationContactColumnsKey.ProfilePrimaryEmail:
        this.inputFilterForProfilePrimaryEmail = {
          filterType: PhxConstants.FilterType.Dropdown,
          filterConfiguration: <TextBoxFilter>{
            inputText: null,
            selectedDropdownValue: null,
            usePrefix: false,
            items: {
              dropDownList: [
                {
                  valueField: '000',
                  textField: 'Found within'
                },
                {
                  valueField: '100',
                  textField: 'Start\'s with'
                },
                {
                  valueField: '200',
                  textField: 'Ends\'s with'
                }
              ],
              textField: 'textField',
              valueField: 'valueField',
              prefixField: null
            }
          }
        };
        this.html.filterSelectedStatus.isProfilePrimaryEmailClicked = true;
        break;
      case this.html.organizationContactColumnsKey.Status:
        this.inputFilterForStatus = {
          filterType: PhxConstants.FilterType.Checkbox,
          filterConfiguration: <CheckBoxFilter>{
            selectedValues: [],
            items: {
              list: [
                {
                  text: 'Active',
                  value: '1'
                },
                {
                  text: 'Draft',
                  value: '4'
                },
                {
                  text: 'Pending Review',
                  value: '6'
                },
                {
                  text: 'Pending Change',
                  value: '7'
                }
              ],
              textField: 'text',
              valueField: 'value'
            }
          }
        };
        this.html.filterSelectedStatus.isStatusClicked = true;
        break;
      default:
        break;
    }
  }

  closeAllFilterPopup(event?: any) {
    switch (event) {
      case this.html.organizationContactColumnsKey.Name:
        this.html.filterSelectedStatus.isNameClicked = false;
        break;
      case this.html.organizationContactColumnsKey.Profile:
        this.html.filterSelectedStatus.isProfileClicked = false;
        break;
      case this.html.organizationContactColumnsKey.ProfilePrimaryEmail:
        this.html.filterSelectedStatus.isProfilePrimaryEmailClicked = false;
        break;
      case this.html.organizationContactColumnsKey.Status:
        this.html.filterSelectedStatus.isStatusClicked = false;
        break;
      default:
        break;
    }
  }

  onGo(event) {
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup(event.columnId);
    this.getContactList();
  }

  onClear(event) {
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup(event.columnId);
    this.getContactList();
  }

  goToContact(item){
    this.router.navigate(['/next', 'contact', item.ContactId, 'profile', this.getProfileType(item), item.Id]);
  }

  private getProfileType(rowdata) {
    let profiletype = null;
    switch (rowdata.ProfileTypeId) {
      case 1: profiletype = 'organizational'; break;
      case 2: profiletype = 'internal'; break;
      case 3: profiletype = 'workertemp'; break;
      case 4: profiletype = 'workercanadiansp'; break;
      case 5: profiletype = 'workercanadianinc'; break;
      case 6: profiletype = 'workersubvendor'; break;
      case 7: profiletype = 'workerunitedstatesw2'; break;
      case 8: profiletype = 'workerunitedstatesllc'; break;
      default: profiletype = ''; break;
    }
    return profiletype;
  }
}

