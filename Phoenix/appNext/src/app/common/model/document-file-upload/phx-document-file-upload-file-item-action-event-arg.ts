import { FileItem } from 'ng2-file-upload';
import { PhxConstants } from '../phx-constants';
import { CommandResponse } from '../command-response';

export class PhxDocumentFileUploadFileItemActionEventArg {
    item: FileItem;
    response: PhxDocumentFileUploadResult;
    status: number;
}

export class PhxDocumentFileUploadError {
    item: FileItem;
    response: string;
    status: number;
}

export class PhxDocumentFileUploadResult {
    documentName: string;
    publicId: string;
    documentTypeId: PhxConstants.DocumentType;
    exceptionMessage: string;
    notificationMessage: string;
    commandResult: CommandResponse;
}
