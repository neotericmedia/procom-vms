import { CodeValueService } from '../../common/services/code-value.service';
import { PhxDataTableColumn } from '../../common/model';
import * as moment from 'moment';
import { CommonService } from '../../common';

export interface RemittanceRow {
    WorkerId: number;
    WorkerName: string;
    OrganizationName: string;
    LegalStatus: number;
    Branch: number;
    LineOfBusiness: number;
    PaymentTransaction: string;
    PaymentTransactionDate: string;
    PaymentTransactionStartDate: string;
    PaymentTransactionEndDate: string;
    PaymentReleaseDate: string;
    GrossPay: number;
    CppEmployer: number;
    CppEmployee: number;
    EiEmployer: number;
    EiEmployee: number;
    PipEmployer: number;
    PipEmployee: number;
    FederalTax: number;
    ProvincialTax: number;
    QppEmployer: number;
    QppEmployee: number;
    NonResidentTax: number;
    AdditionalTax: number;
    EhtEmployer?: number;
    WcbEmployer?: number;
    ClassificationPct?: number;
    PaymentBatchReference: string;
    PaymentReference: string;
    DeductionsProvinceState?: number;
    WorkerClassification?: number;
}

export interface RemittanceType {
    property: string;
    title: string;
    total?: number;
}

const CppEmployer = 'CppEmployer';
const CppEmployee = 'CppEmployee';
const EiEmployer = 'EiEmployer';
const EiEmployee = 'EiEmployee';
const PipEmployer = 'PipEmployer';
const PipEmployee = 'PipEmployee';
const FederalTax = 'FederalTax';
const ProvincialTax = 'ProvincialTax';
const QppEmployer = 'QppEmployer';
const QppEmployee = 'QppEmployee';
const NonResidentTax = 'NonResidentTax';
const AdditionalTax = 'AdditionalTax';
const EhtEmployer = 'EhtEmployer';

export class PendingPayrollRemittancesExport {

    public static RemittanceTypes: RemittanceType[] = [
        { property: CppEmployer, title: 'CPP Employer', },
        { property: CppEmployee, title: 'CPP Employee', },
        { property: EiEmployer, title: 'EI Employer', },
        { property: EiEmployee, title: 'EI Employee', },
        { property: PipEmployer, title: 'PIP Employer', },
        { property: PipEmployee, title: 'PIPEmployee', },
        { property: FederalTax, title: 'Federal Income Tax', },
        { property: ProvincialTax, title: 'Provincial Income Tax', },
        { property: QppEmployer, title: 'QPP Employer', },
        { property: QppEmployee, title: 'QPP Employee', },
        { property: NonResidentTax, title: 'Non-Resident Withholding Tax', },
        { property: AdditionalTax, title: 'Deduct Additional Tax', },
        { property: EhtEmployer, title: 'Employer Health Tax', },
    ];

