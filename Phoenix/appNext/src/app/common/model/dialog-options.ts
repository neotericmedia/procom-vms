export class DialogOptions {
    backdrop?: any = true; // values: 'static',true,false
    backdropClass?: string = 'dialogs-backdrop-default';
    size?: string = 'lg'; // values: 'sm', 'lg', 'md'
    windowClass?: string = 'dialogs-default';
    animation?: boolean = false;

    constructor(params: DialogOptions) {
        Object.assign(this, params);
    }
}
