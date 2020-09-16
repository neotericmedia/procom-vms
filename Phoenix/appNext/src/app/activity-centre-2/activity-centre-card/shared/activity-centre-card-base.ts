import { SimpleChanges, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { PhxConstants } from '../../../common';
import { ActivityCentreCardComponentBase } from './activity-centre-card-component-base';
import { CardBase, CardEntity, TimeSheetActionCommand } from './../../model';

export abstract class ActivityCentreCardBase<T extends CardBase> extends ActivityCentreCardComponentBase implements OnChanges {

    @Input() cardEntity: CardEntity;
    @Output() cardActionCompleted = new EventEmitter<TimeSheetActionCommand>();

    card: T;

    phxConstants: typeof PhxConstants;

    showProfilePicture: boolean = false;

    constructor() {
        super();
    }

    public abstract getCardDetails(): void;

    ngOnChanges(changes: SimpleChanges) {
        if (changes && changes.cardEntity && changes.cardEntity.currentValue) {
            this.cardEntity = changes.cardEntity.currentValue;
            this.getCardDetails();
        }
    }
}
