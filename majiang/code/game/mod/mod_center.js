/**
 * Created by yang on 2016/11/18.
 */

gameclass.mod_center = gameclass.mod_base.extend({
    data: null,
    ip: null,
    gonggao: null,
    areainfo: null,
    notice: null,
    hasread: null,
    shareOK: "lvhaoshuai",
    isclickPYQ: false,
    ctor: function () {
        this.gonggao = "";
    },
    setgame: function (_game) {
        this.game = _game;
    },
});

gameclass.mod_center.prototype.connect = function (ip) {

    if (this.ip == null) {
        this.ip = ip;
    } else {
        return;
    }
    var _this = this;
    gameclass.newwebsocket(this.game, ip, function (ws) {
        //setInterval(function(){
        //    cc.log("2222222222222HeartBeat");
        //},6000);
        //setTimeout(function(){
        //    cc.log("2222222222222HeartBeat");
        //},1);

    }, function (ws) {
        // cc.log("open");
        gameclass.mapinfo = gameclass.mod_platform.getmapinfo();
        var data = {
            "uid": _this.game.modmgr.mod_login.logindata.uid,
            "openid": _this.game.modmgr.mod_login.logindata.openid,
            "mapinfo": gameclass.mapinfo,
            "group": 1
        };
        ws.send("setuid", data);

        _this.mywebsocket = ws;

    }, function (ws, data) {
        // cc.log("onmsng");
        if (data.msghead == "notice") {
            // cc.log(data.msgdata.context);
            _this.gonggao = data.msgdata.context;
            if (_this.game.uimgr.uis["gameclass.hallui"] != null) {
                _this.game.uimgr.uis["gameclass.hallui"].updategonggao();
            }
        } else if (data.msghead == "areainfo") {
            _this.areainfo = JSON.parse(data.msgdata.context);
            // cc.log(_this.areainfo);
            if (_this.game.uimgr.uis["gameclass.hallui"] != null) {
                _this.game.uimgr.uis["gameclass.hallui"].updateareainfo();
            }
        } else if (data.msghead == "noticeinfo") {
            _this.notice = data.msgdata.info;
            _this.hasread = data.msgdata.read;
            if (_this.game.uimgr.uis["gameclass.hallui"] != null) {
                _this.game.uimgr.uis["gameclass.hallui"].updateMailPoint();
            }
            // cc.log(_this.notice);
        } else if (data.msghead == "joingoldfail") {
            _this.game.uimgr.showui("gameclass.msgboxui");
            _this.game.uimgr.uis["gameclass.msgboxui"].setString("金币不足");
        } else if (data.msghead == "userbase") {
            _this.game.modmgr.mod_userbase.setData(data.msgdata);
        } else if (data.msghead == "updatemoney") {
            _this.game.modmgr.mod_userbase.userbase.money = data.msgdata.gold;
            _this.game.modmgr.mod_userbase.userbase.gem = data.msgdata.gem;
            _this.game.modmgr.mod_userbase.userbase.charm = data.msgdata.charm;
            _this.game.uimgr.updateUIMsg("updatemoney");
        } else if (data.msghead == "invite") {
            _this.game.modmgr.mod_login.inviteData = data.msgdata;
            if (_this.game.modmgr.mod_login.inviteData.isinvite == 1) {
                //_this.game.uimgr.showui("gameclass.msgboxui");
                //_this.game.uimgr.uis["gameclass.msgboxui"].setString("正在进行推荐有礼活动,恭喜您获得房卡5张");
                if (_this.game.uimgr.uis["gameclass.recommendUI"]) {
                    _this.game.uimgr.uis["gameclass.recommendUI"].setNoSend();
                }
            }
        }else{

        }
    }, function () {
        cc.log("onerrorfunc");
    }, function () {
        cc.log("onclosefunc");
        _this.ip = null;


        var seq = cc.sequence(cc.delayTime(1), cc.callFunc(function () {
            _this.connect(ip);
        }));
        cc.director.getRunningScene().runAction(seq);
    });
};

gameclass.mod_center.prototype.iospay = function (re) {
    var data = {"receipt": re, "sandbox": false};
    this.mywebsocket.send("charge", data);
};

gameclass.mod_center.prototype.code = function (code) {
    var data = {"code": code};
    this.mywebsocket.send("code", data);
};

gameclass.mod_center.prototype.getmapinfo = function (code) {
    if (!cc.sys.isNative) {
        return
    }
    if (gameclass.clientver == 0) {
        return
    }
    if (gameclass.mapinfo != null && gameclass.mapinfo != "") {
        return;
    }
    gameclass.mapinfo = gameclass.mod_platform.getmapinfo();
    if (gameclass.mapinfo != null && gameclass.mapinfo != "") {
        var data = {"mapinfo": gameclass.mapinfo};
        this.mywebsocket.send("setmapinfo", data);
    }
};

//! 是否显示邮件小红点
gameclass.mod_center.prototype.isViewMailPoint = function () {
    if (this.notice == null) {
        return false;
    }

    if (this.hasread == null) {
        return this.notice.length > 0;
    }

    // cc.log(this.hasread);
    for (var i = 0; i < this.notice.length; i++) {
        var find = false;
        for (var j = 0; j < this.hasread.length; j++) {
            if (this.notice[i].id == this.hasread[j]) {
                find = true;
                break;
            }
        }
        if (!find) {
            return true;
        }
    }

    return false;
};

gameclass.mod_center.prototype.sendReadMail = function (id) {
    if (this.mywebsocket == null) {
        return;
    }

    if (this.hasread == null) {
        return
    }

    for (var i = 0; i < this.hasread.length; i++) {
        if (this.hasread[i] == id) {
            return;
        }
    }

    this.hasread.push(id);

    var data = {"id": id};
    this.mywebsocket.send("readmail", data);

    if (this.game.uimgr.uis["gameclass.hallui"] != null) {
        this.game.uimgr.uis["gameclass.hallui"].updateMailPoint();
    }
};

//! 购买
gameclass.mod_center.prototype.buyItem = function (id) {
    if (this.mywebsocket == null) {
        return;
    }

    var data = {"id": id};
    this.mywebsocket.send("buyitem", data);
};

//! 加入金币场
gameclass.mod_center.prototype.joinGoldRoom = function (roomid) {
    if (this.mywebsocket == null) {
        return;
    }

    var data = {"roomid": roomid};
    this.mywebsocket.send("joingoldroom", data);
};

gameclass.mod_center.prototype.sendInviteCode = function (_inviteCode) {
    var data = {"code": Number(_inviteCode)};
    this.mywebsocket.send("invite", data);
};

gameclass.mod_center.prototype.weixinShareOK = function (_callBackCode) {
    if (this.isclickPYQ) {
        var data = {"id": 18};
        this.mywebsocket.send("shareOK", data);
    }
};