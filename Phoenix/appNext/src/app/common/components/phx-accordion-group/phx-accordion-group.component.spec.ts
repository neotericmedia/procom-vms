import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxAccordionGroupComponent } from './phx-accordion-group.component';

describe('PhxAccordionGroupComponent', () => {
  let component: PhxAccordionGroupComponent;
  let fixture: ComponentFixture<PhxAccordionGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxAccordionGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxAccordionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
