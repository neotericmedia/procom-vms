import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDialogComponent } from './phx-dialog.component';

describe('PhxDialogComponent', () => {
  let component: PhxDialogComponent;
  let fixture: ComponentFixture<PhxDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
