import { Injectable, EventEmitter } from '@angular/core';
import { ApiService } from './api.service';
import { EntityList } from './../model/entity-list';
import { CommandResponse } from './../model/command-response';
import { PhxNote } from './../model/phx-note';


@Injectable()
export class NoteService {
  countEmit: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private apiService: ApiService
  ) { }

  public getNotes(entityTypeId, entityId): Promise<EntityList<PhxNote>> {
    return this.apiService.query(`note/entityType/${entityTypeId}/entity/${entityId}`);
  }

  public saveNote(command): Promise<CommandResponse> {
    return this.apiService.command('SaveNote', command);
  }

  public markRead(command): Promise<CommandResponse> {
    return this.apiService.command('MarkUnreadNote', command);
  }

  public sendFeedback(command): Promise<CommandResponse> {
    command.WorkflowPendingTaskId = -1;
    return this.apiService.command('SendFeedback', command);
  }

  public markCritical(command): Promise<CommandResponse> {
    return this.apiService.command('MarkCriticalNote', command);
  }

  public getCountEmit(event) {
    this.countEmit.emit(event);
  }

}

