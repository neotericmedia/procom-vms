import { BatchOperation } from './../../common/model/batch-operation';
import { PhxConstants } from '../../common';

// This toggles this display of slot numbers
export const ACTIVITY_CENTRE_DEBUG = false;

export enum ActivityCardFieldType {
    string = 0,
    date = 1,
    integer = 2,
    decimal = 3,
    currency = 4
}

export enum TaskType {
    myTask = 0,
    allTask = 1
}

export const ActivityCardConfig = {

    WorkOrderVersion: {
        Worker: {
            slotId: 0,
            fieldType: ActivityCardFieldType.string
        },
        Client: {
            slotId: 2,
            fieldType: ActivityCardFieldType.string
        },
        WorkOrderNumber: {
            slotId: 6,
            fieldType: ActivityCardFieldType.string
        },
        DateRange: {
            slotId: 8,
            fieldType: ActivityCardFieldType.string
        },
        PastDue: {
            slotId: 14,
            fieldType: ActivityCardFieldType.string
        },
        // UserProfileId: {
        //     slotId: 10,
        //     fieldType:  ActivityCardFieldType.integer
        // },
        Status: {
            slotId: 10,
            fieldType: ActivityCardFieldType.string
        },
        TaskOwner: {
            slotId: 12,
            fieldType: ActivityCardFieldType.string
        }
    },
    TimeSheet: {
        Worker: {
            slotId: 0,
            fieldType: ActivityCardFieldType.string
        },
        Client: {
            slotId: 2,
            fieldType: ActivityCardFieldType.string
        },
        Units: {
            slotId: 16,
            fieldType: ActivityCardFieldType.decimal
        },
        UnitType: {
            slotId: 17,
            fieldType: ActivityCardFieldType.string
        },
        IdLabel: {
            slotId: 6,
            fieldType: ActivityCardFieldType.string
        },
        TimesheetId: {
            slotId: 7,
            fieldType: ActivityCardFieldType.string
        },
        DateRange: {
            slotId: 8,
            fieldType: ActivityCardFieldType.string
        },
        PastDue: {
            slotId: 14,
            fieldType: ActivityCardFieldType.string
        },
        Status: {
            slotId: 10,
            fieldType: ActivityCardFieldType.string
        },
        TaskOwner: {
            slotId: 12,
            fieldType: ActivityCardFieldType.string
        }
    },
    Organization: {
        OrganizationName: {
            slotId: 0,
            fieldType: ActivityCardFieldType.string
        },
        OrganizationType: {
            slotId: 2,
            fieldType: ActivityCardFieldType.string
        },
        IdLabel: {
            slotId: 6,
            fieldType: ActivityCardFieldType.string
        },
        SourceOrgId: {
            slotId: 7,
            fieldType: ActivityCardFieldType.string
        },
        Status: {
            slotId: 10,
            fieldType: ActivityCardFieldType.string
        },
        TaskOwner: {
            slotId: 12,
            fieldType: ActivityCardFieldType.string
        },
        PastDue: {
            slotId: 14,
            fieldType: ActivityCardFieldType.string
        }
    },
    Payment: {
        PayeeName: {
            slotId: 0,
            fieldType: ActivityCardFieldType.string
        },
        PaymentDate: {
            slotId: 2,
            fieldType: ActivityCardFieldType.date
        },
        AmountPayment: {
            slotId: 16,
            fieldType: ActivityCardFieldType.currency
        },
        PaymentNumber: {
            slotId: 4,
            fieldType: ActivityCardFieldType.string
        },
        LineItemCount: {
            slotId: 6,
            fieldType: ActivityCardFieldType.integer
        },
        Status: {
            slotId: 10,
            fieldType: ActivityCardFieldType.string
        },
        TaskOwner: {
            slotId: 12,
            fieldType: ActivityCardFieldType.string
        },
        PastDue: {
            slotId: 14,
            fieldType: ActivityCardFieldType.string
        }
    },
    People: {
        PersonName: {
            slotId: 0,
            fieldType: ActivityCardFieldType.string
        },
        OrganizationName: {
            slotId: 2,
            fieldType: ActivityCardFieldType.string
        },
        IdLabel: {
            slotId: 6,
            fieldType: ActivityCardFieldType.string
        },
        SourceContactId: {
            slotId: 7,
            fieldType: ActivityCardFieldType.string
        },
        ProfileType: {
            slotId: 4,
            fieldType: ActivityCardFieldType.string
        },
        Status: {
            slotId: 10,
            fieldType: ActivityCardFieldType.string
        },
        TaskOwner: {
            slotId: 12,
            fieldType: ActivityCardFieldType.string
        },
        PastDue: {
            slotId: 14,
            fieldType: ActivityCardFieldType.string
        }
    },
    PaymentTransaction: {
        PayeeName: {
            slotId: 0,
            fieldType: ActivityCardFieldType.string
        },
        WorkerName: {
            slotId: 2,
            fieldType: ActivityCardFieldType.string
        },
        /*IdLabel: {
            slotId: 4,
            fieldType: ActivityCardFieldType.string
        },*/
        PaymentTransactionNumber: {
            slotId: 5,
            fieldType: ActivityCardFieldType.string
        },
        ReleasedOrPlannedReleaseDate: {
            slotId: 6,
            fieldType: ActivityCardFieldType.date
        },
        Status: {
            slotId: 10,
            fieldType: ActivityCardFieldType.string
        },
        TaskOwner: {
            slotId: 12,
            fieldType: ActivityCardFieldType.string
        },
        PastDue: {
            slotId: 14,
            fieldType: ActivityCardFieldType.string
        }
    },
    Document: {
        DocumentRule: {
            slotId: 0,
            fieldType: ActivityCardFieldType.string
        },
        Status: {
            slotId: 10,
            fieldType: ActivityCardFieldType.string
        },
        TaskOwner: {
            slotId: 12,
            fieldType: ActivityCardFieldType.string
        },
        PastDue: {
            slotId: 14,
            fieldType: ActivityCardFieldType.string
        },
        DocumentEntityInfo: {
            slotId: 8,
            fieldType: ActivityCardFieldType.string
        }
    },
    Expense: {
        Worker: {
            slotId: 0,
            fieldType: ActivityCardFieldType.string
        },
        Client: {
            slotId: 2,
            fieldType: ActivityCardFieldType.string
        },
        TotalAmount: {
            slotId: 16,
            fieldType: ActivityCardFieldType.currency
        },
        Currency: {
            slotId: 17,
            fieldType: ActivityCardFieldType.string
        },
        ClaimTitle: {
            slotId: 6,
            fieldType: ActivityCardFieldType.string
        },
        DateRange: {
            slotId: 8,
            fieldType: ActivityCardFieldType.string
        },
        PastDue: {
            slotId: 14,
            fieldType: ActivityCardFieldType.string
        },
        Status: {
            slotId: 10,
            fieldType: ActivityCardFieldType.string
        },
        TaskOwner: {
            slotId: 12,
            fieldType: ActivityCardFieldType.string
        }
    }

};

