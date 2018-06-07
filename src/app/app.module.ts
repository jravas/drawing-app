import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MainToolsSidebarComponent } from './main-tools-sidebar/main-tools-sidebar.component';
import { DrawingAreaComponent } from './drawing-area/drawing-area.component';

@NgModule({
  declarations: [
    AppComponent,
    MainToolsSidebarComponent,
    DrawingAreaComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
