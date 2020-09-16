export class PhxDocumentFileUploaderOptions {
    queueLimit?: number;
    maxFileSize?: number;
    allowedMimeType?: Array<string>;
    allowedFileType?: Array<string>;

    constructor(params: PhxDocumentFileUploaderOptions) {
        Object.assign(this, params);
    }
}
