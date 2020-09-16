import { RestrictionSelectorType } from './restriction-selector-type';

export class RestrictionItem {
    id: number;
    name: string;
    restrcitionSelectorType: RestrictionSelectorType = RestrictionSelectorType.Dropdown;

    constructor(params: RestrictionItem) {
        Object.assign(this, params);
    }
}
