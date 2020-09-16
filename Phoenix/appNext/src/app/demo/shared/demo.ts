import { DemoItem } from './demoItem';
import { WorkflowAction, AccessAction } from '../../common/model/index';
import { DemoParent } from './demoParent';

export interface Demo {
    Id: number;
    AccessActions: Array<AccessAction>;
    WorkflowAvailableActions: Array<WorkflowAction>;
    WorkflowPendingTaskId?: number;

    WorkOrderId?: number;
    WorkOrderNumber?: string;
    WorkerName: string;

    StringField: string;
    MultilineStringField: string;
    DateField?: Date;
    CurrencyCodeValueField?: number;
    IntegerField: number;
    DecimalField: number;
    CountryId?: number;
    SubdivisionId?: number;
    RadioButton: number;
    CheckBox: boolean;
    Total: number;
    ItemsCount: number;
    LastModifiedByProfileId: number;
    LastModifiedDate: Date;
    CreatedByProfileId: number;
    CreatedDate: Date;

    Parent?: DemoParent;
    Items: Array<DemoItem>;
}
