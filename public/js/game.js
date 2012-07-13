///////////////
// Global Vars
///////////////

var COLORS = {
    GREEN : 0,
    BLUE  : 1,
    RED   : 2,
    NONE  : -1
};
var TYPES = {
    BLOCK : 0,
    VIRUS : 1,
    NONE  : -1
};
var COLOR_NUM = 3;
var BOARD_WIDTH = 8;
var BOARD_HEIGHT = 15;
var IMAGES = {};
//////////////
//Queue
//////////////
function Queue() {
    this.__a = [];
}

Queue.prototype.enqueue = function(o) {
    this.__a.push(o);
};

Queue.prototype.dequeue = function() {
    if( this.__a.length > 0 ) {
        return this.__a.shift();
    }
    return null;
};

Queue.prototype.size = function() {
    return this.__a.length;
};

Queue.prototype.toString = function() {
    return '[' + this.__a.join(',') + ']';
};

///////////////
// Functions
///////////////
function loadImages(root) {
    var dir = root + "img/";
    IMAGES.blue = new Image();
    IMAGES.blue.src = dir + "blue.png";
    IMAGES.blue_conn = {};
    IMAGES.blue_conn[0] = new Image();
    IMAGES.blue_conn[0].src = dir + "blue_right.png";
    IMAGES.blue_conn[1] = new Image();
    IMAGES.blue_conn[1].src = dir + "blue_down.png";
    IMAGES.blue_conn[2] = new Image();
    IMAGES.blue_conn[2].src = dir + "blue_left.png";
    IMAGES.blue_conn[3] = new Image();
    IMAGES.blue_conn[3].src = dir + "blue_top.png";
    IMAGES.yellow = new Image();
    IMAGES.yellow.src = dir + "yellow.png";
    IMAGES.yellow_conn = {};
    IMAGES.yellow_conn[0] = new Image();
    IMAGES.yellow_conn[0].src = dir + "yellow_right.png";
    IMAGES.yellow_conn[1] = new Image();
    IMAGES.yellow_conn[1].src = dir + "yellow_down.png";
    IMAGES.yellow_conn[2] = new Image();
    IMAGES.yellow_conn[2].src = dir + "yellow_left.png";
    IMAGES.yellow_conn[3] = new Image();
    IMAGES.yellow_conn[3].src = dir + "yellow_top.png";
    IMAGES.red = new Image();
    IMAGES.red.src = dir + "red.png";
    IMAGES.red_conn = {};
    IMAGES.red_conn[0] = new Image();
    IMAGES.red_conn[0].src = dir + "red_right.png";
    IMAGES.red_conn[1] = new Image();
    IMAGES.red_conn[1].src = dir + "red_down.png";
    IMAGES.red_conn[2] = new Image();
    IMAGES.red_conn[2].src = dir + "red_left.png";
    IMAGES.red_conn[3] = new Image();
    IMAGES.red_conn[3].src = dir + "red_top.png";
    IMAGES.virus_blue = new Image();
    IMAGES.virus_blue.src = dir + "virus_blue.png";
    IMAGES.virus_yellow = new Image();
    IMAGES.virus_yellow.src = dir + "virus_yellow.png";
    IMAGES.virus_red = new Image();
    IMAGES.virus_red.src = dir + "virus_red.png";
}

function makeRandIntFunc(seed) {
    var mt;
    if( arguments.length === 0 || typeof seed !== 'number' ) {
        mt = new MersenneTwister();
    } else {
        mt = new MersenneTwister(seed);
    }
    return function(max) {
        return mt.nextInt(0, max);
    };
}


///////////////
// Game
///////////////
var Game = function(opt) {
    this.opt = opt;
};

Game.handleEvtMap = {
    "left": function() {
        this.move(-1, 0);
    },
    "right": function() {
        this.move(1, 0);
    },
    "up": function() {
    },
    "down": function() {
        this.move(0, 1);
    },
    "rot_left": function() {
        this.rotate('left');
    },
    "rot_right": function() {
        this.rotate('right');
    },
    "board": function(v) {
        this.board.a = v;
    },
    "cursor": function(v) {
        this.cursor.setData(v);
    },
    "nextblock": function(v) {
        this.nextBlock = v;
    },
    "attack": function(v) {
        this.chainAttack(v);
    },
    "stageend": function(v) {
        this.stageEnd(!v);
    }
};


