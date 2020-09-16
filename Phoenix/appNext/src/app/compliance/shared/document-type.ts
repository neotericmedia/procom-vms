import { AccessAction } from '../../common/model/index';
import { PhxConstants } from '../../common/PhoenixCommon.module';

export interface DocumentType {
    Id: number;
    Name: string;
    Description: string;
    LastModifiedDatetime: Date;
    StatusId: PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus;
    AccessActions: Array<AccessAction>;
}
