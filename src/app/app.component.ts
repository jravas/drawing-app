import { Component, OnInit } from '@angular/core';
import * as paper from 'paper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  tool = new paper.Tool();
  color = '#000';
  drawingArea;
  myPath;

  onFileChanged(event) {
    // get 2d context of canvas elemet
    let ctx = this.drawingArea.getContext('2d');
    let reader = new FileReader();
    // when image is loaded draw it on canvas element
    reader.onload = function(e) {
      let image = new Image();
      image.src = reader.result;
      image.onload = function (){
        let raster = new paper.Raster(image);
        raster.position = paper.view.center;
      }
    }
    reader.readAsDataURL(event.target.files[0]);
  }
  selectTool(tool) {
    let that = this;
    switch(tool) {
      case 'freeHand':
        this.tool.onMouseDown = function(event) {
          this.myPath = new paper.Path();
          this.myPath.strokeColor = that.color;
          this.myPath.add(event.point);
        }
        this.tool.onMouseDrag = function(event) {
          this.myPath.add(event.point);
        }
        break;
      case 'circle':
        // create circle from center (clicked point) of radius (released point)
        this.tool.onMouseDrag = function(event) {
          var path = new paper.Path.Circle({
            center: event.downPoint,
            radius: event.downPoint.getDistance(event.point),
            strokeColor: that.color
          });
          // Remove this path on the next drag event:
          path.removeOnDrag();
        }
        break;
      case 'rectangle':
        // create rectangle from clicked point to released point
        this.tool.onMouseDrag = function(event) {
          var rectangle = new paper.Path.Rectangle(event.downPoint, event.point)
          rectangle.strokeColor = that.color;
          // Remove this path on the next drag event:
          rectangle.removeOnDrag();
        }
        break;
    }
  }

  ngOnInit() {
    this.drawingArea = document.getElementById('drawingArea')
    paper.setup(this.drawingArea)
  }
}
