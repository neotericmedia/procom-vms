import { CommonService } from '../../../common/services/common.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Project, ProjectManagementState, ProjectManagement } from '../../model';
import { ProjectService } from '../../service/project.service';
import { ActivatedRoute } from '@angular/router';
import { TimeSheetService } from '../../../time-sheet/service/time-sheet.service';
import { Subscription } from 'rxjs/Subscription';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableStateSavingMode, PhxDataTableSummaryItem, PhxDataTableSummaryType } from '../../../common/model/index';
import dataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-project-select-detail',
  templateUrl: './project-select-detail.component.html',
  styleUrls: ['./project-select-detail.component.less']
})
export class ProjectSelectDetailComponent implements OnInit, OnDestroy, OnChanges {

  accessActions: any;
  timeSheetSubscription: Subscription;
  alive: boolean = true;

  @Output() selectedProject: EventEmitter<Project> = new EventEmitter();
  @Output() projectManagementState: EventEmitter<ProjectManagementState> = new EventEmitter();
  @Input() availableProjectList: Array<number>;

  projectManagement: ProjectManagement;
  activeProject: Project;

  projectFavouriteList: Array<Project>;
  projectNonFavouriteList: Array<Project>;

  filterText: string = '';

  constructor(private commonService: CommonService,
    private timeSheetService: TimeSheetService,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService) { }

  ngOnInit() {

    this.accessActions = this.commonService.ApplicationConstants.EntityAccessAction;

    this.activatedRoute.parent.params
      .subscribe((params) => {

        const id = +params['TimeSheetId'];
        if (this.timeSheetSubscription) {
          this.timeSheetSubscription.unsubscribe();
        }

        this.timeSheetSubscription = this.timeSheetService.getTimeSheetById(id)
          .takeWhile(() => this.alive)
          .subscribe(timeSheet => {
            if (timeSheet) {
              this.projectService.getProjectManagementByAssignmentId(timeSheet.AssignmentId)
                .takeWhile(() => this.alive)
                .subscribe((projectManagement: ProjectManagement) => {
                  this.projectManagement = projectManagement;

                  if (projectManagement) {

                    this.filterProjectLists(this.filterText);

                  }
                });

              this.projectService.getActiveProject(timeSheet.AssignmentId)
                .takeWhile(() => this.alive)
                .subscribe((activeProject: Project) => {
                  this.activeProject = activeProject;
                });
            }
          });
      });
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.availableProjectIdList &&
      changes.availableProjectIdList.currentValue &&
      this.projectManagement &&
      this.projectManagement.Projects
    ) {

      this.filterProjectLists(this.filterText);

    }

  }

  filterProjectLists(filterText: string = '') {

    this.filterText = filterText;

    const sortedProjectList = this.projectManagement.Projects.sort((p1: Project, p2: Project) => {

      let result: number = 0;

      if (p1.ActiveProjectVersion.Name < p2.ActiveProjectVersion.Name) {
        result = -1;

      } else if (p1.ActiveProjectVersion.Name > p2.ActiveProjectVersion.Name) {
        result = 1;
      }
      return result;
    });

    this.projectFavouriteList = sortedProjectList.filter((p: Project) => {
      return (p.IsFavourite && (p.IsActive || (!p.IsActive && this.availableProjectList && this.availableProjectList.indexOf(p.Id) > -1)));
    });

    this.projectNonFavouriteList = sortedProjectList.filter((p: Project) => {
      return (!p.IsFavourite && (p.IsActive || (!p.IsActive && this.availableProjectList && this.availableProjectList.indexOf(p.Id) > -1)));
    });

    filterText = filterText.trim().toUpperCase();

    if (filterText.length) {

      this.projectFavouriteList = this.projectFavouriteList.filter((project: Project) => project.ActiveProjectVersion.Name.toUpperCase().indexOf(filterText.toUpperCase()) > -1);
      this.projectNonFavouriteList = this.projectNonFavouriteList.filter((project: Project) => project.ActiveProjectVersion.Name.toUpperCase().indexOf(filterText.toUpperCase()) > -1);

    }
  }

  add() {
    this.projectService.setProjectForEdit(this.projectService.getNewProject(this.projectManagement,
      this.projectManagement.AssignmentId));
    this.projectManagementState.emit(ProjectManagementState.edit);
  }

  cancel() {
    this.selectedProject.emit(null); // TODO: return previous selected project?
    this.projectManagementState.emit(ProjectManagementState.cancel);
  }

  edit(project: Project) {

    this.projectService.setProjectForEdit(project);
    this.projectManagementState.emit(ProjectManagementState.edit);

  }

  cellClick(e: any) {
    if (e.rowType === 'data' && e.column.cellTemplate !== 'actionCellTemplate') {
      this.selectProject(<Project>e.data);
    }
  }

  selectProject(project: Project) {
    this.selectedProject.emit(project);
    this.projectManagementState.emit(ProjectManagementState.selected);
  }


  toggleFavourtie(editProject: Project) {

    this.projectService.toggleFavouriteProject(editProject);

  }

  ngOnDestroy() {

    this.alive = false;
  }

}
