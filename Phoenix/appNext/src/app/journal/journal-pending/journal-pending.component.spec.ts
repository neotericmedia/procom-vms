import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalPendingComponent } from './journal-pending.component';

describe('JournalPendingComponent', () => {
  let component: JournalPendingComponent;
  let fixture: ComponentFixture<JournalPendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalPendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
