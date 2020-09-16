import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableStateSavingMode, DialogOptions } from '../../../common/model';
import { PhxDataTableComponent } from '../../../common/components/phx-data-table/phx-data-table.component';
import { ReportService } from './../../service/report.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';
import { ActivatedRoute } from '@angular/router';
import { CodeValueService } from './../../../common/services/code-value.service';
import { CodeValue } from './../../../common/model/code-value';
import { DialogService } from '../../../common';
import { ReportLogItem } from '../../model/report-log';
import { DxDataGridComponent } from 'devextreme-angular';
import { NavigationService } from './../../../common/services/navigation.service';
import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { WindowRefService } from '../../../common/services/WindowRef.service';
import { ReportRoutingConfiguration } from './../../model/report-list';
import { PhxDataTableUserProfile } from './../../../common/model/index';

@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.less']
})
export class ReportComponent implements OnInit, OnDestroy {
    dataSourceUrl = 'reportData/getReport';
    oDataParams: string;
    columns: Array<PhxDataTableColumn> = [];
    reportId: number;
    reportName: string;
    reportTitle: string;
    reportCols: Array<any>;
    isDefaultView: boolean = true;
    visibleColumnsCount: number;
    requiredColumns: Array<any>;
    reportDetails: {
        items1: any,
        cols: any
    };
    reportRoutingConfig: Array<ReportRoutingConfiguration>;
    rowData: any;
    componentName: any = 'ReportComponent';
    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        stateSavingMode: PhxDataTableStateSavingMode.Customizable,
        // enableExport: true,
        // pageSize: 100000,
    });
    isExporting: boolean = false;
    userViewStateName: string;
    userViewStateDescription: string;
    userViewState: PhxDataTableUserProfile;
    isAlive: boolean = true;
    @ViewChild('grid') grid: PhxDataTableComponent;
    constructor(private reportService: ReportService,
        private loadingSpinnerService: LoadingSpinnerService,
        private ref: ChangeDetectorRef,
        private route: ActivatedRoute,
        private codeValueService: CodeValueService,
        private dialogService: DialogService,
        private navigationService: NavigationService,
        private localization: PhxLocalizationService,
        private winRef: WindowRefService,
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.reportId = +params['reportId'];
        });

        this.reportService.reportRoutingConfig$()
            .takeWhile(() => this.isAlive)
            .subscribe(data => {
                this.reportRoutingConfig = data;
            });

        this.reportService.reportUserViewStates$()
            .takeWhile(() => this.isAlive)
            .subscribe(data => {
                this.userViewState = data;
                if (this.userViewState && this.userViewState.Id !== 0) {
                    this.userViewStateName = this.userViewState.StateName;
                    this.userViewStateDescription = this.userViewState.StateDescription;
                    this.isDefaultView = false;
                }
            });

        if (this.reportRoutingConfig === null || this.reportRoutingConfig === undefined) {
            this.reportService.getReportList().subscribe(response => {
                this.reportRoutingConfig = response.Items.filter(id => id.Id === this.reportId).map(ls => ls.ReportRoutingConfiguration)[0];
                this.requiredColumns = this.parseRequiredColumns(this.reportRoutingConfig);
            },
                error => {
                    console.log(error);
                }
            );
        } else {
            this.requiredColumns = this.parseRequiredColumns(this.reportRoutingConfig);
        }
        const reportCodeValue = this.getCodeValue('report.CodeReportType').find(c => c.id === this.reportId);
        this.reportName = reportCodeValue.value;
        this.reportTitle = reportCodeValue.description;

        this.dataSourceUrl = this.dataSourceUrl + this.reportName + 'Data';
        this.getReportConfig();
        this.setTitle();
    }

    setTitle() {
        const extraTexts = [this.reportTitle];
        if (this.userViewStateName) {
            extraTexts.push(this.userViewStateName);
        }
        this.navigationService.setTitle('report', extraTexts);
    }

    getReportConfig() {
        this.loadingSpinnerService.show();
        this.reportService.getReportCols(this.reportId)
            .then((info: any) => {
                this.buildColumns(info.Items);
                const cols = info.Items.map(val => { return val.ColumnName; });
                //this.oDataParams = oreq.request().withSelect(cols).url();
                this.loadingSpinnerService.hide();
                this.isDefaultView = true;
            })
            .catch(() => {
                this.loadingSpinnerService.hide();
            });
    }

    buildColumns(reportCols: Array<any>) {
        reportCols.forEach(val => {
            const col = new PhxDataTableColumn({
                dataField: val.ColumnName,
                caption: this.localization.translate('report.' + this.reportName.charAt(0).toLowerCase() + this.reportName.substring(1) + '.' + val.ColumnName),
                dataType: this.displayColumnType(val.ColumnTypeId),
                visible: val.Visible && val.DefaultView,
                showInColumnChooser: val.Visible,
                lookup: val.DatasourceName != null && val.Datasource && val.Datasource.length ? {
                    dataSource: this.getLookup(val.Datasource),
                    valueExpr: 'value',
                    displayExpr: 'text'
                } : null
            });
            this.columns.push(col);
        });
    }

    getLookup(datasource: Array<any>) {
        return datasource.map((codeValue) => {
            return {
                value: codeValue.id || codeValue.text,
                text: codeValue.text
            };
        });
    }

    displayColumnType(typeId): string {
        return this.getCodeValue('report.CodeReportColumnType').find(c => c.id === typeId).value;
    }

    onEditorPreparing($event) {
        if ($event.parentType === 'filterRow') {
            const dataField = this.columns.find(c => c.dataField === $event.dataField);
            if (dataField && dataField.dataType === 'number') {
                $event.editorOptions.onInput = function (e) {
                    const inputElement = e.event.target;
                    if (inputElement.value.length > 9) {
                        inputElement.value = inputElement.value.slice(0, 9);
                    }
                };
            }
        }
    }

    onExporting($event) {
        if (this.isExporting) {
            this.isExporting = false;
        } else {
            $event.cancel = true;
            const dlg = this.dialogService.confirm('Warning', 'This will track for security purpose. Do you want to continue ?');
            dlg.then(
                btn => {
                    const reportLogItem: ReportLogItem = {};
                    reportLogItem.ReportTypeId = this.reportId;
                    reportLogItem.ReportName = this.reportTitle;
                    reportLogItem.TableState = JSON.stringify(this.grid.grid.instance.state());
                    reportLogItem.VisibleColumns = this.grid.grid.instance.getVisibleColumns().map(col => col.dataField).join(',');
                    reportLogItem.Url = this.route.snapshot.url.join('');
                    this.reportService
                        .logReportExport(reportLogItem)
                        .then(response => {
                            this.isExporting = true;
                            this.grid.grid.instance.exportToExcel(false);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                },
                btn => {
                    $event.cancel = true;
                }
            );
        }
    }

    onExported($event) {

    }

    onFileSaving($event) {
        $event.fileName = this.reportTitle;
    }

    exportReport() {
        this.grid.grid.instance.exportToExcel(false);
    }

    getCodeValue(codeTable: string) {
        return this.codeValueService
            .getCodeValues(codeTable, true)
            .sort((a, b) => {
                if (a.code < b.code) {
                    return -1;
                }
                if (a.code > b.code) {
                    return 1;
                }
                return 0;
            })
            .map((codeValue: CodeValue) => {
                return {
                    description: codeValue.description,
                    id: codeValue.id,
                    code: codeValue.code,
                    value: codeValue.text
                };
            });
    }

    onContentReady(data) {
       if (data && data.getVisibleColumns().length !== this.visibleColumnsCount) {
            //if (this.visibleColumnsCount !== undefined) {
            const columns = _.union(data.getVisibleColumns().map(x => x.dataField), this.requiredColumns);
            this.oDataParams = oreq.request().withSelect(columns).url();
            //}
                this.visibleColumnsCount = data.getVisibleColumns().length;
       }
     }

    onContextMenuPreparing(event: any) {
        if (event && event.row && event.row.rowType === 'data' && this.reportRoutingConfig.length > 0) {
            event.items = [];
            this.reportRoutingConfig.forEach(ro => {
                if (ro.Condition) {
                    // tslint:disable-next-line:no-eval
                    const isTrue = eval(this.parseTpl(ro.Condition, event.row.data, true));
                    if (!isTrue) {
                        return;
                    }
                }
                const route = this.parseTpl(ro.Routing, event.row.data, false);
                if (route) {
                    event.items.push({
                        text: `${this.localization.translate('report.' + this.reportName.charAt(0).toLowerCase() + this.reportName.substring(1) + '.' + ro.RouteName)}`,
                        onItemClick: () => {
                            return this.winRef.nativeWindow.open(route);
                        }
                    });
                }
            });
        }
    }

    parseTpl(template, map, isCondition) {
        let isNull = false;
        const route = template.replace(/\$\{.+?}/g, (match) => {
            const path = match.substr(2, match.length - 3).trim();
            if (path.length > 0 && map[path] !== null && map[path] !== undefined && isCondition) {
                return map[path].length > 0 ? `'${map[path]}'` : map[path];
            } else if (path.length > 0 && map[path] !== null && map[path] !== undefined) {
                return map[path];
            } else {
                isNull = true;
            }
        });
        return isNull ? null : route;
    }

    parseRequiredColumns(data) {
        let reqCols = [];
        if (data) {
            data.forEach(rc => {
                if (rc.Condition) {
                    reqCols = _.union(reqCols, rc.Condition.match(/(\${)(.*?)(?=})/g).map(x => x.replace('${', '')));
                }
                reqCols = _.union(reqCols, rc.Routing.match(/(\${)(.*?)(?=})/g).map(x => x.replace('${', '')));
            });
        }
        return reqCols;
    }

    ngOnDestroy(): void {
        this.isAlive = false;
    }
}


