import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NavigationBarItem, WorkflowAction, PhxButton, StateAction, StateActionDisplayType, StateActionButtonStyle } from '../../common/model/index';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Demo } from '../shared/index';
import { DemoService } from '../shared/demo.service';
import { NavigationService } from '../../common/services/navigation.service';
import { DialogService } from '../../common/index';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.less']
})
export class DemoComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal: PhxModalComponent;
  @ViewChild('fullScreenModal') fullScreenModal: PhxModalComponent;
  id: number;
  demo: Demo = <Demo>{};
  editable: boolean = true;


  fabButtons: PhxButton[] = [
    {
      icon: 'done',
      tooltip: 'Tooltip 1',
      btnType: 'general',
      action: () => { console.log('action1'); }
    },
    {
      icon: 'edit',
      tooltip: 'Tooltip 2',
      btnType: 'general',
      action: () => {
        console.log('action2');
      }
    }
  ];

  singleFabButton: PhxButton[] = [
    {
      icon: 'add',
      tooltip: 'Add',
      btnType: 'primary',
      action: () => { console.log('add'); }
    }
  ];

  modalFabButtons = [
    {
      icon: 'done',
      tooltip: 'Save',
      btnType: 'primary',
      action: () => {
        this.modal.hide();
        console.log('Save');
      }
    },
    {
      icon: 'library_add',
      tooltip: 'Save & New',
      btnType: 'default',
      action: () => {
        this.modal.hide();
        console.log('Save & New');
      }
    },
    {
      icon: 'clear',
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        this.modal.hide();
        console.log('Close');
      }
    }
  ];

  fullScreenModalFabButtons = [
    {
      icon: 'done',
      tooltip: 'Save',
      btnType: 'primary',
      action: () => {
        this.fullScreenModal.hide();
        console.log('Save');
      }
    }
  ];

  isAlive: boolean = true;
  currentUrl: string;
  currentTab: NavigationBarItem;
  tabList: NavigationBarItem[] = [
    {
      Id: 1,
      Name: 'detail',
      Path: './detail',
      DisplayText: 'Detail',
      Icon: '',
      IsDefault: true,
    },
    {
      Id: 2,
      Name: 'attachments',
      Path: './attachments',
      DisplayText: 'Attachments',
      Icon: 'note',
      IsDefault: false
    },
  ];

  workflowAvailableActions: WorkflowAction[] = [];
  stateActions: StateAction[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private demoService: DemoService,
    private navigationService: NavigationService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;

    this.router.events
      .takeWhile(() => this.isAlive)
      .subscribe(
        (val) => {
          if (val instanceof NavigationEnd) {
            this.currentUrl = val.url;
          }
        });

    this.activatedRoute.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['id'];
        this.navigationService.setTitle('demo-detail', [this.id]);
        this.demoService.getDemo(this.id)
          .takeWhile(() => this.isAlive)
          .subscribe((data) => {
            this.demo = data;
          });
      });

    this._initStateActions();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  executeWorkflowAction(action: WorkflowAction) {
    alert('Workflow Action Clicked ' + JSON.stringify(action));
  }

  getActionButtonCssClass(action: WorkflowAction): string {
    if (action.CommandName.includes('Submit')) {
      return 'primary';
    }
  }

  openModal() {
    this.modal.show();
  }

  openFullScreenModal() {
    this.fullScreenModal.show();
  }

  _initStateActions() {
    this.stateActions = [{
      displayText: 'Hide in dropdown',
      onClick: function(action, componentOption, actionOption) {

      },
      hiddenFn: function(action, componentOption) {
        return componentOption.displayType === StateActionDisplayType.DROPDOWN;
      }
    }, {
      displayText: 'Hide in button',
      onClick: function(action, componentOption, actionOption) {

      },
      hiddenFn: function(action, componentOption) {
        return componentOption.displayType === StateActionDisplayType.BUTTON;
      }
    }, {
      displayText: 'Disabled',
      onClick: function(action, componentOption, actionOption) {

      },
      disabledFn: function(action, componentOption) {
        return true;
      }
    }, {
      displayText: 'Declined',
      showDeclinedCommentDialog: true,
      onClick: function(action, componentOption, actionOption) {

      }
    }, {
      displayText: 'Primary',
      style: StateActionButtonStyle.PRIMARY,
      onClick: function(action, componentOption, actionOption) {

      }
    }, {
      displayText: 'Danger',
      style: StateActionButtonStyle.DANGER,
      onClick: function(action, componentOption, actionOption) {

      }
    }, {
      displayText: 'Warning',
      style: StateActionButtonStyle.WARNING,
      onClick: function(action, componentOption, actionOption) {

      }
    }, {
      displayText: 'Secondary',
      style: StateActionButtonStyle.SECONDARY,
      onClick: function(action, componentOption, actionOption) {

      }
    }];
  }
}
