import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as Paper from 'paper';

@Component({
  selector: 'app-main-tools-sidebar',
  templateUrl: './main-tools-sidebar.component.html'
})
export class MainToolsSidebarComponent implements OnInit {
  drawingArea;
  tool = new Paper.Tool();
  color = '#000';
  types = ['point', 'handleIn', 'handleOut'];
  myPath;
  segment;
  path;
  pathB;
  // tools calsses
  freeHand;
  circle;
  rectangle;
  move;
  bezier;
  close;
  simplify;

  freeHandTool() {
    // start path drawing on mouse down
    this.tool.onMouseDown = (event) => {
      this.myPath = new Paper.Path();
      this.myPath.strokeColor = this.color;
      this.myPath.add(event.point);
    }
    // adding point to path while dragging
    this.tool.onMouseDrag = (event) => {
      this.myPath.add(event.point);
    }
    // prevent move tool actions
    this.tool.onMouseMove = (event) => {
      event.preventDefault();
    }
  }

  circleTool() {
    // create circle from center (clicked point) of radius (released point)
    this.tool.onMouseDrag = (event) => {
      event.preventDefault();
      var path = new Paper.Path.Circle({
        center: event.downPoint,
        radius: event.downPoint.getDistance(event.point),
        strokeColor: this.color
      });
      path.data.type = 'circle';
      path.fillColor = new Paper.Color(0, 0, 0, 0.0001);
      // Remove this path on the next drag event:
      path.removeOnDrag();
    }
    // prevent move tool actions
    this.tool.onMouseMove = (event) => {
      event.preventDefault();
    }
    this.tool.onMouseDown = (event) => {
      event.preventDefault();
    }
  }

  rectangleTool() {
    // create rectangle from clicked point to released point
    this.tool.onMouseDrag = (event) => {
      event.preventDefault();
      var rectangle = new Paper.Path.Rectangle(event.downPoint, event.point)
      rectangle.strokeColor = this.color;
      rectangle.fillColor = new Paper.Color(0, 0, 0, 0.0001);
      rectangle.data.type = 'rectangle';
      // Remove this path on the next drag event:
      rectangle.removeOnDrag();
    }
    // prevent move tool actions
    this.tool.onMouseMove = (event) => {
      event.preventDefault();
    }
    this.tool.onMouseDown = (event) => {
      event.preventDefault();
    }
  }

  moveTool() {
    var hitOptions = {
      segments: true,
      stroke: true,
      fill: true,
      tolerance: 5
    };
    this.tool.onMouseDown = (event) => {
      event.preventDefault();
      this.segment = this.path = null;
      var hitResult = Paper.project.hitTest(event.point, hitOptions);

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
      var hitResult = Paper.project.hitTest(event.point, hitOptions);
      Paper.project.activeLayer.selected = false;
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
  }

  bezierTool() {
    var currentSegment, mode, type;
    this.tool.onMouseDown = (event) => {
      event.preventDefault();
      if (currentSegment) {
        currentSegment.selected = false;
        mode = type = currentSegment = null;
      }
      if (!this.pathB) {
        this.pathB = new Paper.Path();
        this.pathB.fillColor = {
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
        if (this.pathB.segments.length > 1 && result.type == 'point' && result.segment.index == 0) {
          mode = 'close';
          this.pathB.closed = true;
          this.pathB.selected = false;
          this.pathB = null;
        }
      }

      if (mode != 'close') {
        mode = currentSegment ? 'move' : 'add';
        if (!currentSegment) {
          currentSegment = this.pathB.add(event.point);
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
          delta = new Paper.Point({ x: -delta.x, y: -delta.y });
        }
        currentSegment.handleIn.x += delta.x;
        currentSegment.handleIn.y += delta.y;
        currentSegment.handleOut.x -= delta.x;
        currentSegment.handleOut.y -= delta.y;
      }
    }
  }

  findHandle(point) {
    // bezier drawing handle
    for (var i = 0, l = this.pathB.segments.length; i < l; i++) {
      for (var j = 0; j < 3; j++) {
        var type = this.types[j];
        var segment = this.pathB.segments[i];
        var segmentPoint = type == 'point' ? segment.point : segment.point + segment[type];
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

  closePolygon() {
    var hitOptions = {
      segments: true,
      stroke: true,
      fill: true,
      tolerance: 5
    };
    // move cursor to detect polygon then close it on double click
    this.tool.onMouseMove = (event) => {
      event.preventDefault();
      var hitResult = Paper.project.hitTest(event.point, hitOptions);
      Paper.project.activeLayer.selected = false;
      if (hitResult && hitResult.item) {
        hitResult.item.selected = true;
        // double click to close poygon
        hitResult.item.onClick = (e) => {
          e.target.closed = true;
          e.target.selected = false;
          this.pathB = null;
        }
      }
    }
    this.tool.onMouseDown = (event) => {
      event.preventDefault();
    }
    this.tool.onMouseDrag = (event) => {
      event.preventDefault();
    }
  }
  simplifyPolygon() {
    var hitOptions = {
      segments: true,
      stroke: true,
      fill: true,
      tolerance: 5
    };
    // move cursor to detect polygon then close it on double click
    this.tool.onMouseMove = (event) => {
      event.preventDefault();
      var hitResult = Paper.project.hitTest(event.point, hitOptions);
      Paper.project.activeLayer.selected = false;
      if (hitResult && hitResult.item) {
        hitResult.item.selected = true;
        // double click to close poygon
        hitResult.item.onClick = (e) => {
          e.target.simplify();
          e.target.flatten(4);
        }
      }
    }
    this.tool.onMouseDown = (event) => {
      event.preventDefault();
    }
    this.tool.onMouseDrag = (event) => {
      event.preventDefault();
    }
  }
  selectTool(tool) {
    // remove active classes
    this.resetActiveClasses();
    // tools selecting
    if (tool === 'freeHand') {
      this.freeHandTool();
      this.freeHand = true;
    } else if (tool === 'circle') {
      this.circleTool();
      this.circle = true;
    } else if (tool === 'rectangle') {
      this.rectangleTool();
      this.rectangle = true;
    } else if (tool === 'move') {
      this.moveTool();
      this.move = true;
    } else if (tool === 'bezier') {
      this.bezierTool();
      this.bezier = true;
    } else if (tool === 'close') {
      this.closePolygon();
      this.close = true;
    } else if (tool === 'simplify') {
      this.simplifyPolygon();
      this.simplify = true;
    }
  }
  resetActiveClasses() {
    this.freeHand = null;
    this.circle = null;
    this.rectangle = false;
    this.move = null;
    this.bezier = null;
    this.close = null;
    this.simplify = null;
  }

  clearScene() {
    // temp solution show buton for add/create iamge
    this.drawingArea.width = 500;
    this.drawingArea.height = 500;
    // reset variables becaus tools relies on them
    // maybe define inside functions
    this.pathB = null;
    this.myPath = null;
    this.segment = null;
    // remove all items from active layer
    Paper.project.clear()
    // emit clear event
    this.clearEvent.emit(false);
  }

  @Input() isSelected: boolean;
  @Output() clearEvent = new EventEmitter<boolean>();

  ngOnInit() {
    this.drawingArea = document.getElementById('drawingArea')
  }

}
