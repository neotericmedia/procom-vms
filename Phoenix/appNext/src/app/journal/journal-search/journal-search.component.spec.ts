import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalSearchComponent } from './journal-search.component';

describe('JournalSearchComponent', () => {
  let component: JournalSearchComponent;
  let fixture: ComponentFixture<JournalSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
