export interface CustomField {
    DisplayName: string;
    FieldName: string;
    FieldType: 'Textbox' | 'DecimalNumber' | 'Dropdown' | 'Datepicker';
    FieldValue: any;
    IsMandatory: boolean;
    RegEx: string;
    SelectValues: string;
    SelectValueArray?: string[];
    SortOrder: number;
    ValidationMessage: string;
    DefaultValue: string;
}
