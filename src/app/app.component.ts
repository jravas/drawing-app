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
  types = ['point', 'handleIn', 'handleOut'];
  drawingArea;
  myPath;
  path;

  findHandle(point) {
    for (var i = 0, l = this.path.segments.length; i < l; i++) {
      for (var j = 0; j < 3; j++) {
        var type = this.types[j];
        var segment = this.path.segments[i];
        var segmentPoint = type == 'point' ? segment.point : segment.point + segment[type];
        // var distance = (point - segmentPoint).length;
        var distance = point.getDistance(segmentPoint);
        if (distance < 3) {
          return {
            type: type,
            segment: segment
          };
        }
      }
    }
    return null;
  }

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
    if (tool === 'freeHand') {
      // prevent move tool actions
      this.tool.onMouseMove = (event) => {
        event.preventDefault();
      }
      this.tool.onMouseDown = (event) => {
        this.myPath = new paper.Path();
        this.myPath.strokeColor = that.color;
        this.myPath.add(event.point);
      }
      this.tool.onMouseDrag = (event) => {
        this.myPath.add(event.point);
      }
    } else if (tool === 'circle') {
      // prevent move tool actions
      this.tool.onMouseMove = (event) => {
        event.preventDefault();
      }
      // create circle from center (clicked point) of radius (released point)
      this.tool.onMouseDrag = (event) => {
        var path = new paper.Path.Circle({
          center: event.downPoint,
          radius: event.downPoint.getDistance(event.point),
          strokeColor: that.color
        });
        // Remove this path on the next drag event:
        path.removeOnDrag();
      }
    } else if (tool === 'rectangle') {
      // prevent move tool actions
      this.tool.onMouseMove = (event) => {
        event.preventDefault();
      }
      // create rectangle from clicked point to released point
      this.tool.onMouseDrag = (event) => {
        var rectangle = new paper.Path.Rectangle(event.downPoint, event.point)
        rectangle.strokeColor = that.color;
        // Remove this path on the next drag event:
        rectangle.removeOnDrag();
      }
    } else if (tool === 'move') {
      var hitOptions = {
        segments: true,
        stroke: true,
        fill: false,
        tolerance: 5
      };
      this.tool.onMouseMove = (event) => {
        // relocate
        var hitResult = paper.project.hitTest(event.point, hitOptions);
        paper.project.activeLayer.selected = false;
        if (hitResult && hitResult.item) {
          hitResult.item.selected = true;
        }
      }
      // drag
      this.tool.onMouseDown = (event) => {
        var hitResult = paper.project.hitTest(event.point, hitOptions);
        paper.project.activeLayer.selected = false;
        if (hitResult && hitResult.item) {
          hitResult.item.selected = true;
          console.log(hitResult.item.bounds.center)
          // hitResult.item.bounds.center = event.point;
        }
      }
      this.tool.onMouseDrag = (event) => {
      }
    } else if (tool === 'bezier') {
        var currentSegment, mode, type;
        this.tool.onMouseDown = (event) => {
          if (currentSegment)
            currentSegment.selected = false;
            mode = type = currentSegment = null;
          if (!this.path) {
            this.path = new paper.Path();
            this.path.fillColor = {
              hue: 360 * Math.random(),
              saturation: 1,
              brightness: 1,
              alpha: 0.5
            };
          }
          var result = this.findHandle(event.point);
          if (result) {
            currentSegment = result.segment;
            type = result.type;        
            if (this.path.segments.length > 1 && result.type == 'point' && result.segment.index == 0) {
              mode = 'close';
              this.path.closed = true;
              this.path.selected = false;
              this.path = null;
            }
          }

          if (mode != 'close') {
            mode = currentSegment ? 'move' : 'add';
            if (!currentSegment) {
              currentSegment = this.path.add(event.point);
            }
            currentSegment.selected = true;
          }
        }
        this.tool.onMouseDrag = (event) => {
          event.preventDefault();
            if (mode == 'move' && type == 'point') {
              currentSegment.point = event.point;
            } else if (mode != 'close') {
              var delta = event.delta.clone();
              if (type == 'handleOut' || mode == 'add') {
                delta = new paper.Point({ x: -delta.x, y: -delta.y });
              }
              currentSegment.handleIn.x += delta.x;
              currentSegment.handleIn.y += delta.y;
              currentSegment.handleOut.x -= delta.x;
              currentSegment.handleOut.y -= delta.y;
            }
        }
    }
  }

  ngOnInit() {
    this.drawingArea = document.getElementById('drawingArea')
    paper.setup(this.drawingArea)
  }
}
