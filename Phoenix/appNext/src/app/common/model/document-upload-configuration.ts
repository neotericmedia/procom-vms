export class DocumentUploadConfiguration {
    UploadTitle?: string = 'Upload';
    WorkflowPendingTaskId: number;
    entityTypeId: number;
    entityId: number;
    documentTypeId: number;
    multiDocumentUploadBatchId: string;
    customId1?: number;
    customId2?: number;
    customMethodata?: number;
    description?: string;
    isFinalDocument?: boolean;

    constructor(params: DocumentUploadConfiguration) {
        Object.assign(this, params);
    }
}
