export class PhxDialogComponentConfigModel {
    public HeaderTitle?: string;
    public BodyMessage?: string;
    public Buttons: Array<PhxDialogComponentConfigModelButton>;
    public ObjectDate?: PhxDialogComponentConfigModelDate;
    public ObjectComment?: PhxDialogComponentConfigModelComment;
    public ObjectDropdown?: PhxDialogComponentConfigModelDropdown;
}
export class PhxDialogComponentConfigModelButton {
    public Id: number;
    public CheckValidation?: boolean = false;
    public Name: string;
    public SortOrder: number;
    public Class: string = 'btn-default';
    public ClickEvent?: (PhxDialogComponentEventEmitterInterface) => void;
}
export class PhxDialogComponentConfigModelDate {
    public Label: string;
    public HelpBlock: string;
    public Value?: Date;
    public IsRequared: boolean;
    public Max?: Date | string;
    public Min?: Date | string;
}
export class PhxDialogComponentConfigModelComment {
    public Label: string;
    public HelpBlock: string;
    public Value?: string;
    public IsRequared: boolean;
    public LengthMin: number;
    public LengthMax: number;
    public PlaceHolder?: string;
}
export interface PhxDialogComponentEventEmitterInterface {
    buttonId: number;
    config: PhxDialogComponentConfigModel;
}
export class PhxDialogComponentConfigModelDropdown {
    public Label: string;
    public HelpBlock: string;
    public Value?: string;
    public IsRequared: boolean;
    public AdditionalNote?: string;
    public PlaceHolder?: string;
    public DropDownList?: any[];
}
