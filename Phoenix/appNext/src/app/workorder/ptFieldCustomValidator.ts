import { WorkOrderApiServiceLocator } from './workorder.api.service.locator';
import { ControlFieldAccessibility } from './control-field-accessibility';
import { AuthService } from '../common/services/auth.service';

export class PtFieldViewCustomValidator {
    static authService: AuthService;

    static checkPtFieldViewCustomValidator(modelPrefix, fieldName, modelValidators = null, validator, isFromTaxOrEarningsAndDeduction = false) {
        this.authService = WorkOrderApiServiceLocator.injector.get<AuthService>(AuthService, null);
        if (ControlFieldAccessibility.ptFieldViewEventOnChangeStatusId(modelPrefix, fieldName, modelValidators, this.authService, isFromTaxOrEarningsAndDeduction)) {
            return validator;
        } else {
            return null;
        }
    }
}
