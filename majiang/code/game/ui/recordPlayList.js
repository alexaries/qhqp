/**
 * Created by Administrator on 2017/3/11 0011.
 */

gameclass.recordPlayList = gameclass.baseui.extend({
    mod_record: null,
    recordRoomid: null,
    index: 0,
    btnGroupCtr: null,
    //标准TAB按钮
    btnStyle: null,
    ctor: function () {
        this._super();
    },

    show: function () {
        this.node = this.game.uimgr.createnode(res.RecordReplayList, true);
        this.addChild(this.node);
        this.mod_record = new gameclass.mod_record();
        this.mod_record.setgame(this.game);

        this.listView = ccui.helper.seekWidgetByName(this.node, "listView");
        this._replayTxt = ccui.helper.seekWidgetByName(this.node, "replayTxt");
        this.btnStyle = this.listView.getChildByName("btnStyle");
        this.btnGroupCtr = new gameclass.buttonGroupControl(this.changeTab.bind(this));

        this.listView.removeAllChildren();
        var btnControlArr = [];
        var len = StaticData.roomSetArr.length;

        //test
        // len = 4;
        //test end

        for (var i = 0; i < len; i++) {
            var btn = this.btnStyle.clone();
            var txtArr = staticFunction.addTabBtn(btn, StaticData.roomSetArr[i].normalImg, StaticData.roomSetArr[i].selectImg);
            var selectTxt = txtArr[1];
            selectTxt.setPositionX(selectTxt.getPositionX() - 4);
            selectTxt.setPositionY(selectTxt.getPositionY() + 7);
            this.listView.addChild(btn);
            btnControlArr.push(new gameclass.baseButtonControl(btn, ["normal"], ["select"]));
        }

        this.btnGroupCtr.initData(btnControlArr);
        this.btnGroupCtr.setSelectIndex(0);

        this.mod_record.setCurUserid(this.game.modmgr.mod_login.logindata.uid);

        this.gameList = ccui.helper.seekWidgetByName(this.node, "rightListView");
        var _this = this;

        gameclass.createbtnpress(this.node, "btn_colse", function () {
            _this.game.uimgr.closeui("gameclass.recordPlayList");
        });
        gameclass.createbtnpress(this.node, "replayBtn", function () {
            var inputContent = _this._replayTxt.getString();
            var gameType = 0, roomid = 0, uid = 0;
            //麻将没有类型，无法判断，下面为容错处理
            if (inputContent.length == 12 || inputContent.length == 14)
            {
                gameType = gameclass.gamehlgc;
                roomid = inputContent.substring(0, 8);
                uid = inputContent.substring(8, inputContent.length);
                _this.mod_record.setCurBureauid(Number(roomid));
                _this.mod_record.setCurUserid(Number(uid));
                _this.mod_record.setCurGameid(Number(gameType));
                _this.game.uimgr.showui("gameclass.ReplayWindow").setMod(_this.mod_record);
                _this.game.uimgr.closeui("gameclass.hallui");
            }else if (inputContent.length == 15)
            {//斗地主 -- 牛牛 回放码15位
                gameType = inputContent.substring(0, 1);
                roomid = inputContent.substring(1, 9);
                uid = inputContent.substring(9, 15);
                //cc.log(inputContent,gameType,roomid,uid);
                if (gameType == gameclass.gameddz || gameType == gameclass.gamelzddz)
                {//斗地主回放码处理
                    _this.mod_record.setCurBureauid(Number(roomid));
                    _this.mod_record.setCurUserid(Number(uid));
                    _this.mod_record.setCurGameid(Number(gameType));
                    _this.game.uimgr.showui("gameclass.ddzrecord").setMod(_this.mod_record);
                    _this.game.uimgr.closeui("gameclass.hallui");
                }
                else if (gameType == gameclass.gameNewNiuNiu)
                { //牛牛回放码处理
                    var data = {type: Number(gameType), uid: Number(uid)};
                    var nn_roomid = inputContent.substring(1, 7);
                    var s_data = null;
                    _this.mod_record.getRecordListStatic(gameclass.gameNewNiuNiu, data, function () {
                        cc.each(_this.mod_record.s_data, function (o, i) {
                            //cc.log(o, i);
                            if (i == nn_roomid) {
                                s_data = o;
                            }
                        });
                        if (s_data) {
                            _this.game.uimgr.showui("gameclass.niuniurecord").showRecord_nn(s_data.ot, s_data.children, s_data.time);
                            _this.game.uimgr.closeui("gameclass.hallui");
                        }
                    });

                }
                else {
                    _this.showToast("数据错误!");
                }
            }
            else {
                _this.showToast("输入有误，请重新输入!");
            }
        });
        _this.changeTab();
    },
    showToast: function (_text) {
        if (this.node.getChildByTag(123456)) {
            return;
        }
        var _this = this;
        _this.node.removeChildByTag(123456);
        var node = new cc.Sprite(res.img_input);
        node.setPosition(this.node.getContentSize().width / 2, 100);
        node.setOpacity(160);
        node.setTag(123456);
        var text = new cc.LabelTTF(_text, "Arial", 25);
        text.setPosition(node.getContentSize().width / 2, node.getContentSize().height / 2);
        node.addChild(text);
        _this.node.addChild(node);
        _this.scheduleOnce(function () {
            _this.node.removeChildByTag(123456);
        }, 3);
    },
    changeTab: function () {
        var tabIndex = this.btnGroupCtr._selectIndex;
        var obj = StaticData.roomSetArr[tabIndex];

        var data = {type: obj.gameType, uid: this.game.modmgr.mod_login.logindata.uid};
        this.showRecordList(data, obj.gameType);
    },
    //游戏类型请求数据
    showRecordList: function (data, type) {
        var _this = this;
        _this.mod_record.getRecordList(type, data, function (mydata) {
            _this.showData(type);
        });
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
    showData: function (tp) {
        this.gameList.removeAllChildren();

        var tabIndex = this.btnGroupCtr._selectIndex;
        var obj = StaticData.roomSetArr[tabIndex];

        var _this = this;
        var gameType;
        // cc.log(this.mod_record.s_data);
        for (var i in this.mod_record.s_data) {
            var infoObj = this.mod_record.s_data[i];

            gameType = obj.gameType;
            for (var m = 0; m < infoObj.children.length; m++) {
                if(infoObj.children[m].type){
                    gameType = infoObj.children[m].type;
                    break;
                }
            }
            if(gameType != obj.gameType)continue;
            // var infoObjChildArr = infoObj.children[i];
            //
            // if(infoObjChildArr.type != obj.gameType)continue;

            var listCell = this.game.uimgr.createnode(res.recordListCell, true).getChildByName("Panel_1");
            listCell.removeFromParent(false);
            this.gameList.pushBackCustomItem(listCell);
            ccui.helper.seekWidgetByName(listCell, "roomId").setString(Number(i));
            ccui.helper.seekWidgetByName(listCell, "name").setString(obj.name);
            ccui.helper.seekWidgetByName(listCell, "time").setString("时间:" + this.getDate(infoObj.children[0].time));

            var stateWin = ccui.helper.seekWidgetByName(listCell, "stateWin");
            var stateLost = ccui.helper.seekWidgetByName(listCell, "stateLost");

            //显示玩家信息
            var infos = {};
            if (tp == gameclass.gamehlgc || tp == gameclass.gameddz || tp == gameclass.gamelzddz || tp == gameclass.gameszp || tp == gameclass.gamewolong)
                infos = infoObj.children[0].person;
            else
                infos = infoObj.children[0].info;
            var len = infos.length;
            // cc.log("------------");
            for (var j = 0; j < 6; j++) {
                var player = ccui.helper.seekWidgetByName(listCell, "player" + j);
                player.setVisible(j < len);
                if (j > len - 1) continue;
                player.setString(infos[j].name);

                // cc.log(infos[j].uid + "," + infos[j].score);
                var total = 0;
                // if (infos[j].total) total = infos[j].total;

                if (infos[j].total) {
                    total = infos[j].total;
                } else {
                    for (var m = 0; m < infoObj.children.length; m++) {
                        if (tp == gameclass.gamehlgc || tp == gameclass.gameddz || tp == gameclass.gamelzddz || tp == gameclass.gameszp || tp == gameclass.gamewolong) {
                            total += infoObj.children[m].person[j].score;
                        } else {
                            total += infoObj.children[m].info[j].score;
                        }
                    }
                }

                if(infos[j].uid == this.game.modmgr.mod_login.logindata.uid){
                    if(total == 0){
                        stateWin.setVisible(false);
                        stateLost.setVisible(false);
                    }else if(total > 0){
                        stateWin.setVisible(true);
                        stateLost.setVisible(false);
                    }else{
                        stateWin.setVisible(false);
                        stateLost.setVisible(true);
                    }
                }

                player.getChildByName("score").setString(total);
            }
            // cc.log("------------");

            var btn_check = ccui.helper.seekWidgetByName(listCell, "btn_chakan");
            btn_check.roomid = Number(i);
            btn_check._type = 1;
            if (tp == gameclass.gamehlgc) btn_check._type = 2;
            btn_check.addTouchEventListener(_this.touchEvent_gc, _this);
        }
    },

    touchEvent_gc: function (sender, type) {
        var _this = this;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                //cc.log("Touch Up"+sender.roomid);
                _this.mod_record.setCurRoomid(sender.roomid);
                this.game.uimgr.closeui("gameclass.recordPlayList");
                this.game.uimgr.showui("gameclass.recordBureau").setMod(_this.mod_record, sender._type);//.setClickItem(arr);
                break;
            default:
                break;
        }
    },
    destroy: function () {
        this.btnGroupCtr.destroy();
    },
});