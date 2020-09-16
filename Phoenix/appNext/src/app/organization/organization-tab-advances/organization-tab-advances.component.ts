// angular
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
// common
import { PhxConstants, CommonService, CodeValueService } from '../../common/index';
import { IOrganization, IReadOnlyStorage, OrganizationAdvanceColumnsKey, TableFilterConfiguration } from '../state';
import { EntityAccessActionExists, AccessAction } from '../../common/model';
// organization
import { OrganizationObservableService } from './../state/organization.observable.service';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { OrganizationApiService } from '../organization.api.service';
import { isEqual, cloneDeep } from 'lodash';
import { InputFilter, TextBoxFilter, CheckBoxFilter } from '../../common/model/advance-filter/phx-advance-filter';
import { AuthService } from '../../common/services/auth.service';

declare var oreq;

@Component({
  selector: 'app-organization-tab-advances',
  templateUrl: './organization-tab-advances.component.html',
  styleUrls: ['./organization-tab-advances.component.less']
})
export class OrganizationTabAdvancesComponent extends BaseComponentActionContainer implements OnInit {
  @ViewChild('modalAdvanceNew') modalAdvanceNew: PhxModalComponent;
  @ViewChild('modalAdvanceEdit') modalAdvanceEdit: PhxModalComponent;
  @Output() countRefreshEvent = new EventEmitter();
  public organization: IOrganization = null;
  public readOnlyStorage: IReadOnlyStorage;
  html: {
    codeValueGroups: any;
    organizationAdvanceColumnsKey: any;
    scrollConfig: {
      infiniteScrollDistance: number;
      scrollWindow: boolean;
      infiniteScrollThrottle: number;
    };
    commonLists: {
      statusList: any;
      advanceList: {
        Count: number;
        Items: Array<any>;
        NextPageLink: any;
      }
    };
    filterSelectedStatus: {
      isIdClicked: boolean;
      isDescriptionClicked: boolean;
      isAdvanceAmountClicked: boolean;
      isPaidAmountClicked: boolean;
      isPaybackRemainderClicked: boolean;
      isStatusClicked: boolean;
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
    access: {
      organizationIndependentContractorRoleAdvanceView: boolean,
      organizationIndependentContractorRoleAdvanceNew: boolean,
      organizationIndependentContractorRoleAdvanceSubmit: boolean,
      organizationSubvendorRoleAdvanceView: boolean
    }
  } = {
      codeValueGroups: null,
      organizationAdvanceColumnsKey: null,
      scrollConfig: {
        infiniteScrollDistance: 2,
        scrollWindow: false,
        infiniteScrollThrottle: 750
      },
      commonLists: {
        statusList: [],
        advanceList: {
          Count: null,
          Items: [],
          NextPageLink: null
        }
      },
      filterSelectedStatus: {
        isIdClicked: false,
        isDescriptionClicked: false,
        isAdvanceAmountClicked: false,
        isPaidAmountClicked: false,
        isPaybackRemainderClicked: false,
        isStatusClicked: false
      },
      tableState: {
        isLoadedFromPreviousState: false,
        pagination: {
          currentPage: 1,
          number: 30,
          pageSize: 30,
          start: 0
        },
        search: {
          predicateObject: {}
        },
        sort: {
          predicate: OrganizationAdvanceColumnsKey.Id,
          reverse: false
        }
      },
      access: {
        organizationIndependentContractorRoleAdvanceView: false,
        organizationIndependentContractorRoleAdvanceNew: false,
        organizationIndependentContractorRoleAdvanceSubmit: false,
        organizationSubvendorRoleAdvanceView: false
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
  organizationId: number;
  sortNumber: number = 0;
  previousTableState: any;
  scrollProgress: boolean;
  inputFilterForId: InputFilter;
  inputFilterForDescription: InputFilter;
  inputFilterForAmountInitial: InputFilter;
  inputFilterForPaidAmount: InputFilter;
  inputFilterForPaybackRemainder: InputFilter;
  inputFilterForStatus: InputFilter;
  listCurrency: any;
  activeAny: boolean;
  activeAdvanceCount: number;
  inputFilter: any;
  advanceId: number;

  constructor(private commonService: CommonService,
    private organizationObservableService: OrganizationObservableService,
    private codeValueService: CodeValueService,
    private organizationApiService: OrganizationApiService,
    private authService: AuthService) {
    super();
    this.html.organizationAdvanceColumnsKey = OrganizationAdvanceColumnsKey;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.getCodeValuelistsStatic();
  }

  getCodeValuelistsStatic() {
    this.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true);
  }

  ngOnInit() {
    this.html.commonLists.statusList = this.codeValueService.getCodeValues(this.html.codeValueGroups.AdvanceStatuses, true);
    this.html.tableState.search.predicateObject[this.html.organizationAdvanceColumnsKey.Id] = null;
    this.html.tableState.search.predicateObject[this.html.organizationAdvanceColumnsKey.Description] = null;
    this.html.tableState.search.predicateObject[this.html.organizationAdvanceColumnsKey.AmountInitial] = null;
    this.html.tableState.search.predicateObject[this.html.organizationAdvanceColumnsKey.PaidAmount] = null;
    this.html.tableState.search.predicateObject[this.html.organizationAdvanceColumnsKey.PaybackRemainder] = null;
    this.html.tableState.search.predicateObject[this.html.organizationAdvanceColumnsKey.AdvanceStatusId] = [];
    this.organizationObservableService
      .organizationOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(organization => {
        if (organization) {
          this.organizationId = organization.Id;
          this.onInitOrganization(organization);
          this.resetTableStateConfig();
          this.getAdvanceData();
        }
      });
    this.modalAdvanceNew.addClassToConfig('modal-lg');
    this.modalAdvanceEdit.addClassToConfig('modal-lg');
  }

  resetTableStateConfig() {
    this.html.commonLists.advanceList = {
      Count: null,
      Items: [],
      NextPageLink: null
    };
    this.html.tableState.pagination.currentPage = 1;
    this.html.tableState.pagination.start = 0;
  }

  getAdvanceData() {
    const oDataParams = oreq
      .request()
      .withSelect(['Id', 'Description', 'AmountInitial', 'PaidAmount', 'PaybackRemainder', 'CurrencyId', 'AdvanceStatusId'])
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
    this.organizationApiService.getListAdvancesByOriginalAndStatusIsActiveOrPendingChangeOrganization(this.organizationId, newTableState, oDataParams).subscribe((result: any) => {
      if (isPreviousStateIsEquelToNewState) {
        result.Items = this.html.commonLists.advanceList.Items.concat(result.Items);
      }
      this.previousTableState = cloneDeep(newTableState);
      this.scrollProgress = false;
      this.html.commonLists.advanceList = result;
    });
    this.getActiveAdvanceCount();
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
    tableStateFilter.sort = tableStateFilter.sort.predicate === null ? {} : tableStateFilter.sort;
    tableStateFilter.search.predicateObject = output;
    return cloneDeep(tableStateFilter);
  }

  getActiveAdvanceCount() {
    this.organizationApiService.refreshActiveAdvancesAndActiveGarnisheesCount(this.organization.Id).subscribe((response: any) => {
      this.activeAdvanceCount = response.ActiveAdvancesCount;
      this.activeAny = (this.activeAdvanceCount > 0);
    });
  }


  onInitOrganization(organization: IOrganization) {
    this.organization = organization;
    this.readOnlyStorage = organization.ReadOnlyStorage;
    this.recalcCodeValueLists(organization);
    this.recalcLocalProperties(organization);
    this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
  }

  recalcCodeValueLists(organization: IOrganization) { }

  recalcLocalProperties(organization: IOrganization) { }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
    this.html.access.organizationIndependentContractorRoleAdvanceView =
      this.organization.IsOriginalAndStatusIsAtiveOrPendingChange &&
      this.organization.IsOrganizationIndependentContractorRole &&
      this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationIndependentContractorRoleAdvanceView);

    this.html.access.organizationIndependentContractorRoleAdvanceNew =
      this.organization.IsOriginalAndStatusIsAtiveOrPendingChange &&
      this.organization.IsOrganizationIndependentContractorRole &&
      this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationIndependentContractorRoleAdvanceNew);

