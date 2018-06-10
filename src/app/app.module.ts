import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MainToolsSidebarComponent } from './main-tools-sidebar/main-tools-sidebar.component';
import { DrawingAreaComponent } from './drawing-area/drawing-area.component';
import { importType } from '@angular/compiler/src/output/output_ast';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    AppComponent,
    MainToolsSidebarComponent,
    DrawingAreaComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ColorPickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
