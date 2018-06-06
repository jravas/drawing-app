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
  segment;
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
    let that = this;
    // when image is loaded draw it on canvas element
    reader.onload = function() {
      let image = new Image();
      image.src = reader.result;
      image.onload = function() {
        // set canvas width and height equalt to iamge width and height
        that.drawingArea.width = image.width;
        that.drawingArea.height = image.height;
        // set image on canvas
        let raster = new paper.Raster(image, new paper.Point(image.width / 2, image.height / 2));
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
      this.tool.onMouseDown = (event) => {
        event.preventDefault();
      }
      // prevent move tool actions
      this.tool.onMouseMove = (event) => {
        event.preventDefault();
      }
      // create circle from center (clicked point) of radius (released point)
      this.tool.onMouseDrag = (event) => {
        event.preventDefault();
        var path = new paper.Path.Circle({
          center: event.downPoint,
          radius: event.downPoint.getDistance(event.point),
          strokeColor: that.color
        });
        path.data.type = 'circle';
        path.fillColor = new paper.Color(0, 0, 0, 0.0001);
        // path.fillColor = '#000';
        // Remove this path on the next drag event:
        path.removeOnDrag();
      }
    } else if (tool === 'rectangle') {
      this.tool.onMouseDown = (event) => {
        event.preventDefault();
      }
      // prevent move tool actions
      this.tool.onMouseMove = (event) => {
        event.preventDefault();
      }
      // create rectangle from clicked point to released point
      this.tool.onMouseDrag = (event) => {
        event.preventDefault();
        var rectangle = new paper.Path.Rectangle(event.downPoint, event.point)
        rectangle.strokeColor = that.color;
        rectangle.fillColor = new paper.Color(0, 0, 0, 0.0001);
        rectangle.data.type = 'rectangle';
        // Remove this path on the next drag event:
        rectangle.removeOnDrag();
      }
    } else if (tool === 'move') {
      var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
      };
      this.tool.onMouseDown = (event) => {
        event.preventDefault();
        this.segment = this.path = null;
        var hitResult = paper.project.hitTest(event.point, hitOptions);

        if (event.modifiers.shift) {
          if (hitResult.type == 'segment') {
            hitResult.segment.remove();
          };
          return;
        }

        if (hitResult) {
          this.path = hitResult.item;
          if (hitResult.type == 'segment') {
            this.segment = hitResult.segment;
          } else if (hitResult.type == 'stroke') {
            var location = hitResult.location;
            this.segment = this.path.insert(location.index + 1, event.point);
            this.path.smooth();
          }
          hitResult.item.bringToFront();
        }
      }
      this.tool.onMouseMove = (event) => {
        event.preventDefault();
        var hitResult = paper.project.hitTest(event.point, hitOptions);
        paper.project.activeLayer.selected = false;
        if (hitResult && hitResult.item) {
          hitResult.item.selected = true;
        }
      }
      this.tool.onMouseDrag = (event) => {
        event.preventDefault();
        if (this.segment) {
          // if item type is circle change circle radius
          if (this.path.data.type === 'circle') {
            // changing circle radius
            this.path.scale(event.point.getDistance(this.path.bounds.center) / (this.path.bounds.width / 2))
          } else if (this.path.data.type === 'rectangle') {
            // if item type is rectangle change get rectangle width and height
            let a = this.path.bounds.width;
            let b = this.path.bounds.height;
            let c = event.point.getDistance(this.path.bounds.center) * 2;
            // scale rectangle
            this.path.scale(c / (Math.sqrt((Math.pow(a,2) + Math.pow(b,2)))))
            // console.log(event.point.getDistance(this.path.bounds.center))
          } else {
            this.segment.point.x += event.delta.x;
            this.segment.point.y += event.delta.y;
            this.path.smooth();
          }
        } else if (this.path) {
            this.path.position.x += event.delta.x;
            this.path.position.y += event.delta.y;
        }
      }
    } else if (tool === 'bezier') {
        var currentSegment, mode, type;
        this.tool.onMouseDown = (event) => {
          console.log(this.path)
          event.preventDefault();
          if (currentSegment) {
            currentSegment.selected = false;
            mode = type = currentSegment = null;
          }
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
