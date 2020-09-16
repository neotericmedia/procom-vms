import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoItemsComponent } from './demo-items.component';

describe('DemoItemsComponent', () => {
  let component: DemoItemsComponent;
  let fixture: ComponentFixture<DemoItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
