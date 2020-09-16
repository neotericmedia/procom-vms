import { TestBed, inject } from '@angular/core/testing';

import { JsConvertedJqueryService } from './js.converted.jquery.service';

describe('JsConvertedJqueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsConvertedJqueryService]
    });
  });

  it('should ...', inject([JsConvertedJqueryService], (service: JsConvertedJqueryService) => {
    expect(service).toBeTruthy();
  }));
});
