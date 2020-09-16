export interface StateAction {

    /**
     * The state action id defined in ApplicationConstants that's in sync with the codetable in the database.
     * It is used to retrieve default displayText and commandName.
     * Security will also be checked against it.
     * Pure UI action does not need to provide this field.
     */
    actionId?: number;

    /**
     * Set this flag to true when actionId is provided but does not wish to perform security check against it.
     * ex. batch screen actions
     */
    skipSecurityCheck?: boolean;

    /**
     * The display text of the button.
     * Override any default if provided.
     */
    displayText?: string;

    /**
     * The command name of the button.
     * Override any default if provided.
     */
    commandName?: string;

    /**
     * The sort order of the button within the same style.
     */
    sortOrder?: number;

    /**
     * The style of the button.
     * Please refer to the enum for currently supported style.
     * Currently ordered as PRIMARY -> DANGER -> WARNING -> SECONDARY -> ...
     */
    style?: StateActionButtonStyle;

    /**
     * Set this flag to true when a declined comment dialog is desired.
     * The comment entered is returned in the actionOption obj.
     */
    showDeclinedCommentDialog?: boolean;

    /**
     * This function is called when the button is clicked.
     * @param action - the action itself
     * @param componentOption - component data that can be used in the logic
     * @param actionOption - additional data available from the action
     */
    onClick(action: StateAction, componentOption: StateActionButtonsOption, actionOption?: OnClickStateActionOption): void;

    /**
     * This function is used to determine the hidden state of the button.
     * @param action - the action itself
     * @param componentOption - component data that can be used in the logic
     * @returns - hidden or not
     */
    hiddenFn?(action: StateAction, componentOption: StateActionButtonsOption): boolean;

    /**
     * This function is used to determine the disabled state of the button.
     * @param action - the action itself
     * @param componentOption - component data that can be used in the logic
     * @returns - disabled or not
     */
    disabledFn?(action: StateAction, componentOption: StateActionButtonsOption): boolean;

    /* ----- private variables, do not use outside of component. ----- */
    _primaryAction?: boolean;
    _secondaryAction?: boolean;
    _dangerAction?: boolean;
    _warningAction?: boolean;
}

export interface StateActionButtonsOption {
    displayType: StateActionDisplayType;
    refData: any;
}

export interface OnClickStateActionOption {
    comment?: string;
}

export enum StateActionButtonStyle {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY',
    DANGER = 'DANGER',
    WARNING = 'WARNING'
}

export enum StateActionDisplayType {
    BUTTON = 'BUTTON',
    DROPDOWN = 'DROPDOWN',
    SMALL_BUTTON = 'SMALL_BUTTON',
    BUTTON_WITH_ELIPSIS = 'BUTTON_WITH_ELIPSIS'     // buttons without style config will be placed in elipsis
}
