import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDateBoxComponent } from './phx-date-box.component';

describe('PhxDateBoxComponent', () => {
  let component: PhxDateBoxComponent;
  let fixture: ComponentFixture<PhxDateBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDateBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDateBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
