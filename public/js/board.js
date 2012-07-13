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
var BLOCK_HEIGHT = 30;
var BLOCK_WIDTH  = 30;
var BLANK_BLOCK = {type: TYPES.NONE, color: COLORS.NONE};

function removeDups(array) {
    var obj = {},
        len = array.length,
        res = [],
        i;
    for(i=0; i < len; i++) {
        obj[JSON.stringify(array[i])] = array[i];
    }

    for(i in obj) {
        res.push(obj[i]);
    }

    return res;
}

function drawBlock(ctx, x, y, color, rot) {
    var img;
    rot = undefined; // todo
    if(rot === undefined) {
        switch(color) {
            case COLORS.GREEN:
                img = IMAGES.yellow;
                break;
            case COLORS.RED:
                img = IMAGES.red;
                break;
            case COLORS.BLUE:
                img = IMAGES.blue;
                break;
        }
    } else {
        switch(color) {
            case COLORS.GREEN:
                img = IMAGES.yellow_conn[rot];
                break;
            case COLORS.RED:
                img = IMAGES.red_conn[rot];
                break;
            case COLORS.BLUE:
                img = IMAGES.blue_conn[rot];
                break;
        }
    }
    ctx.drawImage(img, x, y);
}

function drawVirus(ctx, x, y, color) {
    switch(color) {
        case COLORS.GREEN:
            ctx.drawImage(IMAGES.virus_yellow, x, y);
            break;
        case COLORS.RED:
            ctx.drawImage(IMAGES.virus_red, x, y);
            break;
        case COLORS.BLUE:
            ctx.drawImage(IMAGES.virus_blue, x, y);
            break;
    }
}

function Board(game) {
    this.game = game;
}

Board.prototype.init = function(level, randFunc) {
    this.a = [];
    this.viruses = level*4 + 4;

    var i;
    for(i=0; i < BOARD_HEIGHT; i++) {
        this.a[i] = [];
    }

    for(i=0; i < BOARD_HEIGHT; i++) {
        for(var j=0; j < BOARD_WIDTH; j++) {
            this.a[i][j] = BLANK_BLOCK;
        }
    }

    for(i=0; i < this.viruses; i++) {
        var x, y, color;
        do {
            x = randFunc(BOARD_WIDTH);
            y = BOARD_HEIGHT-randFunc(BOARD_HEIGHT-3)-1;
            color = randFunc(COLOR_NUM);
        } while(this.a[y][x].type != TYPES.NONE);
        this.a[y][x] = {type:TYPES.VIRUS, color: color};
    }
};

Board.prototype.get = function(x, y) {
    return this.a[y][x];
};

Board.prototype.set = function(x, y, val) {
    var self = this;
    this.a[y][x] = val;
    if(!this.changed) {
        this.changed = true;
        setTimeout(function() {
            self.game.drawBoard();
            if(self.game.opt.onAction) {
                self.game.opt.onAction('board', self.a);
            }
            self.changed = false;
        }, 0);
    }
};

Board.prototype.setBlank = function(x, y) {
    this.set(x, y, BLANK_BLOCK);
};

Board.prototype.getRemoveRange = function(x, y) {
    var color = this.get(x, y).color, start, end, res=[], i, b;
    start = x;
    for(i=start; i >= 0;i--) {
        b = this.get(i, y);
        if(b.type === TYPES.NONE || b.color !== color) {
            break;
        }
        start = i;
    }
    end = x;
    for(i=end; i < BOARD_WIDTH; i++) {
        b = this.get(i, y);
        if(b.type === TYPES.NONE || b.color !== color) {
            break;
        }
        end = i;
    }
    if(end-start+1 >= 4){
        res.push({start: [y, start], end: [y, end]});
    }
    // vertical search
    start = y;
    for(i=start; i >= 0;i--) {
        b = this.get(x, i);
        if(b.type === TYPES.NONE || b.color !== color) {
            break;
        }
        start = i;
    }
    end = y;
    for(i=end; i < BOARD_HEIGHT; i++) {
        b = this.get(x, i);
        if(b.type === TYPES.NONE || b.color !== color) {
            break;
        }
        end = i;
    }
    if(end-start+1 >= 4){
        res.push({start: [start, x], end: [end, x]});
    }

    return removeDups(res);
};

