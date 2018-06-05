import { Component, OnInit } from '@angular/core';
import * as paper from 'paper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  tool = new paper.Tool();
  drawingArea;
  myPath;

  onFileChanged(event) {
    const file = event.target.files[0]
    // console.log(event.target.results)
    let ctx = this.drawingArea.getContext('2d');
    // console.log(ctx)
    // ctx.drawImage(event.target.files[0], 0, 0);
    let reader = new FileReader();
    reader.onload = function(e) {
      // console.log(reader.result);
      let image = new Image();
      image.src = reader.result;
      image.onload = function (){
        // ctx.drawImage(image, 0, 0);
        let raster = new paper.Raster(image);
        raster.position = paper.view.center;
      }
    }
    reader.readAsDataURL(event.target.files[0]);
  }
  selectTool(tool) {
    switch(tool) {
      case 'freeHand':
        this.tool.onMouseDown = function(event) {
          this.myPath = new paper.Path();
          this.myPath.strokeColor = 'black';
          this.myPath.add(event.point);
        }
        this.tool.onMouseDrag = function(event) {
          this.myPath.add(event.point);
          console.log(this.myPath)
        }
        break;
      case 'circle':
      let circle;
        this.tool.onMouseDown = function(event) {
          circle = new paper.Path.Circle({
            center: event.point,
            // radius: event.delta.length / 2
            radius: 1
          });
          circle.strokeColor = 'black';
        }
        this.tool.onMouseDrag = function(event) {
          // console.log(event.point)
          // circle.bounds = new paper.Path.Circle(circle.data.center, event.point)
          // distance between circle center and pointer location
          // console.log(event.point.getDistance(circle.bounds.center))
          circle.scale((event.point.getDistance(circle.bounds.center)) / (circle.bounds.width / 2))
        }
        this.tool.onMouseUp = function(event) {
          console.log(circle.bounds.width / 2)
          // console.log(event.point.getDistance(circle.bounds.center))
          // circle.bounds = new paper.Path.Circle({circle.center})
        }
        break;
    }
  }

  ngOnInit() {
    this.drawingArea = document.getElementById('drawingArea')
    paper.setup(this.drawingArea)
  }
}
