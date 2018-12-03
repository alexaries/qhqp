/**
 * Created by yang on 2016/11/10.
 */

gameclass.websocket = cc.Class.extend({
    url: null,
    openfunc: null,
    onmsgfunc: null,
    onerrorfunc: null,
    onclosefunc: null,
    ws: null,
    curservrtime: null,
    curclienttime: null,
    game: null,
    ctor: function () {
        this.curservrtime = 0;
        this.curclienttime = 0;

    },
    setgame: function (_game) {

        this.game = _game;
    }
});

var heartCheck = {
    timeout: 60000,//60ms
    timeoutObj: null,
    reset: function(){
        clearTimeout(this.timeoutObj);
        this.start();
    },
    start: function(){
        //this.schedule(function(){
        //    cc.log("HeartBeat");
        //},6);
        //this.timeoutObj = setTimeout(function(){
        //
        //    cc.log("HeartBeat");
        //},6);
        //this.timeoutObj = setTimeout(function(){
        //    var response = {"msghead": "HeartBeat", "msgdata": 1};
        //    var jsonData = JSON.stringify(response);
        //    this._send(jsonData);
        //    cc.log("HeartBeat");
        //}, this.timeout)
    }
};

gameclass.websocket.prototype.getcurservertime = function () {
    return this.curservrtime + (Math.floor(new Date().getTime() / 1000) - this.curclienttime);
};

gameclass.websocket.prototype.init = function (url, openfunc, onmsgfunc, onerrorfunc, onclosefunc) {

    this.url = url;
    this.openfunc = openfunc;
    this.onmsgfunc = onmsgfunc;
    this.onerrorfunc = onerrorfunc;
    this.onclosefunc = onclosefunc;


    //test
    //
    //test end


    this.ws = null;
    //if (!cc.sys.isNative) {

    cc.log("create webSocket,url=" + this.url);

    this.ws = new WebSocket(this.url);
    /*}else{
     this._wsiError = new MySocket(url);
     }*/
    this.ws.binaryType = "arraybuffer";
    var _this = this;
    this.ws.onopen = function (evt) {
        // cc.log("open");
        if (_this.openfunc != null) {
            _this.openfunc(_this, evt);
            heartCheck.start();
            setInterval(function(){
                //cc.log("2222222222222HeartBeat");
            },6000);


        }
    };
    this.ws.onmessage = function (evt) {
        if (_this.onmsgfunc != null) {
            var u8a = new Uint8Array(evt.data);
            var str = Bytes2Str(u8a);
            //heartCheck.reset();

            //cc.log(str);

            var recvdata = JSON.parse(str);

            var msgsign = JSON.parse(recvdata.msgsign);

            _this.curservrtime = msgsign.time;
            _this.curclienttime = Math.floor(new Date().getTime() / 1000);

            if (msgsign.encode && msgsign.encode == 1) {
                var data = new Uint8Array(BASE64.decoder(recvdata.msgdata));
                recvdata.msgdata = Bytes2Str(pako.inflate(data));
            }
            //cc.log(recvdata.msgdata);
            //cc.log(recvdata);

            if (recvdata.msghead == "err") {
                var data = JSON.parse(recvdata.msgdata);
                if (data.info.length > 0) {
                    _this.game.uimgr.closeui("gameclass.inputcode2");
                    _this.game.uimgr.showui("gameclass.msgboxui");
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString(data.info);
                }
            } else if (recvdata.msghead == "updcard") {
                var data = JSON.parse(recvdata.msgdata);
                _this.game.modmgr.mod_login.logindata.card = data.card;
                if (_this.game.uimgr.uis["gameclass.hallui"] != null) {
                    _this.game.uimgr.uis["gameclass.hallui"].update();
                }
            }
            else {
                recvdata.msgdata = JSON.parse(recvdata.msgdata);

                //cc.log("getMsg----->msgHead:" + recvdata.msghead + "||msgData=" + JSON.stringify(recvdata.msgdata));
                _this.onmsgfunc(_this, recvdata);
            }
        }
    };
    this.ws.onerror = function (evt) {
        cc.log("Error was fired");
        //self._errorStatus.setString("an error was fired");
        if (_this.onerrorfunc != null) {
            _this.onerrorfunc(_this, evt, _this.ws);
        }
    };
    this.ws.onclose = function (evt) {
        cc.log("_wsiError websocket instance closed.");
        //self._wsiError = null;
        if (_this.onclosefunc != null) {
            _this.onclosefunc(_this, evt);
        }
    };

    return this;
};

gameclass.websocket.prototype.setonmsgfunc = function (onmsgfunc) {
    this.onmsgfunc = onmsgfunc;
};

gameclass.websocket.prototype._send = function (str) {
    this.ws.send(str);
};


gameclass.websocket.prototype.send = function (head, data) {
    var response = {"msghead": head, "msgdata": JSON.stringify(data)};
    var jsonData = JSON.stringify(response);
    // cc.log("send ......" + jsonData);
    cc.log("sendMsg----->" + head + "||data=" + jsonData);
    this._send(jsonData);
};

gameclass.newwebsocket = function (_game, url, preinit, openfunc, onmsgfunc, onerrorfunc, onclosefunc) {
    // cc.log("create socket:url===" + url)
    var websocket = new gameclass.websocket;
    websocket.setgame(_game);

    if (preinit != null) {
        preinit(websocket);
    }
    websocket.init(url, openfunc, onmsgfunc, onerrorfunc, onclosefunc);
    return websocket;
}