Game.prototype.init = function() {
    var self = this;
    this.dropCnt = 0;
    this.workQueue = new Queue();
    this.workQueueAfterFix = new Queue();
    this.board = new Board(this);

    self.blockRandFunc = makeRandIntFunc(this.opt.blockSeed);

    var canvas;
    switch(this.opt.position) {
        case 'center':
            canvas = $('<canvas id="canvas-' + this.opt.id + '"class="canvas-center" />');
            break;
        case 'left':
            canvas = $('<canvas id="canvas-' + this.opt.id + '"class="canvas-left" />');
            break;
        case 'right':
            canvas = $('<canvas id="canvas-' + this.opt.id + '"class="canvas-right" />');
            break;
    }

    canvas.attr({
        width: 300,
        height: 540
    });
    $('#canvas-block').append(canvas);
    self.board.init(this.opt.level, makeRandIntFunc(this.opt.boardSeed));
};

Game.prototype.manipulate = function(k, v) {
    if(this.autoMode && this.workQueue.size() > 0) return;
    Game.handleEvtMap[k].call(this, v);
    this.drawBoard();
};

Game.prototype.getCanvasCtx = function() {
    return $('#canvas-' + this.opt.id).get(0).getContext('2d');
};

Game.prototype.drawBoard = function() {
    var self = this;

    if(!this.changed) {
        this.changed = true;
        setTimeout(function() {
            if(self.clear) return;
            self.board.draw(self.getCanvasCtx(), self.cursor, self.nextBlock);
            self.changed = false;
        }, 0);
    }
};

Game.prototype.defaultWork = function(callback, speed) {
    var self = this;
    setTimeout(function() {
        if( !self.move(0, 1) ) {
            self.fix();
            if(self.opt.onAction) {
                self.opt.onAction('cursor', self.cursor.makeSendData());
            }
        }
        callback();
    }, speed);
};

Game.prototype.move = function(hor, ver) {
    var ret = this.cursor.move(this.board, hor, ver);
    if(ret && this.opt.onAction) {
        this.opt.onAction('cursor', this.cursor.makeSendData());
    }

    return ret;
};

Game.prototype.rotate = function(dir) {
    this.cursor.rotate(this.board, dir);
    if(this.opt.onAction) {
        this.opt.onAction('cursor', this.cursor.makeSendData());
    }
};

Game.prototype.addNewBlock = function() {
    this.cursor = new Cursor(this, this.nextBlock);
    this.makeNextBlock();
};

Game.prototype.fall = function(breaks, callback) {
    var fallcc = this.board.fallcc(breaks, function(bs) {
        setTimeout(callback(bs), 200);
        clearInterval(interval);
    });

    var interval = setInterval(function() {
        fallcc();
    }, 200);
};

Game.prototype.chainAttack = function(n) {
    var self = this;
    var blocks = [], rand = makeRandIntFunc();

    for(var i=0; i < n; i++) {
        var x = rand(BOARD_WIDTH - 2);
        if(x >= BOARD_WIDTH/2 - 1) x += 2;
        if(this.board.get(x, 0).type != TYPES.NONE) continue;
        var b = {type: TYPES.BLOCK, color: rand(COLOR_NUM)};
        this.board.set(x, 0, b);
        blocks.push([0, x]);
    }

    if(blocks.length === 0) return;

    this.workQueueAfterFix.enqueue(function(cb) {
        self.fall(blocks, function(bs) {
            self.remove(bs, function(chain) {
                if(chain >= 2) {
                    self.opt.notify('attack', chain-1);
                }
            });
            cb();
        });
    });
};

Game.prototype.remove = function(blocks, callback, chain) {
    if(chain === undefined) chain = 0;
    var self = this,
        res  = this.board.remove(blocks);

    chain += res.chain;

    if( res.breaks.length > 0 ) {
        res.breaks.sort(function(a, b){ return b[0] - a[0]; });
        this.workQueue.enqueue(function(cb) {
            self.fall(res.breaks, function(bs) {
                self.remove(bs, callback, chain);
                cb();
            });
        });
    } else {
        if(callback) callback(chain);
    }
};

Game.prototype.fix = function() {
    var left =  [this.cursor.pos[0], this.cursor.pos[1]],
        right = [this.cursor.pos[0] + this.cursor.pair[0],
                 this.cursor.pos[1] + this.cursor.pair[1]];
    var self = this;

    this.board.fix(this.cursor);
    this.cursor.visible = false;
    this.remove([left, right], function(chain) {
        if(self.board.get(BOARD_WIDTH/2, 0).type == TYPES.BLOCK ||
           self.board.get(BOARD_WIDTH/2-1, 0).type == TYPES.BLOCK) {
            self.stageEnd(false);
            if(self.opt.notify) {
                self.opt.notify('stageend', false);
            }
        } else if(self.board.viruses === 0) {
            self.stageEnd(true);
            if(self.opt.notify) {
                self.opt.notify('stageend', true);
            }
        } else {
            self.workQueue.enqueue( function(cb) {
                setTimeout( function() {
                    self.addNewBlock();
                    cb('fix');
                }, self.opt.speed);
            });

            if(chain >= 2) {
                if(self.opt.notify) {
                    self.opt.notify('attack', chain-1);
                }
            }
        }
    });
    if( (++this.dropCnt % 10) === 0 ) {
        this.opt.speed -= 20;
    }
};

