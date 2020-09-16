import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxNavigationBarComponent } from './phx-navigation-bar.component';

describe('NavigationMenuComponent', () => {
  let component: PhxNavigationBarComponent;
  let fixture: ComponentFixture<PhxNavigationBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxNavigationBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxNavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
