import { CodeValueGroups } from './../../model/phx-code-value-groups';
import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { orderBy } from 'lodash';
import { PhxLocalizationService, CodeValueService } from './../../';
import { StateAction, OnClickStateActionOption, StateActionDisplayType, StateActionButtonsOption, StateActionButtonStyle } from '../../model';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-phx-state-action-buttons',
  templateUrl: './phx-state-action-buttons.component.html',
  styleUrls: ['./phx-state-action-buttons.component.less'],
})
export class PhxStateActionButtonsComponent implements OnInit, OnChanges {
  /**
   * The configuration of actions.
   * Refer to the StateAction interface for more details.
   */
  @Input() stateActions: StateAction[] = [];

  /**
   * The display type of the component.
   * Refer to the StateActionDisplayType for available options.
   */
  @Input() displayType: StateActionDisplayType = StateActionDisplayType.BUTTON;

  /**
   * An array of actionIds provided by backend.
   * This is used to check if the action is currently available based on access restrictions.
   */
  @Input() availableStateActions: number[] = [];

  /**
   * Reference data that will be passed back to call back functions in componentOption
   */
  @Input() refData: any;

  _actionClicked: StateAction;
  executing = false;

  public filteredStateActions: StateAction[];

  constructor(
    private localizationService: PhxLocalizationService,
    private codeValueService: CodeValueService,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef,
  ) {

  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.stateActions) { // remove currentValue check because it should support null
        this.configStateActions();
        this.sortStateActions();
        this.filterStateActions();
      } else if (changes.availableStateActions) { // remove currentValue check because it should support null
        this.filterStateActions();
      }
    }
  }

  showDropdown() {
    return this.displayType === StateActionDisplayType.DROPDOWN;
  }

  showButton() {
    return this.displayType === StateActionDisplayType.BUTTON;
  }

  showSmallButton() {
    return this.displayType === StateActionDisplayType.SMALL_BUTTON;
  }

  showButtonWithElipsis() {
    return this.displayType === StateActionDisplayType.BUTTON_WITH_ELIPSIS;
  }

  isActionHidden(action: StateAction) {
    let hidden: boolean = false;
    if (action.hiddenFn) {
      hidden = action.hiddenFn(action, this.getComponentOption());
    }
    return hidden;
  }

  isActionDisabled(action: StateAction) {
    let disabled: boolean = false;
    if (action.disabledFn) {
      disabled = action.disabledFn(action, this.getComponentOption());
    }
    return disabled;
  }

  onClickAction(action: StateAction) {
    if (!this.isActionDisabled(action) && !this.isActionHidden(action)) {
      this._actionClicked = action;
      if (action.showDeclinedCommentDialog) {
        this.showDeclinedCommentDialog();
      } else {
        this.executeAction(action);
      }
    }
  }

  executeAction(action: StateAction, option?: OnClickStateActionOption) {
    if (!this.executing) {
      this.executing = true;
      action.onClick(action, this.getComponentOption(), option);
      setTimeout(() => {
        this.executing = false;
        this.cd.detectChanges();
      }, 1000);
    } else {
      console.warn('The following action was not executed because another action is currently executing:');
      console.warn(action);
    }
  }

  showDeclinedCommentDialog() {
    this.dialogService
      .comment(
        this._actionClicked.displayText,
        this.localizationService.translate('common.phxWorkflowButtons.declineHelpblock', this._actionClicked.displayText),
        this.localizationService.translate('common.phxWorkflowButtons.declineReasonLabel', this._actionClicked.displayText.toLowerCase()),
        4000,
        this._actionClicked.displayText,
        { size: 'md' }
      )
      .then(comment => {
        this.executeAction(this._actionClicked, {
          comment: comment
        });
      });
  }

  getComponentOption(): StateActionButtonsOption {
    return {
      displayType: this.displayType,
      refData: this.refData
    };
  }

  configStateActions() {
    this.stateActions = this.stateActions || [];
    this.stateActions.forEach((action: StateAction) => {
      if (action.actionId && !action.displayText) {
        action.displayText = this.codeValueService.getCodeValueText(action.actionId, CodeValueGroups.StateAction);
      }
      if (action.actionId && !action.commandName) {
        action.commandName = this.codeValueService.getCodeValueCode(action.actionId, CodeValueGroups.StateAction);
      }
      action._primaryAction = action.style === StateActionButtonStyle.PRIMARY;
      action._secondaryAction = action.style === StateActionButtonStyle.SECONDARY;
      action._dangerAction = action.style === StateActionButtonStyle.DANGER;
      action._warningAction = action.style === StateActionButtonStyle.WARNING;
    });
  }

  sortStateActions() {
    this.stateActions = orderBy(this.stateActions, ['_primaryAction', '_dangerAction', '_warningAction', '_secondaryAction', 'sortOrder'], ['desc', 'desc', 'desc', 'desc', 'asc']);
    if (this.showButton() || this.showButtonWithElipsis()) {
      this.stateActions.reverse();
    }
  }

  filterStateActions() {
    const availableStateActions = this.availableStateActions || [];
    this.filteredStateActions = this.stateActions.filter((action: StateAction) => {
      return !action.actionId || action.skipSecurityCheck || availableStateActions.some((id: number) => id === action.actionId);
    });
  }

  hasStateActions() {
    return this.filteredStateActions && this.filteredStateActions.some((action: StateAction) => !this.isActionHidden(action));
  }

  hasElipsis() {
    return this.filteredStateActions && this.filteredStateActions.some((action: StateAction) => !action.style);
  }
}
