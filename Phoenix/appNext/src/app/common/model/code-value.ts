export interface CodeValue {
    id: number;
    groupName: string;
    parentId?: number;
    parentGroup: string;
    code: string;
    text: string;
    description: string;
    sortOrder: number;
    Icon: string;
}
