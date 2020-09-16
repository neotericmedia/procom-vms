import * as moment from 'moment';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { WorkflowAction } from './../../../common/model/workflow-action';
import { ExpenseClaimService } from './../../service/expense-claim.service';
import { ExpenseClaim } from './../../model';
import { NavigationBarItem, DialogResultType, StateAction, StateActionDisplayType } from '../../../common/model/index';
import { NavigationService, PhxLocalizationService, DialogService, CommonService } from '../../../common/index';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';
import { PhxConstants } from '../../../common/PhoenixCommon.module';

const MAX_PHONE_EXPENSE = 54;
const CATEGORY_INTERNAL = PhxConstants.ExpenseCategoryInternal;
const RES_KEYS = ExpenseModuleResourceKeys;

const Command = PhxConstants.ExpenseClaimStateActionCommand;
const EntityType = PhxConstants.EntityType;
const StateAction = PhxConstants.StateAction;

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.less']
})
export class ExpenseDetailComponent implements OnInit, OnDestroy {
  id: number;
  isAlive: boolean = true;
  editable: boolean = true;
  expenseClaim: ExpenseClaim;
  validationMessages: {};

  currentUrl: string;
  tabList: NavigationBarItem[];
  stateActions: StateAction[];

  ActionDisplayType = StateActionDisplayType;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private expenseClaimService: ExpenseClaimService,
    private dialogService: DialogService,
    private localizationSvc: PhxLocalizationService,
    private navigationService: NavigationService,
    private commonService: CommonService,
  ) {
  }

  ngOnInit() {
    this.navigationService.setTitle('expense-claim-edit');
    this.currentUrl = this.router.url;

    this.tabList = [
      {
        Id: 1,
        Name: 'detail',
        Path: './detail',
        DisplayText: this.localizationSvc.translate(RES_KEYS.detail.detailTab),
        Icon: '',
        IsDefault: true,
      }, {
        Id: 2,
        Name: 'notes',
        Path: './notes',
        DisplayText: this.localizationSvc.translate(RES_KEYS.detail.notesAndAttachmentsTab),
        Icon: '',
        IsDefault: false,
      }, {
        Id: 3,
        Name: 'history',
        Path: './history',
        DisplayText: this.localizationSvc.translate(RES_KEYS.detail.historyTab),
        Icon: '',
        IsDefault: false,
      }
    ];

    this.router.events
      .takeWhile(() => this.isAlive)
      .subscribe(
        (val) => {
          if (val instanceof NavigationEnd) {
            this.currentUrl = val.url;
          }
        });

    this.route.params
      .takeWhile(() => this.isAlive)
      .subscribe(params => {
        this.id = +params['Id'];
        this.loadExpense(this.id, true);
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadExpense(id: number, force: boolean = false) {

    this.expenseClaimService.getExpenseClaim(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe(data => {
        if (data) {
          this.expenseClaim = data;
          this.expenseClaimService.getExpenseClaimItems(this.id);
          this.setExpenseClaimEditableStatus(this.expenseClaim);

          this._initStateActions();
        }
      });
  }

  setExpenseClaimEditableStatus(expenseClaim: ExpenseClaim) {
    this.expenseClaimService.isEditable(expenseClaim)
      .first()
      .subscribe((data) => this.editable = data);
  }

  _initStateActions() {
    const self = this;
    self.stateActions = [
      { displayText: 'Discard',
        commandName: Command.ExpenseClaimDiscard,
        actionId: StateAction.ExpenseClaimDiscardState,
        onClick: function(action, componentOption, actionOption) {
          self.dialogService.confirm( 'Discard', self.localizationSvc.translate(RES_KEYS.detail.discardConfirmationMessage))
            .then((button) => {
              if (button === DialogResultType.Yes) {
                self.executeAction(action.commandName, null);
              }
            });
        }
      },
      { displayText: 'Submit',
        commandName: Command.ExpenseClaimSubmit,
        actionId: StateAction.ExpenseClaimSubmitState,
        onClick: function(action, componentOption, actionOption) {

          const items = self.expenseClaim.ExpenseItems.filter(item => item.Total > MAX_PHONE_EXPENSE && item.ExpenseCategoryId === CATEGORY_INTERNAL.PhoneAndInternet);
          if (items.length > 0) {
            self.dialogService.confirm('Submit', self.localizationSvc.translate(RES_KEYS.detail.phoneExpenseOverage, self.localizationSvc.formatMoney(MAX_PHONE_EXPENSE)))
              .then(btn => {
                if (btn === DialogResultType.Yes) {
                  self.executeAction(action.commandName, null);
                }
              });
          } else {
            self.executeAction(action.commandName, null);
          }
        }
      },
      { displayText: 'Approve',
        commandName: Command.ExpenseClaimApprove,
        actionId: StateAction.ExpenseClaimApproveState,
        onClick: function(action, componentOption, actionOption) {
          self.executeAction(action.commandName, null);
        }
      },
      { displayText: 'Decline',
        commandName: Command.ExpenseClaimDecline,
        actionId: StateAction.ExpenseClaimDeclineState,
        onClick: function(action, componentOption, actionOption) {
          self.executeAction(action.commandName, null);
        }
      },
      { displayText: 'Recall',
        commandName: Command.ExpenseClaimRecall,
        actionId: StateAction.ExpenseClaimRecallState,
        onClick: function(action, componentOption, actionOption) {
          self.executeAction(action.commandName, null);
        }
      }
    ];
  }

  executeAction(commandName: string, comments: string) {
    const payload = { EntityIds: [ this.expenseClaim.Id ], EntityTypeId: EntityType.ExpenseClaim };
    this.expenseClaimService.executeExpenseCommand(commandName, comments, payload).then(x => {
      this.validationMessages = {};
      this.expenseClaimService.clearItemsValidationErrors(this.expenseClaim.Id);
    }).catch(err => {
      this.validationMessages = this.parseValidationMessages(err.ModelState);
    });
  }

  getActionCssClass(action: WorkflowAction): string {
    if (
      action.CommandName.includes('Submit') ||
      action.CommandName.includes('Approve')) {
      return 'primary';
    } else {
      return '';
    }
  }

  parseValidationMessages(messages: any) {
    const result = {};
    if (messages) {
      Object.keys(messages).forEach(item => {

        // this is validation error related to item
        if (item.startsWith(`command.Entity.ExpenseItems[`)) {

          const itemIndex = item.match(/^\d+|\d+\b|\d+(?=\w)/g)
            .map(function (v) { return +v; })[0];

          const expenseItem = this.expenseClaim.ExpenseItems.sort((a, b) => a.Id - b.Id)[itemIndex];
          this.expenseClaimService.addItemsValidationErrors(this.expenseClaim.Id, expenseItem.Id, messages[item]);

          // If we add Amount to rowTitle then if it has cents the title will be truncated
          const rowTitle = `${expenseItem.ExpenseCategory.DisplayName}${expenseItem.DateIncurred ? ', ' + moment(expenseItem.DateIncurred).format('MMM DD YYYY') : ''}`;

          // adding Id to key to make it unique, also add it before Item with a dot to be truncated in ValidationMessage.component.cs
          const key = `[${expenseItem.Id}].Item (${rowTitle})`;

          result[key] = (result[key] || []).concat(messages[item]);
        } else {
          result[item] = messages[item];
        }
      });
      return Object.assign({}, { ModelState: result });
    } else {
      this.expenseClaimService.clearItemsValidationErrors(this.expenseClaim.Id);
      return {};
    }
  }
}
