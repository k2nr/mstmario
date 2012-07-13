function setLocalStorage(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
}

function getLocalStorage(k) {
    return JSON.parse(localStorage.getItem(k));
}

function extend(mixin, obj) {
    var member, name;
    if (obj === null) obj = {};
    for (name in mixin) {
        member = mixin[name];
        obj[name] = member;
    }
    return obj;
}
///////////////
// Global Vars
///////////////
var gameType;

Port = function() {
    this.games = {};
};
Port.prototype.addGame = function(id, game, autoMode) {
    this.games[id] = game;
    game.start(autoMode);
};

Port.prototype.send = function(id, a, v) {
    if(this.games[id])
        this.games[id].manipulate(a, v);
};

Port.prototype.sendAll = function(a, v) {
    for(var i in this.games) {
        this.games[i].manipulate(a, v);
    }
};

netPort = new Port();
keyPort = new Port();

keyEvtMap = {
    "Left": "left",
    "Right": "right",
    "Up":    "up",
    "Down":  "down",
    "U+0041": "rot_left",
    "U+0053": "rot_right"
};

function makeSequence() {
    var boardSeed, blockSeed, id, opponentId;
    id = getLocalStorage('id');
    opponentId = getLocalStorage('opponentId');

    var seq = new MatchSequence({
        id: id,
        matchId: getLocalStorage('matchId'),
        name: getLocalStorage('name'),
        url: 'ws://' + window.location.host + '/match/ws',
        onStartInfo: function(msg) {
            console.log("onstartinfo");
            boardSeed = msg.boardRandSeed;
            blockSeed = msg.blockRandSeed;
        },

        onReady: function(msg) {
            console.log("onready");
            $('#start-game').removeClass('disabled').removeAttr('disabled');
        },

        onStarted: function(msg) {
            console.log("onstarted");
            var opt = {
                level: $('#level').val(),
                speed: $('#speed').val(),
                boardSeed: boardSeed,
                blockSeed: blockSeed
            };
            var makeNewGame = {
                'key': function(i, pos) {
                    return new Game(extend(opt, {
                        id: i,
                        position: pos,
                        onAction: function(a, v) {
                            seq.update({
                                id: i,
                                action: a,
                                value: v
                            });
                        },
                        notify: function(a, v) {
                            seq.notify({
                                id: opponentId,
                                action: a,
                                value: v
                            });
                        }
                    }));
                },
                'net': function(i, pos) {
                    return new Game(extend(opt, {
                        id: i,
                        position: pos
                    }));
                },
                'single': function(i, pos) {
                    return new Game(extend(opt, {
                        id: i,
                        position: pos
                    }));
                }
            };
            var registerGame = {
                'player': function() {
                    keyPort.addGame(id, makeNewGame.key(id, 'left'), true);
                    netPort.addGame(opponentId, makeNewGame.net(opponentId, 'right'), false);
                },
                'audience': function() {
                    netPort.addGame(id, makeNewGame.net(id, 'left'), false);
                    netPort.addGame(opponentId, makeNewGame.net(opponentId, 'right'), false);
                },
                'default': function() {
                    keyPort.addGame(id, makeNewGame.single('single', 'center'), true);
                }
            };
            if(!gameType) gameType = 'default';
            registerGame[gameType]();

            document.addEventListener("keydown", function(e) {
                if(keyEvtMap[e.keyIdentifier]) {
                    keyPort.sendAll(keyEvtMap[e.keyIdentifier]);
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
        },

        onUpdate: function(msg) {
            netPort.send(msg.id, msg.action, msg.value);
        },

        onNotify: function(msg) {
            keyPort.send(msg.id, msg.action, msg.value);
        }
    });

    return seq;
}

$(document).ready(function() {
    loadImages("/");

    if(document.cookie) {
        var cookies = document.cookie.split('; ');
        for(var i=0; i < cookies.length; i++) {
            var str = cookies[i].split('=');
            if(str[0] === 'type') {
                gameType = str[1];
            }
        }
    }

    var seq = makeSequence();

    if(!gameType || gameType === 'default') {
        $('#start-game').removeClass('disabled').removeAttr('disabled');
        var game = new Game({
            level: $('#level').val(),
            speed: $('#speed').val(),
            id: 'single',
            position: 'center'
        });
        $('#start-game').click(function() {
            $('#config-block').hide();
            game.start(true);
        });
        document.addEventListener("keydown", function(e) {
            if(keyEvtMap[e.keyIdentifier]) {
                game.manipulate(keyEvtMap[e.keyIdentifier]);
                e.stopPropagation();
                e.preventDefault();
            }
        });
    } else {
        $('#start-game').click(function() {
            $('#config-block').hide();
            seq.startGame();
        });

        seq.run();
    }
});

