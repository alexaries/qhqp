/**
 * 开设包房-游戏单元控制
 * @type {Function}
 */
gameclass.clubRoomSetItemCtr = cc.Class.extend({
    _node: null,
    game: null,
    _titleTxt: null,
    _detailTxt: null,
    _gameImg: null,
    _setBtn: null,
    _openBtn: null,
    _clubData: null,
    _index: -1,
    ctor: function (node, game, index) {
        this._index = index;

        this._node = node;
        this.game = game;
        this._titleTxt = ccui.helper.seekWidgetByName(this._node, "titleTxt");
        this._detailTxt = ccui.helper.seekWidgetByName(this._node, "detailTxt");
        this._gameImg = ccui.helper.seekWidgetByName(this._node, "gameImg");
        this._setBtn = ccui.helper.seekWidgetByName(this._node, "setBtn");
        this._openBtn = ccui.helper.seekWidgetByName(this._node, "openBtn");

        this._setBtn.addTouchEventListener(function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) return;
            this.game.uimgr.showui("gameclass.createroomui");
            this.game.uimgr.uis["gameclass.createroomui"].setclubid(this._clubData.id, this._index);
        }, this);
        this._openBtn.addTouchEventListener(function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) return;
            this.openClubRoom();
        }, this);
    },
    updateView: function (clubData, ismanager) {
        this._clubData = clubData;

        if (ismanager) {
            this._setBtn.setBright(true);
            this._setBtn.setTouchEnabled(true);
        } else {
            this._setBtn.setBright(false);
            this._setBtn.setTouchEnabled(false);
        }
        if (this._clubData.mode == 0) {
            //仅群主可以开放
            if (ismanager) {
                this._openBtn.setBright(true);
                this._openBtn.setTouchEnabled(true);
            } else {
                this._openBtn.setBright(false);
                this._openBtn.setTouchEnabled(false);
            }
        } else {
            //都可以开房
            this._openBtn.setBright(true);
            this._openBtn.setTouchEnabled(true);
        }

        var mainType = gameclass.getGameMainType(this._clubData.game[this._index].gametype);
        var gameName = StaticData.getRoomSetFromType(this._clubData.game[this._index].gametype).name;
        this._gameImg.setTexture(res["jublebu_" + mainType]);

        this._titleTxt.setString(gameName);
        this._detailTxt.setString("");
        // var str = staticFunction.getStorage(gameclass.clubStorageKey, this._clubData.id + "-" + this._clubData.game[this._index] + "-" + this._index);
        // if(str == null)return;

        this._clubData.game[this._index].clubid = this._clubData.id;
        this._clubData.game[this._index].maxstep = this.game.modmgr.mod_center.mod_club.getmaxstepbycardnum(this._clubData.game[this._index].gametype, this._clubData.game[this._index].num);


        var clubmanager = this.game.uimgr.uis["gameclass.clubmanger"];
        var clubSingleHall = clubmanager._roomListControl;
        // var wanfaStr = clubSingleHall.allshare(this._clubData.game[this._index], false);

        var str = StaticData.getRoomSetStrFromParam(this._clubData.game[this._index].gametype, this._clubData.game[this._index].param1, this._clubData.game[this._index].param2, this._clubData.game[this._index].num);
        // cc.log("str == "+str)

        this._detailTxt.setString(str);
        return;
    },
    /**
     * 俱乐部开房
     */
    openClubRoom: function () {
        // var obj = staticFunction.getStorage(gameclass.clubStorageKey, this._clubData.id + "-" + this._clubData.game[this._index] + "-" + this._index);
        // if (obj == null) return;
        // var recordinfo = {
        //     "gametype":roomId,
        //     "card":cardNum,
        //     "maxstep":this.game.modmgr.mod_center.mod_club.getmaxstepbycardnum(roomId,cardNum),
        //     "param1":param1,
        //     "param2":param2
        // };
        // var data = {
        //     "cid": this._clubData.id,
        //     "gametype": this._clubData.game[this._index].gametype,
        //     "param1": this._clubData.game[this._index].param1,
        //     "param2": this._clubData.game[this._index].param2,
        //     "card": this._clubData.game[this._index].card
        // };
        this.game.modmgr.mod_center.mod_club.sendclubkaifang(this._clubData.game[this._index]);

        gameclass.showText("开房成功，在房间列表可以查看");
    },
    switchInRoomIndex: function (gameType) {
        var gameType = gameclass.getGameMainType(gameType);

        var createui = [9, 1, 2, 3, 8, 0, 6, 5, 4, 7];//创建房间对应的序号
        var result = 0;
        if (gameType == gameclass.gamekwx) {
            result = 9;
        } else if (gameType == gameclass.gameszp) {
            result = 1;
        } else if (gameType == gameclass.gameniuniu) {
            result = 2;
        } else if (gameType == gameclass.gameddz) {
            result = 3;
        } else if (gameType == gameclass.gamenys) {
            result = 8;
        } else if (gameType == gameclass.gameptj) {
            result = 0;
        } else if (gameType == gameclass.gamettz) {
            result = 6;
        } else if (gameType == gameclass.gamesdb) {
            result = 5;
        } else if (gameType == gameclass.gamenxs) {
            result = 7;
        } else {
            result = 4
        }
        return result;
    },
});