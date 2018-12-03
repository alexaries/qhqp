/**
 * Created by Administrator on 2017/3/11 0011.
 */

gameclass.mod_record = gameclass.mod_base.extend({
    msg_list_Hander: {},//{:1, gameclass.gameddz, gameclass.gameniuniu, gameclass.gamelzddz},
    msg_data_hander: {},
    o_data: null,
    s_data: null,
    curGameid: null,
    curRoomid: null,
    curBureauid: null,
    curUserid: null,

    maxJu: [],
    ctor: function () {
        this.msg_list_Hander[gameclass.gameniuniu] = "record";//牛牛消息请求头 
        this.msg_list_Hander[gameclass.gamelzddz] = "recordddz1";//斗地主获取房间号及局数列表消息
        this.msg_list_Hander[gameclass.gameddz] = "recordddz1";
        this.msg_list_Hander[gameclass.gamesdb] = "record";
        this.msg_list_Hander[gameclass.gamehlgc] = "recordqhmj1";
        this.msg_list_Hander[gameclass.gamelyc] = "record";
        this.msg_list_Hander[gameclass.gamewolong] = "record";//牛牛消息请求头
        this.msg_list_Hander[gameclass.gameptj] = "record";

        this.msg_data_hander[gameclass.gameniuniu] = "record";//牛牛
        this.msg_data_hander[gameclass.gamelzddz] = "recordddz2";//斗地主获取战绩界面消息
        this.msg_data_hander[gameclass.gameddz] = "recordddz2";
        this.msg_data_hander[gameclass.gamesdb] = "record";  //十点半
        this.msg_data_hander[gameclass.gamelyc] = "record";
        this.msg_data_hander[gameclass.gameptj] = "record";
        this.msg_data_hander[gameclass.gamehlgc] = "recordqhmj2";
        this.msg_data_hander[gameclass.gamewolong] = "record";//牛牛
    },
    setCurGameid: function (gid) {
        this.curGameid = gid;
    },
    setCurRoomid: function (rid) {
        this.curRoomid = rid;
    },
    setCurBureauid: function (bid) {
        this.curBureauid = bid;
    },
    setCurUserid: function (uid) {
        this.curUserid = uid;
    },
    getMaxJu: function (obj) {
        this.maxJu = [];
        for (var i in obj) {
            var roomID = Number(i);
            var maxJu = obj[i].children.length;
            var data = {"roomId": roomID, "maxJu": maxJu};
            this.maxJu.push(data);
        }
        // cc.log(this.maxJu);
    },
});

gameclass.mod_record.prototype.getRecordList = function (gameid, data, func) {
    this.getGCRecordInfo(gameid, data, func);
};

gameclass.mod_record.prototype.getGCRecordInfo = function (gameid, data, func) {
    this.curGameid = null;
    this.o_data = null;
    this.s_data = null;
    var _this = this;
    var s = this.msg_list_Hander[gameid];
    this.sendhttp(this.msg_list_Hander[gameid], data, function (retdata, temp, recvdata) {
        _this.setCurGameid(gameid);
        if (gameid == gameclass.gamelzddz || gameid == gameclass.gameddz || gameid == gameclass.gameszp || gameid == gameclass.gamehlgc) {

            var mydata = {roomData: retdata, temp: temp, playData: recvdata};
            _this.o_data = mydata.roomData.info;
        } else {
            _this.o_data = [];
            if (!retdata.info) {
                // return;
            }else{
                for (var i = 0; i < retdata.info.length; i++) {
                    _this.o_data.push(JSON.parse(retdata.info[i]));
                }
            }

        }
        var sd = {};
        cc.each(_this.o_data, function (o, x) {
            if (gameid == gameclass.gameszp) o = JSON.parse(o);
            if (o.roomid > 10000000) {
                var rid = parseInt(o.roomid / 100);
                if (!sd[rid]) {
                    sd[rid] = {
                        ot: o.roomid,
                        time: o.time,
                        children: []
                    }
                }
                sd[rid].children.push(o);
            }

        });

        _this.s_data = sd;
        // cc.log(_this.o_data)
        if (gameid == gameclass.gamehlgc) _this.getMaxJu(sd);
        if (func) {
            func(sd);
        }
    });
};

gameclass.mod_record.prototype.getBureauList = function () {
    //cc.log(this.s_data);
    return this.s_data[this.curRoomid];
};
//回放请求
gameclass.mod_record.prototype.getRecordBureau = function (func) {
    var header = this.msg_data_hander[this.curGameid];
    var data = {
        type: this.curBureauid,
        uid: this.curUserid
    };
    this.sendhttp(header, data, function (retdata, temp, recvdata) {
        // cc.log("func ddzrecord");
        func(retdata);
    });
};


