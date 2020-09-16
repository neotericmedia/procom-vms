/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TestchildComponent } from './testchild.component';

describe('TestchildComponent', () => {
  let component: TestchildComponent;
  let fixture: ComponentFixture<TestchildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestchildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestchildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
