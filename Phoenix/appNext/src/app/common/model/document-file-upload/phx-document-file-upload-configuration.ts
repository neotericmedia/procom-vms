export class PhxDocumentFileUploadConfiguration {

    entityTypeId: number;
    entityId: number;
    documentTypeId: number;
    WorkflowPendingTaskId?: number;  // TODO: remove this
    limitMultiFileUploads?: number;
    UploadTitle?: string;
    SupportedFileExtensions?: string;
    customId1?: number;
    customId2?: number;
    customMethodata?: number;
    customDateTime?: Date;
    customComment?: string;
    description?: string;
    isFinalDocument?: boolean;

    customUiConfig?: {
        objectDate: {
            value: Date,
            isRequared: boolean,
            label: string,
            helpBlock: string
        },
        objectComment: {
            value: string,
            isRequared: boolean,
            label: string,
            helpBlock: string
            minlength: number,
            maxlength: number
        },
        objectDocumentType?: {
            value?: number,
            isRequared: boolean,
            label: string,
            helpBlock: string
        }
    };

  constructor(params: PhxDocumentFileUploadConfiguration) {
    Object.assign(this, params);
  }
}
