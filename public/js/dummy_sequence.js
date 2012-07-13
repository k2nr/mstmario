// To encapsulate WebSocket connection and sequences
var sock;

DummySequence = function(params) {
    var self = this;
    this.run = function() {
        params.onStartInfo.call(self, {
            id: 0,
            opponentId: 1,
            boardRandSeed: 0,
            blockRandSeed: 1});

        params.onReady.call(self, {});

    };

    this.startGame = function() {
        params.onStarted.call(self, {});
    };

    this.fire = function(m) {
        console.log('fire:' + m.action);
        params.onFired(m);
    };
};
