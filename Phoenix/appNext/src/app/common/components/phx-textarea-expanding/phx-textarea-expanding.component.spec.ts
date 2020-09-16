import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxTextareaExpandingComponent } from './phx-textarea-expanding.component';

describe('PhxTextareaExpandingComponent', () => {
  let component: PhxTextareaExpandingComponent;
  let fixture: ComponentFixture<PhxTextareaExpandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxTextareaExpandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxTextareaExpandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
