import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxModalComponent } from './phx-modal.component';

describe('PhxModalComponent', () => {
  let component: PhxModalComponent;
  let fixture: ComponentFixture<PhxModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
