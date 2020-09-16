export interface PhxDocument {
    CreatedByProfileId?: number;
    CreatedDatetime?: Date;
    Description?: string;
    DocumentTypeId: number;
    EntityId?: number;
    EntityTypeId?: number;
    Extension?: string;
    LastModifiedByProfileId?: number;
    LastModifiedDatetime?: Date;
    Name: string;
    PdfDocumentPublicId?: string;
    PublicId: string;
    Size?: number;
    UploadedByContactFirstName?: string;
    UploadedByContactLastName?: string;
    UploadedByProfileId?: number;
    UploadedDatetime?: Date;
}
