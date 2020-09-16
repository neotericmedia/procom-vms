import { TimeSheetDetail } from './index';
import { Project } from '../../project/model/index';


export interface TimeSheetActiveCapsule {
    detail: TimeSheetDetail;
    openModal: boolean;
    project: Project;
    isSubmitted: boolean;
}
