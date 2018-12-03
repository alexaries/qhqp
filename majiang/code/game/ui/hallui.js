/**
 * Created by yang on 2016/11/9.
 */

gameclass.hallui = gameclass.baseui.extend({
    sprite: null,
    node: null,
    wchat: null,
    btn_jinbi: null,
    ctor: function () {
        this._super();

        this._address = gameclass.mod_platform.getAddress();
    },
    show: function () {
        //if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
        //    cc.spriteFrameCache.removeUnusedSpriteFrames();
        //    cc.textureCache.removeUnusedTextures();
        //}


        mod_sound.playbmg(g_music.bmg, true);

        this.node = this.game.uimgr.createnode(res.halluijson, true);

        if (window.wx) {
            gameclass.mod_platform.wxshare(gameclass.title, 0, "大家一起过来玩吧。")
        }

        var maskLayer = ccui.helper.seekWidgetByName(this.node, "maskLayer");
        this._male = ccui.helper.seekWidgetByName(this.node, "male");
        this._famale = ccui.helper.seekWidgetByName(this.node, "famale");
        this._noticeTxt = ccui.helper.seekWidgetByName(this.node, "noticeTxt");
        this._curGameSp = ccui.helper.seekWidgetByName(this.node, "curGameSp");
        this._page0 = ccui.helper.seekWidgetByName(this.node, "page0");
        this._page1 = ccui.helper.seekWidgetByName(this.node, "page1");
        this._gameLayer = ccui.helper.seekWidgetByName(this.node, "gameLayer");
        this._shareLayer = ccui.helper.seekWidgetByName(this.node, "shareLayer");

        this._shareLayer.setVisible(false);

        this.swapPage(true);

        this._male.setVisible(false);
        maskLayer.setVisible(false);
        maskLayer.setTouchEnabled(true);
        maskLayer.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_ENDED) {
                maskLayer.setVisible(false);
            }
        }, this);

        this._gameType = staticFunction.getStorage(StaticData.HALL_CASH, StaticData.GAME_DEFAUL);
        this.updateCurGame();

        this.addChild(this.node);

        var _this = this;

        this.wchat = ccui.helper.seekWidgetByName(this.node, "wchat");

        gameclass.createbtnpress(this.node, "buyroomcard", function () {
            _this.game.uimgr.showui("gameclass.shopView");
        });

        var head = ccui.helper.seekWidgetByName(this.node, "headback");
        head.setTouchEnabled(true);
        gameclass.mod_base.showtximg(head, this.game.modmgr.mod_login.logindata.imgurl, 0, 0, "im_headbg2");
        var name = ccui.helper.seekWidgetByName(this.node, "name");
        var id = ccui.helper.seekWidgetByName(this.node, "id");
        var card = ccui.helper.seekWidgetByName(this.node, "money");

        name.setString(this.game.modmgr.mod_login.logindata.name);
        id.setString(this.game.modmgr.mod_login.logindata.uid.toString());
        card.setString(this.game.modmgr.mod_login.logindata.card.toString());
        if (this.game.modmgr.mod_login.logindata.sex == 0) {
            this._male.setVisible(false);
            this._famale.setVisible(true);
        } else {
            this._male.setVisible(true);
            this._famale.setVisible(false);
        }

        for (var i = 0; i < this._gameLayer.getChildrenCount(); i++) {
            var gameBtn = this._gameLayer.getChildren()[i];
            var gameBtnName = gameBtn.getName();
            var gameType = parseInt(gameBtnName.substr(4, gameBtnName.length));
            gameBtn.gameType = gameType;
            gameclass.createbtnpress(this.node, gameBtnName, function (sender) {
                _this.showCreateRoom(sender.gameType);
            });
        }

        //test
        // id.setPositionY(id.getPositionY() + 20);
        // this.node.setPositionX(200);
        //test end

        gameclass.createbtnpress(this.node, "joinBtn", function () {
            //var arr=[1, 5, 1, 5, 2, 2, 5, 3, 5, 4, 5, 6, 7];
            //var pos=cc.p(50,400);
            //for(var i=0;i<arr.length;i++){
            //    var spr=gameclass.hlgc.Table.CreateCard(arr[i], 0, 0, 0);
            //    spr.setPosition(pos);
            //    cc.director.getRunningScene().addChild(spr);
            //    pos.x+=70;
            //}
            //var huarr=gameclass.MJtool.create().tinghu(arr,5);
            //
            //var pos1=cc.p(50,200);
            //for(var i=0;i<huarr.length;i++){
            //    var spr=gameclass.hlgc.Table.CreateCard(huarr[i], 0, 0, 0);
            //    spr.setPosition(pos1);
            //    if(huarr[i]==5){
            //        spr.setColor(new cc.color(127, 127, 127));
            //    }
            //    cc.director.getRunningScene().addChild(spr);
            //    pos1.x+=70;
            //}

            _this.game.uimgr.showui("gameclass.jionroomui");
        });
        gameclass.createbtnpress(this.node, "btn_setting1", function () {
            _this.game.uimgr.showui("gameclass.couponLayer");

        });
        gameclass.createbtnpress(this.node, "Button_daikai", function () {
            _this.game.uimgr.showui("gameclass.roomListLayer");
        });
        gameclass.createbtnpress(this.node, "Button_copy", function () {
            var str = "y752975677";
            gameclass.mod_platform.copyStr(str);
        });
        //var youhuiBtn = ccui.helper.seekWidgetByName(this.node,"Button_youhui");
        //youhuiBtn.addTouchEventListener(function(sender,type){
        //    if(type == ccui.Widget.TOUCH_ENDED)
        //    {
        //        _this.game.uimgr.showui("gameclass.couponLayer");
        //    }
        //
        //});
        //gameclass.createbtnpress(this.node,"Button_youhui", function () {
        //    _this.game.uimgr.showui("gameclass.couponLayer");
        //});
        gameclass.createbtnpress(this.node, "createBtn", function () {
            if (_this._gameType != null) {
                _this.showCreateRoom(_this._gameType);
            } else {
                _this.swapPage(false);
            }
        });
        gameclass.createbtnpress(this.node, "backBtn", function () {
            _this.swapPage(true);
        });
        gameclass.createbtnpress(this.node, "headback", function () {
            var userInfoView = _this.game.uimgr.showui("gameclass.UserInfoView");
            userInfoView.updateView(
                _this.game.modmgr.mod_login.logindata.imgurl,
                _this.game.modmgr.mod_login.logindata.name,
                "ID：" + _this.game.modmgr.mod_login.logindata.uid,
                "IP：" + _this.game.modmgr.mod_login.logindata.ip,
                "地址：" + _this._address);
        });

        gameclass.createbtnpress(this.node, "btn_setting", function () {
            _this.game.uimgr.showui("gameclass.settingui");
        });
        gameclass.createbtnpress(this.node, "btn_record", function () {//战绩
            _this.game.uimgr.showui("gameclass.recordPlayList");
        });
        gameclass.createbtnpress(this.node, "btn_help", function () {
            _this.game.uimgr.showui("gameclass.GameRuleView");
        });
        gameclass.createbtnpress(this.node, "shareBtn", function () {
            _this._shareLayer.setVisible(true);
        });
        gameclass.createbtnpress(this.node, "shareBtn", function () {
            _this._shareLayer.setVisible(true);
        });
        gameclass.createbtnpress(this.node, "shareCloseBtn", function () {
            _this._shareLayer.setVisible(false);
        });
        gameclass.createbtnpress(this.node, "friendCircleBtn", function () {//消息
            gameclass.mod_platform.invitefriendSpoons("", gameclass.download, StaticData.GAME_NAME + "，最好玩的棋牌游戏平台，快一起来玩吧！");

        });
        gameclass.createbtnpress(this.node, "wxFriendBtn", function () {//消息
            gameclass.mod_platform.invitefriend("", gameclass.download, StaticData.GAME_NAME + "，最好玩的棋牌游戏平台，快一起来玩吧！");
        });

        gameclass.createbtnpress(this.node, "swapBtn", function () {//消息
            _this.swapPage(false);
        });
        gameclass.createbtnpress(this.node, "shopBtn", function () {//消息
            _this.game.uimgr.showui("gameclass.shopView");
        });

        this.updategonggao();

        this.schedule(function () {
            this.game.modmgr.mod_center.getmapinfo();
        }, 1);

        if (g_will_room != 0) {
            _this.game.modmgr.mod_login.joinwithroomid(g_will_room);
            g_will_room = 0;
        }


    },
    /**
     * 更新当前默认游戏
     */
    updateCurGame: function () {
        if (this._gameType != null) {
            var obj = StaticData.getRoomSetFromType(this._gameType);
            this._curGameSp.setTexture(obj.nameIcon);
        }
    },
    /**
     * 设置当前默认游戏
     * @param gameType
     */
    setCurGame: function (gameType) {
        this._gameType = gameType;
        staticFunction.setStorage(StaticData.HALL_CASH, StaticData.GAME_DEFAUL, gameType);
        this.updateCurGame();
    },
    /**
     * 根据游戏类型显示房间设置面板
     * @param gameType
     */
    showCreateRoom: function (gameType) {
        this.setCurGame(gameType);
        if(gameType==1||gameType==19){

            var _tag=2;
            if(gameType==1){
                _tag=2;
            }else {
                _tag=0;
            }
            this.game.uimgr.showui("gameclass.Newcreateroomui");
            this.game.uimgr.uis["gameclass.Newcreateroomui"].setGameType(_tag, this.clubid, this.clubRoomIndex);
        }else
        this.game.uimgr.showui("gameclass.createroomui");
    },
    /**
     * 切换页面
     * @param isMain 是否主页面
     */
    swapPage: function (isMain) {
        if (isMain) {
            this._page0.setVisible(true);
            this._page1.setVisible(false);
        } else {
            this._page0.setVisible(false);
            this._page1.setVisible(true);
        }
    },
    update: function () {
        var card = ccui.helper.seekWidgetByName(this.node, "money");
        card.setString(this.game.modmgr.mod_login.logindata.card);
        card.runAction(cc.blink(1, 2));
    },
    updategonggao: function () {
        var gg = ccui.helper.seekWidgetByName(this.node, "pmdInfo");
        gg.setString(this.game.modmgr.mod_center.gonggao);
        gg.ignoreContentAdaptWithSize(true);

        //gg.setPosition(cc.p(666,16));

        gg.stopAllActions();
        var act = cc.repeatForever(cc.sequence(
            cc.moveTo(20, cc.p(0 - gg.getContentSize().width, gg.getPosition().y)),
            cc.moveTo(0, cc.p(ccui.helper.seekWidgetByName(this.node, "pmdBack").getContentSize().width, gg.getPosition().y))));
        gg.runAction(act);
    },
    updateMailPoint: function () {
        var len = this.game.modmgr.mod_center.notice.length;
        var showContent = "";
        if (this.game.modmgr.mod_center.notice.length != 0) {
            showContent = this.game.modmgr.mod_center.notice[len - 1].context;
        }
       // this._noticeTxt.setString(showContent);
    },
    updateareainfo: function () {

    },
});