export interface ActivityBatchConfiguration {
    entityTypeId: number;
    getBatchOperationButtons(statusIds: number[]): BatchOperation[];
}

export const ActivityEntityConfigs: ActivityBatchConfiguration[] = [
    { // Timesheet
        entityTypeId: 9,
        getBatchOperationButtons(statusIds: number[]): BatchOperation[] {
            if (statusIds.length === 1 && statusIds[0] === PhxConstants.TimeSheetStatus.PendingClientReview) {
                return [
                    {
                        Name: 'common.generic.approve',
                        ConfirmMessage: 'activityCentre.messages.confirmApproveTimeSheet',
                        SuccessMessage: 'activityCentre.messages.timeSheetApproveSuccessMessage',
                        TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.None,
                        CommandName: 'SetTimeSheetIndividualClientApproverToApproved',
                        DisplayButtonOrder: 1,
                        IsPrimaryAction: true,
                        TaskIdsToBatch: [],
                        BatchPreValidationCommandName: 'BatchPreValidationOnTimeSheetIndividualClientApproval',
                        BatchPreExecutionCommandName: 'BatchPreExecutionOnTimeSheetIndividualClientApproval',
                        BatchThreadExecutionCommandName: 'BatchThreadExecutionOnTimeSheetIndividualClientApproval',
                        TaskResultId: PhxConstants.TaskResult.Complete
                    },
                    {
                        Name: 'common.generic.decline',
                        ConfirmMessage: 'activityCentre.messages.confirmDeclineTimeSheet',
                        SuccessMessage: 'activityCentre.messages.timeSheetDeclineSuccessMessage',
                        TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.Decline,
                        CommandName: 'ChangeTimeSheetStatusToDeclined',
                        DisplayButtonOrder: 2,
                        IsPrimaryAction: false,
                        TaskIdsToBatch: [],
                        BatchPreExecutionCommandName: 'BatchPreExecutionOnTimeSheetDecline',
                        BatchThreadExecutionCommandName: 'BatchThreadExecutionOnTimeSheetDecline',
                        TaskResultId: PhxConstants.TaskResult.Complete
                    }
                ];
            }
            return [];
        }
    },
    { // Expense
        entityTypeId: 96,
        getBatchOperationButtons(statusIds: number[]): BatchOperation[] {
            if (statusIds.length === 1) {
                switch (statusIds[0]) {
                    case PhxConstants.ExpenseClaimStatus.PendingSupplierReview:
                        return [
                            {
                                Name: 'common.generic.approve',
                                ConfirmMessage: 'activityCentre.messages.confirmApproveExpense',
                                SuccessMessage: 'activityCentre.messages.expenseApproveSuccessMessage',
                                TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.None,
                                CommandName: 'SetExpenseClaimIndividualSupplierApproverToApproved',
                                DisplayButtonOrder: 1,
                                IsPrimaryAction: true,
                                TaskIdsToBatch: [],
                                BatchPreValidationCommandName: 'BatchPreValidationOnExpenseClaimIndividualSupplierApproval',
                                BatchPreExecutionCommandName: 'BatchPreExecutionOnExpenseClaimIndividualSupplierApproval',
                                BatchThreadExecutionCommandName: 'BatchThreadExecutionOnExpenseClaimIndividualSupplierApproval',
                                TaskResultId: PhxConstants.TaskResult.Complete
                            },
                            {
                                Name: 'common.generic.decline',
                                ConfirmMessage: 'activityCentre.messages.confirmDeclineExpense',
                                SuccessMessage: 'activityCentre.messages.expenseDeclineSuccessMessage',
                                TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.Decline,
                                CommandName: 'ChangeExpenseClaimStatusToDeclined',
                                DisplayButtonOrder: 2,
                                IsPrimaryAction: false,
                                TaskIdsToBatch: [],
                                BatchPreExecutionCommandName: 'BatchPreExecutionOnExpenseClaimDecline',
                                BatchThreadExecutionCommandName: 'BatchThreadExecutionOnExpenseClaimDecline',
                                TaskResultId: PhxConstants.TaskResult.Complete
                            }
                        ];

                    case PhxConstants.ExpenseClaimStatus.PendingInternalReview:
                        return [
                            {
                                Name: 'common.generic.approve',
                                ConfirmMessage: 'activityCentre.messages.confirmApproveExpense',
                                SuccessMessage: 'activityCentre.messages.expenseApproveSuccessMessage',
                                TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.None,
                                CommandName: 'SetExpenseClaimIndividualInternalApproverToApproved',
                                DisplayButtonOrder: 1,
                                IsPrimaryAction: true,
                                TaskIdsToBatch: [],
                                BatchPreValidationCommandName: 'BatchPreValidationOnExpenseClaimIndividualInternalApproval',
                                BatchPreExecutionCommandName: 'BatchPreExecutionOnExpenseClaimIndividualInternalApproval',
                                BatchThreadExecutionCommandName: 'BatchThreadExecutionOnExpenseClaimIndividualInternalApproval',
                                TaskResultId: PhxConstants.TaskResult.Complete
                            },
                            {
                                Name: 'common.generic.decline',
                                ConfirmMessage: 'activityCentre.messages.confirmDeclineExpense',
                                SuccessMessage: 'activityCentre.messages.expenseDeclineSuccessMessage',
                                TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.Decline,
                                CommandName: 'ChangeExpenseClaimStatusToDeclined',
                                DisplayButtonOrder: 2,
                                IsPrimaryAction: false,
                                TaskIdsToBatch: [],
                                BatchPreExecutionCommandName: 'BatchPreExecutionOnExpenseClaimDecline',
                                BatchThreadExecutionCommandName: 'BatchThreadExecutionOnExpenseClaimDecline',
                                TaskResultId: PhxConstants.TaskResult.Complete
                            }
                        ];

                    case PhxConstants.ExpenseClaimStatus.PendingClientReview:
                        return [
                            {
                                Name: 'common.generic.approve',
                                ConfirmMessage: 'activityCentre.messages.confirmApproveExpense',
                                SuccessMessage: 'activityCentre.messages.expenseApproveSuccessMessage',
                                TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.None,
                                CommandName: 'SetExpenseClaimIndividualClientApproverToApproved',
                                DisplayButtonOrder: 1,
                                IsPrimaryAction: true,
                                TaskIdsToBatch: [],
                                BatchPreValidationCommandName: 'BatchPreValidationOnExpenseClaimIndividualClientApproval',
                                BatchPreExecutionCommandName: 'BatchPreExecutionOnExpenseClaimIndividualClientApproval',
                                BatchThreadExecutionCommandName: 'BatchThreadExecutionOnExpenseClaimIndividualClientApproval',
                                TaskResultId: PhxConstants.TaskResult.Complete
                            },
                            {
                                Name: 'common.generic.decline',
                                ConfirmMessage: 'activityCentre.messages.confirmDeclineExpense',
                                SuccessMessage: 'activityCentre.messages.expenseDeclineSuccessMessage',
                                TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.Decline,
                                CommandName: 'ChangeExpenseClaimStatusToDeclined',
                                DisplayButtonOrder: 2,
                                IsPrimaryAction: false,
                                TaskIdsToBatch: [],
                                BatchPreExecutionCommandName: 'BatchPreExecutionOnExpenseClaimDecline',
                                BatchThreadExecutionCommandName: 'BatchThreadExecutionOnExpenseClaimDecline',
                                TaskResultId: PhxConstants.TaskResult.Complete
                            }
                        ];

                    case PhxConstants.ExpenseClaimStatus.PendingBackofficeReview:
                        return [
                            {
                                Name: 'common.generic.approve',
                                ConfirmMessage: 'activityCentre.messages.confirmApproveExpense',
                                SuccessMessage: 'activityCentre.messages.expenseApproveSuccessMessage',
                                TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.None,
                                CommandName: 'AcceptAndApproveExpenseClaim',
                                DisplayButtonOrder: 1,
                                IsPrimaryAction: true,
                                TaskIdsToBatch: [],
                                BatchPreValidationCommandName: 'BatchPreValidationOnAcceptAndApproveExpenseClaim',
                                BatchPreExecutionCommandName: 'BatchPreExecutionOnAcceptAndApproveExpenseClaim',
                                BatchThreadExecutionCommandName: 'BatchThreadExecutionOnAcceptAndApproveExpenseClaim',
                                TaskResultId: PhxConstants.TaskResult.Complete
                            },
                            {
                                Name: 'common.generic.decline',
                                ConfirmMessage: 'activityCentre.messages.confirmDeclineExpense',
                                SuccessMessage: 'activityCentre.messages.expenseDeclineSuccessMessage',
                                TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType.Decline,
                                CommandName: 'ChangeExpenseClaimStatusToDeclined',
                                DisplayButtonOrder: 2,
                                IsPrimaryAction: false,
                                TaskIdsToBatch: [],
                                BatchPreExecutionCommandName: 'BatchPreExecutionOnExpenseClaimDecline',
                                BatchThreadExecutionCommandName: 'BatchThreadExecutionOnExpenseClaimDecline',
                                TaskResultId: PhxConstants.TaskResult.Complete
                            }
                        ];

                    default:
                        return [];
                }
            }
            return [];
        }
    }
];
