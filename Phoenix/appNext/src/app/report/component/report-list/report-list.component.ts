import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from './../../../common/services/navigation.service';
import { PhxDataTableService } from '../../../common/services/phx-data-table.service';
import { ReportService } from './../../service/report.service';
import { ReportListItem, ReportRoutingConfiguration } from './../../model/report-list';
import { CodeValue } from './../../../common/model/code-value';
import { CodeValueService } from './../../../common/services/code-value.service';
import { PhxDataTableUserProfile } from './../../../common/model/index';

@Component({
    selector: 'app-report-list',
    templateUrl: './report-list.component.html',
    styleUrls: ['./report-list.component.less']
})
export class ReportListComponent implements OnInit {

    public reportList: Array<ReportListItem>;

    constructor(
        private reportService: ReportService,
        private router: Router,
        private route: ActivatedRoute,
        private codeValueService: CodeValueService,
        private navigationService: NavigationService,
        private phxDataTableService: PhxDataTableService
    ) { }

    ngOnInit() {
        this.reportService.getReportList()
            .subscribe(response => {
                this.reportList = response.Items;
                this.reportList.forEach((x, index) => {
                  this.reportList[index].Icon = this.getCodeValue('report.CodeReportType').find(c => c.id === x.Id).Icon;
                  this.reportList[index].Description = this.getCodeValue('report.CodeReportType').find(c => c.id === x.Id).description;
                    this.reportList[index].UserViewStates = x.UserViewStates
                                                            .filter(name => name.StateName !== '')
                                                            .sort((a, b) => {
                                                                const aTime = a.LastModifiedDatetime ? a.LastModifiedDatetime.toString() : null;
                                                                const bTime = b.LastModifiedDatetime ? b.LastModifiedDatetime.toString() : null;
                                                                return new Date(bTime).getTime() - new Date(aTime).getTime();
                                                            });
                    this.reportList[index].UserViewStates.unshift({
                        Id: 0,
                        StateName : 'Default Report',
                        StateDescription : this.reportList[index].Description,
                    });
                });
            },
                error => {
                    console.log(error);
                }
            );
        this.navigationService.setTitle('report');
    }

    public viewReport(reportId: number, state: PhxDataTableUserProfile = null) {
        const reportListItem: ReportListItem = this.reportList.find(id => id.Id === reportId);
        const reportRoutingConfig: Array<ReportRoutingConfiguration> = reportListItem ? reportListItem.ReportRoutingConfiguration : null;
        this.reportService.changeRoutingCongfig(reportRoutingConfig);
        this.reportService.changeUserViewStates(state);
        if (state && state.Id > 0) {
            this.phxDataTableService.saveState(state);
        }
        this.router.navigate(['/next', 'report', reportId]);
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
                    value: codeValue.text,
                    Icon: codeValue.Icon,
                };
            });
    }

}
