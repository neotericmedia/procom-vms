import * as moment from 'moment';
import { PhxDataTableColumn, UserInfo } from '../../common/model';
import { PaymentYtdEarningsDetailsComponent } from '../payment-ytd-earnings-details/payment-ytd-earnings-details.component';
import { PaymentYtdEarningsSummaryComponent } from '../payment-ytd-earnings-summary/payment-ytd-earnings-summary.component';
import { CodeValueService, CommonService, PhxLocalizationService } from '../../common';
import { PaymentModuleResourceKeys } from '../payment-module-resource-keys';

export class PaymentYtdEarningsExport {

    public static produceCsvText(ytdEarningDetails: any, userInfo: UserInfo, startDate: any, endDate: any,
        codeValueService: CodeValueService, commonService: CommonService, localizationService: PhxLocalizationService): string {

        const str = (value: any) => {
            return value ? ('"' + value + '"') : '""';
        };

        const amt = (value: any, precision?: number) => {
            return value ? Number(value).toFixed(precision ? precision : 2) : '""';
        };

        const dt = (value: string | Date) => {
            const m = moment.utc('' + value);
            const result = value ? m.format('"MMM D, YYYY"') : '""';
            return result;
        };

        const strFromCode = (code: number, codeValueName: string, useQuotes: boolean) => {
            return codeValueService.getCodeValues(codeValueName, true)
                .filter(i => i.id === code)
                .map(i => useQuotes ? '"' + i.text + '"' : i.text)
                .join();
        };

        const myFormat = (value: any, type: string) => {
            switch (type) {
                case 'string':
                    return str(value);
                case 'number':
                    return amt(value);
                case 'date':
                    return dt(value);
                default:
                    return null;
            }
        };

        const newLine = '\r\n';

        ////////////////

        const columns = PaymentYtdEarningsDetailsComponent.generateTransactionColumns(ytdEarningDetails);
        const columnsText = columns.map((i) => str(i.caption)).join(',');
        const rowItems: any[] = ytdEarningDetails.items;

        /////////////////////

        const detailText = rowItems.map((i) => {
            return columns.map((j) => {
                const value = i[j.dataField];
                const type = j.dataType;
                return myFormat(value, type);
            }
            )
                .join(',');
        })
            .join(newLine);

        ///////////////////

        const { items, maxInfos } = PaymentYtdEarningsSummaryComponent.processData(ytdEarningDetails);

        const maximumText = maxInfos.map((i) => {
            const deductionName = strFromCode(i.SourceDeductionTypeId, commonService.CodeValueGroups.SourceDeductionType, false);
            return localizationService.translate(PaymentModuleResourceKeys.ytdEarning.yearMaximumSourceDeduction, deductionName, i.YearMaximum)
                    + ',' + amt(i.AmountMaximum);
        })
            .join(newLine);

        /////////////////////////

        const tmp = localizationService.translate(PaymentModuleResourceKeys.ytdEarning.startingDate);

        const summaryText = items.map((i) => {
            const column = columns.find(j => j.dataField === i.Key);
            const label = column ? 
                localizationService.translate(PaymentModuleResourceKeys.ytdEarning.totalAmount) + ' ' + column.caption 
                : localizationService.translate(PaymentModuleResourceKeys.ytdEarning.totalGrossAmount);
            return str(label) + ',' + amt(i.TotalAmount);
        })
            .join(newLine);

        ////////////////////

        const workerProfileType = codeValueService.getCodeValueText(ytdEarningDetails.workerProfile.ProfileTypeId, commonService.CodeValueGroups.ProfileType);

        /////////
        const topText = localizationService.translate(PaymentModuleResourceKeys.ytdEarning.startingDate) + ',' + dt(startDate) + ',' 
                        + localizationService.translate(PaymentModuleResourceKeys.ytdEarning.endingDate) + ',' + dt(endDate) + newLine
                        + str(ytdEarningDetails.workerProfile.FirstName + ' ' + ytdEarningDetails.workerProfile.LastName) + newLine + str(workerProfileType);
        const csvText = topText + newLine + newLine + maximumText + newLine + newLine + summaryText + newLine + newLine + columnsText + newLine + detailText;

        return csvText;
    }

}
/*


*/
