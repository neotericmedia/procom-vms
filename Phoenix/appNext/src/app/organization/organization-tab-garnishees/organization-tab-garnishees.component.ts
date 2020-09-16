// angular
import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
// common
import { PhxConstants, CommonService, CodeValueService } from '../../common/index';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { EntityAccessActionExists, AccessAction } from '../../common/model';
// organization
import { OrganizationObservableService } from './../state/organization.observable.service';
import { IOrganization, IReadOnlyStorage, OrganizationGarnisheeColumnsKey, TableFilterConfiguration } from '../state';
import { InputFilter, TextBoxFilter, CheckBoxFilter } from '../../common/model/advance-filter/phx-advance-filter';
import { OrganizationApiService } from '../organization.api.service';
import { isEqual, cloneDeep } from 'lodash';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { AuthService } from '../../common/services/auth.service';

declare var oreq;

@Component({
  selector: 'app-organization-tab-garnishees',
  templateUrl: './organization-tab-garnishees.component.html',
  styleUrls: ['./organization-tab-garnishees.component.less']
})
export class OrganizationTabGarnisheesComponent extends BaseComponentActionContainer implements OnInit {
  public organization: IOrganization = null;
  public readOnlyStorage: IReadOnlyStorage;
  @ViewChild('modalGarnisheeNew') modalGarnisheeNew: PhxModalComponent;
  @ViewChild('modalGarnisheeEdit') modalGarnisheeEdit: PhxModalComponent;
  @Output() countRefreshEvent = new EventEmitter();
  organizationId: number;
  currentSelectedColumn: string;
  sortNumber: number = 0;
  previousTableState: any;
  selectedPredicateKey: any;
  scrollProgress: boolean;
  inputFilterForId: InputFilter;
  inputFilterForDescription: InputFilter;
  inputFilterForPayAmountMax: InputFilter;
  inputFilterForPayAmount: InputFilter;
  inputFilterForPaidAmount: InputFilter;
  inputFilterForPaybackRemainder: InputFilter;
  inputFilterForStatus: InputFilter;
  listCurrency: any;
  activeAny: boolean;
  activeGarnisheesCount: number;
  inputFilter: any;
  garnisheeId: number;
  html: {
    codeValueGroups: any;
    organizationGarnisheeColumnsKey: any;
    scrollConfig: {
      infiniteScrollDistance: number;
      scrollWindow: boolean;
      infiniteScrollThrottle: number;
    };
    commonLists: {
      garnisheeStatusesList: any;
      garnisheeList: {
        Count: number;
        Items: Array<any>;
        NextPageLink: any;
      }
    };
    filterSelectedStatus: {
      isIdClicked: boolean;
      isDescriptionClicked: boolean;
      isPayAmountClicked: boolean;
      isPayAmountMaxClicked: boolean;
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
      organizationIndependentContractorRoleGarnisheeView: boolean;
      organizationIndependentContractorRoleGarnisheeNew: boolean;
      organizationIndependentContractorRoleGarnisheeSubmit: boolean;
    }
  } = {
      codeValueGroups: null,
      organizationGarnisheeColumnsKey: null,
      scrollConfig: {
        infiniteScrollDistance: 2,
        scrollWindow: false,
        infiniteScrollThrottle: 750
      },
      commonLists: {
        garnisheeStatusesList: [],
        garnisheeList: {
          Count: null,
          Items: [],
          NextPageLink: null
        }
      },
      filterSelectedStatus: {
        isIdClicked: false,
        isDescriptionClicked: false,
        isPayAmountClicked: false,
        isPayAmountMaxClicked: false,
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
          predicate: OrganizationGarnisheeColumnsKey.Id,
          reverse: false
        }
      },
      access: {
        organizationIndependentContractorRoleGarnisheeView: false,
        organizationIndependentContractorRoleGarnisheeNew: false,
        organizationIndependentContractorRoleGarnisheeSubmit: false
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
    private authService: AuthService,
    private organizationObservableService: OrganizationObservableService,
    private codeValueService: CodeValueService,
    private organizationApiService: OrganizationApiService) {
    super();
    this.html.organizationGarnisheeColumnsKey = OrganizationGarnisheeColumnsKey;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.getCodeValuelistsStatic();
  }

