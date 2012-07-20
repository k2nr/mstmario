(function() {

var members = {};
var sock = null;
var myId;

function setLocalStorage(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
}

function getLocalstorage(k) {
    return JSON.parse(localStorage.getItem(k));
}

$('document').ready(function() {
    sock = new Socket('ws://' + window.location.host + '/ws');
    sock.onopen = function() {
        //sock.send('MEMBER_LIST');
        var name = getLocalstorage('name');
        if(name) {
            register(name);
            $('#register-text').val(name);
        }
    };

    sock.on('NOTIFY_ID', function(msg) {
        myId = msg.id;
        setLocalStorage("id", msg.id);
    });

    sock.on('MEMBER_ADDED', function(msg) {
        members[msg.id] = {id: msg.id, name: msg.name};
        refreshMembers();
    });

    sock.on('MEMBER_DELETED', function(msg) {
        delete members[msg.id];
        refreshMembers();
    });

    sock.on('MEMBER_LIST', function(msg) {
        members = msg.members;
        refreshMembers();
    });

    sock.on('REQUEST_MATCH', function(msg) {
        $('#accept-opponent-name').html(msg.opponentName);
        $('#accept-match-id').attr({value: myId});
        $('#accept-member-id').attr({value: myId});
        $('#accept-form').attr({action: '/match/' + myId});
        $('#accept-message').show();
        $('#accept-btn').click(function() {
            setLocalStorage("matchId", myId);
            setLocalStorage("opponentId", msg.opponentId);
            sock.send('ACCEPT_MATCH', {
                opponentId: msg.opponentId
            });
        });
    });

    sock.on('ACCEPT_MATCH', function(msg) {
        $('#start-game-opponent-name').html(msg.opponentName);
        $('#start-game-form').attr({action: '/match/' + msg.opponentId});
        $('#start-game-match-id').attr({value: msg.opponentId});
        $('#start-game-member-id').attr({value: myId});
        $('#start-game-message').show();

        setLocalStorage("matchId", msg.opponentId);
        setLocalStorage("opponentId", msg.opponentId);
    });

    $('#register-btn').click(function() {
        register($('#register-text').val());
    });
});

function register(name) {
    sock.send('ADD_MEMBER', {
        name: name
    });
    sock.send('MEMBER_LIST');
    $('#register-btn').addClass('disabled').attr({disabled: ""});
    setLocalStorage('name', name);
}

function refreshMembers() {
    var btnTmp = $('<button class="btn btn-inverse match-btn" />')
                 .html('対戦する');
    var makeBtn = function(id) {
        return btnTmp.clone(true).click(function(e) {
            sock.send('REQUEST_MATCH', {
                   opponentId: id
            });
            $(this).addClass('disabled').attr({disabled: ""});
        });
    };

    $('tr.member').remove();

    for(var i in members) {
        var id = parseInt(i, 10);
        var m = members[i];
        var btn = makeBtn(id);
        if(!m) continue;
        var tr = $('<tr class="member" />').append( $('<td />').html(m.name) );
        if( id !== myId) {
            tr.append( $('<td />').append( btn.clone(true) ) );
        } else {
            tr.append( $('<td />') );
        }

        $('tbody#member-list').append(tr);
    }
}

}).call(this);
