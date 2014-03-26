function KeyboardInputManager() {
  this.events = {};

  var self = this;
  var map = {
    'up'   : 0, // Up
    'right': 1, // Right
    'down' : 2, // Down
    'left' : 3, // Left
  };

  this.editor = ace.edit("ia-editor");
  this.editor.setTheme("ace/theme/solarized_dark");
  this.editor.getSession().setMode("ace/mode/javascript");

  eval(this.editor.getValue());
  this.nextDirection = IA;

  this.continue = function (grid) {
    console.info(
      "---------------------------\"\n" +
      "| %04d | %04d | %04d | %04d |\n" +
      "| %04d | %04d | %04d | %04d |\n" +
      "| %04d | %04d | %04d | %04d |\n" +
      "| %04d | %04d | %04d | %04d |\n" +
      "\"---------------------------",
      grid[0][0], grid[1][0], grid[2][0], grid[3][0],
      grid[0][1], grid[1][1], grid[2][1], grid[3][1],
      grid[0][2], grid[1][2], grid[2][2], grid[3][2],
      grid[0][3], grid[1][3], grid[2][3], grid[3][3]
    );

    var direction = self.nextDirection(grid);

    console.log('IA response: ', direction);

    var mapped = map[direction];
    if (mapped !== undefined) {
      self.emit("move", mapped);
    }
  };

  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    // meta ctrl+return restarts the game
    if (event.ctrlKey && event.which === 13) {
      var IA;
      eval(self.editor.getValue());
      console.log(self.editor.getValue(), IA);
      self.nextDirection = IA;
      self.restart.call(self, event);
    }
  });

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};
