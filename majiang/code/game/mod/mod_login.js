/**
 * Created by yang on 2016/11/9.
 */



gameclass.mod_login = gameclass.mod_base.extend({
    data: null,
    logindata: null,
    roomdata: null,
    mod_game: null,
    islogin: null,
    isExit:null,

    ctor: function () {
        this.islogin = false;
    }
});

gameclass.mod_login.prototype.getserverver = function (func) {

    var data = {};
    var _this = this;
    this.getver("", data, function (retdata, temp, recvdata) {
        func(retdata)
    });
}

gameclass.mod_login.prototype.guestlogin = function (openid) {

    // gameclass.servertype = 2;
    // setservertype(gameclass.servertype);
    gameclass.clientver = 1000;

    if (openid != null && openid != "") {
        mod_userdefault.globaldata.code = openid;
    }
    var data = {"code": mod_userdefault.globaldata.code, "ver": gameclass.clientver};
    var _this = this;
    this.sendhttp("loginYK", data, function (retdata, temp, recvdata) {
        if (recvdata.msghead == "loginfail") {
            //gameclass.mod_login.prototype.guestlogin();

            gameclass.servertype = 2;//1正式服 2测试服
            gameclass.clientver = 0;
            _this.game.modmgr.mod_login.guestlogin(openid);
        } else {
            _this.logindata = retdata;

            // cc.log("login");
            // cc.log(_this.logindata);
            mod_userdefault.globaldata.code = retdata.openid;
            mod_userdefault.writeglobaljson();
            if (retdata.room == 0) {
                _this.game.uimgr.showui("gameclass.hallui");

            } else {
                _this.jionroom(retdata.ip, retdata.room);
            }
            _this.game.uimgr.closeui("gameclass.loginui");
            _this.game.modmgr.mod_center.connect("ws://" + retdata.center);
        }
    });

};

gameclass.mod_login.prototype.wxlogin = function (code) {
    var type = 83;
    if (!cc.sys.isNative) {
        type = 1;
    }

    var op = "loginWX";
    if (mod_userdefault.globaldata.code != "") {
        code = mod_userdefault.globaldata.code;
        op = "loginOP";
    }

    var data = {"code": code, "type": type, "ver": gameclass.clientver};
    var _this = this;


    // _this.game.uimgr.showui("gameclass.msgboxui").setString("wxLogin requestHttp...");


    this.sendhttp(op, data, function (retdata, temp, recvdata) {

        // _this.game.uimgr.showui("gameclass.msgboxui").setString(recvdata.msghead);

        if (recvdata.msghead == "loginfail") {
            //gameclass.mod_login.prototype.guestlogin();

            gameclass.servertype = 1;//1正式服 2测试服
            gameclass.clientver = 0;
            _this.game.modmgr.mod_login.guestlogin("");
        } else {
            _this.logindata = retdata;

            // cc.log("loginwx");
            if (mod_userdefault.globaldata.code != retdata.openid) {
                mod_userdefault.globaldata.code = retdata.openid;
                mod_userdefault.globaldata.time = (new Date()).getTime();
                mod_userdefault.writeglobaljson();
            }
            _this.islogin = true;
            g_islogin = true;
            if (retdata.room == 0) {
                _this.game.uimgr.showui("gameclass.hallui");

            } else {
                _this.jionroom(retdata.ip, retdata.room);
            }
            _this.game.uimgr.closeui("gameclass.loginui");
            _this.game.modmgr.mod_center.connect("ws://" + retdata.center);
        }
    });

};


gameclass.mod_login.prototype.createroom = function (gameid, num, param1, param2, agent) {
    if(agent == null){
        agent = 0;
    }
    var data = {"uid": this.logindata.uid, "type": gameid, "num": num, "param1": param1, "param2": param2, "agent":agent};
    var _this = this;
    this.sendhttp("create", data, function (retdata) {
        //_this.roomdata = retdata;
        // cc.log("createroom");

        if(retdata.agent){

            _this.game.uimgr.showui("gameclass.msgboxui");
            _this.game.uimgr.showui("gameclass.msgboxui").setString("代开成功！");
            _this.game.uimgr.showui("gameclass.roomListLayer");

            if ( _this.game.uimgr.uis["gameclass.hallui"] != null) {
                _this.logindata.card = retdata.card;
                _this.game.uimgr.uis["gameclass.hallui"].update();
            }

        }else{

            _this.jionroom(retdata.ip, retdata.room);
        }

        //gameclass.newwebsocket(retdata.ip);


    });
};


