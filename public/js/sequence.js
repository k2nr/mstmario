// To encapsulate WebSocket connection and sequences
var sock;

MatchSequence = function(params) {
    var self = this;
    sock = new Socket(params.url);
    this.run = function() {
        sock.on('START_INFO', function(msg) {
            params.onStartInfo.call(self, msg);
        });

        sock.on('READY', function(msg) {
            params.onReady.call(self, msg);
        });

        sock.on('STARTED', function(msg) {
            params.onStarted.call(self, msg);
        });

        sock.on('UPDATE', function(msg) {
            params.onUpdate.call(self, msg);
        });

        sock.on('NOTIFY', function(msg) {
            params.onNotify.call(self, msg);
        });

        sock.onopen = function() {
            sock.send('REGISTER', {
                id: params.id,
                name: params.name,
                matchId: params.matchId
            });
        };
    };

    this.startGame = function() {
        sock.send('START_GAME');
    };

    this.update = function(m) {
        sock.send('UPDATE', m);
    };

    this.notify = function(m) {
        sock.send('NOTIFY', m);
    };
};
