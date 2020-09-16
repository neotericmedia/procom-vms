import { Component, OnInit, ViewChild } from '@angular/core';
import { PhxLocalizationService } from './../../common/services/phx-localization.service';
import { CommonService, CodeValueService, DialogService } from '../../common/index';
import { PhxDataTableConfiguration, PhxDataTableColumn, CodeValue, PhxDataTableStateSavingMode, PhxDataTableSelectallMode } from '../../common/model/index';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';


@Component({
  selector: 'app-demo-localization',
  templateUrl: './demo-localization.component.html',
  styleUrls: ['./demo-localization.component.less']
})
export class DemoLocalizationComponent implements OnInit {

  public heading: string = 'Translation Methods';
  public translatedText: string = '';
  public translatedTextListeningToChanges: string = '';
  public precipitation: string = '36%';
  public humididty: string = '79%';
  public wind: number = 39;

  demoDate: Date = new Date();

  @ViewChild('dataTable') dataTable: PhxDataTableComponent;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectAllMode: PhxDataTableSelectallMode.Page,
    stateSavingMode: PhxDataTableStateSavingMode.None,
    enableExport: true,
    enableMasterDetail: true,
    showOpenInNewTab: true,
  });

  columns: Array<PhxDataTableColumn>;

  demoGridData = [
    {
      Id: 1 ,
      Text: 'test',
      Boolean: true,
      Date: new Date(),
      CodeValueId: 1
    }
  ];

  constructor(
    private locale: PhxLocalizationService,
    public dialogService: DialogService,
    private commonService: CommonService,
    private codeValueService: CodeValueService
  ) { console.log('PhxLocalizationService'); }

  ngOnInit() {
    this.translatedText = this.locale.translate('demo.local.helloWorld');
    this.translatedTextListeningToChanges = this.locale.translate('demo.local.helloWorld');
    this.subscribeToLangChanged();

    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: this.locale.translate('demoGrid.numberColumnHeader'),
        dataType: 'number',
        hidingPriority: 104,
      }),
      new PhxDataTableColumn({
        dataField: 'Text',
        caption: this.locale.translate('demoGrid.textColumnHeader'),
        hidingPriority: 201,
      }),
      new PhxDataTableColumn({
        dataField: 'Boolean',
        caption: this.locale.translate('demoGrid.booleanColumnHeader'),
        hidingPriority: 200,
      }),
      new PhxDataTableColumn({
        dataField: 'Date',
        caption: this.locale.translate('demoGrid.dateColumnHeader'),
        dataType: 'date',
        cellTemplate: 'dateCellTemplate',
        hidingPriority: 304,
      }),
      new PhxDataTableColumn({
        dataField: 'CodeValueId',
        caption: this.locale.translate('demoGrid.lookupColumnHeader'),
        dataType: 'number',
        lookup: {
          dataSource: this.getRateUnitLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        },
        hidingPriority: 300,
      })
    ];
  }

  selectLang(lang: string) {
    // set current lang;
    this.locale.setLocale(lang);
  }

  subscribeToLangChanged() {
      return this.locale.onLangChanged.subscribe(lang => this.refreshText());
  }

  unSubscribeToLangChanged() {
      this.locale.onLangChanged.unsubscribe();
  }

  refreshText() {
      // refresh translation when language change
      this.heading = this.locale.translate('demo.local.translationHeading');
      this.translatedTextListeningToChanges = this.locale.translate('demo.local.helloWorld');
  }

  getRateUnitLookup() {
    return this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RateUnit, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
      };
    });
  }

  confirm() {
    this.dialogService.confirm()
    .then(btn => {
      console.log(btn);
    })
    .catch(ex => {
      console.log(ex);
    });
  }

  comment() {
    this.dialogService.comment()
      .then(comment => {
        console.log(comment);
      })
      .catch(ex => {
        console.log(ex);
      });
  }
}