gameclass.mod_login.prototype.joinwithroomid = function (roomid) {
    var data = {"uid": this.logindata.uid, "roomid": Number(roomid), "group": -1};
    var _this = this;
    this.sendhttp("join", data, function (retdata) {
        //_this.roomdata = retdata;
        // cc.log("createroom");

        //gameclass.newwebsocket(retdata.ip);
        _this.jionroom(retdata.ip, retdata.room)

    });
};
gameclass.mod_login.prototype.getroomlist = function(_callfun){
    var data = {"uid":this.logindata.uid};
    this.sendhttp("getroomlist",data, function (retdata) {
        _callfun(retdata);
    });
};
gameclass.mod_login.prototype.sendDeleteRoom = function(roomNum,uid){
    var data = {"room_id":roomNum,"uid":uid};
    this.sendhttp("delete",data);

};

gameclass.mod_login.prototype.jionroom = function (ip, roomid, times) {
    var _this = this;

    if (times == null) {
        times = 5;
    }
    this.getroominfo("ws://" + ip, roomid, function (ws, data) {
        switch (data.msghead) {
            case "roominfo":
                _this.game.uimgr.showload(false);
                _this.game.uimgr.closeallui(true);
                g_isgame = true;
                if (data.msgdata.type == gameclass.gameniuniu) {
                    _this.createniuniu(data.msgdata, ws);
                }else if (data.msgdata.type == gameclass.gamejxnn) {
                    _this.createjxnn(data.msgdata, ws);
                } else if (data.msgdata.type == gameclass.gameddz) {
                    _this.createddz(data.msgdata, ws);
                } else if (data.msgdata.type == gameclass.gamelzddz) {
                    _this.createddz_wild(data.msgdata, ws);
                } else if (data.msgdata.type == gameclass.gamehlgc) {
                    _this.creathlgc(data.msgdata, ws);
                } else if (data.msgdata.type == gameclass.gamesaolei) {
                    _this.createsaolei(data.msgdata, ws);
                } else if (data.msgdata.type == gameclass.gamewolong) {
                    _this.createWoLong(data.msgdata, ws);
                } else if (data.msgdata.type == gameclass.gameptj) {
                    _this.createptj(data.msgdata, ws);
                }else {
                    ws.onclosefunc = null;
                    _this.dissmissroom();
                    _this.game.uimgr.showui("gameclass.msgboxui");
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString("您在房间中，请退出后重试");
                }
                break;
            case "joinroomfail":
                ws.onclosefunc = null;
                _this.dissmissroom();
                _this.game.uimgr.showui("gameclass.msgboxui");
                switch (data.msgdata.result) {
                    case 1:
                        _this.game.uimgr.uis["gameclass.msgboxui"].setString("该房间已解散");
                        break;
                    case 2:
                        _this.game.uimgr.uis["gameclass.msgboxui"].setString("该房间已满员");
                        break;
                    case 4:
                        _this.game.uimgr.uis["gameclass.msgboxui"].setString("房卡不足");
                        break;
                    default:
                        _this.game.uimgr.uis["gameclass.msgboxui"].setString("房间错误");
                        break;
                }
                break;
        }
    })
};

