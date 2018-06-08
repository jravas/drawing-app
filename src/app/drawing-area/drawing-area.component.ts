import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as Paper from 'paper';

@Component({
  selector: 'app-drawing-area',
  templateUrl: './drawing-area.component.html'
})
export class DrawingAreaComponent implements OnInit {
  drawingArea;
  exported;

  onFileChanged(event) {
    // emit event
    this.selectEvent.emit(true);
    // get 2d context of canvas elemet
    let ctx = this.drawingArea.getContext('2d');
    let reader = new FileReader();
    let that = this;
    // when image is loaded draw it on canvas element
    reader.onload = function() {
      let image = new Image();
      image.src = reader.result;
      image.onload = function() {
        // width & height of main element
        // let width = document.getElementById('canvas-container').offsetWidth;
        // let height = document.getElementById('canvas-container').offsetHeight;
        // // check if image is larger than image container -> screen
        // if (image.height > height -20) {
        //   console.log('image is too big do something about that 😸')
        // }
        // set canvas width and height equalt to iamge width and height
        that.drawingArea.width = image.width;
        that.drawingArea.height = image.height;
        // check if image is larger than screen size
        // set image on canvas
        let raster = new Paper.Raster(image, new Paper.Point(image.width / 2, image.height / 2));
      }
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  exportJSON() {
    this.exported = Paper.project.exportJSON();
    console.log(this.exported)
  }

  importJSON() {
    Paper.project.importJSON(this.exported);
  }

  @Input() isSelected: boolean;
  @Output() selectEvent = new EventEmitter<boolean>();
  ngOnInit() {
    this.drawingArea = document.getElementById('drawingArea')
    Paper.setup(this.drawingArea)
  }

}
