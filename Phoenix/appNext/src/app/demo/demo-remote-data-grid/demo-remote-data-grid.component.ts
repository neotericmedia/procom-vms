import { Component, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import ODataStore from 'devextreme/data/odata/store';

@Component({
  selector: 'app-demo-remote-data-grid',
  templateUrl: './demo-remote-data-grid.component.html',
  styleUrls: ['./demo-remote-data-grid.component.less']
})
export class DemoRemoteDataGridComponent implements OnInit {
  dataSource: any;
  priority: any;

  constructor() {
    this.dataSource = {
      store: new ODataStore({
        url: 'https://js.devexpress.com/Demos/DevAV/odata/Tasks',
        onLoading: function(loadOptions) {
          return {d: loadOptions};
        }
      }),
      expand: 'ResponsibleEmployee',
      select: [
        'Task_ID',
        'Task_Subject',
        'Task_Start_Date',
        'Task_Due_Date',
        'Task_Status',
        'Task_Priority',
        'ResponsibleEmployee/Employee_Full_Name'
      ]
    };

    this.priority = [
      { name: 'High', value: 4 },
      { name: 'Urgent', value: 3 },
      { name: 'Normal', value: 2 },
      { name: 'Low', value: 1 }
    ];
  }

  ngOnInit() {
  }

}
