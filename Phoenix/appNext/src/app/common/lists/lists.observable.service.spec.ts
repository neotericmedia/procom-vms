import { TestBed, inject } from '@angular/core/testing';
import { CommonListsObservableService } from './lists.observable.service';

describe('CommonListsObservableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonListsObservableService]
    });
  });

  it(
    'should be created',
    inject([CommonListsObservableService], (service: CommonListsObservableService) => {
      expect(service).toBeTruthy();
    })
  );
});
