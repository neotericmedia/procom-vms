import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPictureComponent } from './account-picture.component';

describe('AccountPictureComponent', () => {
  let component: AccountPictureComponent;
  let fixture: ComponentFixture<AccountPictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPictureComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
