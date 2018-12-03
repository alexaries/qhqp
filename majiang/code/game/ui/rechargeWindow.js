/**
 * Created on 2017/12/26.
 */

gameclass.rechargeWindow = gameclass.baseui.extend({
    _numSetLayer: null,
    _numSetCtr: null,
    _prevBtn: null,
    _nextBtn: null,
    _backBtn: null,
    _okBtn: null,
    _curPage: 0,
    _pageContain: null,
    game: null,
    _receiveUid: 0,
    _receiveNickName: "",
    _sendUid: 0,
    _sendCardNum: 0,
    _idTxt: null,
    _nameTxt: null,
    _cardNumTxt: null,
    ctor: function () {
        this._super();
        this._curPage = 0;
    },
    setGame: function ($game) {
        this.game = $game;
        this._sendUid = this.game.modmgr.mod_login.logindata.uid;
    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.rechargeJson, true);
        this.addChild(this.node);

        this._numSetLayer = ccui.helper.seekWidgetByName(this.node, "numSetLayer");
        this._numSetCtr = new gameclass.numSetSimpleCtr(this._numSetLayer, false, 6);
        this._numSetCtr.setFont(50, new cc.color(165, 42, 42));

        this._pageContain = ccui.helper.seekWidgetByName(this.node, "pageContain");
        this._prevBtn = ccui.helper.seekWidgetByName(this.node, "prevBtn");
        this._nextBtn = ccui.helper.seekWidgetByName(this.node, "nextBtn");
        this._backBtn = ccui.helper.seekWidgetByName(this.node, "backBtn");
        this._okBtn = ccui.helper.seekWidgetByName(this.node, "okBtn");
        this._idTxt = ccui.helper.seekWidgetByName(this.node, "idTxt");
        this._nameTxt = ccui.helper.seekWidgetByName(this.node, "nameTxt");
        this._cardNumTxt = ccui.helper.seekWidgetByName(this.node, "cardNumTxt");


        var _this = this;
        gameclass.createbtnpress(this.node, "backBtn", function () {
            _this.game.uimgr.closeui("gameclass.rechargeWindow");
        });
        gameclass.createbtnpress(this.node, "closeBtn", function () {
            _this.game.uimgr.closeui("gameclass.rechargeWindow");
        });
        gameclass.createbtnpress(this.node, "okBtn", function () {
            _this.okHandle();
        });
        gameclass.createbtnpress(this.node, "prevBtn", function () {
            _this.prevHandle();
        });
        gameclass.createbtnpress(this.node, "nextBtn", function () {
            _this.nextHandle();
        });

        this.updatePage();
    },
    updatePage: function () {
        var len = this._pageContain.getChildrenCount();
        if (this._curPage == 0) {
            this._prevBtn.setBright(false);
            this._prevBtn.setTouchEnabled(false);

            this._nextBtn.setBright(true);
            this._nextBtn.setTouchEnabled(true);
        } else if (this._curPage == len - 1) {
            this._prevBtn.setBright(true);
            this._prevBtn.setTouchEnabled(true);

            this._nextBtn.setBright(false);
            this._nextBtn.setTouchEnabled(false);
        } else {
            this._prevBtn.setBright(true);
            this._prevBtn.setTouchEnabled(true);

            this._nextBtn.setBright(true);
            this._nextBtn.setTouchEnabled(true);
        }
        for (var i = 0; i < len; i++) {
            var child = this._pageContain.getChildren()[i];
            if (i == this._curPage) {
                child.setVisible(true);
            } else {
                child.setVisible(false);
            }
        }
        if (this._curPage == len - 1) {
            this._prevBtn.setVisible(false);
            this._nextBtn.setVisible(false);
            this._numSetLayer.setVisible(false);
        } else {
            this._numSetLayer.setVisible(true);
        }

        this._numSetCtr.resetNumber();
    },
    prevHandle: function () {
        var _this = this;
        if (this._curPage == 0) {
            _this._idTxt.setString(_this._receiveUid.toString());
        } else if (this._curPage == 1) {
            _this._cardNumTxt.setString(this._sendCardNum.toString());
        }
        this.prevPage();
    },
    prevPage: function () {
        this._curPage--;
        if (this._curPage < 0) return;

        this.updatePage();
    },
    okHandle: function () {
        var _this = this;
        var data = {"send_id": this._sendUid, "rec_id": this._receiveUid, "num": this._sendCardNum};
        this.game.modmgr.mod_login.agentPostRequest(gameclass.phpAddressPrev + gameclass.agentPostAdd, "sendCard", data, function (retdata) {
            if (retdata && retdata.code && retdata.code == 1) {
                cc.log("sendcardOk:rec_id=" + this._receiveUid + ",recNickName=" + this._receiveNickName + ",cardNum=" + this._sendCardNum);
                _this.game.uimgr.showui("gameclass.msgboxui").setString("发送成功！");
            } else {
                if (retdata.msg != "") {
                    _this.game.uimgr.showui("gameclass.msgboxui").setString(retdata.msg);
                } else {
                    _this.game.uimgr.showui("gameclass.msgboxui").setString("发送失败，请重启游戏后重试！");
                }
            }
            _this.game.uimgr.closeui("gameclass.rechargeWindow");
        });
    },
    nextHandle: function () {
        var _this = this;
        if (this._curPage == 0) {
            _this._receiveUid = this._numSetCtr.getNumber();
            _this._idTxt.setString(_this._receiveUid.toString());
            if (_this._receiveUid == 0) {
                _this.game.uimgr.showui("gameclass.msgboxui").setString("需要输入用户ID!");
                return;
            }
            var data = {"uid": _this._receiveUid};
            this.game.modmgr.mod_login.agentPostRequest(gameclass.phpAddressPrev + gameclass.agentPostAdd, "getNickName", data, function (retdata) {
                if (retdata && retdata.nickname && retdata.nickname != "") {
                    cc.log("uid=" + data.uid + ",getNickName=" + retdata.nickname);
                    _this._receiveNickName = retdata.nickname;
                    _this._nameTxt.setString(_this._receiveNickName.toString());
                    _this.nextPage();
                } else {
                    _this.game.uimgr.showui("gameclass.msgboxui").setString("找不到该用户!");
                    return;
                }
            });
        } else if (this._curPage == 1) {
            var data = {"uid": this._sendUid};
            _this._sendCardNum = this._numSetCtr.getNumber();
            _this._cardNumTxt.setString(this._sendCardNum.toString());
            if (_this._sendCardNum == 0) {
                _this.game.uimgr.showui("gameclass.msgboxui").setString("需要输入房卡数量!");
                return;
            }
            this.game.modmgr.mod_login.agentPostRequest(gameclass.phpAddressPrev + gameclass.agentPostAdd, "getCard", data, function (retdata) {
                if (retdata) {
                    cc.log("uid=" + data.uid + ",totalCardNum=" + retdata.card);
                    if (retdata.card < _this._sendCardNum) {
                        _this.game.uimgr.showui("gameclass.msgboxui").setString("房卡不足!");
                    } else {
                        _this.nextPage();
                    }
                    cc.log("uid=" + data.uid + ",getCard=" + retdata.card);
                }
            });
        }
    },
    nextPage: function () {
        var len = this._pageContain.getChildrenCount();
        this._curPage++;
        if (this._curPage >= len) return;

        this.updatePage();
    },
});