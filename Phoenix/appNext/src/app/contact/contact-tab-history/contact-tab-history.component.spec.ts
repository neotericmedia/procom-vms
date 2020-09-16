import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactTabHistoryComponent } from './contact-tab-history.component';

describe('ContactTabHistoryComponent', () => {
  let component: ContactTabHistoryComponent;
  let fixture: ComponentFixture<ContactTabHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactTabHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactTabHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
