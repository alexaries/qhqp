/**
 * Created by Administrator on 2017/4/18 0018.
 */

gameclass.hlgc = gameclass.hlgc || {};


gameclass.hlgc.Table = gameclass.baseui.extend({
    node: null,
    mod_hlgc: null,
    playerHeads: null,//玩家节点数组

    roomInfo: null,
    ciNum: null,

    uiLayer: null,
    outPokerLayer: null,

    arrowSp: null, //指示当前是谁操作的精灵
    shineSpArr: [],  //四个方向闪烁容器

    lastCardNum: null,//记录上家出的什么牌
    lastCardSp: null,//保存上一张出牌精灵,（如果被碰、杠）需要捡起
    lastChairNum: null,//记录上一张打出牌的座位号
    playerSendNum: null,// 4家分别打了多少张牌在桌面上(如果打的牌被碰、杠需要减1)

    playerHandCardSp: null,
    playerPengGangNodeArr: null,
    playerPengGangArr: null,

    tishiNode: null,//杠牌多余两种选择的时候显示出来的节点

    cardNumText: null,//显示牌张数的节点
    cardNum: null,//牌桌剩余多少张牌

    outPokerManager: null,

    seeObj: null,
    allSlect: false,
    curPersons: 0,
    _seatContain: null,
    _readyBtn: null,
    //开局时，用户应该所在的位置
    _userPosArr: null,
    //摸宝容器
    _baoContain: null,
    _tingContain: null,
    _curTime: 30,
    timeTxt: null,
    isHaidiLao:null,
    isSeat:null,
    genzhuangImg:null,

    ctor: function () {
        this._super();
        this.playerHeads = [];
        this.seeObj = {};
        this._curTime = 30;
        this.isHaidiLao = false;
        this.isSeat = false;
        this.genzhuangImg = null;
    },


    show: function () {
        var self = this;

        cc.spriteFrameCache.addSpriteFrames(res.mah_bg_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_text_plist);

        cc.spriteFrameCache.addSpriteFrames(res.mah_down_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_out_left_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_out_right_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_out_ver_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_back_plist);

        gameclass.languageType = gameclass.languageType || 0;//断线重连的时候没走loginui节能为空

        this.node = this.game.uimgr.createnode(res.hlgcTable, true);
        this.node.setPosition((cc.winSize.width - this.node.getContentSize().width) / 2, 0);
        this.addChild(this.node);

        this.uiLayer = ccui.helper.seekWidgetByName(this.node, "uiLayer");
        this.controlLayer = ccui.helper.seekWidgetByName(this.node, "controlLayer");
        this.arrowSp = ccui.helper.seekWidgetByName(this.node, "arrow");

        ccui.helper.seekWidgetByName(this.controlLayer, "director").setScale(1.2);

        this._tingContain = new ccui.Layout();
        this.uiLayer.addChild(this._tingContain);

        this._seatContain = this.uiLayer.getChildByName("seatContain");
        this._seatContain.setVisible(false);
        this.genzhuangImg = ccui.helper.seekWidgetByName(this.uiLayer,"Image_genzhuang");
        this.genzhuangImg.setVisible(false);
        this._cheatBtn = ccui.helper.seekWidgetByName(this.uiLayer, "cheatBtn");
        // this._cheatBtn.setVisible(false);

        this.betLayer = ccui.helper.seekWidgetByName(this.uiLayer, "betLayer");
        for (var i = 0; i < this.betLayer.getChildrenCount(); i++) {
            var betBtn = this.betLayer.getChildren()[i];
            betBtn.index = i;
            betBtn.addTouchEventListener(function (sender, type) {
                if (type != ccui.Widget.TOUCH_ENDED) return;
                self.mod_hlgc.sendGetBet(sender.index);
                self.betLayer.setVisible(false);
            }, this);
        }

        //test
        // if (gameclass.isCheat) {
        //     this._cheatBtn.setVisible(true);
        // }else{
        //     this._cheatBtn.setVisible(false);
        // }
        //test end


        this._readyBtn = ccui.helper.seekWidgetByName(this.uiLayer, "readyBtn");
        // this._readyBtn.setVisible(false);

        for(var i =0;i< 4;i++)
        {
            var sitBtn = ccui.helper.seekWidgetByName(this.uiLayer,"Button_"+i);
            sitBtn.addTouchEventListener(function(sender,type){
                if(type == ccui.Widget.TOUCH_ENDED)
                {
                    self.mod_hlgc.sendSeat(sender.getTag());
                }

            });

        }
        this.shineSpArr = [];
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            var directSp = ccui.helper.seekWidgetByName(this.node, "d" + i + "Sp");
            this.shineSpArr.push(directSp);
            directSp.setVisible(false);
        }

        this.jushuText = ccui.helper.seekWidgetByName(this.controlLayer, "roundTxt");
        this.cardNumText = ccui.helper.seekWidgetByName(this.controlLayer, "remainCard");
        this.timeTxt = ccui.helper.seekWidgetByName(this.controlLayer, "timeTxt");
        this.timeTxt.setString("");

        this.readytime = ccui.helper.seekWidgetByName(this.controlLayer, "readytime");
        //this.readytime.setString("");

        this.arrowSp.setVisible(false);
        this.cardNumText.setVisible(false);

        this.outPokerLayer = ccui.helper.seekWidgetByName(this.controlLayer, "outPokerLayer");

        this.btn_guo = ccui.helper.seekWidgetByName(this.uiLayer, "btn_guo");
        this.btn_gang = ccui.helper.seekWidgetByName(this.uiLayer, "btn_gang");
        this.btn_peng = ccui.helper.seekWidgetByName(this.uiLayer, "btn_peng");
        this.btn_hu = ccui.helper.seekWidgetByName(this.uiLayer, "btn_hu");
        this.cardCommonNode = ccui.helper.seekWidgetByName(this.uiLayer, "cardCommonNode");

        this.btn_guo.setName("btn_guo");
        this.btn_gang.setName("btn_gang");
        this.btn_peng.setName("btn_peng");
        this.btn_hu.setName("btn_hu");
        this.saveArr = [];

        this.starpointer = ccui.helper.seekWidgetByName(this.controlLayer, "starpointer");

        this.gangLayer = ccui.helper.seekWidgetByName(this.uiLayer, "gangLayer");
        this.mahLayer = ccui.helper.seekWidgetByName(this.uiLayer, "mahLayer");
        this.gangLayer.setVisible(false);

        //动画
        // var animNode = ccui.helper.seekWidgetByName(this.uiLayer, "dengdai");
        // //animNode.setPosition(200,30);
        // var anim = sp.SkeletonAnimation.createWithJsonFile(res.dengdai_json, res.dengdai_atlas);
        // animNode.addChild(anim);
        // anim.setAnimation(0, 'animation', true);

        this.initBtnState();

        this._baoContain = new ccui.Layout();
        this.addChild(this._baoContain);

        //test
        // this.showBao([1, 2]);
        //test end

        ////显示时间
        //var titiletime =  ccui.helper.seekWidgetByName(this.controlLayer, "time");
        //var reftime = function () {
        //    var myDate = new Date();
        //    var str = myDate.Format("MM-dd hh:mm");
        //    titiletime.setString(str);
        //};
        //reftime();
        //var func = cc.repeatForever(cc.sequence(cc.delayTime(1),cc.callFunc(function(){
        //    reftime();
        //})));
        //titiletime.runAction(func);

        //test
        // this.arrowSp.setVisible(true);
        // ccui.helper.seekWidgetByName(this.uiLayer, "btn_invite").setVisible(false);
        //test end
    },
    initBtnState: function () {
        this.btn_guo.setVisible(false);
        this.btn_gang.setVisible(false);
        this.btn_peng.setVisible(false);
        this.btn_hu.setVisible(false);
    },

    //otherHu:function(){
    //    this.btn_gang.setVisible(false);
    //    this.btn_peng.setVisible(false);
    //},
    listenTest: function () {
        this.mod_hlgc.gameInfo.Razz = [];
        this.playerHeads[0].curCards = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 5, 6, 7, 13];
        // this.playerHeads[0].curCards = [1, 1, 2, 2, 3, 3, 5, 7, 7, 7, 8, 8, 8, 9];
        // this.playerHeads[0].curCards = [1, 2, 3, 5, 6, 7, 9,9,9, 11, 11, 11, 13, 18 ];
        // this.playerHeads[0].curCards = [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 11, 15, 13, 18];
        this.playerHeads[0].checkListen();
    },
    setmod: function (_mod_hlgc) {
        this.mod_hlgc = _mod_hlgc;
        this.mod_hlgc.bindUI(this);
        var _this = this;
        this.starpointer.setVisible(false);

        // if (window.wx) {
        //     _this.share();
        // }
        this.maxNum = this.mod_hlgc.maxNum;

        //玩家头像
        //modify by lish
        this._userPosArr = [];
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            var playerNode = ccui.helper.seekWidgetByName(this.uiLayer, "head_" + i);
            this._userPosArr.push(playerNode.getPosition());
            //playerNode.setPosition(this._seatContain.getChildren()[i].getPosition());

            //this.playerHeads[i] = new gameclass.hlgc.Player(
            //    playerNode,
            //    i,
            //    this.uiLayer,
            //    this.controlLayer,
            //    this);
            //this.playerHeads[i].setGame(this.game);
            // this.playerHeads[i]._headContain.setScale(1);


        }

        this.outPokerManager = new gameclass.outPokerLayer({
            outNode: this.outPokerLayer,
            parent: this,
        });

        //邀请好友
        gameclass.createbtnpress(_this.uiLayer, "btn_invite", function () {
            _this.share();

            //test
            // _this.listenTest();
            //test end
        });

        // //解散房间  两个按钮
        // //返回按钮
        // gameclass.createbtnpress(_this.uiLayer, "btn_exit", function () {
        //     _this.game.uimgr.showui("gameclass.msgboxui").setString("是否想要解散房间？", function () {
        //         _this.mod_hlgc.dissmissroom();
        //     });
        // });
        // gameclass.createbtnpress(_this.uiLayer, "btn_back", function () {
        //     _this.game.uimgr.showui("gameclass.msgboxui").setString("是否想要解散房间？", function () {
        //         _this.mod_hlgc.dissmissroom();
        //     });
        // });
        //设置按钮
        gameclass.createbtnpress(_this.uiLayer, "settingBtn", function () {
            //var card = [6,6,7,7,9,9,12,12,12,14,14,15,15,17];

            //var card = [1,2,11,11,11,9,9,9,12,13,14,15,16,17];
            //var card = [1,2,3,3,4,5,6,7,8,18,18,13,14];
            //var card = [1,1,1,1,2,2,2,2,3,3,15,15,28,14];
            //var card = [31,31,31,31,32,32,33,34,35,36,36,36,36,27,24];

            //var card = [1, 2, 3, 3, 4, 5, 6, 7, 8, 11, 11, 13, 14, 15];
            //var card = [1,1,2,2,4,4,5,5,7,7,12,12,15];
            //var card = [1,2,3,3,4,5,7,8,9,11,12,13,14];
            var card = [2,2,5,5,6,6,7,7,9,9,11,11,12,12];


            var cards = {"card": card};
            //_this.mod_hlgc.Testcard(cards);
            _this.game.uimgr.showui("gameclass.FightSetView").setMod(_this.mod_hlgc);
            //_this.game.uimgr.uis["gameclass.settingui"].btn_ok.setPositionX(679/2);
        });

        if (_this.mod_hlgc.roominfo.time != 0) {
            _this.game.uimgr.showui("gameclass.exitroom", false);
            _this.game.uimgr.uis["gameclass.exitroom"].setData(_this.mod_hlgc, _this.mod_hlgc.roominfo);
        }

        //聊天按钮
        gameclass.createbtnpress(_this.node, "chatbtn", function () {
            _this.game.uimgr.showui("gameclass.chatui");
            _this.game.uimgr.uis["gameclass.chatui"].setmod(_this.mod_hlgc);

        });

        //碰按钮
        gameclass.createbtnpress(_this.uiLayer, "btn_peng", function () {
            _this.mod_hlgc.sendPeng();
            _this.initBtnState();
        });

        //杠按钮
        gameclass.createbtnpress(_this.uiLayer, "btn_gang", function () {
            var gangArr = _this.playerHeads[0].getGangNum(_this.lastCardNum);

            _this.initBtnState();

            if (gangArr.length < 1) {
                return false;
            }

            if (_this.lastCardNum) {
                for (var i = 0; i < gangArr.length; i++) {
                    if (gangArr[i] == _this.lastCardNum) {
                        _this.mod_hlgc.sendGang(_this.lastCardNum);
                        return false;
                    }
                }
            }
            //如果点击了可以杠的牌，直接杠
            if (_this.playerHeads[0].gangNum) {
                _this.mod_hlgc.sendGang(_this.playerHeads[0].gangNum);
                return false;
            }

            if (gangArr.length > 1) {
                _this.showClickWindow(gangArr);
            } else {
                _this.mod_hlgc.sendGang(gangArr[0]);
            }

            return false;
        });

        //胡按钮
        gameclass.createbtnpress(_this.uiLayer, "btn_hu", function () {
            _this.mod_hlgc.sendHu();
            _this.initBtnState();
        });

        //过按钮
        gameclass.createbtnpress(_this.uiLayer, "btn_guo", function () {
            _this.sendGuoCallBack();
        });

        //退出杠按钮
        gameclass.createbtnpress(_this.uiLayer, "btn_exitGang", function () {
            _this.gangLayer.setVisible(false);
            _this.gangLayer.getChildByName("mahLayer").removeAllChildren(true);
            _this.resetBtnState(true);
        });
        gameclass.createbtnpress(_this.uiLayer, "cheatBtn", function () {
            if (_this.mod_hlgc.gameInfo && _this.mod_hlgc.gameInfo.begin) {
                // if (_this.mod_hlgc.gameInfo && _this.mod_hlgc.gameInfo.begin && gameclass.isCheat) {
                _this.game.uimgr.showui("gameclass.hlgc.cheatPlayMo").setmod(_this.mod_hlgc);
            } else {
                _this.game.uimgr.showui("gameclass.hlgc.cheatPrevPlay").setmod(_this.mod_hlgc);
            }
        });
        gameclass.createbtnpress(_this.uiLayer, "readyBtn", function () {
            _this.mod_hlgc.sendGameReady();
        });

        //语音
        var mic = ccui.helper.seekWidgetByName(_this.node, "mic");

        var miclayer = ccui.helper.seekWidgetByName(_this.node, "miclayer");
        miclayer.setVisible(false);

        var imgmic = ccui.helper.seekWidgetByName(_this.node, "imgmic");

        var ani = cc.sequence(cc.scaleTo(0.8, 1), cc.scaleTo(0.8, 0.8));
        imgmic.runAction(cc.repeatForever(ani));

        var oldvnum = mod_sound.getEffectsVolume();
        var oldmnum = mod_sound.getMusicVolume();
        var btnFunc = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    oldvnum = mod_sound.getEffectsVolume();
                    oldmnum = mod_sound.getMusicVolume();
                    mod_sound.setEffectsVolume(0.0);
                    mod_sound.setMusicVolume(0.0);
                    miclayer.setVisible(true);
                    gameclass.mod_platform.begmic();
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    //var pos = sender.getTou;
                    miclayer.setVisible(false);
                    gameclass.mod_platform.endmic();
                    mod_sound.setEffectsVolume(Number(oldvnum));
                    mod_sound.setMusicVolume(Number(oldmnum));
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    miclayer.setVisible(false);
                    gameclass.mod_platform.cancelmic();

                    mod_sound.setEffectsVolume(Number(oldvnum));
                    mod_sound.setMusicVolume(Number(oldmnum));
                    break;
            }
        };
        mic.addTouchEventListener(btnFunc);


        this.safeLayer = new gameclass.checkSafeLayer(this.node, this.game, null);
        this.safeLayer.setName("safeLayer");
        this.node.addChild(this.safeLayer);
    },

    chatshowinfo: function (index, data) {
        if(this.playerHeads[index])
        {
            this.playerHeads[index].onChat(data);
        }

        if (data.type == 1) {
            for (var i = 0; i < g_womanTalk.length; i++) {
                if (data.chat == g_chatstr[i]) {
                    mod_sound.playeffect(g_womanTalk[i]);
                    break;
                }
            }
        }
    },
    betCheck: function () {
        this.betLayer.setVisible(false);

        for (var i = 0; i < this.mod_hlgc.gameInfo.info.length; i++) {
            var userInfo = this.mod_hlgc.gameInfo.info[i];
            if (userInfo.uid == this.game.modmgr.mod_login.logindata.uid) {
                var isAllReady = this.mod_hlgc.checkAllReady();
                if (isAllReady  && userInfo.piao < 0 && !this.mod_hlgc.gameInfo.begin && this.mod_hlgc.roomSetArr[3] == 1 && this.isSeat) {
                    this.betLayer.setVisible(true);
                }
            }
            this.gamebets(userInfo.uid, userInfo.piao);
        }
    },
    gamebets: function (uid, value) {
        if (this.mod_hlgc.roomSetArr[3] == 1) {
            //var index = this.mod_hlgc.getPlayerIndexById(uid);
            var index = this.mod_hlgc.getPlayerSeatById(uid);
            if(this.playerHeads[index])
            {
                if (value == 0) {
                    this.playerHeads[index].betTxt.setString("不跑");
                } else if (value == 1) {
                    this.playerHeads[index].betTxt.setString("跑 x1");
                } else if (value == 2) {
                    this.playerHeads[index].betTxt.setString("跑 x2");
                } else {

                    this.playerHeads[index].betTxt.setString("");

                }
            }

        }
    },
    checkCardArr: function (arr) {
        var mybool = false;
        if (arr.length != 3) return mybool;
        for (var i = 0; i < arr.length; i++) {
            if (parseInt(arr[i] / 10) == parseInt(arr[i + 1] / 10) && parseInt(arr[i] / 10) == parseInt(arr[i + 2] / 10)) {
                mybool = true;
            }
        }
        return mybool;
    },

    showSystemCard: function () {
        this.playerHeads[0].slectIndex();
    },

    sendGangCallBack: function () {
        this.gangLayer.setVisible(false);
        this.mahLayer.removeAllChildren();
    },

    showClickWindow: function (crr) {
        if (this.uiLayer.getChildByTag(112233)) {
            this.uiLayer.removeChildByTag(112233);
        }
        var difX = 80;
        var btnArr = [];
        this.gangLayer.setVisible(true);

        var startPos = cc.p((this.mahLayer.width - (crr.length - 1) * 100) / 2, 0);

        for (var i = 0; i < crr.length; i++) {
            var spBtn = new ccui.Button();
            spBtn.loadTextureNormal(res.tishiSpBg, 0);
            var card;
            if (crr[i] == StaticData.WIND_GANG) {
                card = StaticData.WIND_DONG;
            } else {
                card = crr[i];
            }
            var textStr = gameclass.hlgc.Table.getCardTextStr(card);
            var cardTextSp = new cc.Sprite();
            cardTextSp.initWithSpriteFrameName(textStr);
            cardTextSp.setScale(0.65);
            cardTextSp.setPosition(spBtn.getContentSize().width / 2, spBtn.getContentSize().height / 2);
            spBtn.addChild(cardTextSp);

            var createrStr=function(str){
                var helloLabel = new cc.LabelTTF(str, "Arial", 20);
                helloLabel.setAnchorPoint(cc.p(0.5,0.5));
                helloLabel.setPosition(spBtn.getContentSize().width / 2,spBtn.getContentSize().height / 2+50);
                helloLabel.setColor(cc.color.RED);
                spBtn.addChild(helloLabel);
            }
            if(crr[i] == StaticData.WIND_GANG){
                createrStr("旋风杠");
            }

            spBtn.slectedNum = crr[i];
            btnArr.push(spBtn);

            spBtn.setAnchorPoint(0, 0);
            spBtn.setScale(0.8);
            spBtn.setPosition(startPos.x + i * difX, startPos.y);

            this.mahLayer.addChild(spBtn);
        }

        var _this = this;
        for (var i = 0; i < btnArr.length; i++) {
            btnArr[i].addTouchEventListener(function (sender, type) {
                switch (type) {
                    case ccui.Widget.TOUCH_ENDED:
                        // cc.log("选择杠牌:"+sender.slectedNum);
                        _this.mod_hlgc.sendGang(sender.slectedNum);
                        break;
                }
            })
        }
    },
    //未摸牌时，如果是听牌状态，需要持续显示
    createTingContinue: function (_arr) {
        this._tingContain.removeAllChildren();

        if (_arr == null || _arr.length == 0) return;

        var margin = 5;

        var size = cc.p(0, 0);
        var tingView = new ccui.Layout();
        tingView.setBackGroundImage(res.tishiBgAlpha);
        tingView.setBackGroundImageScale9Enabled(true);
        tingView.setAnchorPoint(0, 0);

        tingView.setPosition(10, margin);
        this._tingContain.addChild(tingView);

        var tingTxtImg = new cc.Sprite("res/ui/gxDdz/ting.png");
        tingTxtImg.setAnchorPoint(cc.p(0, 0))
        tingView.addChild(tingTxtImg);
        tingTxtImg.setScale(0.3);

        var difX = tingTxtImg.getContentSize().width * tingTxtImg.getScale() + 5;
        var difY = 0;

        var tingObj = {};
        for (var i in this.seeObj) {
            tingObj[i] = this.seeObj[i];
        }
        for (var i = 0; i < this.playerHeads[0].curCards.length; i++) {
            tingObj[this.playerHeads[0].curCards[i]]++;
        }
        for (var i = 0; i < _arr.length; i++) {
            var spBtn = gameclass.hlgc.Table.CreateCard(_arr[i], 0, 0, 0);
            // this.creatListenSp(_arr[i]);
            spBtn.setAnchorPoint(0, 0);
            spBtn.setScale(0.3);
            if (i == 0) {
                spBtn.setPosition(difX, margin);
            } else {
                spBtn.setPosition(difX + 5, margin);
            }
            spBtn.setPosition(difX + 5, margin);
            tingView.addChild(spBtn);
            difX = spBtn.getPositionX() + spBtn.getContentSize().width * spBtn.getScale();
            difY = spBtn.getPositionY() + spBtn.getContentSize().height * spBtn.getScale();
        }
        size = this.setTingWindowSize(_arr.length, this.creatListenSp(1));
        tingView.setContentSize(difX + margin, difY + margin);
    },
    showTingWindow: function (_arr) {
        if (_arr.length == 0) return;
        this.gangLayer.setVisible(false);
        _arr.sort(function (a, b) {
            return a - b;
        })

        var _this = this;
        var closeEvent = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    if (_this.uiLayer.getChildByTag(112233)) {
                        _this.uiLayer.removeChildByTag(112233);
                    }
                    break;
            }
        }

        var size = cc.p(0, 0);
        if (this.uiLayer.getChildByTag(112233)) {
            this.uiLayer.removeChildByTag(112233);
        }
        if (!this.uiLayer.getChildByTag(112233)) {
            this.tishiNode = new ccui.Layout();
            this.tishiNode.setBackGroundImage(res.tishiBg);
            this.tishiNode.setBackGroundImageScale9Enabled(true);
            this.tishiNode.setAnchorPoint(0, 0);
            size = this.setTingWindowSize(_arr.length, this.creatListenSp(1));
            this.tishiNode.setContentSize(size.y, size.x);
            var startX = (cc.winSize.width - size.y) / 2;
            this.tishiNode.setPosition(startX, 120);
            this.tishiNode.setTag(112233);
            //关闭按钮
            var closeBtn = new ccui.Button();
            closeBtn.setContentSize(1136, 520);
            closeBtn.setScale9Enabled(true);
            //var localPos = this.tishiNode.convertToNodeSpace(cc.p(cc.winSize.width/2,(cc.winSize.height-120)/2));
            var localPos = this.tishiNode.convertToNodeSpace(cc.p(cc.winSize.width / 2, 520 / 2 + 120));

            closeBtn.setPosition(localPos);
            closeBtn.addTouchEventListener(closeEvent);
            this.tishiNode.addChild(closeBtn);

            this.uiLayer.addChild(this.tishiNode);
        }

        var difX = 25;
        var startPos = cc.p(0, 0);

        var tingObj = {};
        for (var i in this.seeObj) {
            tingObj[i] = this.seeObj[i];
        }
        for (var i = 0; i < this.playerHeads[0].curCards.length; i++) {
            tingObj[this.playerHeads[0].curCards[i]]++;
        }
        for (var i = 0; i < _arr.length; i++) {
            var spBtn = this.creatListenSp(_arr[i]);
            //剩余张数
            var lastNum = 4 - tingObj[_arr[i]];
            var numText = new cc.LabelTTF(lastNum + "张", "Arial", 30);
            numText.setPosition(spBtn.width / 2, 100);
            numText.setColor(new cc.color(255, 0, 0));

            spBtn.setAnchorPoint(0, 0);
            spBtn.setScale(0.8);
            spBtn.setPosition(this.setTingSpPos(i, size, spBtn));

            spBtn.addChild(numText);
            this.tishiNode.addChild(spBtn);
        }
    },

    setTingWindowSize: function (len, sp) {
        var row = Math.ceil(len / 7);
        var col = 0;
        if (len < 8) {
            col = len % 8;
        } else {
            col = 7;
        }
        var size = cc.p(row * 95, col * sp.width * 0.8 + (col - 1) * 25 + 2 * 25);
        return size;
    },

    setTingSpPos: function (i, size, spBtn) {
        var row = parseInt(i / 7) + 1;
        var col = parseInt(i % 7) + 1;

        var x = col * spBtn.width * 0.8 + (col - 1) * 25 - 25;
        var y = size.x - row * 95;
        var pos = cc.p(x, y);
        return pos;
    },

    creatListenSp: function (cardNum) {
        // cc.log("cardNum=="+cardNum)
        var sp = new cc.Sprite(res.tishiSpBg);
        var textSp = new cc.Sprite();
        textSp.initWithSpriteFrameName(gameclass.hlgc.Table.getCardTextStr(cardNum));
        textSp.setPosition(sp.width / 2, sp.height / 2);
        textSp.setScale(0.65);
        sp.addChild(textSp);
        return sp;
    },

    getSex: function (index) {
        var sex = this.playerHeads[index].sex;
        if (sex == 1 || sex == 2) {
            return sex - 1;
        } else {
            return 0;
        }
    },
    initUserBaseView: function (data,index) {
        if(this.playerHeads[index])
        {
            if(data.line)
            {
                this.playerHeads[index].offLineImg.setVisible(false);
            }
            else
            {
                this.playerHeads[index].offLineImg.setVisible(true);
            }
            if(!this.mod_hlgc.gameInfo.begin)
            {
                this.playerHeads[index].initBaseView();
            }

        }

    },
    setLivePlayerView: function (uid) {
        var data = this.mod_hlgc.gameInfo.info;
        for(var i =0;i< data.length;i++)
        {
            if(data[i].uid == uid)
            {
                var playerSeat = data[i].seat;
                var player = this._seatContain.getChildren()[playerSeat];
                var playerControls = player.getChildren();
                for(var k =0;k<playerControls.length;k++){
                    playerControls[k].setVisible(false);
                }

                var playerBg = ccui.helper.seekWidgetByName(player,"headContain");
                playerBg.setVisible(false);
                var playerHead = ccui.helper.seekWidgetByName(player, "headBg");
                playerHead.setVisible(false);
                playerHead.removeAllChildren();

                ccui.helper.seekWidgetByName(player, "playerName").setVisible(false);
                ccui.helper.seekWidgetByName(player, "playerName").setString("");

                ccui.helper.seekWidgetByName(this.node,"Button_" + playerSeat).setVisible(true);
            }
        }
    },
    //更新混牌
    updateCardCommon: function () {
        this.cardCommonNode.removeAllChildren();

        if (this.mod_hlgc.gameInfo.Razz == null) return;

        for (var i = 0; i < this.mod_hlgc.gameInfo.Razz.length; i++) {
            var card = this.mod_hlgc.gameInfo.Razz[i];
            var handSp = gameclass.hlgc.Table.CreateCard(card, 2, 2, 0);
            this.cardCommonNode.addChild(handSp);
            handSp.setPositionX(i * 40);

            var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
            handSp.addChild(logo);
            logo.setPosition(20,110);
        }


        //初始化癞子
        this.playerHeads[0].initlaizi();
    },
    setSelectSeatLine:function(msgdata){
        if(this._seatContain.isVisible())
        {
            var newdata = this.mod_hlgc.roominfo;
            var data = this.mod_hlgc.gameInfo.info;
            for(var i =0;i<data.length;i++)
            {
                var playerSeat = data[i].seat;
                var player = this._seatContain.getChildren()[playerSeat];
                var lineImage = ccui.helper.seekWidgetByName(player,"offLine");

                if(this.mod_hlgc.findPlayer(data[i].uid))
                {
                    if(data[i].uid == msgdata.uid && player && player.isVisible())
                    {
                        if(msgdata.line)
                        {
                            lineImage.setVisible(false);
                        }
                        else
                        {
                            lineImage.setVisible(true);
                        }

                    }

                }
                else
                {
                    if(player && player.isVisible())
                    {
                        player.setVisible(false);
                        ccui.helper.seekWidgetByName(this.node,"Button_" + playerSeat).setVisible(true);
                    }

                }
            }
        }

    },
    setUnSelectSeatLine:function(newdata)
    {
        if(this._seatContain.isVisible())
        {
            var data = this.mod_hlgc.gameInfo.info;
            var _mrr=[null,null,null,null];
            for(var i=0;i<this.mod_hlgc.gameInfo.info.length;i++){
                if(!this.mod_hlgc.gameInfo.info[i]||this.mod_hlgc.gameInfo.info[i].seat<0) continue;
                _mrr[(this.mod_hlgc.gameInfo.info[i].seat-this.mod_hlgc._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.mod_hlgc.gameInfo.info[i]);
            }
            for(var i =0;i<_mrr.length;i++)
            {

                if(_mrr[i])
                {
                    var playerSeat = _mrr[i].seat;
                    var player = this._seatContain.getChildren()[playerSeat];
                    var lineImage = ccui.helper.seekWidgetByName(player,"offLine");
                    var personData=this.mod_hlgc._getnewPersonDataByUid(newdata,_mrr[i].uid);

                    if( personData && this.mod_hlgc.findPlayer(_mrr[i].uid))
                    {
                        if(_mrr[i] && player && player.isVisible())
                        {

                            if(personData.line)
                            {
                                lineImage.setVisible(false);
                            }
                            else
                            {
                                lineImage.setVisible(true);
                            }
                        }
                    }
                    else
                    {
                        if(player && player.isVisible())
                        {
                            player.setVisible(false);
                            ccui.helper.seekWidgetByName(this.node,"Button_" + playerSeat).setVisible(true);
                        }
                    }
                }


            }
        }

    },
    setPlayerState:function(data){
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.mod_hlgc.gameInfo.info.length;i++){
            if(!this.mod_hlgc.gameInfo.info[i]||this.mod_hlgc.gameInfo.info[i].seat<0) continue;
            _mrr[(this.mod_hlgc.gameInfo.info[i].seat-this.mod_hlgc._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.mod_hlgc.gameInfo.info[i]);
        }
        for(var i =0;i< _mrr.length;i++)
        {
            var personData = this.mod_hlgc._getnewPersonDataByUid(data,_mrr[i].uid);
            if(personData.line && this.playerHeads[i])
            {
                this.playerHeads[i].offLineImg.setVisible(false);
            }
            else
            {
                this.playerHeads[i].offLineImg.setVisible(true);
            }

        }
    },
    setSeatBtn:function(){
        for(var i=0;i<4;i++){
            ccui.helper.seekWidgetByName(this.node,"Button_" + i).setVisible(false);
            this._seatContain.setVisible(false);
            var headBtn = this._seatContain.getChildren();
            headBtn[i].setVisible(false);
        }
    },
    userLineOut: function (index, data) {
        if(this.playerHeads[index])
        {
            if (this.playerHeads[index].offLineImg == null) {
                cc.log("2")
            }

            if (data.line) {
                this.playerHeads[index].offLineImg.setVisible(false);
            } else {
                this.playerHeads[index].offLineImg.setVisible(true);
            }
        }


        // gameclass.mod_base.showtximg(this.playerHeads[index].head_img, data.imgurl, 0, 0, "", !data.line);
    },

    setPointerAct: function (pai, _index) {
        this.starpointer.setAnchorPoint(0.5, 0.5);
        this.starpointer.setScale(1);
        this.starpointer.stopAllActions();
        var arr = [0.35, 0.5, 0.35, 0.5];

        // cc.log("pai.x==="+pai.x)

        this.starpointer.x = pai.x;
        this.starpointer.y = pai.y + arr[_index] * pai.getContentSize().width;

        // cc.log("this.starpointer.x="+this.starpointer.x)

        this.starpointer.setVisible(true);
        this.starpointer.setLocalZOrder(30);
        var action = cc.repeatForever(cc.sequence(
            cc.spawn(cc.moveTo(0.5, cc.p(this.starpointer.x, this.starpointer.y + 2.5)), cc.fadeTo(0.5, 255)),
            cc.spawn(cc.moveTo(0.5, cc.p(this.starpointer.x, this.starpointer.y - 2.5)), cc.fadeTo(0.5, 100))
            )
        );
        this.starpointer.runAction(action);
    },

    //出牌
    sendCard: function (_num, func, _haveOutPoke, _specialOperate) {
        this.mod_hlgc.sendCard(_num, func, _haveOutPoke, _specialOperate);
    },

    //=====================================================接受服务端消息的处理================================================
    //发牌
    onDealCards: function (_arr) {
        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            if (_arr[i] != null && _arr[i].length > 0) {
                this.playerHeads[i].dealCards(_arr[i]);
            }
        }
    },
    chuliDataCheckListen: function () {
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            if (this.mod_hlgc.persons[i].uid == this.mod_hlgc.myUid && this.playerHeads[i].curCards.length % 3 == 2) {
                this.playerHeads[i].checkListen();
                break;
            }
        }
    },
    //关闭光标
    closeArrow: function () {
        this.setArrowTowards(-1);
    },
    // 处理起牌
    onDrawCard: function (nowIndex,_index, data) {
        var res = {
            gang: data.gang,
            hu: data.hu,
        };
        this.cardNum--;
        this.setCardAcount(this.cardNum);

        this.playerHeads[_index].onDrawCard(data.card);

        if (_index == 0) {
            this.onOperate(res);
        }
        this.setArrowTowards(nowIndex);

        this.updateTime(30);
    },
    updateTime: function (time) {
        this._curTime = time;
        var self = this;
        self.timeTxt.setString(this._curTime.toString());
        var sequAction = cc.sequence(cc.delayTime(1), cc.callFunc(function () {
            self._curTime--;
            if (self._curTime < 0) {
                self._curTime = 0;
            }
            self.timeTxt.setString(self._curTime.toString());
        }));
        this.node.stopAllActions();
        this.node.runAction(cc.repeat(sequAction, this._curTime));
    },
    showRuSteaTime:function(time,isshow){
        this.readytime.setVisible(isshow);
        this.node.stopAllActions();

        if(isshow){
            var readytime = time;
            var self = this;

            var sequAction = cc.sequence(cc.delayTime(1), cc.callFunc(function () {
                readytime--;
                if (readytime < 0) {
                    readytime = 0;
                }
                self.readytime.setString("入座倒计时："+readytime.toString());
            }));
            this.node.runAction(cc.repeat(sequAction, readytime));
        }
    },
    resetBtnState: function (mybool) {
        if (!this.saveArr) return;
        for (var i = 0; i < this.saveArr.length; i++) {
            this.saveArr[i].setVisible(mybool);
        }
    },

    showSlectLayout: function (slectArr) {
        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.playerHeads[i].showSlectLayout(slectArr[i]);
        }
    },

    setSlectVisable: function (_bool) {

    },

    //换三张的时候。在桌子显示三张牌，但是别人看不见
    showThree: function (_index, slectCard) {
        this.playerHeads[_index].showSlectLayout(slectCard);
    },

    allSlectThree: function (buArr, removeArr) {
        this.allSlect = true;
        //modify by lish，可能会因为没有排序出问题！
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.playerHeads[i].changeShow();
            this.playerHeads[i].allSlectThree(buArr, removeArr);
        }
    },

    //-1表示未选择 -2表示选择了但是暂时不广播
    changeState: function (_index, _bet) {
        this.playerHeads[_index].setQueState(_bet);
    },

    showQue: function (_arr) {
        this.allSlect = true;
        //modify by lish，可能会因为没有排序出问题！
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.playerHeads[i].setQueState(_arr[i]);
        }
    },

    //处理出牌消息
    onSendCard: function (cardNum, _index) {
        var strCard = cardNum < 10 ? "0" + String(cardNum) : String(cardNum);
        var str = String(this.getSex(_index) + String(strCard));

        if (cardNum > 0) {
            //staticFunction.playUserTalk("m" + cardNum, this.getSex(_index),this.mod_hlgc.isPaoLong);

            if(this.mod_hlgc.isPaoLong)
            {
                mod_sound.playeffect(g_music["mjClick"]);
            }
            else
            {
                var str = String(this.getSex(_index)+String(strCard));
                mod_sound.playeffect(g_music[str]);
            }
        }

        if (!this.seeObj[cardNum]) {
            this.seeObj[cardNum] = 0;
        }
        this.seeObj[cardNum]++;

        this.lastChairNum = _index;
        this.lastCardNum = cardNum;
        this.playerHeads[_index].onSendCard(_index,cardNum);

        if( this.mod_hlgc._turn == 0 && this.mod_hlgc._nchupaiNum == 3)
        {
            //for(var i =0;i< this.mod_hlgc.isGenzhuang.length;i++)
            //{
            //    if(this.mod_hlgc.isGenzhuang[i])
            //    {
            //        this.mod_hlgc.isSure = true;
            //    }
            //    else
            //    {
            //        this.mod_hlgc.isSure = false;
            //    }
            //}
            if(this.mod_hlgc.isGenzhuang == 4)
            {


                this.genzhuangImg.setVisible(true);
                this.scheduleOnce(function () {
                    this.genzhuangImg.setVisible(false);
                },1.5);
            }
            else
            {
                this.genzhuangImg.setVisible(false);
            }
        }
    },

    checkTableCard: function (_num) {
        this.outPokerManager.checkTableCard(_num);
    },

    //处理碰
    onPeng: function (nowIndex,_index, cardNum, pengbackIndex) {
        this.starpointer.setVisible(false);
        this.playerHeads[_index].onPeng(cardNum, this.lastChairNum, pengbackIndex);
        this.outPokerManager.removePengGangSp(this.lastChairNum, cardNum);
        this.lastCardNum = 0;
        this.setArrowTowards(nowIndex);
        //碰牌之后也做听牌判断
        if (_index == 0) {
            this.playerHeads[0].checkListen();
            this.saveArr = [];
        }
        this.seeObj[cardNum] += 2;

        //staticFunction.playUserTalk("peng", this.getSex(_index),false);
        mod_sound.playeffect(this.getSex(_index)==0?g_music.mpeng:g_music.fpeng);

        //碰完牌，拉一张牌，放置于摸牌位置
        this.playerHeads[_index].pengDragOne();
    },

    //处理杠,type为杠的类型
    onGang: function (_index, cardNum, type) {
        this.starpointer.setVisible(false);

        if (cardNum == StaticData.WIND_GANG) {
            type = 0;
        }

        //旋风杠必定是自己摸的，不是旋风杠
        if (cardNum != StaticData.WIND_GANG) {
            //如果是明杠。就删除上家打的牌
            if (type == 1) {
                this.outPokerManager.removePengGangSp(this.lastChairNum, cardNum);
                this.lastCardNum = 0;
            }
        }


        if (this.uiLayer.getChildByTag(112233)) {
            this.uiLayer.removeChildByTag(112233);
        }
        this.playerHeads[_index].onGang(cardNum, type);

        //碰牌之后也做听牌判断
        if (_index == 0) {
            this.playerHeads[0].checkListen();
            this.saveArr = [];
        }

        //staticFunction.playUserTalk("gang", this.getSex(_index),false);
        mod_sound.playeffect(this.getSex(_index)==0?g_music.mgang:g_music.fgang);

    },

    onHu: function (_index, huIndex, type, huNum) {
        if (this.playerHeads[_index] == null) return;

        //如果其他人胡了。就只显示胡操作
        if (_index != 0) {
            var willHu = false;
            for (var i = 0; i < this.saveArr.length; i++) {
                if (this.saveArr[i].getName() == "btn_hu" && !this.playerHeads[0].isHasHu) {
                    willHu = true;
                }
            }
            if (!willHu) {
                this.initBtnState();
            } else {
                this.saveArr = [];
                this.initBtnState();
                this.btn_hu.setVisible(true);
                this.btn_guo.setVisible(true);
                this.saveArr.push(this.btn_hu);
                this.saveArr.push(this.btn_guo);
            }
            var pos = cc.p(1136 / 2 + 250 - (this.saveArr.length - 1) * 50, 180);
            var differX = 150;

            for (var i = 0; i < this.saveArr.length; i++) {
                this.saveArr[i].setPosition(pos.x + i * differX, pos.y);
            }
        } else {
            this.saveArr = [];
        }

        this.playerHeads[_index].onHu(huIndex, type, huNum);
        mod_sound.playeffect(this.getSex(huIndex)==0? g_music.mhu : g_music.fhu);

        //if (type == 1) {//如果是自摸
        //   // staticFunction.playUserTalk("zimo", this.getSex(_index),false);
        //    mod_sound.playeffect(this.getSex(whoIndex)==0? g_music.mhu : g_music.fhu);
        //} else {
        //   // staticFunction.playUserTalk("dianpao", this.getSex(_index),false);
        //    mod_sound.playeffect(this.getSex(whoIndex)==0? g_music.mhu : g_music.fhu);
        //}
    },
    setCardAcount: function (_num) {
        this.cardNum = _num;
        this.cardNumText.setString("剩余" + this.cardNum + "张");
    },

    //玩家是否可以胡、碰、杠
    onOperate: function (option) {
        if (option.huType && parseInt(option.huType / 10) > 0) return;

        var isCanGang = option.gang && option.gang == 1;

        this.btn_hu.setVisible(option.hu);
        this.btn_gang.setVisible(isCanGang);
        this.btn_peng.setVisible(option.peng);
        this.btn_guo.setVisible(option.hu || isCanGang || option.peng);
        this.playerHeads[0].specialOperate = (option.hu || isCanGang || option.peng);

        this.saveArr = [];
        if (option.hu) this.saveArr.push(this.btn_hu);
        if (isCanGang) this.saveArr.push(this.btn_gang);
        if (option.peng) this.saveArr.push(this.btn_peng);
        if (option.hu || isCanGang || option.peng) this.saveArr.push(this.btn_guo);

        var pos = cc.p(1136 / 2 + 250 - (this.saveArr.length - 1) * 50, 180);
        var differX = 120;

        for (var i = 0; i < this.saveArr.length; i++) {
            this.saveArr[i].setPosition(pos.x + i * differX, pos.y);
        }

        this.updateTime(15);

        //if(option.gang && this.playerHeads[0].isQiPai && !option.hu && !option.peng){
        //    this.playerHeads[0].isShowGang();
        //}
    },

    sendGuoCallBack: function () {
        this.playerHeads[0].haveOutPoke = false;
        this.playerHeads[0].specialOperate = false;
        //this.playerHeads[0].hasPass = true;
        //this.playerHeads[0].addIgnoreCard();
        this.mod_hlgc.sendGuo();
        this.initBtnState();
    },

    //setIgnoreCard:function(mopaiIndex,handArr,pengGangArr){
    //    var resultArr = this.playerHeads[0].getGangNum();
    //    for(var i = 0;i < pengGangArr.length;i++){
    //        if(mopaiIndex == 0 && handArr[handArr.length-1] == pengGangArr[i] ){
    //            this.playerHeads[0].ignoreState = true;
    //            for(var j = 0;j < resultArr.length;j++){
    //                if(resultArr[j] == pengGangArr[i]){
    //                    resultArr.splice(j,1);
    //                    break;
    //                }
    //            }
    //        }
    //    }
    //    this.playerHeads[0].ignoreCard = resultArr;
    //},

    gameBye: function () {
        if (this.roomInfo.step == this.roomInfo.maxStep) return;

        var _this = this;
        _this.game.uimgr.closeui("gameclass.hlgcResultAllUi");
        var hlgcResultAllUi = _this.game.uimgr.showui("gameclass.hlgcResultAllUi");
        hlgcResultAllUi.setData(_this.mod_hlgc);
        var hlgcResultOneUi = _this.game.uimgr.getui("gameclass.hlgcResultOneUi")
        if(hlgcResultOneUi != null){
            hlgcResultAllUi.setLocalZOrder(hlgcResultOneUi.getLocalZOrder() - 1);
        }
    },
    showGameBye:function () {

    },
    onSimpleEnd: function () {
        //modify by lish

        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            var directSp = this.shineSpArr[i];
            directSp.setVisible(false);
            directSp.stopAllActions();
            this.playerHeads[i].initData();
        }
        var _this = this;

        for(var i =0;i< 4;i++)
        {
            this.mod_hlgc.gameInfo.info[i].piao = -1;
        }

        var hlgcResultOneUi = _this.game.uimgr.showui("gameclass.hlgcResultOneUi");
        hlgcResultOneUi.setDjjsMod(_this.mod_hlgc);
        hlgcResultOneUi.setVisible(false);

        this.node.scheduleOnce(function () {
            _this.initDeskView();
            _this.updateReadyView();
            _this._baoContain.removeAllChildren();
            hlgcResultOneUi.setVisible(true);
        }, 0.5);
    },
    setArrowTowards: function (_index) {
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            var directSp = this.shineSpArr[i];
            directSp.setVisible(false);
            directSp.stopAllActions();
        }
        if (_index <= this.shineSpArr.length - 1 && _index >= 0) {
            //this.shineSpArr[_index].setVisible(true);
            this.arrowSp.getChildren()[(_index+this.mod_hlgc._mySeat)%4].setVisible(true);
        }
        // this.shineSpArr[_index].runAction(cc.repeatForever(cc.blink(1.2, 1)));
    },
    setArrowBg:function(_severPos){
        //var bgArr = [res.img_eastBg,res.img_southBg,res.img_westBg,res.img_northBg];
        this.arrowSp.setVisible(true);
        var rotationArr = [0,90,180,270];
        this.arrowSp.setRotation(rotationArr[_severPos]);
    },
    //更新桌子中间的方位盘
    updateDirect: function (playerInfos) {
        this.arrowSp.setVisible(true);
        var index = 0;
        //for(var i=0;i<playerInfos.length;i++){
        //    if(playerInfos[i].uid == this.game.modmgr.mod_login.logindata.uid ){
        //        index = playerInfos[i].seat;
        //        break;
        //    }
        //}
        //var rotationArr = [0,90,180,270];
        //this.arrowSp.setRotation(rotationArr[index]);
        cc.log("玩家数据",playerInfos);
        var dongUrlIndex = 1;
        var off = 1;

        var zhuangIndex = 0;
        var tempData=[null,null,null,null];
        for(var i=0;i<playerInfos.length;i++){
            if(!playerInfos[i]||playerInfos[i].seat<0) continue;
            tempData[(playerInfos[i].seat-this.mod_hlgc._mySeat+4)%4]=gameclass.mod_base.deepCopy(playerInfos[i]);
        }
        var len = playerInfos.length;
        for (var i = 0; i < len; i++) {
            var playerInfo = tempData[i];
            if (playerInfo != null && playerInfo.deal) {
                zhuangIndex = i;
                off = zhuangIndex - dongUrlIndex;
                break;
            }
        }

        var _rotation = zhuangIndex * 90;
        cc.log("旋转的角度",-_rotation);
        this.arrowSp.setRotation(-_rotation);

        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            var directSp = this.shineSpArr[i];
            directSp.setVisible(false);
            var urlIndex = (i- off  + gameclass.HLGC_MAX_USER) % gameclass.HLGC_MAX_USER;
            cc.log("urlIndex=" + urlIndex);
            if(urlIndex == 0)
            {
                urlIndex = 3;
            }
            else
            {
                urlIndex -= 1;
            }
            directSp.setTexture("res/ui/gxDdz/13-room/TimePoint" + urlIndex + ".png");
        }
    },
    _runBeginAction:function(func){
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.playerHeads[i].initData();
            this.playerHeads[i].renderAllCard();
            this.playerHeads[i]._headContain.setScale(0.8);
            this.playerHeads[i].scoreBg.setScale(0.5);

            var serverChairIndex = this.mod_hlgc.getserverchair(i);
            // cc.log(i + "," + serverChairIndex);
            //if (serverChairIndex == 0) {
            //    this.playerHeads[i]._masterIcon.setVisible(true);
            //} else {
            //    this.playerHeads[i]._masterIcon.setVisible(false);
            //}
            this.playerHeads[i].updateRead(false);
            // this.playerHeads[this.mod_hlgc.gameInfo.info[i].seat].node.setPosition(this._userPosArr[i]);
            // this.playerHeads[i].node.setPosition(this._userPosArr[i]);
        }
        this.scheduleOnce(function(){
            func();
        },1)
        var _angle=(this.mod_hlgc.curPlayerIndex-1)*90;
        this.arrowSp.runAction(cc.rotateBy(1,_angle));
    },
    initDeskView: function () {
        // this.updateRound();

        if (this.uiLayer.getChildByTag(112233)) {
            this.uiLayer.removeChildByTag(112233);
        }
        this._tingContain.removeAllChildren();
        this.initBtnState();

        this.cardNumText.setVisible(false);

        this.outPokerManager.removeTableCard();
        this.starpointer.setVisible(false);

        // if (this.mod_hlgc.gameInfo && this.mod_hlgc.gameInfo.begin && gameclass.isCheat) {
        //     this._cheatBtn.setVisible(true);
        // }else{
        //     this._cheatBtn.setVisible(false);
        // }


        //test
        // this._cheatBtn.setVisible(false);
        //test end


        //modify by lish
        var ss = this.roomInfo;
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++)
        {
            this.playerHeads[i].initData();
            this.playerHeads[i].renderAllCard();
            this.playerHeads[i]._headContain.setScale(0.8);
            this.playerHeads[i].scoreBg.setScale(0.5);

            var serverChairIndex = this.mod_hlgc.getserverchair(i);
            // cc.log(i + "," + serverChairIndex);
            var _seat = this.mod_hlgc.gameInfo.info[i].seat;
            var _name = this.roomInfo.person[0].name;
            var ss=  this.roomInfo.person[0].uid;
            var _playername = this.playerHeads[i].name_text.getString();
            var playerId = this.playerHeads[i]._myId;
            if( this.mod_hlgc._houseId == playerId )
            {
                this.playerHeads[i]._masterIcon.setVisible(true);
            }
            else
            {
                this.playerHeads[i]._masterIcon.setVisible(false);
            }
            //if (serverChairIndex == 0) {
            //    this.playerHeads[i]._masterIcon.setVisible(true);
            //} else {
            //    this.playerHeads[i]._masterIcon.setVisible(false);
            //}
            this.playerHeads[i].updateRead(false);
            //this.playerHeads[this.mod_hlgc.gameInfo.info[i].seat].node.setPosition(this._userPosArr[i]);
            // this.playerHeads[i].node.setPosition(this._userPosArr[i]);
        }
        //var _mrr=[null,null,null,null];
        //for(var i=0;i<this.mod_hlgc.gameInfo.info.length;i++){
        //    if(!this.mod_hlgc.gameInfo.info[i]||this.mod_hlgc.gameInfo.info[i].seat<0) continue;
        //    _mrr[(this.mod_hlgc.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.mod_hlgc.gameInfo.info[i]);
        //}


    },

    //=================================================================================================================
    /*
     *  gameReady  游戏开始
     * */
    gameReady: function (playerInfo, roominfo, remainCardNum) {
        this.roomInfo = roominfo;
        if (this.roomInfo.step == 0) {
            this.roomInfo.step = 1;
        }
        //初始化查表
        var tableSource = new gameclass.mahjong.TableSource();


        // this.roomInfo.step += 1;

        this.seeObj = {};
        for (var i = 0; i <= gameclass.HLGC_MAX_CARD_NUM; i++) {
            if (i % 10 != 0) {
                this.seeObj[i] = 0;
            }
        }
        this.initDeskView();

        this.cardNumText.setVisible(true);
        this.cardNum = remainCardNum;
        this.setCardAcount(remainCardNum);
        ccui.helper.seekWidgetByName(this.uiLayer, "btn_invite").setVisible(false);

        //清除玩家数据,
        //modify by lish
        // for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
        //     this.playerHeads[i].initData();
        //     this.playerHeads[i].renderAllCard();
        //     // this.playerHeads[i]._headContain.setScale(1);
        //
        //     var serverChairIndex = this.mod_hlgc.getserverchair(i);
        //     // cc.log(i + "," + serverChairIndex);
        //     if (serverChairIndex == 0) {
        //         this.playerHeads[i]._masterIcon.setVisible(true);
        //     } else {
        //         this.playerHeads[i]._masterIcon.setVisible(false);
        //     }
        //     this.playerHeads[i].updateRead(false);
        //     this.playerHeads[i].node.setPosition(this._userPosArr[i]);
        // }
        if (this.roomInfo.hsz) {
            this.allSlect = false;
        }
        var _this = this;
        //var _mrr=[null,null,null,null];
        //for(var i=0;i<_this.mod_hlgc.gameInfo.info.length;i++){
        //    if(!_this.mod_hlgc.gameInfo.info[i]||_this.mod_hlgc.gameInfo.info[i].seat<0) continue;
        //    _mrr[(_this.mod_hlgc.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(_this.mod_hlgc.gameInfo.info[i]);
        //}
        //for(var i =0;i< 4;i++)
        //{
        //    //if(_mrr[i])
        //    //{
        //    //    _this.playerHeads[i].score_text.setString(playerInfo[i].total);
        //    //}
        //    if( _mrr[i] &&_mrr[i].uid == _this.playerHeads[i].id && _this.playerHeads[i].deal)
        //    {
        //        _this.playerHeads[i].zhuang_img.setVisible(true);
        //    }
        //    else
        //    {
        //        _this.playerHeads[i].zhuang_img.setVisible(false);
        //    }
        //}

        cc.each(this.playerHeads, function (o, i) {
            if (playerInfo[i]) {
                o.setVisible(true);
                if (playerInfo[i].deal) {

                    o.zhuang_img.setVisible(true);
                } else {
                    o.zhuang_img.setVisible(false);
                }
                o.score_text.setString(playerInfo[i].total);
            } else {
                o.setVisible(false);
            }
        });


        // this.updateDirect(playerInfo);




        // if (gameclass.isCheat) {
        //     this._cheatBtn.setVisible(true);
        // } else {
        //     this._cheatBtn.setVisible(false);
        // }


        //test
        // this._cheatBtn.setVisible(true);
        //test end


        this._readyBtn.setVisible(false);
        //for(var i =0;i< 4;i++)
        //{
        //    this.playerHeads[i].betTxt.setString("b");
        //}

    },

    reflashScore: function (_scoreArr) {
        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.playerHeads[i].reflashScore(_scoreArr[i]);
        }
    },
    updateRound: function () {
        this.jushuText.setString(this.roomInfo.step + "/" + this.roomInfo.maxStep + "局");
    },

    log1:'',
    log2:'',

    mlog:function(data){
        if((data+'').indexOf('Beat') != -1){
            return '';
        }
        var wanfaTxt = ccui.helper.seekWidgetByName(this.controlLayer, "wanfaTxt");
        wanfaTxt.setContentSize(400, 300);
        wanfaTxt.setString( this.log1 + '\n' +this.log2 + '\n' + data +'');
        wanfaTxt.y = 400;
        this.log1 =this.log2;
        this.log2 =data;
    },

    //房间信息
    setRoomInfo: function (data) {
        this.roomInfo = data;
        ccui.helper.seekWidgetByName(this.controlLayer, "roomIdTxt").setString("房号:" + data.roomid);
        //cc.log = this.mlog.bind(this);

        // ccui.helper.seekWidgetByName(this.controlLayer,"text2").setString("最大番数:"+ this.roomInfo.fd + "番");
        // ccui.helper.seekWidgetByName(this.controlLayer,"text3").setString(this.roomInfo.zmjd == 0 ? "自摸加底" : "自摸加番");
        // ccui.helper.seekWidgetByName(this.controlLayer,"text4").setString(this.roomInfo.dgh == 0 ?"点杠花(点炮)" : "点杠花(自摸)");
        // ccui.helper.seekWidgetByName(this.controlLayer,"text5").setString(this.roomInfo.hsz == 0 ?"":"换三张");
        this.updateRound();
        if (this.roomInfo.step == 0) {
            this.cardNumText.setVisible(false);
        } else {
            ccui.helper.seekWidgetByName(this.uiLayer, "btn_invite").setVisible(false);
        }

        var wanfaArr = StaticData.getRoomSetArrFromParam(this.roomInfo.type, this.roomInfo.param1, this.roomInfo.param2, 1);
        if(wanfaArr[5] == "扣牌打")
        {
            this.mod_hlgc.isPaoLong = true;
        }
        if(wanfaArr[3] == "带跑龙")
        {
            this.mod_hlgc.isDaiPaoLong = true;
        }
        var wanfaTxt = ccui.helper.seekWidgetByName(this.controlLayer, "wanfaTxt");
        var wanfaTxt_1 = ccui.helper.seekWidgetByName(this.controlLayer, "wanfaTxt_1");
        wanfaTxt.setString(wanfaArr[1]);
        if (wanfaArr[5]) {
            wanfaTxt_1.setString(wanfaArr[5]);
        } else {
            wanfaTxt_1.setString("");
        }
        // wanfaTxt_1.setString(wanfaArr[2] + " " + wanfaArr[3]);
    },

    //微信邀请文字
    share: function () {
        if (this.roomInfo == null) return;

        var wanfa = StaticData.getRoomSetStrFromParam(this.roomInfo.type, this.roomInfo.param1, this.roomInfo.param2, 1);

        var seatNum = 0;
        var newdata = this.mod_hlgc.roominfo.person;
        var gamedata = this.mod_hlgc.gameInfo.info;
        for(var j =0;j<gamedata.length;j++)
        {
            for(var i =0;i< newdata.length;i++)
            {
                if(gamedata[j] && gamedata[j].uid == newdata[i].uid)
                {
                    var _seat = gamedata[j].seat;
                    if(_seat != -1)
                    {
                        seatNum++;
                    }
                }
            }
        }
        var personLen = "";

        if(seatNum == 4)
        {
            personLen = "当前房间已有4人";
        }
        else
        {
            var num =  Math.abs(4 - seatNum);
            personLen = seatNum + "缺" + num;
        }

        // var sharetxt = "底分: 1" + " 局数: " + this.roomInfo.maxStep +
        var sharetxt = "我在[" + StaticData.GAME_NAME + "]开了" + wanfa + ",";

        sharetxt += "快来一起玩吧!";

        gameclass.mod_platform.invitefriend(
            sharetxt,
            gameclass.download,
            "房号:" + this.roomInfo.roomid + "-" +  StaticData.GAME_NAME + "-" + personLen);
    },
    //玩家座位显示
    setSeatState:function(){
        for(var i=0;i<4;i++){

            ccui.helper.seekWidgetByName(this.node,"Button_" + i).setVisible(false);
        }
    },
    //海底捞模式开始
    showSeaState:function(){
        var _sea = ccui.helper.seekWidgetByName(this.node,"Image_Sea");
        _sea.setVisible(true);
        this.scheduleOnce(function(){
            _sea.setVisible(false);
        },1);
    },
    updatePlayerinfo: function (msgdata) {
        this.curPersons = 0;
        this._readyBtn.setVisible(false);
        var _this = this;
        for(var i=0;i<4;i++){
            //this.playerHeads[i].setVisible(false);
            if(!_this.mod_hlgc.gameInfo.begin && _this.mod_hlgc.roominfo.step == 0){
                ccui.helper.seekWidgetByName(this.node,"Button_" + i).setVisible(true);
                //this.playerHeads[i].setVisible(false);
                var playerNode = ccui.helper.seekWidgetByName(_this.uiLayer, "head_" + i);
                var hulogo = ccui.helper.seekWidgetByName(_this.uiLayer,"hulogo" + i);
                hulogo.setVisible(false);
                playerNode.setVisible(false);
            }
            //this.playerHeads[i].setVisible(false);
            this._seatContain.setVisible(true);
            var headBtn = this._seatContain.getChildren();
            headBtn[i].setVisible(false);
        }

        var data = msgdata; //yuanshi data
        if(!_this.mod_hlgc.gameInfo.begin && _this.mod_hlgc.roominfo.step == 0) {

            _this.arrowSp.setVisible(true);
            cc.each(data, function (o, i) {
                if(data[0] && data[1] && data[2] && data[3])
                {
                    var isAllReady = _this.mod_hlgc.checkAllReady();
                    if(isAllReady && o.uid == _this.game.modmgr.mod_login.logindata.uid &&  _this.mod_hlgc.isDaiPaoLong)
                    {
                        _this.isSeat = true;
                        ccui.helper.seekWidgetByName(_this.uiLayer, "betLayer").setVisible(true);
                    }
                }
                if(!o)return;
                if(o.seat != -1){
                    var personData=_this.mod_hlgc._getPersonDataByUid(o.uid);
                    if(personData)
                    {
                        if(o.seat >= 0){
                            ccui.helper.seekWidgetByName(_this.node,"Button_" + o.seat).setVisible(false);
                        }
                        var seat = o.seat >= 0 ? o.seat : 0

                        var player = _this._seatContain.getChildren()[seat];
                        player.setVisible(true);
                        var playerControls = player.getChildren();
                        for(var k =0;k<playerControls.length;k++){
                            playerControls[k].setVisible(false);
                        }

                        var playerBg = ccui.helper.seekWidgetByName(player,"headContain");
                        playerBg.setVisible(true);
                        var playerHead = ccui.helper.seekWidgetByName(player, "headBg");
                        playerHead.setVisible(true);
                        ccui.helper.seekWidgetByName(player, "playerName").setVisible(true);
                        ccui.helper.seekWidgetByName(player, "playerName").setString(personData.name);
                        if(personData.line )
                        {
                            ccui.helper.seekWidgetByName(player,"offLine").setVisible(false);
                        }
                        else
                        {
                            ccui.helper.seekWidgetByName(player,"offLine").setVisible(true);
                        }
                        if (personData.imgurl != null) {
                            //点击显示的信息
                            gameclass.mod_base.showtximg(playerHead, personData.imgurl || '', 0, 0, '', !personData.line);
                        } else {
                            playerHead.removeAllChildren();
                        }

                    }
                }

            })
            return;
        }
        if(_this.mod_hlgc.isHaveingSeat)
        {
            //var tempData=[null,null,null,null];
            //for(var i=0;i<msgdata.info.length;i++){
            //    if(!msgdata.info[i]||msgdata.info[i].seat<0) continue;
            //    tempData[(msgdata.info[i].seat-_this.mod_hlgc._mySeat+4)%4]=gameclass.mod_base.deepCopy(msgdata.info[i]);
            //}

            _this._seatContain.setVisible(false);
            cc.each(data, function (o, i) {
                if (o) {
                    var MySeat = o.seat;
                    ccui.helper.seekWidgetByName(_this.node,"Button_" + i).setVisible(false);
                    if(i >= 0)
                    {
                        if(data[0] && data[1] && data[2] && data[3]) {
                            if ( o.uid == _this.game.modmgr.mod_login.logindata.uid && _this.mod_hlgc.isDaiPaoLong) {
                                _this.isSeat = true;
                            }
                        }
                        var playerNode = ccui.helper.seekWidgetByName(_this.uiLayer, "head_" + i);
                        _this.playerHeads[i] = new gameclass.hlgc.Player(
                            playerNode,
                            i,
                            _this.uiLayer,
                            _this.controlLayer,
                            _this);
                        _this.playerHeads[i].setGame(_this.game);
                        var personData=_this.mod_hlgc._getPersonDataByUid(o.uid);
                        _this.curPersons++;
                        _this.playerHeads[i].setVisible(true);
                        _this.playerHeads[i].setBaseInfo({
                            name: personData.name,
                            id: personData.uid,
                            head: personData.imgurl,
                            uip: personData.ip,
                            uid: personData.uid,
                            sex: personData.sex,
                            address: personData.address,
                            ready: personData.ready,
                            line: personData.line,
                            total: 0,
                        });
                        //if(_this.mod_hlgc.roominfo.step == 1)
                        //{
                        //    _this.gamebets(o.uid,o.piao);
                        //}


                    }
                    else
                    {
                        // _this.playerHeads[i].setVisible(false);
                    }

                }
                //else {
                //         _this.playerHeads[i].setVisible(false);
                //}
            });

        }

    },
    updateReadyView: function () {
        //this._readyBtn.setVisible(true);
        var data = this.mod_hlgc.gameInfo.info;
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.mod_hlgc.gameInfo.info.length;i++){
            if(!this.mod_hlgc.gameInfo.info[i]||this.mod_hlgc.gameInfo.info[i].seat<0) continue;
            _mrr[(this.mod_hlgc.gameInfo.info[i].seat-this.mod_hlgc._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.mod_hlgc.gameInfo.info[i]);
        }
        for (var i = 0; i < _mrr.length; i++) {
            var person = _mrr[i];
            if (person == null) continue;
            var isReady = this.mod_hlgc.getUserRead(person.uid);
            // cc.log("isReady=="+isReady);
            if(this.playerHeads[i])
            {
                if(!this.mod_hlgc.gameInfo.begin)
                {
                    this.playerHeads[i].updateRead(isReady);
                }

                if (isReady && person.uid == this.mod_hlgc.myUid) {
                    this._readyBtn.setVisible(false);
                    this.playerHeads[i].betTxt.setString("");

                }
            }

        }
    },
    reconnectionShow: function (data, roominfo, players) {
        var _this = this;
        cc.each(this.playerHeads, function (o, i) {
            if (data[i] && data[i].card) {
                o.setVisible(true);
                if (data[i].dealer) {
                    o.zhuang_img.setVisible(true);
                }
                o.score_text.setString(data[i].total);
            }
        });
    },

    //===================================断线重连====================================
    connect_showTableCard: function (arr) {
        this.outPokerManager.getConnectTableData(arr);
        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.outPokerManager.renderCards(i);
        }
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].length; j++) {
                if (!this.seeObj[arr[i][j]]) {
                    this.seeObj[arr[i][j]] = 0;
                }
                this.seeObj[arr[i][j]]++;
            }
        }
    },

    connect_showPengGangCard: function (arr) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].length; j++) {
                if (!this.seeObj[arr[i][j].nums[0]]) {
                    this.seeObj[arr[i][j].nums[0]] = 0;
                }
                if (arr[i][j].type == "peng") {
                    this.seeObj[arr[i][j].nums[0]] += 3;
                }
            }
        }
        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.playerHeads[i].getConnectPengGangData(arr[i]);
            this.playerHeads[i].renderAllCard(0);
        }
    },


    connect_isHaveOutPoke: function (_index, _state) {
        this.playerHeads[_index].haveOutPoke = _state;
    },

    connet_setLastInfo: function (lastchair, lastCardNum) {
        this.lastChairNum = lastchair;
        this.lastCardNum = lastCardNum;
    },

    whoHasHu: function (_arr) {
        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.playerHeads[i].isHasHu = (_arr[i] / 10 > 0);
        }
    },

    showHuPoke: function (_arr) {
        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            if (_arr[i] > 0) {
                this.playerHeads[i].showHuPoke(_arr[i]);
            }
        }
    },
    //显示抓宝
    showBao: function (cardArr) {
        this._baoContain.removeAllChildren();
        for (var i = 0; i < cardArr.length; i++) {
            var cardSp = gameclass.hlgc.Table.CreateCard(cardArr[i], 0, 2);
            cardSp.setAnchorPoint(cc.p(0, 0))
            cardSp.setScale(1.5);
            this._baoContain.addChild(cardSp);
            cardSp.setPositionX(i * (cardSp.getContentSize().width * cardSp.getScale()));
            this._baoContain.setContentSize(cc.size(cardSp.getPositionX() + cardSp.getContentSize().width * cardSp.getScale(), cardSp.getContentSize().height * cardSp.getScale()))
        }
        this._baoContain.setPositionX((cc.winSize.width - this._baoContain.getContentSize().width) / 2);
        this._baoContain.setPositionY((cc.winSize.height - this._baoContain.getContentSize().height) / 2);
    },
});