gameclass.mod_login.prototype.getroominfo = function (ip, roomid, func, times) {

    var _this = this;
    gameclass.newwebsocket(this.game, ip, function (ws) {
    }, function (ws) {
        // cc.log("open");
        var data = {"uid": _this.logindata.uid, "roomid": roomid, "minfo": gameclass.mod_platform.getmapinfo()};
        ws.send("joinroom", data);
    }, function (ws, data) {
        func(ws, data);
        // cc.log("onmsng");
    }, function () {
        cc.log("onerrorfunc");
    }, function () {
        cc.log("onclosefunc");
        _this.backlogin();
    });
};
gameclass.mod_login.prototype.createWoLong = function(_roominfo,_mysocket) {
    var mod_wolong = new gameclass.mod_wolong();

    this.mod_game = mod_wolong;

    this.game.uimgr.showui("gameclass.wolongTable");
    this.game.uimgr.closeui("gameclass.hallui");
    this.game.uimgr.closeui("gameclass.jionroomui");

    mod_wolong.view=this.game.uimgr.uis["gameclass.wolongTable"];
    this.game.uimgr.uis["gameclass.wolongTable"].bindMod(mod_wolong,_roominfo);

    mod_wolong.setgame(this.game);
    mod_wolong.entergame(_roominfo,_mysocket);
};
gameclass.mod_login.prototype.createniuniu = function (_roominfo, _mysocket) {
    var mod_niuniu = new gameclass.mod_niuniu;
    g_ShowBattery = true;
    this.game.uimgr.showui("gameclass.niuniutable");

    mod_niuniu.setgame(this.game);
    mod_niuniu.entergame(_roominfo, _mysocket);

    this.game.uimgr.uis["gameclass.niuniutable"].setmod(mod_niuniu);

    //this.gamelst[this.gamelst.length] = mod_niuniu;
    this.mod_game = mod_niuniu;

};
gameclass.mod_login.prototype.createjxnn = function (_roominfo, _mysocket) {
    g_ShowBattery = true;
    var mod_niuniu = new gameclass.mod_jxnn;
    this.game.uimgr.showui("gameclass.jxnntable");

    mod_niuniu.setgame(this.game);
    mod_niuniu.entergame(_roominfo, _mysocket);

    this.game.uimgr.uis["gameclass.jxnntable"].setmod(mod_niuniu);

    this.mod_game = mod_niuniu;
};
gameclass.mod_login.prototype.createptj = function (_roominfo, _mysocket) {
    g_ShowBattery = true;
    var mod_ptj = new gameclass.mod_ptj;
    this.game.uimgr.showui("gameclass.pintianjiutable");

    mod_ptj.setgame(this.game);
    mod_ptj.entergame(_roominfo, _mysocket);

    this.game.uimgr.uis["gameclass.pintianjiutable"].setmod(mod_ptj);

    this.mod_game = mod_ptj;
};
gameclass.mod_login.prototype.createddz = function (_roominfo, _mysocket) {
    var mod_ddzhu = new gameclass.mod_ddzhu;

    this.game.uimgr.showui("gameclass.ddzhutable");
    this.game.uimgr.closeui("gameclass.hallui");
    this.game.uimgr.closeui("gameclass.jionroomui");
    // cc.log("------------------------------------------------");
    // cc.log("ddzhutable");
    // cc.log("------------------------------------------------");
    mod_ddzhu.setgame(this.game);
    mod_ddzhu.entergame(_roominfo, _mysocket);

    this.game.uimgr.uis["gameclass.ddzhutable"].setmod(mod_ddzhu);

    //this.gamelst[this.gamelst.length] = mod_ddzhu;
    this.mod_game = mod_ddzhu;
};
gameclass.mod_login.prototype.createsaolei = function (_roominfo, _mysocket) {
    var mod = new gameclass.mod_minesweeping;
    this.game.uimgr.showui("gameclass.minesweepingtable", false, null, 1);

    mod.setgame(this.game);
    mod.entergame(_roominfo, _mysocket);
    this.game.uimgr.uis["gameclass.minesweepingtable"].setmod(mod);

    //this.gamelst[this.gamelst.length] = mod_zjh;
    this.mod_game = mod;
};
gameclass.mod_login.prototype.createddz_wild = function (_roominfo, _mysocket) {
    var mod_ddzhu = new gameclass.mod_ddzhu;
    this.game.uimgr.showui("gameclass.ddzhutable_wild");
    this.game.uimgr.closeui("gameclass.hallui");
    this.game.uimgr.closeui("gameclass.jionroomui");

    mod_ddzhu.setgame(this.game);
    mod_ddzhu.entergame(_roominfo, _mysocket);

    this.game.uimgr.uis["gameclass.ddzhutable_wild"].setmod(mod_ddzhu);

    //this.gamelst[this.gamelst.length] = mod_ddzhu;
    this.mod_game = mod_ddzhu;
};


gameclass.mod_login.prototype.creathlgc = function (_roominfo, _mysocket) {
    var mod = new gameclass.mod_hlgc;
    this.game.uimgr.showui("gameclass.hlgc.Table");
    this.game.uimgr.closeui("gameclass.hallui");
    this.game.uimgr.closeui("gameclass.jionroomui");


    mod.setgame(this.game);
    mod.entergame(_roominfo, _mysocket);
    this.game.uimgr.uis["gameclass.hlgc.Table"].setmod(mod);

    this.mod_game = mod;
};


gameclass.mod_login.prototype.dissmissroom = function () {
    g_isgame = false;
    g_will_room = 0;
    //this.gamelst = [];//.splice(0,1);
    //this.game.uimgr.closeui("gameclass.loginui");
    this.game.uimgr.closeui("gameclass.niuniutable");
    this.game.uimgr.closeui("gameclass.zjhtable");
    this.game.uimgr.closeui("gameclass.ddzhutable");
    this.game.uimgr.closeui("gameclass.ddzhutable_wild");
    this.game.uimgr.closeui("gameclass.sdbtable");
    this.game.uimgr.closeui("gameclass.hlgc.Table");
    this.game.uimgr.closeui("gameclass.lyctable");
    this.game.uimgr.showui("gameclass.hallui");

};

gameclass.mod_login.prototype.backlogin = function () {
    g_isgame = false;
    g_islogin = false;
    g_will_room = 0;
    //this.gamelst.splice(0,1);
    //this.game.uimgr.closeui("gameclass.loginui");
    this.game.uimgr.closeui("gameclass.niuniutable");
    this.game.uimgr.closeui("gameclass.zjhtable");
    this.game.uimgr.closeui("gameclass.ddzhutable");
    this.game.uimgr.closeui("gameclass.ddzhutable_wild");
    this.game.uimgr.closeui("gameclass.lyctable");
    this.game.uimgr.showui("gameclass.loginui");
};


gameclass.mod_login.prototype.getfirstgame = function () {
    return this.mod_game;
};


