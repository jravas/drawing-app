import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainToolsSidebarComponent } from './main-tools-sidebar.component';

describe('MainToolsSidebarComponent', () => {
  let component: MainToolsSidebarComponent;
  let fixture: ComponentFixture<MainToolsSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainToolsSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainToolsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
