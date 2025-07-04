var TILE_W = 25;
var TILE_H = 25;

function Game() {
  this.WIDTH = 40;
  this.HEIGHT = 24;
  this.map = [];
  this.rooms = [];
}

Game.prototype.init = function() {
  // Устанавливаем размеры поля под размер карты
  $('.field').css({
    width: this.WIDTH * TILE_W,
    height: this.HEIGHT * TILE_H
  });
  this.generateMap();
  this.generateRooms();
  this.generateVerticalCorridors();
  this.generateHorizontalCorridors();
  this.connectRooms();
  this.render();
};

Game.prototype.generateMap = function() {
  for (var y = 0; y < this.HEIGHT; y++) {
    this.map[y] = [];
    for (var x = 0; x < this.WIDTH; x++) {
      this.map[y][x] = 'W'; // W = wall
    }
  }
};

Game.prototype.generateRooms = function() {
  var roomCount = 5 + Math.floor(Math.random() * 6); // 5-10
  for (var i = 0; i < roomCount; i++) {
    var w = 3 + Math.floor(Math.random() * 6); // 3-8
    var h = 3 + Math.floor(Math.random() * 6);
    var x = 1 + Math.floor(Math.random() * (this.WIDTH - w - 1));
    var y = 1 + Math.floor(Math.random() * (this.HEIGHT - h - 1));
    var room = {x:x, y:y, w:w, h:h};
    if (!this.isOverlap(room)) {
      this.rooms.push(room);
      for (var ry = y; ry < y + h; ry++) {
        for (var rx = x; rx < x + w; rx++) {
          this.map[ry][rx] = '.'; // . = floor
        }
      }
    }
  }
};

Game.prototype.isOverlap = function(room) {
  for (var i = 0; i < this.rooms.length; i++) {
    var r = this.rooms[i];
    if (room.x < r.x + r.w && room.x + room.w > r.x && room.y < r.y + r.h && room.y + room.h > r.y) {
      return true;
    }
  }
  return false;
};

Game.prototype.connectRooms = function() {
  for (var i = 1; i < this.rooms.length; i++) {
    var r1 = this.rooms[i-1];
    var r2 = this.rooms[i];
    var x1 = Math.floor(r1.x + r1.w/2), y1 = Math.floor(r1.y + r1.h/2);
    var x2 = Math.floor(r2.x + r2.w/2), y2 = Math.floor(r2.y + r2.h/2);
    this.createCorridor(x1, y1, x2, y2);
  }
};

Game.prototype.createCorridor = function(x1, y1, x2, y2) {
  var x = x1, y = y1;
  while (x !== x2) {
    this.map[y][x] = '.';
    x += (x2 > x) ? 1 : -1;
  }
  while (y !== y2) {
    this.map[y][x] = '.';
    y += (y2 > y) ? 1 : -1;
  }
};

Game.prototype.generateVerticalCorridors = function() {
  var count = 3 + Math.floor(Math.random() * 3); // 3-5
  var used = {};
  for (var i = 0; i < count; i++) {
    var x;
    do {
      x = 1 + Math.floor(Math.random() * (this.WIDTH - 2));
    } while (used[x]);
    used[x] = true;
    for (var y = 0; y < this.HEIGHT; y++) {
      this.map[y][x] = '.';
    }
  }
};

Game.prototype.generateHorizontalCorridors = function() {
  var count = 3 + Math.floor(Math.random() * 3); // 3-5
  var used = {};
  for (var i = 0; i < count; i++) {
    var y;
    do {
      y = 1 + Math.floor(Math.random() * (this.HEIGHT - 2));
    } while (used[y]);
    used[y] = true;
    for (var x = 0; x < this.WIDTH; x++) {
      this.map[y][x] = '.';
    }
  }
};

Game.prototype.render = function() {
  var $field = $('.field');
  $field.empty();
  for (var y = 0; y < this.HEIGHT; y++) {
    for (var x = 0; x < this.WIDTH; x++) {
      var t = this.map[y][x];
      var $tile = $('<div class="tile"></div>');
      $tile.css({
        left: x * TILE_W,
        top: y * TILE_H,
        width: TILE_W,
        height: TILE_H
      });
      if (t === 'W') $tile.addClass('tileW');
      if (t === '.') $tile.addClass('tile');
      $field.append($tile);
    }
  }
}; 