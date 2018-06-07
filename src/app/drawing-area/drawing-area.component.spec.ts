import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingAreaComponent } from './drawing-area.component';

describe('DrawingAreaComponent', () => {
  let component: DrawingAreaComponent;
  let fixture: ComponentFixture<DrawingAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawingAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
