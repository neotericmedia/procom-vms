export interface IPhxUnread {
    Id: number;
    NoteId: number;
    IsRead: boolean;
    LastModifiedDatetime: Date;
}

export interface PhxNote {
    Comment: string;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    EntityId: number;
    EntityTypeId: number;
    Id: number;
    IsDraft: boolean;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
    CommentOwnerName: string;
    IsCritical: boolean;
    UnreadNote: IPhxUnread;
}

