var TILE_W = 25;
var TILE_H = 25;

function Game() {
  this.WIDTH = 40;
  this.HEIGHT = 24;
  this.map = [];
  this.rooms = [];
  this.items = [];
  this.enemies = [];
  this.hero = null;
}

Game.prototype.init = function() {
  $('.field').css({
    width: this.WIDTH * TILE_W,
    height: this.HEIGHT * TILE_H
  });
  var gen = new MapGenerator(this.WIDTH, this.HEIGHT);
  gen.generateMap();
  gen.generateRooms();
  gen.generateVerticalCorridors();
  gen.generateHorizontalCorridors();
  gen.connectRooms();
  this.map = gen.map;
  this.rooms = gen.rooms;
  this.placeItems();
  this.placeHero();
  this.placeEnemies();
  this.render();
};

Game.prototype.getRandomEmptyCell = function() {
  var tries = 0;
  while (tries < 1000) {
    var x = Math.floor(Math.random() * this.WIDTH);
    var y = Math.floor(Math.random() * this.HEIGHT);
    if (this.map[y][x] === '.' && !this.isOccupied(x, y)) {
      return {x: x, y: y};
    }
    tries++;
  }
  return null;
};

Game.prototype.isOccupied = function(x, y) {
  for (var i = 0; i < this.items.length; i++) {
    if (this.items[i].x === x && this.items[i].y === y) return true;
  }
  if (this.hero && this.hero.x === x && this.hero.y === y) return true;
  for (var j = 0; j < this.enemies.length; j++) {
    if (this.enemies[j].x === x && this.enemies[j].y === y) return true;
  }
  return false;
};

Game.prototype.placeItems = function() {
  // 2 меча
  for (var i = 0; i < 2; i++) {
    var cell = this.getRandomEmptyCell();
    if (cell) this.items.push({type: 'sword', x: cell.x, y: cell.y});
  }
  // 10 зелий
  for (var j = 0; j < 10; j++) {
    var cell2 = this.getRandomEmptyCell();
    if (cell2) this.items.push({type: 'potion', x: cell2.x, y: cell2.y});
  }
};

Game.prototype.placeHero = function() {
  var cell = this.getRandomEmptyCell();
  if (cell) this.hero = new Hero(cell.x, cell.y);
};

Game.prototype.placeEnemies = function() {
  for (var i = 0; i < 10; i++) {
    var cell = this.getRandomEmptyCell();
    if (cell) this.enemies.push(new Enemy(cell.x, cell.y));
  }
};

Game.prototype.moveHero = function(dx, dy) {
  var nx = this.hero.x + dx;
  var ny = this.hero.y + dy;
  if (nx < 0 || ny < 0 || nx >= this.WIDTH || ny >= this.HEIGHT) return;
  if (this.map[ny][nx] !== '.') return;
  // Проверка на врага
  for (var i = 0; i < this.enemies.length; i++) {
    if (this.enemies[i].x === nx && this.enemies[i].y === ny) return;
  }
  this.hero.x = nx;
  this.hero.y = ny;
  this.pickItem();
  this.render();
};

Game.prototype.pickItem = function() {
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (item.x === this.hero.x && item.y === this.hero.y) {
      if (item.type === 'potion') this.hero.hp = Math.min(100, this.hero.hp + 30);
      if (item.type === 'sword') this.hero.power++;
      this.items.splice(i, 1);
      break;
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
      // Проверяем объекты
      for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (item.x === x && item.y === y) {
          if (item.type === 'sword') $tile.addClass('tileSW');
          if (item.type === 'potion') $tile.addClass('tileHP');
        }
      }
      // Герой
      if (this.hero && this.hero.x === x && this.hero.y === y) {
        $tile.addClass('tileP');
        // Полоска здоровья героя
        var hp = Math.max(0, Math.min(100, this.hero.hp));
        var $hp = $('<div class="health"></div>');
        $hp.css('width', hp + '%');
        $tile.append($hp);
      }
      // Враги
      for (var j = 0; j < this.enemies.length; j++) {
        var enemy = this.enemies[j];
        if (enemy.x === x && enemy.y === y) {
          $tile.addClass('tileE');
          var ehp = Math.max(0, Math.min(100, enemy.hp));
          var $ehp = $('<div class="health"></div>');
          $ehp.css('width', ehp + '%');
          $tile.append($ehp);
        }
      }
      $field.append($tile);
    }
  }
};

Game.prototype.heroAttack = function() {
  var dirs = [
    {dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}
  ];
  for (var i = this.enemies.length - 1; i >= 0; i--) {
    var enemy = this.enemies[i];
    for (var d = 0; d < dirs.length; d++) {
      var nx = this.hero.x + dirs[d].dx;
      var ny = this.hero.y + dirs[d].dy;
      if (enemy.x === nx && enemy.y === ny) {
        enemy.hp -= 10 * this.hero.power;
        if (enemy.hp <= 0) this.enemies.splice(i, 1);
        break;
      }
    }
  }
  this.render();
};

Game.prototype.enemiesTurn = function() {
  var dirs = [
    {dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}
  ];
  for (var i = 0; i < this.enemies.length; i++) {
    var enemy = this.enemies[i];
    // Если герой на соседней клетке — атаковать
    var attacked = false;
    for (var d = 0; d < dirs.length; d++) {
      var nx = enemy.x + dirs[d].dx;
      var ny = enemy.y + dirs[d].dy;
      if (this.hero.x === nx && this.hero.y === ny) {
        this.hero.hp -= 10;
        attacked = true;
        break;
      }
    }
    if (!attacked) {
      // Случайное движение
      var moves = [];
      for (var d = 0; d < dirs.length; d++) {
        var nx = enemy.x + dirs[d].dx;
        var ny = enemy.y + dirs[d].dy;
        if (nx >= 0 && ny >= 0 && nx < this.WIDTH && ny < this.HEIGHT && this.map[ny][nx] === '.' && !this.isOccupied(nx, ny)) {
          moves.push({x: nx, y: ny});
        }
      }
      if (moves.length > 0) {
        var move = moves[Math.floor(Math.random() * moves.length)];
        enemy.x = move.x;
        enemy.y = move.y;
      }
    }
  }
  this.render();
};

// Обработка клавиш
$(document).on('keydown', function(e) {
  if (!window.game || !game.hero) return;
  if (e.key === 'w' || e.key === 'ArrowUp') { game.moveHero(0, -1); game.enemiesTurn(); }
  if (e.key === 's' || e.key === 'ArrowDown') { game.moveHero(0, 1); game.enemiesTurn(); }
  if (e.key === 'a' || e.key === 'ArrowLeft') { game.moveHero(-1, 0); game.enemiesTurn(); }
  if (e.key === 'd' || e.key === 'ArrowRight') { game.moveHero(1, 0); game.enemiesTurn(); }
  if (e.key === ' ') { game.heroAttack(); game.enemiesTurn(); }
}); 