    public static produceCsvText(remittanceType: string, /*columns: Array<PhxDataTableColumn>,*/ rows: RemittanceRow[],
        totals: RemittanceType[], totalRemittanceAmount: number, grossPay: number, remittanceDate: Date,
        codeValueService: CodeValueService) {

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

        const strFromCode = (code: number, codeValueName: string) => {
            return codeValueService.getCodeValues(codeValueName, true)
                .filter(i => i.id === code)
                .map(i => '"' + i.text + '"')
                .join();
        };

        const strLegalStatus = (value: number) => {
            return strFromCode(value, 'usr.CodeProfileType');
        };

        const strBranch = (value: number) => {
            return strFromCode(value, 'workorder.CodeInternalOrganizationDefinition1');
        };

        const strProvince = (value: number) => {
            return strFromCode(value, 'workorder.CodeWorksite');
        };

        const strLOB = (value: number) => {
            return strFromCode(value, 'org.CodeLineOfBusiness');
        };

        const totalAmt = (propertyName: string) => {
            const total = Array.isArray(totals) && totals.find(i => i.property === propertyName);
            return total ? amt(total.total) : '';
        };

        const newLine = '\r\n';

        const title1 = '"Payment Transaction","Worker Id","Worker Name","Organization","Legal Status"';
        const title2 = ',"Branch","Province","LOB"';
        const title3 = ',"Payment Transaction Date",Transaction Start","Transaction End","Payment Release"';
        const title7 = ',"Reference No","Payment Reference","Gross Pay"';
        const title4 = ',"CPP Employer","CPP Employee","EI Employer","EI Employee","PIP Employer","PIP Employee"';
        const title5 = ',"Federal Tax","Provincial Tax","QPP Employer","QPP Employee"';
        const title6 = ',"Non-Resident Tax","Additional Tax"';
        const titleEht = ',"EhtEmployer"';
        const titleWcb = '"Worker Classification","ClassificationPct","Employer Worker Safety"';
        const titleRemit = ',"Remit"';

        let titleRow = title1 + title2 + title3 + title7;

        switch (remittanceType) {
            case 'wcb':
                titleRow = titleRow + titleWcb + titleRemit;
                break;
            case 'health-tax':
                titleRow = titleRow + titleEht + titleRemit;
                break;
            case 'payroll-deduction':
                titleRow = titleRow + title4 + title5 + title6 + titleRemit;
                break;
        }

        // const titleRow = columns.map(i => str(i.caption)).join(',');

        const csvRows = rows.map((i) => {

            // const remit = 0 + i.CppEmployer + i.CppEmployee + i.EiEmployer + i.EiEmployee + i.PipEmployer + i.PipEmployee
            //     + i.FederalTax + i.ProvincialTax + i.QppEmployer + i.QppEmployee
            //     + i.NonResidentTax + i.AdditionalTax
            //     ;

            let csvRow = ''
                + str(i.PaymentTransaction) + ',' + str(i.WorkerId) + ',' + str(i.WorkerName) + ',' + str(i.OrganizationName) + ',' + strLegalStatus(i.LegalStatus)
                + ',' + strBranch(i.Branch) + ',' + strProvince(i.DeductionsProvinceState) + ',' + strLOB(i.LineOfBusiness)
                + ',' + dt(i.PaymentTransactionDate) + ',' + dt(i.PaymentTransactionStartDate) + ',' + dt(i.PaymentTransactionEndDate) + ',' + dt(i.PaymentReleaseDate)
                + ',' + str(i.PaymentBatchReference) + ',' + str(i.PaymentReference) + ',' + amt(i.GrossPay)
                ;
            switch (remittanceType) {
                case 'wcb':
                    csvRow = csvRow + ',' + amt(i.ClassificationPct, 4) + ',' + amt(i.WcbEmployer) + ',' + amt(i.WcbEmployer);
                    break;
                case 'health-tax':
                    csvRow = csvRow + ',' + amt(i.EhtEmployer) + ',' + amt(i.EhtEmployer) ;
                    break;
                case 'payroll-deduction':
                    const remit = 0 + i.CppEmployer + i.CppEmployee + i.EiEmployer + i.EiEmployee + i.PipEmployer + i.PipEmployee
                        + i.FederalTax + i.ProvincialTax + i.QppEmployer + i.QppEmployee
                        + i.NonResidentTax + i.AdditionalTax
                        ;
                    csvRow = csvRow
                        + ',' + amt(i.CppEmployer) + ',' + amt(i.CppEmployee) + ',' + amt(i.EiEmployer) + ',' + amt(i.EiEmployee) + ',' + amt(i.PipEmployer) + ',' + amt(i.PipEmployee)
                        + ',' + amt(i.FederalTax) + ',' + amt(i.ProvincialTax) + ',' + amt(i.QppEmployer) + ',' + amt(i.QppEmployee)
                        + ',' + amt(i.NonResidentTax) + ',' + amt(i.AdditionalTax) + ',' + amt(remit)
                        ;
                    break;
            }
            return csvRow;
        })
            .join(newLine);

        let totalLine = '';
        switch (remittanceType) {
            case 'wcb':
                totalLine = newLine + '"---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---"' + newLine
                    + '"Totals","","","","","","","","","","","","","",' + amt(grossPay) + ',"",' + amt(totalRemittanceAmount) + ',' + amt(totalRemittanceAmount)
                    ;
                break;
            case 'health-tax':
                totalLine = newLine + '"---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---"' + newLine
                    + '"Totals","","","","","","","","","","","","","",' + amt(grossPay) + ',' + totalAmt(EhtEmployer) + ',' + totalAmt(EhtEmployer)
                    ;
                break;
            case 'payroll-deduction':
                totalLine = newLine +
                    '"---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---","---",'
                    + newLine
                    + '"Totals","","","","",""'
                    + ',"","",""'
                    + ',"","","","","",' + amt(grossPay)
                    + ',' + totalAmt(CppEmployer) + ',' + totalAmt(CppEmployee) + ',' + totalAmt(EiEmployer) + ',' + totalAmt(EiEmployee) + ',' + totalAmt(PipEmployer) + ',' + totalAmt(PipEmployee)
                    + ',' + totalAmt(FederalTax) + ',' + totalAmt(ProvincialTax) + ',' + totalAmt(QppEmployer) + ',' + totalAmt(QppEmployee)
                    + ',' + totalAmt(NonResidentTax) + ',' + totalAmt(AdditionalTax) + ',' + amt(totalRemittanceAmount)
                    ;
                break;
        }

        const grossTotalsCsv = 'Gross Paid' + ',' + amt(grossPay) + newLine
            + 'Total Remittance Amount' + ',' + amt(totalRemittanceAmount) + newLine
            + 'Remittance Date' + ',' + (remittanceDate ? dt(remittanceDate) : 'N/A');

        const totalsCsv = (totals || []).map(i => newLine + str(i.title) + ',' + amt(i.total));

        const csvText = titleRow + newLine + csvRows + totalLine + newLine + newLine + grossTotalsCsv + newLine + totalsCsv;

        return csvText;
    }