//创建牌背  --type表示牌的类型--0手牌 1暗杠 2明杠 3出牌--
//         --direct表示朝向 --0自家 1右手边 2对面 3左手边--
//         --canSee表示能不能看见--0可见 1不可见
gameclass.hlgc.Table.CreateCard = function (cardNum, direct, type, canSee, state) {
    // var cardBgStr = "";
    // var ds = ["_p0", "_p1", "_p2", "_p3"];
    // var oper = ["_hand", "_oper", "_oper", "_push"];
    // var see = ["_f", "_b"];
    //
    // cardBgStr = "bg" + ds[direct] + oper[type] + see[canSee] + ".png";
    // var card = new cc.Sprite();
    // card.initWithSpriteFrameName(cardBgStr);

    var cardBgStr = "";
    var scale = 1;

    if (type == 0) {
        if (direct == 0) {
            cardBgStr = "down_" + cardNum + ".png";
            scale = 0.92;
        } else if (direct == 1) {
            cardBgStr = "hand_right.png";
            scale = 0.95;
        } else if (direct == 2) {
            cardBgStr = "hand_top.png";
            scale = 0.8;
        } else {
            cardBgStr = "hand_left.png";
            scale = 0.95;
        }

    } else if (type == 1) {
        if (direct == 0) {
            cardBgStr = "heap_out.png";
            scale = 0.8;
        } else if (direct == 1) {
            cardBgStr = "heap_right.png";
            scale = 0.99;
        } else if (direct == 2) {
            cardBgStr = "heap_out.png";
            scale = 0.55;
        } else {
            cardBgStr = "heap_left.png";
            scale = 0.99;
        }
    } else if (type == 2) {
        if (direct == 0) {
            cardBgStr = "out_ver_" + cardNum + ".png";
            scale = 0.8;
        } else if (direct == 1) {
            cardBgStr = "right_" + cardNum + ".png";
            scale = 0.99;
        } else if (direct == 2) {
            cardBgStr = "out_ver_" + cardNum + ".png";
            scale = 0.55;
        } else {
            cardBgStr = "left_" + cardNum + ".png";
            scale = 0.99;
        }
    } else if (type == 3) {
        if (direct == 0) {
            cardBgStr = "out_ver_" + cardNum + ".png";
            scale = 0.55;
        } else if (direct == 1) {
            cardBgStr = "right_" + cardNum + ".png";
            scale = 0.99;
        } else if (direct == 2) {
            cardBgStr = "out_ver_" + cardNum + ".png";
            scale = 0.55;
        } else {
            cardBgStr = "left_" + cardNum + ".png";
            scale = 0.99;
        }
    }
    // if(canSee == 1){
    //     if (direct == 0) {
    //         cardBgStr = "heap_out.png";
    //         scale = 0.78;
    //     } else if (direct == 1) {
    //         cardBgStr = "heap_right.png";
    //         scale = 0.94;
    //     } else if (direct == 2) {
    //         cardBgStr = "heap_out.png";
    //         scale = 0.45;
    //     } else {
    //         cardBgStr = "heap_left.png";
    //         scale = 0.94;
    //     }
    // }

    // cc.log("cardBgStr===" + cardBgStr)


    // var ds = ["down_", "_p1", "_p2", "_p3"];
    // var oper = ["_hand", "_oper", "_oper", "_push"];
    // var see = ["_f", "_b"];
    //
    // cardBgStr = "handmah_11.png";
    var card = new cc.Sprite();
    card.initWithSpriteFrameName(cardBgStr);
    card.setScale(scale-0.1);

    // gameclass.hlgc.Table.CreateCardText(cardNum, direct, type, canSee, card, state);
    return card;
};
gameclass.hlgc.Table.prototype.checkSafe = function (people) {
    if (this.mod_hlgc.roomSetArr[2] == 0) return;

    var isDanger = this.safeLayer.checkSafe(people);
    if (isDanger) {
        this.safeLayer.showSafeWindow(people)
    }
};
gameclass.hlgc.Table.CreateCardText = function (cardNum, direct, type, canSee, _parent, state) {
    if (canSee == 1) return;
    var textScaleArr = [];
    var textDifY = [];
    var rotateAngleArr = [0, 270, 0, 90];
    if (type == 0) {
        textScaleArr = [1, 1, 1, 1];
        textDifY = [-10, 0, 0, 0];
    } else if (type == 3) {
        textScaleArr = [0.5, 0.5, 0.5, 0.5];
        textDifY = [6, 8, 6, 8];
    } else if (type == 2) {
        textScaleArr = [1, 0.5, 0.5, 0.5];
        textDifY = [10, 8, 6, 8];
    }
    var cardTextStr = "card_" + cardNum + ".png";
    var cardTextSp = new cc.Sprite();
    cardTextSp.initWithSpriteFrameName(cardTextStr);
    if (state == "huifang") {
        cardTextSp.setRotation(0);
    } else {
        cardTextSp.setRotation(rotateAngleArr[direct]);
    }
    cardTextSp.setScale(textScaleArr[direct]);
    cardTextSp.setPosition(_parent.getContentSize().width / 2, _parent.getContentSize().height / 2 + textDifY[direct]);
    _parent.addChild(cardTextSp);
    return cardTextSp;
},

    gameclass.hlgc.Table.getCardStr = function (cardNum, direct, type, canSee) {
        var cardBgStr = "";
        var ds = ["_p0", "_p1", "_p2", "_p3"];
        var oper = ["_hand", "_oper", "_oper", "_push"];
        var see = ["_f", "_b"];

        cardBgStr = "bg" + ds[direct] + oper[type] + see[canSee] + ".png";
        return cardBgStr;
    },

    gameclass.hlgc.Table.getCardTextStr = function (cardNum) {
        return "down_" + cardNum + ".png";
    }


