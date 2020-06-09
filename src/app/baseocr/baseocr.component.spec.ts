import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseocrComponent } from './baseocr.component';

describe('BaseocrComponent', () => {
  let component: BaseocrComponent;
  let fixture: ComponentFixture<BaseocrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseocrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseocrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