    this.html.access.organizationIndependentContractorRoleAdvanceSubmit =
      this.organization.IsOriginalAndStatusIsAtiveOrPendingChange &&
      this.organization.IsOrganizationIndependentContractorRole &&
      this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationIndependentContractorRoleAdvanceSubmit);

    this.html.access.organizationSubvendorRoleAdvanceView =
      this.organization.IsOriginalAndStatusIsAtiveOrPendingChange &&
      this.organization.IsOrganizationSubVendorRole &&
      this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationSubvendorRoleAdvanceView);
  }

  onScroll() {
    if (this.html.commonLists.advanceList.Count > this.html.commonLists.advanceList.Items.length) {
      this.html.tableState.pagination.currentPage = this.html.tableState.pagination.currentPage + 1;
      this.html.tableState.pagination.start = this.html.tableState.pagination.start + 20;
      this.getAdvanceData();
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
    this.getAdvanceData();
  }


  setTableStatePredicateObjectFromFilterOutput(event) {
    this.html.tableState.search.predicateObject[event.columnId] = this.processResult(event);
  }

  processResult(event) {
    if (event.columnId === this.html.organizationAdvanceColumnsKey.AdvanceStatusId) {
      return event.result.map(i => i.value);
    } else if (event.columnId === this.html.organizationAdvanceColumnsKey.Description) {
      return event.result.inputText ? '\'' + event.result.inputText + '\'' + event.result.selectedDropdownValue : null;
    } else {
      return event.result.inputText ? event.result.inputText + event.result.selectedDropdownValue : null;
    }
  }

  getInputFilter() {
    return {
      filterType: PhxConstants.FilterType.Dropdown,
      filterConfiguration: <TextBoxFilter>{
        inputText: null,
        selectedDropdownValue: null,
        usePrefix: true,
        items: {
          dropDownList: [
            {
              textField: 'Equal (Exact Value)',
              valueField: '000',
              prefixField: '='
            },
            {
              textField: 'Not equal',
              valueField: '100',
              prefixField: '!='
            },
            {
              textField: 'Greater than',
              valueField: '200',
              prefixField: '>'
            },
            {
              textField: 'Greater than or equal',
              valueField: '300',
              prefixField: '>='
            },
            {
              textField: 'Less than',
              valueField: '400',
              prefixField: '<'
            },
            {
              textField: 'Less than or equal',
              valueField: '500',
              prefixField: '<='
            }
          ],
          textField: 'textField',
          valueField: 'valueField',
          prefixField: 'prefixField'
        }
      }
    };
  }

  onColumnClicked(event) {
    this.closeAllFilterPopup();
    switch (event) {
      case this.html.organizationAdvanceColumnsKey.Id:
        this.inputFilterForId = this.getInputFilter();
        this.html.filterSelectedStatus.isIdClicked = true;
        break;
      case this.html.organizationAdvanceColumnsKey.Description:
        this.inputFilterForDescription = {
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
        this.html.filterSelectedStatus.isDescriptionClicked = true;
        break;
      case this.html.organizationAdvanceColumnsKey.AmountInitial:
        this.inputFilterForAmountInitial = this.getInputFilter();
        this.html.filterSelectedStatus.isAdvanceAmountClicked = true;
        break;
      case this.html.organizationAdvanceColumnsKey.PaidAmount:
        this.inputFilterForPaidAmount = this.getInputFilter();
        this.html.filterSelectedStatus.isPaidAmountClicked = true;
        break;
      case this.html.organizationAdvanceColumnsKey.PaybackRemainder:
        this.inputFilterForPaybackRemainder = this.getInputFilter();
        this.html.filterSelectedStatus.isPaybackRemainderClicked = true;
        break;
      case this.html.organizationAdvanceColumnsKey.AdvanceStatusId:
        this.inputFilterForStatus = {
          filterType: PhxConstants.FilterType.Checkbox,
          filterConfiguration: <CheckBoxFilter>{
            selectedValues: [],
            items: {
              list: [
                {
                  text: 'Active',
                  // tslint:disable-next-line:quotemark
                  value: "'1'"
                },
                {
                  text: 'Complete',
                  // tslint:disable-next-line:quotemark
                  value: "'2'"
                },
                {
                  text: 'Cancelled',
                  // tslint:disable-next-line:quotemark
                  value: "'3'"
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

  closeAllFilterPopup() {
    this.html.filterSelectedStatus.isIdClicked = false;
    this.html.filterSelectedStatus.isDescriptionClicked = false;
    this.html.filterSelectedStatus.isAdvanceAmountClicked = false;
    this.html.filterSelectedStatus.isPaidAmountClicked = false;
    this.html.filterSelectedStatus.isPaybackRemainderClicked = false;
    this.html.filterSelectedStatus.isStatusClicked = false;
  }

  onGo(event) {
    this.resetTableStateConfig();
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup();
    this.getAdvanceData();
  }

  onClear(event) {
    this.resetTableStateConfig();
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup();
    this.getAdvanceData();
  }

  onOutputEvent(event: any) {
    this.resetTableStateConfig();
    this.getAdvanceData();
    this.countRefreshEvent.emit();
  }

  onClickAddNewAdvance() {
    this.modalAdvanceNew.show();
  }

  onClickEditAdvance(id: number) {
    this.advanceId = id;
    this.modalAdvanceEdit.show();
  }
}
