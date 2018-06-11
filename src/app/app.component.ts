import { Component, OnInit,HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  imageSelected = false;

  selectedFunction($event) {
    // console.log($event)
  }

  ngOnInit() {
  }
}