Game.prototype.makeNextBlock = function() {
    this.nextBlock = {
        left:  {type:TYPES.BLOCK, color: this.blockRandFunc(COLOR_NUM)},
        right: {type:TYPES.BLOCK, color: this.blockRandFunc(COLOR_NUM)}
    };
    if(this.opt.onAction) {
        this.opt.onAction('nextblock', this.nextBlock);
    }
};

Game.prototype.stageEnd = function(result) {
    if(this.clear) return;
    var str = result ? 'WIN' : 'LOSE',
        x = 20, y = 200,
        ctx = this.getCanvasCtx();
    this.clear = true;
    ctx.font = result ? '100pt Arial' : '75pt Arial';
    ctx.fillStyle = 'rgb(200, 20, 20)';
    ctx.fillText(str, x, y);
};

Game.prototype.loop = function(queue) {
    var self = this;
    var item = queue.dequeue() ||
               function(cb) {self.defaultWork(cb, self.opt.speed);};

    item.call(self, function(ev) {
        if(!self.clear) {
            switch(ev) {
                case 'fix':
                    self.loop(self.workQueueAfterFix);
                    break;
                default:
                    self.loop(self.workQueue);
                    break;
            }
        }
    });
};

Game.prototype.start = function(autoMode) {
    this.autoMode = autoMode;
    this.init();

    this.makeNextBlock();
    this.addNewBlock();
    if(autoMode) {
        this.loop(this.workQueue);
    }
    this.drawBoard();
};

Cursor = function(game, block) {
    this.game = game;
    this.pos =  [0, BOARD_WIDTH/2-1];
    this.pair = [0, 1];
    this.block = block;
    this.visible = true;
    this.game.drawBoard();
};

Cursor.prototype.makeSendData = function() {
    return {
        pos:     this.pos,
        pair:    this.pair,
        block:   this.block,
        visible: this.visible
    };
};

Cursor.prototype.setData = function(d) {
    this.pos     = d.pos;
    this.pair    = d.pair;
    this.block   = d.block;
    this.visible = d.visible;
};

Cursor.prototype.isMovable = function(board, h, v) {
    var left =  [this.pos[0], this.pos[1]],
        right = [this.pos[0] + this.pair[0],
                 this.pos[1] + this.pair[1]];

    return Math.max(left[0] + v, right[0] + v) < BOARD_HEIGHT &&
           Math.min(left[1] + h, right[1] + h) >= 0 &&
           Math.max(left[1] + h, right[1] + h) < BOARD_WIDTH &&
           board.get(left[1] + h, left[0] + v).type  == TYPES.NONE &&
           board.get(right[1] + h, right[0] + v).type == TYPES.NONE;
};

Cursor.prototype.move = function(board, h, v) {
    var ret = this.isMovable(board, h, v);
    if(ret) {
        this.pos = [this.pos[0] + v, this.pos[1] + h];
    }

    this.game.drawBoard();
    return ret;
};

Cursor.prototype.rotate = function(board, dir) {
    var newPair = [this.pair[1], this.pair[0]];
    switch(dir) {
        case 'left':
            if(newPair[0] !== 0) newPair[0] = newPair[0] * (-1);
            break;
        case 'right':
            if(newPair[1] !== 0) newPair[1] = newPair[1] * (-1);
            break;
    }

    var newPos = [this.pos[0], this.pos[1]],
        right = [this.pos[0] + newPair[0],
                 this.pos[1] + newPair[1]];
    if(right[0] < 0) {
        newPos[0]++;
    } else if(right[0] >= BOARD_HEIGHT) {
        newPos[0]--;
    } else if(right[1] < 0) {
        newPos[1]++;
    } else if(right[1] >= BOARD_WIDTH) {
        newPos[1]--;
    }

    right = [newPos[0] + newPair[0],
             newPos[1] + newPair[1]];
    if(board.get(newPos[1], newPos[0]).type == TYPES.NONE &&
       board.get(right[1], right[0]).type == TYPES.NONE) {
        this.pos  = newPos;
        this.pair = newPair;
    }
    this.game.drawBoard();
};

