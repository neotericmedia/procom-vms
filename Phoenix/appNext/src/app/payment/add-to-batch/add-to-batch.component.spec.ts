import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToBatchComponent } from './add-to-batch.component';

describe('AddToBatchComponent', () => {
  let component: AddToBatchComponent;
  let fixture: ComponentFixture<AddToBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddToBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
