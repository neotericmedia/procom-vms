import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { T4PrintingComponent } from './t4-printing.component';

describe('T4PrintingComponent', () => {
  let component: T4PrintingComponent;
  let fixture: ComponentFixture<T4PrintingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ T4PrintingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(T4PrintingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
