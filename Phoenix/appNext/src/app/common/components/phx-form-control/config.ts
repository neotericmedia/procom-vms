// SRC: https://github.com/d-kostov-dev/ng2-mdf-validation-messages

export class ValidationMessagesConfiguration {
    class: string;
    defaultErrorMessages: DefaultErrorMessages;
}

export class DefaultErrorMessages {
    required: string;
    pattern: string;
    email: string;
    minLength: string;
    maxLength: string;
    minNumber: string;
    maxNumber: string;
    minDate: string;
    maxDate: string;
    noEmpty: string;
    unknownError: string;
    rangeLength: string;
    range: string;
    digit: string;
    equal: string;
    url: string;
    date: string;
    areEqual: string;
    passwords: string;
    [key: string]: string;
}

export const defaultConfig: ValidationMessagesConfiguration = {
    class: 'text-danger',
    defaultErrorMessages: {
        required: 'common.phxFormControl.required',
        pattern: 'common.phxFormControl.pattern',
        email: 'common.phxFormControl.email',
        minLength: 'common.phxFormControl.minLength',
        maxLength: 'common.phxFormControl.maxLength',
        minNumber: 'common.phxFormControl.minNumber',
        maxNumber: 'common.phxFormControl.maxNumber',
        minDate: 'common.phxFormControl.minNumber',
        maxDate: 'common.phxFormControl.maxNumber',
        noEmpty: 'common.phxFormControl.noEmpty',
        rangeLength: 'common.phxFormControl.rangeLength',
        range: 'common.phxFormControl.range',
        digit: 'common.phxFormControl.digit',
        equal: 'common.phxFormControl.equal',
        url: 'common.phxFormControl.url',
        date: 'common.phxFormControl.date',
        areEqual: 'common.phxFormControl.areEqual',
        passwords: 'common.phxFormControl.passwords',
        unknownError: 'common.phxFormControl.unknownError',
    },
};