    public static downloadCsvFile(commonService: CommonService, csvText: string, batchNumber?: number, organizationInternalCode?: string) {
        const encodedData = btoa(csvText);
        const fileName = (batchNumber ? organizationInternalCode + ' Remittance batch ' + batchNumber : 'Pending Remittances Draft') + '.csv';
        commonService.base64FileSaveAs(encodedData, 'text/csv', 'utf-8', fileName);
    }

    public static calculateRemittanceTotals(rows: RemittanceRow[], remittanceType: string, workerCompensations: any[], codeValueService: CodeValueService) {
        let remittanceTotalsAll: RemittanceType[];
        switch (remittanceType) {
            case 'payroll-deduction':
                remittanceTotalsAll = PendingPayrollRemittancesExport.calculatePayrollTotals(rows);
                break;
            case 'wcb':
                remittanceTotalsAll = PendingPayrollRemittancesExport.calculateWcbTotals(rows, workerCompensations, codeValueService);
                break;
            case 'health-tax':
                remittanceTotalsAll = PendingPayrollRemittancesExport.calculateHealthTotals(rows);
                break;
        }
        return remittanceTotalsAll.filter(i => !!i.total);
    }

    private static calculatePayrollTotals(rows: RemittanceRow[]) {
        return PendingPayrollRemittancesExport.RemittanceTypes
        .filter(i => (i.property !== 'EhtEmployer') && (i.property !== 'QuebecTrainingFee'))
        .map(i => {
            i.total = rows.reduce((prev, current) => current[i.property] ? prev + current[i.property] : prev, 0);
            return i;
        });
    }

    private static calculateHealthTotals(rows: RemittanceRow[]) {
        return PendingPayrollRemittancesExport.RemittanceTypes
            .filter(i => i.property === 'EhtEmployer')
            .map(i => {
                i.total = rows.reduce((prev, current) => current[i.property] ? prev + current[i.property] : prev, 0);
                return i;
            });
    }

    private static calculateWcbTotals(rows: RemittanceRow[], workerCompensations: any[], codeValueService: CodeValueService) {
        const allItems = rows.map(i => {
            return {
                deductionsProvinceState: i.DeductionsProvinceState,
                workerClassification: i.WorkerClassification,
                wcbEmployer: i.WcbEmployer,
            };
        });
        const lines = [];
        allItems.forEach(i => {
            const index = lines.findIndex(j => j.deductionsProvinceState === i.deductionsProvinceState && j.workerClassification === i.workerClassification);
            if (index === -1) {
                lines.push(i);
            } else {
                lines[index].wcbEmployer = lines[index].wcbEmployer + i.wcbEmployer;
            }
        });
        const linesWithTitles: RemittanceType[] = lines.map(i => {
            const wC = workerCompensations.find(k => k.value === i.workerClassification);
            const worksites = codeValueService.getCodeValues('workorder.CodeWorksite', true);
            const wS = worksites.find(k => k.id === i.deductionsProvinceState);
            return {
                property: null,
                title: (wC ? wC.text : '') + ' - ' + (wS ? wS.text : ''),
                total: i.wcbEmployer,
            };
        });
        const sortedLines = linesWithTitles.sort((a, b) => {
            const nameA = a.title.toUpperCase();
            const nameB = b.title.toUpperCase();
            if (nameA < nameB) { return -1; }
            if (nameA > nameB) { return 1; }
            return 0;
        });
        return sortedLines;
    }

}