  getCodeValuelistsStatic() {
    this.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true);
  }

  ngOnInit() {

    this.html.commonLists.garnisheeStatusesList = this.codeValueService.getCodeValues(this.html.codeValueGroups.GarnisheeStatuses, true);
    this.html.tableState.search.predicateObject[this.html.organizationGarnisheeColumnsKey.Id] = null;
    this.html.tableState.search.predicateObject[this.html.organizationGarnisheeColumnsKey.Description] = null;
    this.html.tableState.search.predicateObject[this.html.organizationGarnisheeColumnsKey.PayAmountMaximum] = null;
    this.html.tableState.search.predicateObject[this.html.organizationGarnisheeColumnsKey.PaidAmount] = null;
    this.html.tableState.search.predicateObject[this.html.organizationGarnisheeColumnsKey.PaybackRemainder] = null;
    this.html.tableState.search.predicateObject[this.html.organizationGarnisheeColumnsKey.GarnisheeStatusId] = [];
    this.organizationObservableService
      .organizationOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(organization => {
        if (organization) {
          this.organizationId = organization.Id;
          this.onInitOrganization(organization);
          this.resetTableStateConfig();
          this.getGarnisheeData();
        }
      });
    this.modalGarnisheeNew.addClassToConfig('modal-lg garnishee-modal');
    this.modalGarnisheeEdit.addClassToConfig('modal-lg garnishee-modal');
  }

  resetTableStateConfig() {
    this.html.commonLists.garnisheeList = {
      Count: null,
      Items: [],
      NextPageLink: null
    };
    this.html.tableState.pagination.currentPage = 1;
    this.html.tableState.pagination.start = 0;
  }

  getGarnisheeData() {
    const oDataParams = oreq.request().withSelect(['Id', 'Description', 'PayAmount', 'PayAmountMaximum', 'PayAmountIsMaximum', 'PaidAmount', 'PaybackRemainder', 'CurrencyId', 'GarnisheeStatusId']).url();
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

    this.organizationApiService.getListGarnisheesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(this.organizationId, newTableState, oDataParams).subscribe((result: any) => {
      if (isPreviousStateIsEquelToNewState) {
        result.Items = this.html.commonLists.garnisheeList.Items.concat(result.Items);
      }
      this.previousTableState = cloneDeep(newTableState);
      this.scrollProgress = false;
      this.html.commonLists.garnisheeList = result;
    });

    this.getActiveGarnisheeCount();
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

  getActiveGarnisheeCount() {
    this.organizationApiService.refreshActiveAdvancesAndActiveGarnisheesCount(this.organization.Id).subscribe((response: any) => {
      this.activeGarnisheesCount = response.ActiveGarnisheesCount;
      this.activeAny = (this.activeGarnisheesCount > 0);
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

    this.html.access.organizationIndependentContractorRoleGarnisheeView =
      this.organization.IsOriginalAndStatusIsAtiveOrPendingChange &&
      this.organization.IsOrganizationIndependentContractorRole &&
      this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationIndependentContractorRoleGarnisheeView);

    this.html.access.organizationIndependentContractorRoleGarnisheeNew =
      this.organization.IsOriginalAndStatusIsAtiveOrPendingChange &&
      this.organization.IsOrganizationIndependentContractorRole &&
      this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationIndependentContractorRoleGarnisheeNew);

    this.html.access.organizationIndependentContractorRoleGarnisheeSubmit =
      this.organization.IsOriginalAndStatusIsAtiveOrPendingChange &&
      this.organization.IsOrganizationIndependentContractorRole &&
      this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationIndependentContractorRoleGarnisheeSubmit);
  }

  onScroll() {
    if (this.html.commonLists.garnisheeList.Count > this.html.commonLists.garnisheeList.Items.length) {
      this.html.tableState.pagination.currentPage = this.html.tableState.pagination.currentPage + 1;
      this.html.tableState.pagination.start = this.html.tableState.pagination.start + 20;
      this.getGarnisheeData();
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
    this.getGarnisheeData();
  }

  setTableStatePredicateObjectFromFilterOutput(event) {
    this.html.tableState.search.predicateObject[event.columnId] = this.processResult(event);
  }

  processResult(event) {
    if (event.columnId === this.html.organizationGarnisheeColumnsKey.GarnisheeStatusId) {
      return event.result.map(i => i.value);
    } else if (event.columnId === this.html.organizationGarnisheeColumnsKey.Description) {
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
      case this.html.organizationGarnisheeColumnsKey.Id:
        this.inputFilterForId = this.getInputFilter();
        this.html.filterSelectedStatus.isIdClicked = true;
        break;
      case this.html.organizationGarnisheeColumnsKey.Description:
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
      case this.html.organizationGarnisheeColumnsKey.PayAmount:
        this.inputFilterForPayAmount = this.getInputFilter();
        this.html.filterSelectedStatus.isPayAmountClicked = true;
        break;
      case this.html.organizationGarnisheeColumnsKey.PayAmountMaximum:
        this.inputFilterForPayAmountMax = this.getInputFilter();
        this.html.filterSelectedStatus.isPayAmountMaxClicked = true;
        break;
      case this.html.organizationGarnisheeColumnsKey.PaidAmount:
        this.inputFilterForPaidAmount = this.getInputFilter();
        this.html.filterSelectedStatus.isPaidAmountClicked = true;
        break;
      case this.html.organizationGarnisheeColumnsKey.PaybackRemainder:
        this.inputFilterForPaybackRemainder = this.getInputFilter();
        this.html.filterSelectedStatus.isPaybackRemainderClicked = true;
        break;
      case this.html.organizationGarnisheeColumnsKey.GarnisheeStatusId:
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
                  text: 'Complete',
                  value: '2'
                },
                {
                  text: 'Cancelled',
                  value: '3'
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
    this.html.filterSelectedStatus.isPayAmountClicked = false;
    this.html.filterSelectedStatus.isPayAmountMaxClicked = false;
    this.html.filterSelectedStatus.isPaidAmountClicked = false;
    this.html.filterSelectedStatus.isPaybackRemainderClicked = false;
    this.html.filterSelectedStatus.isStatusClicked = false;
  }

  onGo(event) {
    this.resetTableStateConfig();
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup();
    this.getGarnisheeData();
  }

  onClear(event) {
    this.resetTableStateConfig();
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup();
    this.getGarnisheeData();
  }

  onOutputEvent(event: any) {
    this.resetTableStateConfig();
    this.getGarnisheeData();
    this.countRefreshEvent.emit();
  }

  onClickAddNewGarnishee() {
    this.modalGarnisheeNew.show();
  }

  onClickEditGarnishee(id: number) {
    this.garnisheeId = id;
    this.modalGarnisheeEdit.show();
  }
}
