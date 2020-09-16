import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalBatchComponent } from './journal-batch.component';

describe('JournalBatchComponent', () => {
  let component: JournalBatchComponent;
  let fixture: ComponentFixture<JournalBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
