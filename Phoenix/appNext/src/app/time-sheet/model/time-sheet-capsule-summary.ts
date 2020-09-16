import { TimeSheetCapsule } from './time-sheet-capsule';
export interface TimeSheetCapsuleSummary {
    capsule: TimeSheetCapsule;
    visible: boolean;
    totalUnits: number;
    projectVersionId?: number;
}
