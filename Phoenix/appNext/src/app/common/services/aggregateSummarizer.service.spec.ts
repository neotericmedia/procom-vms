/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AggregateSummarizerService } from './aggregateSummarizer.service';

describe('Service: AggregateSummarizer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AggregateSummarizerService]
    });
  });

  it('should ...', inject([AggregateSummarizerService], (service: AggregateSummarizerService) => {
    expect(service).toBeTruthy();
  }));
});