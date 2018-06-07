import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  imageSelected = false;

  @HostListener('document:keydown', ['$event']) deleteEvent(e) {
    console.log(e.keyCode);
    // 46 & 8
  }

  selectedFunction($event) {
    console.log($event)
  }

  ngOnInit() {
  }
}
