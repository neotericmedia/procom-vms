import { Component, OnInit, Input } from '@angular/core';
import { StateHistoryGroupHeader, StateHistory, PhxConstants, StateHistoryVersionHeader } from '../../model';
import { CodeValueGroups } from './../../model/phx-code-value-groups';
import { WorkflowService } from './../../services/workflow.service';
import { CodeValueService } from './../../services/code-value.service';
import { PhxLocalizationService } from '../../services/phx-localization.service';

@Component({
  selector: 'app-phx-state-history',
  templateUrl: './phx-state-history.component.html',
  styleUrls: ['./phx-state-history.component.less']
})
export class PhxStateHistoryComponent implements OnInit {
  @Input() entityTypeId: number;
  @Input() entityId: number;

  GROUP_HISTORY = false; // first release does not support history grouping
  nonVersion: boolean;

  statusCodeValueGroups: string;
  stateHistoryVersionHeader: Array<StateHistoryVersionHeader>;

  phxConstant = PhxConstants;
  codeValueGroups = CodeValueGroups;

  constructor(private workflowService: WorkflowService, private codeValueService: CodeValueService, private localizationService: PhxLocalizationService) {}

  ngOnInit() {
    this.statusCodeValueGroups = this.getStatusCodeValueGroups(this.entityTypeId);
    this.initStateHistory(this.entityTypeId, this.entityId);
  }

  private initStateHistory(entityTypeId: number, entityId: number) {
    this.workflowService.getStateHistory(entityTypeId, entityId).then((stateHistoryVersionHeader: Array<StateHistoryVersionHeader>) => {
      if (stateHistoryVersionHeader && stateHistoryVersionHeader.length) {
        this.stateHistoryVersionHeader = stateHistoryVersionHeader;
        this.stateHistoryVersionHeader.forEach((version: StateHistoryVersionHeader) => {
          version.StateHistoryGrouped = this.groupStateHistory(version.StateHistory);
          const current = version.StateHistoryGrouped.find(g => g.LatestCurrent);
          version.CurrentStatus = current ? current.EntityStatusId : null;
          if (version.CurrentStatus) {
            version.StateHistoryGrouped = this.getFuturePath(version.EntityTypeId, version.CurrentStatus).concat(version.StateHistoryGrouped);
          }
          version.isOpen = true;
        });
        this.nonVersion = !this.stateHistoryVersionHeader[0].VersionNumber;
      }
    });
  }

  private getFuturePath(entityTypeId: number, statusId: number): Array<StateHistoryGroupHeader> {
    const futurePathStatusIds = this.workflowService.getPreferredEntityStatusIdPath(entityTypeId, statusId) || [];
    return futurePathStatusIds.map((id: number, index: number) => {
      return <StateHistoryGroupHeader>{
        Future: true,
        NextStep: index === 0,
        EntityStatusId: id,
        StateHistory: [{
          EntityStatusId: id,
          NextStep: index === 0
        }]
      };
    }).reverse();
  }

  /**
   * Determine if a new group is needed.
   * If action & status are the same, we group them.
   * Alternatively, if grouping feature is turned off, every history is a group on its own.
   * @param stateHistory
   */
  private groupStateHistory(stateHistory: Array<StateHistory>): Array<StateHistoryGroupHeader> {
    const historyGrouped: Array<StateHistoryGroupHeader> = [];
    stateHistory.forEach((history: StateHistory, index: number) => {
      let curGroup: StateHistoryGroupHeader = historyGrouped.length ? historyGrouped[historyGrouped.length - 1] : null;
      history.Description = this.getHistoryDescription(history);

      if (this.needNewGroup(curGroup, history)) {
        curGroup = <StateHistoryGroupHeader>{
          Future: false,
          LatestCurrent: index === 0,
          EntityStatusId: history.EntityStatusId,
          StateActionId: history.StateActionId,
          StateHistory: []
        };
        historyGrouped.push(curGroup);
      }
      curGroup.StateHistory.push(history);
      curGroup.LastCreatedByFirstName = history.CreatedByFirstName;
      curGroup.LastCreatedByLastName = history.CreatedByLastName;
      curGroup.LastCreatedByFullName = history.CreatedByFullName;
      curGroup.LastCreatedDatetime = history.CreatedDatetime;
    });
    return historyGrouped;
  }

  /**
   * Translation for status based on entity
   * Expand this switch case to support more entities
   * @param entityTypeId
   */
  private getStatusCodeValueGroups(entityTypeId: number): string {
    switch (entityTypeId) {
      case PhxConstants.EntityType.WorkOrder:
        return CodeValueGroups.WorkOrderVersionStatus;
      case PhxConstants.EntityType.TimeSheet:
        return CodeValueGroups.TimeSheetStatus;
    }
  }

  /**
   * Determine if a new group is needed.
   * If action & status are the same, we group them.
   * Alternatively, if grouping feature is turned off, every history is a group on its own.
   * @param curGroup
   * @param history
   */
  private needNewGroup(curGroup: StateHistoryGroupHeader, history: StateHistory): boolean {
    const curStatusId = curGroup ? curGroup.EntityStatusId : null;
    const curStateActionId = curGroup ? curGroup.StateActionId : null;
    return curStatusId !== history.EntityStatusId || curStateActionId !== history.StateActionId || !this.GROUP_HISTORY;
  }

  /**
   * Get the translated description based on action
   * Default resource is in workflow.stateHistory.{actionCode}
   *
   * If entity based custom description is desired, alternate resource is in workflow.{entityTypeCode}History.{actionCode}
   * @param history
   */
  private getHistoryDescription(history: StateHistory): string {
    if (history) {
      const stateActionCode = this.codeValueService.getCodeValueCode(history.StateActionId, CodeValueGroups.StateAction) || '';
      const entityTypeCode = this.codeValueService.getCodeValueCode(this.entityTypeId, CodeValueGroups.EntityType) || '';
      const transKeyCustom = `workflow.${entityTypeCode.charAt(0).toLowerCase + entityTypeCode.slice(1)}History.${stateActionCode}`;
      const transKeyDefault = `workflow.stateHistory.${stateActionCode}`;
      const descCustom = this.localizationService.translate(transKeyCustom, history.CreatedByFullName, history.UserComment || '');
      const descDefault = this.localizationService.translate(transKeyDefault, history.CreatedByFullName, history.UserComment || '');
      return transKeyCustom === descCustom ? descDefault : descCustom;
    }
  }
}
