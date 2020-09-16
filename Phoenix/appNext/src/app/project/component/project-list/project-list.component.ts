import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { CustomFieldDataSourceDetail } from './../../../common/model/custom-field-data-source-detail';
import { CustomFieldVersionConfiguration, PhxConstants } from './../../../common/model/index';
import { ProjectEditComponent } from './../project-edit/project-edit.component';
import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Project, ProjectManagement } from '../../model';
import { Subscription } from 'rxjs/Subscription';
import { TimeSheetService } from '../../../time-sheet/service/time-sheet.service';
import { ProjectService } from '../../service/project.service';
import { ProjectEditModalComponent } from '../project-edit-modal/project-edit-modal.component';
import { CommonService, CustomFieldService, DialogService } from '../../../common/index';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataColumnLookup, PhxDataTableStateSavingMode, PhxDataTableSummaryItem, PhxDataTableSummaryType, UserProfile } from '../../../common/model/index';
import { AuthService } from '../../../common/services/auth.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.less']
})
export class ProjectListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() assignmentId: number;
  private alive: boolean = true;
  isEditable: boolean = false;

  deactivateTitle = 'project.messages.confirmDeactivateTitle';
  deactivateMessage = 'project.messages.confirmDeactivateMessage';

  @ViewChild(ProjectEditModalComponent) projectEditModalComponent: ProjectEditModalComponent;

  projectSubscription: Subscription;
  projectManagement: ProjectManagement;
  projectList: Array<Project> = [];

  stateSaveUrl: string;
  componentName: string = 'ProjectManagement';
  myFilename: string;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    enableExport: false,
    stateSavingMode: PhxDataTableStateSavingMode.None,
    showTotalCount: false
  });

  baseColumns: Array<PhxDataTableColumn>;

  columns: Array<PhxDataTableColumn> = null;

  // constants
  EntityAccessAction = PhxConstants.EntityAccessAction;

  constructor(
    private projectService: ProjectService,
    private customFieldService: CustomFieldService,
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService
  ) {
    this.buildColumns();
    this.applyLocalization();
  }

  applyLocalization() {
    this.deactivateTitle = this.localizationService.translate(this.deactivateTitle);
    this.deactivateMessage = this.localizationService.translate(this.deactivateMessage);
  }

  buildColumns() {
    this.baseColumns = [
      new PhxDataTableColumn({
        dataField: 'IsFavourite',
        caption: this.localizationService.translate('project.list.isFavouriteColumnHeader'),
        dataType: 'boolean',
        hidingPriority: 5,
        cellTemplate: 'isFavouriteCellTemplate',
        sortOrder: 'desc',
        sortIndex: 1,
        lookup: {
          dataSource: this.formatBoolean(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'ActiveProjectVersion.Name',
        caption: this.localizationService.translate('project.list.projectNameColumnHeader'),
        dataType: 'string',
        hidingPriority: 5,
        sortOrder: 'asc',
        sortIndex: 2
      }),
      new PhxDataTableColumn({
        dataField: 'ActiveProjectVersion.Code',
        caption: this.localizationService.translate('project.list.codeColumnHeader'),
        dataType: 'string',
        hidingPriority: 2
      }),
      new PhxDataTableColumn({
        dataField: 'ActiveProjectVersion.Description',
        caption: this.localizationService.translate('project.list.descriptionColumnHeader'),
        dataType: 'string',
        hidingPriority: 3
      }),
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: this.localizationService.translate('common.generic.actions'),
        cellTemplate: 'actionCellTemplate',
        hidingPriority: 5,
        allowFiltering: false,
        allowSorting: false,
        allowExporting: false,
        allowGrouping: false
      })
    ];
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assignmentId) {
      const assignmentId = changes.assignmentId.currentValue;
      if (assignmentId != null) {
        this.projectSubscription = this.projectService
          .getProjectManagementByAssignmentId(assignmentId)
          .takeWhile(() => this.alive)
          .subscribe(
            (projectManagement: ProjectManagement) => {
              this.columns = null;
              if (projectManagement && projectManagement.Projects) {
                this.projectManagement = projectManagement;
                this.isEditable = projectManagement.AccessActions.some(x => x.AccessAction === this.EntityAccessAction.ProjectSave || x.AccessAction === this.EntityAccessAction.ProjectDiscard);
                this.projectList = projectManagement.Projects.filter((project: Project) => project.IsActive);
                this.columns = this.getColumns(projectManagement);
              }
            },
            error => {
              console.error(error);
              this.projectList = [];
            }
          );
      } else {
        if (this.projectSubscription) {
          this.projectSubscription.unsubscribe();
        }
        this.projectManagement = null;
        this.projectList = [];
        this.columns = null;
      }
    }
  }

  private getColumns(projectManagement: ProjectManagement): Array<PhxDataTableColumn> {
    const cols: Array<PhxDataTableColumn> = this.baseColumns.map((c: PhxDataTableColumn) => {
      return c;
    });

    if (projectManagement.CustomFieldVersions.length) {
      const codingCols: Array<PhxDataTableColumn> = [];
      const version = projectManagement.ActiveCustomFieldVersion;

      projectManagement.ActiveCustomFieldVersion.CustomFieldVersionConfigurations.forEach((field: CustomFieldVersionConfiguration, index: number) => {
        const isDataSource: boolean = this.customFieldService.isDataSourceField(field);
        const dataField = isDataSource ? 'CustomFieldDataSourceDetailId' : 'CustomFieldTextValue';
        const lookup: PhxDataColumnLookup = !isDataSource
          ? null
          : {
              dataSource: field.CustomFieldDataSourceDetails,
              displayExpr: 'Value',
              valueExpr: 'Id'
            };

        codingCols.push(
          new PhxDataTableColumn({
            dataField: `ActiveProjectVersion.CustomFieldValues[${index}].${dataField}`,
            caption: field.DisplayName,
            dataType: 'string',
            lookup: lookup,
            hidingPriority: 2
          })
        );
      });

      cols.splice(2, 0, ...codingCols);
    }

    return cols;
  }

  private formatBoolean() {
    return [
      {
        value: true,
        text: this.localizationService.translate('common.generic.yes')
      },
      {
        value: false,
        text: this.localizationService.translate('common.generic.no')
      }
    ];
  }

  edit(project: Project) {
    this.projectService.setProjectForEdit(project);
    this.projectEditModalComponent.toggleModal(true);
  }

  deactivateProject(project: any) {
    this.dialogService.confirm(this.deactivateTitle, this.deactivateMessage).then(button => {
      this.projectService.deactivate(project);
    });
  }

  onCellClick($event: any) {
    const editProject: Project = $event.data;

    if ($event.rowType === 'data' && $event.column.cellTemplate !== 'actionCellTemplate' && $event.column.command !== 'adaptive' && $event.column.cellTemplate === 'isFavouriteCellTemplate' && this.isEditable) {
      this.projectService.toggleFavouriteProject(editProject);
    } else if ($event.rowType === 'data' && $event.column.cellTemplate !== 'actionCellTemplate' && $event.column.command !== 'adaptive' && $event.column.cellTemplate !== 'isFavouriteCellTemplate') {
      this.edit(editProject);
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
