(function() {
var sock = null;

this.Socket = function(addr) {
    var self = this;

    self.onMap = {};

    sock = new WebSocket(addr);
    sock.onopen = function() {
        //console.log('onopen');
        if(self.onopen) {
            self.onopen();
        }
    };

    sock.onmessage = function(evt) {
        var data = JSON.parse(evt.data),
            func = self.onMap[data.action];
        console.log('onmessage', data);
        if(func) {
            func.call(self, data.msg);
        }
    };

    sock.onclose = function () {
        //console.log('onclose');
        if(self.onclose) {
            self.onclose();
        }
    };
};

this.Socket.prototype.on = function(action, func) {
    this.onMap[action] = func;
};

this.Socket.prototype.send = function(action, msg) {
    var data = {
        action: action,
        msg: msg || {}
    };
    //console.log('send', data);
    sock.send(JSON.stringify(data));
};

}).call(this);
