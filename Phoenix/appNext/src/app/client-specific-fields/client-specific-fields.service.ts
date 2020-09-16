import { Injectable } from '@angular/core';
import { ApiService } from '../common';
import { CustomField } from './model/custom-field';

@Injectable()
export class ClientSpecificFieldsService {

  constructor(private apiSvc: ApiService) { }

  getCustomFields(clientId, entityId, entityTypeId): Promise<CustomField[]> {
    return this.apiSvc.query(`ClientBasedEntityCustomField/GetCustomFields?organizationId=${clientId}&entityType=${entityTypeId}&entityId=${entityId}`)
      .then((res: any) => res.CustomFields);
  }
}
