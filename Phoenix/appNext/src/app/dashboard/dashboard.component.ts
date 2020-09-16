import { Component, OnInit } from '@angular/core';
import { ApiService, NavigationService } from '../common';
import { PhxConstants } from '../common/model/phx-constants';
import { AuthService } from '../common/services/auth.service';
import { EventService } from '../common/services/event.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  Id;
  model;
  editable;
  LastModifiedDatetime;

  modelGetStarted = {
    title: ".",
    structure: "4-4-4",
    rows: [{
        columns: [
            {
                styleClass: "col-md-4",
            },
            {
                styleClass: "col-md-4",
                widgets: [{
                    fullScreen: false,
                    type: "ZZZ_getStarted",
                    title: "dashboard.getStarted.getStartedWidgetTitle"
                }]
            },
            {
                styleClass: "col-md-4",
            }
        ]
    }]
};

modelEmpty = {
    title: ".",
    structure: "4-4-4",
    rows: [{
        columns: [
            {
                styleClass: "col-md-4",
            },
            {
                styleClass: "col-md-4",
            },
            {
                styleClass: "col-md-4",
            }
        ]
    }]
};

  constructor(
    private navigationService: NavigationService,
    private apiService: ApiService,
    private authService: AuthService,
    private eventService: EventService
  ) {

   }

  ngOnInit() {
    const self = this;
    self.navigationService.setTitle('dashboard');

    self.apiService.query('dashboard/model').then((success: any) => {
        if (success) {
          if (success.Value) {
              self.Id = success.Id;
              self.LastModifiedDatetime = success.LastModifiedDatetime;
              self.model = JSON.parse(success.Value);
          } else {
              self.model = self.modelGetStarted;
          }
          self.editable = true;
          // resolve(resolved);
        }
    },
    function (error) {
      self.model = self.modelEmpty;
      self.editable = false;
      console.log(error, 'Dashboard access denied.');
        // resolve(resolved);
    });


    self.model.titleTemplateUrl = '/assets/dashboard/adf-custom-dashboard-title.html';
    self.model.addTemplateUrl = '/assets/dashboard/adf-custom-widget-add.html';
    self.model.editTemplateUrl = '/assets/dashboard/adf-custom-dashboard-edit.html';

    self.eventService.subscribe('adfDashboardChanged', self.eventFired);
    self.eventService.subscribe('adfDashboardEditsCancelled', function () {
      // $state.reload(); // fix me
    });
}


eventFired(event, name = null, model = null) {
  const self = this;
  if (model) {
      const command = {
          Id: self.Id,
          LastModifiedDatetime: self.LastModifiedDatetime,
          WorkflowPendingTaskId: -1,
          ModelJson: JSON.stringify(model),
      };
      this.apiService.command('DashboardSaveModel', command)
          .then(function () { // retrieve new date
              return self.apiService.query('dashboard/model');
          })
          .then(function (response: any) {
              self.LastModifiedDatetime = response.LastModifiedDatetime;
          });
  }
}

WidgetFilter(widget, type, model) {
  const self = this;
  const user = self.authService.currentProfile;
  switch (widget.category) {
      case PhxConstants.WidgetCategories.InternalOnly:
          if (user.ProfileTypeId !== PhxConstants.UserProfileType.Internal) {
              return false;
          } else {
              break;
          }
      case PhxConstants.WidgetCategories.All:
          break;
      default:
          return false;
  }

  if (user.ProfileTypeId === PhxConstants.UserProfileType.Organizational) {

  } else if (user.ProfileTypeId === PhxConstants.UserProfileType.Internal) {

  } else if (user.ProfileTypeId === PhxConstants.UserProfileType.WorkerTemp) {

  } else if (user.ProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianSp) {

  } else if (user.ProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianInc) {

  } else if (user.ProfileTypeId === PhxConstants.UserProfileType.WorkerSubVendor) {

  } else if (user.ProfileTypeId === PhxConstants.UserProfileType.WorkerUnitedStatesW2) {

  } else if (user.ProfileTypeId === PhxConstants.UserProfileType.WorkerUnitedStatesLLC) {

  }
  // Can access widget, now check if it's already on the page
  if (model.rows && model.rows.constructor === Array) {
      for (let i = 0; i < model.rows.length; i++) {
          if (model.rows[i] && model.rows[i].columns && model.rows[i].columns.constructor === Array) {
              for (let j = 0; j < model.rows[i].columns.length; j++) {
                  if (model.rows[i].columns[j] && model.rows[i].columns[j].widgets && model.rows[i].columns[j].widgets.constructor === Array) {
                      for (let k = 0; k < model.rows[i].columns[j].widgets.length; k++) {
                          if (model.rows[i].columns[j].widgets[k] && model.rows[i].columns[j].widgets[k].type && model.rows[i].columns[j].widgets[k].type === type) {
                              return false;
                          }
                      }
                  }
              }
          }
      }
  }
  return true;
}


}
