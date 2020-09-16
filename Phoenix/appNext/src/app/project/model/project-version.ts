import { CustomFieldValue } from '../../common/model/index';

export interface ProjectVersion {
    Id: number;
    Name: string;
    Code: string;
    Description: string;
    CustomFieldValues: CustomFieldValue[];

}
