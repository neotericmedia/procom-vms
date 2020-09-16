import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxAccordionComponent } from './phx-accordion.component';

describe('PhxAccordionComponent', () => {
  let component: PhxAccordionComponent;
  let fixture: ComponentFixture<PhxAccordionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxAccordionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
