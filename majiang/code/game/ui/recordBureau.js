/**
 * Created by Administrator on 2017/3/11 0011.
 */

gameclass.recordBureau = gameclass.baseui.extend({
    gameType: 0,
    groupstable:null,
    ctor: function () {
        this._super();
        this.getptjson();
    },

    show: function () {
        this.node = this.game.uimgr.createnode(res.RecordBureau, true);
        this.addChild(this.node);
        this.recorBureaulist = ccui.helper.seekWidgetByName(this.node, "ListView_1");
        gameclass.createbtnpress(this.node, "btn_colse", function () {
            this.game.uimgr.closeui("gameclass.recordBureau");
            this.game.uimgr.showui("gameclass.recordPlayList");
        });

    },
    setMod: function (mod, type) {
        var _this = this;
        _this.mod_record = mod;

        var data = _this.mod_record.getBureauList();
        var arr = data.children;
        arr.sort(function (a, b) {
            return a.time > b.time;
        });
        _this.setClickItem(arr, type);
    },
    getptjson:function() {
        var _this = this;
        cc.loader.loadJson(res.pintianjiugroups,function(err,data){
            _this.groupstable = [];
            for(var ty in data){
                var obj = data[ty];
                //for(var i = 0 ; i < 10; i++){
                //    var group = "group"+(i+1);
                //    var splitarr = [];
                //    if(obj[group]) {
                //        splitarr = obj[group].split("#",2);
                //        obj[group] = splitarr;
                //    }else{
                //        break;
                //    }
                //}
                _this.groupstable.push(obj);
            }
        });
    },
    setClickItem: function (data, type) {
        var _this = this;
        _this.gameType = _this.mod_record.curGameid;
        _this.recorBureaulist.removeAllChildren();

        // cc.log(data);

        for (var i = 0; i < data.length; i++) {
            var listCell = this.game.uimgr.createnode(res.recordCell, true).getChildByName("Panel_1");
            listCell.setContentSize(cc.size(listCell.getContentSize().width, 130))
            // cc.log(listCell.getContentSize().width + "," + listCell.getContentSize().height)
            listCell.removeFromParent(false);
            this.recorBureaulist.pushBackCustomItem(listCell);

            var infos = [];
            if (_this.gameType == gameclass.gamehlgc || _this.gameType == gameclass.gameddz || _this.gameType == gameclass.gamelzddz || _this.gameType == gameclass.gamewolong)
                infos = data[i].person;
            else
                infos = data[i].info;

            var len = infos.length;
            for (var j = 0; j < 4; j++) {
                var nameTxt = ccui.helper.seekWidgetByName(listCell, "player" + j);
                var score = ccui.helper.seekWidgetByName(listCell, "score" + j);
                score.setVisible(j < len);
                if (j > len - 1) {
                    nameTxt.setString("");
                    score.setString("");
                    continue;
                }
                nameTxt.setString(infos[j].name);
                score.setString(infos[j].score);
            }
            var rankTxt = ccui.helper.seekWidgetByName(listCell, "rankTxt");
            rankTxt.setString((i + 1).toString());

            var roomid = parseInt(data[i].ot / 100);

            var btn_hf = ccui.helper.seekWidgetByName(listCell, "btn_replay");
            btn_hf.bureauid = data[i].roomid;
            btn_hf.nn_time = data[i].time;//

            //add by lish 2017-10-16
            btn_hf.nn_ju = i;

            if (type == 1) {
                btn_hf.addTouchEventListener(_this.hf_touchEvent, _this);
            } else if (type == 2) {
                btn_hf.addTouchEventListener(_this.hf_touchEvent_gc, _this);

            }

            if (_this.mod_record.curGameid == gameclass.gamewolong) {
                btn_hf.itemIndex = data[i].roomid;
                btn_hf.recordData = data;
            } else if (_this.mod_record.curGameid == gameclass.gamelyc) {
                btn_hf.nn_data = data[i].info;
            }else if(_this.mod_record.curGameid == gameclass.gameniuniu||_this.mod_record.curGameid == gameclass.gameptj){
                var _data =  _this.mod_record.getBureauList();
                btn_hf.nn_data  = _data.children;
            }
            else {
                btn_hf.nn_data = data[i];
            }
        }
    },

    getDate: function (date) {
        var d = new Date(date * 1000);    //根据时间戳生成的时间对象
        var date = (d.getFullYear()) + "-" +
            (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            (d.getHours()) + ":" +
            (d.getMinutes()) + ":" +
            (d.getSeconds());
        return date;
    },


    //回看
    hf_touchEvent_gc: function (sender, type) {
        var _this = this;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                //cc.log("hf_touchEvent Touch Up"+sender.bureauid);
                _this.mod_record.setCurBureauid(sender.bureauid);
                _this.game.uimgr.closeui("gameclass.recordBureau");
                _this.game.uimgr.closeui("gameclass.hallui");
                _this.game.uimgr.showui("gameclass.ReplayWindow").setMod(_this.mod_record);
                break;
            default:
                break;
        }
    },

    hf_touchEvent: function (sender, type) {
        var _this = this;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:

                _this.game.uimgr.closeui("gameclass.recordBureau");
                _this.game.uimgr.closeui("gameclass.hallui");
                _this.mod_record.setCurBureauid(sender.bureauid);
                if (_this.gameType == gameclass.gamettz) {
                    //_this.game.uimgr.showui("gameclass.ttzrecord").ttz_showRecord(sender.bureauid,sender.nn_data,sender.nn_time);
                } else if (_this.gameType == gameclass.gameddz || _this.gameType == gameclass.gamelzddz) {
                    _this.game.uimgr.showui("gameclass.ddzrecord").setMod(_this.mod_record);
                }else if(_this.gameType == gameclass.gameptj){
                    _this.game.uimgr.showui("gameclass.ptjrecord").ptj_showRecord(sender.bureauid,sender.nn_data,sender.nn_time,_this.groupstable);
                } else if (_this.gameType == gameclass.gamewolong) {
                    var selectRoomid=sender.itemIndex;
                    var recordData=sender.recordData;
                    _this.game.uimgr.showui("gameclass.woLongRecord").setMod(recordData,selectRoomid);
                } else {
                     var zhanji_data = sender.nn_data;
                     zhanji_data.curGameid = _this.gameType;
                     _this.game.uimgr.showui("gameclass.niuniurecord").showRecord_nn(sender.bureauid, zhanji_data, sender.nn_time);
                }
                break;
            default:
                break;
        }
    },
});