Board.prototype.draw = function(ctx, cursor, nextBlock){
    var basePos = {x: (300 - BLOCK_WIDTH*BOARD_WIDTH)/2, y: 70};

    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, 1200, 600);
    ctx.storokeStyle = 'rgb(20, 20, 20)';
    ctx.strokeRect(basePos.x-5, basePos.y-5, BLOCK_WIDTH*BOARD_WIDTH+5, BLOCK_HEIGHT*BOARD_HEIGHT+5);
    var rot;
    for(var i=0; i < BOARD_HEIGHT; i++) {
        for(var j=0; j < BOARD_WIDTH; j++) {
            switch(this.get(j, i).type) {
                case TYPES.BLOCK:
                    var p = this.get(j, i).conn;
                    rot = undefined;
                    if(p) {
                        if(p[0] == 1) {
                            rot = 1;
                        } else if(p[0] == -1) {
                            rot = 3;
                        } else if(p[1] == 1) {
                            rot = 0;
                        } else {
                            rot = 2;
                        }
                    }
                    drawBlock(ctx, basePos.x + BLOCK_WIDTH*j, basePos.y + BLOCK_HEIGHT*i, this.get(j, i).color, rot);
                    break;
                case TYPES.VIRUS:
                    drawVirus(ctx, basePos.x + BLOCK_WIDTH*j, basePos.y + BLOCK_HEIGHT*i, this.get(j, i).color);
                    break;
            }
        }
    }

    drawBlock(ctx, basePos.x + BLOCK_WIDTH*(BOARD_WIDTH/2 - 1), basePos.y - 50, nextBlock.left.color);
    drawBlock(ctx, basePos.x + BLOCK_WIDTH*BOARD_WIDTH/2, basePos.y - 50, nextBlock.right.color);

    if(!cursor.visible) return;
    var left =  [cursor.pos[0], cursor.pos[1]],
        right = [cursor.pos[0] + cursor.pair[0],
                 cursor.pos[1] + cursor.pair[1]];

    drawBlock(ctx, basePos.x + BLOCK_WIDTH*left[1], basePos.y + BLOCK_HEIGHT*left[0] + 3, cursor.block.left.color);
    drawBlock(ctx, basePos.x + BLOCK_WIDTH*right[1], basePos.y + BLOCK_HEIGHT*right[0] + 3, cursor.block.right.color);
};

Board.prototype.remove = function(blocks) {
    var breaks = [], removes = [], self = this, chain=0;

    var addBreak = function(x, y) {
        for(var i=y; i >= 0; i--) {
            if(self.get(x, i).type != TYPES.BLOCK) break;
            var p = self.get(x, i).conn;
            for(var j=0; j < breaks.length; j++) {
                if(breaks[j] == [i, x] || (p && breaks[j] == [i+p[0], x+p[1]])) break;
            }
            if(j < breaks.length) continue;
            if( p ) {
                if(i+p[0] >= BOARD_HEIGHT-1) break;
                if(self.get(x+p[1], i+p[0]+1).type === TYPES.NONE || p[1] === 0) {
                    breaks.push([i, x]);
                } else {
                    break;
                }
            } else {
                breaks.push([i, x]);
            }
        }
    };

    var i, j;

    for(i=0; i < blocks.length; i++) {
        removes = removes.concat(this.getRemoveRange(blocks[i][1], blocks[i][0]));
    }
    chain += removes.length;
    for(var m=0; m < removes.length; m++) {
        var rem = removes[m];
        for(i=rem.start[0]; i <= rem.end[0]; i++) {
            for(j=rem.start[1]; j <= rem.end[1]; j++) {
                var p=this.get(j, i).conn;
                if(p) {
                    addBreak(j+p[1], i+p[0]);
                    this.get(j+p[1], i+p[0]).conn = null;
                }
                if(this.get(j, i).type == TYPES.VIRUS)
                    this.viruses--;
                this.setBlank(j, i);
            }
        }
    }

    for(i=BOARD_HEIGHT-2; i >= 0; i--) {
        for(j=0; j < BOARD_WIDTH; j++) {
            if(this.get(j, i).type == TYPES.BLOCK &&
               this.get(j, i+1).type == TYPES.NONE) {
                addBreak(j, i);
            }
        }
    }

    return {chain: chain, breaks: breaks};
};

Board.prototype.fall = function(breaks) {
    var conti = false,
        self  = this,
        bs    = breaks.concat([]);
        canFall = function(x, y) {
            return y+1 < BOARD_HEIGHT && self.get(x, y+1).type == TYPES.NONE;
        };

    for(var i=0; i < bs.length; i++) {
        var b = bs[i];
        var p = self.get(b[1], b[0]).conn;
        if(canFall(b[1], b[0]) && (!p || p[1]===0 || canFall(b[1]+p[1], b[0]+p[0]))) {
            self.set(b[1], b[0]+1, self.get(b[1], b[0]));
            self.setBlank(b[1], b[0]);
            if(p) {
                self.set(b[1]+p[1], b[0]+p[0]+1, self.get(b[1]+p[1], b[0]+p[0]));
                self.setBlank(b[1]+p[1], b[0]+p[0]);
            }
            b[0]++;
            if(canFall(b[1], b[0]) && (!p || canFall(b[1]+p[1], b[0]+p[0]))) {
                conti = true;
            }
        }
    }

    return {breaks: bs, conti: conti};
};

// returns continuation function for falling
Board.prototype.fallcc = function(breaks, endcb) {
    var bs   = breaks,
        self = this;
    return function() {
        var res = self.fall(bs);
        bs = res.breaks;
        if(!res.conti) {
            endcb(bs);
        }
    };
};

Board.prototype.fix = function(cursor) {
    var left =  [cursor.pos[0], cursor.pos[1]],
        right = [cursor.pos[0] + cursor.pair[0],
                 cursor.pos[1] + cursor.pair[1]];

    this.set(left[1], left[0], cursor.block.left);
    this.set(right[1], right[0], cursor.block.right);
    this.get(left[1], left[0]).conn   = cursor.pair;
    this.get(right[1], right[0]).conn = [left[0]-right[0], left[1]-right[1]];
};
