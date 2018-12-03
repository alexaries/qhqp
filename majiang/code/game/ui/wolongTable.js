/**
 * Created by Administrator on 2017/4/18 0018.
 */
var WOLONGMAXPLAYER = 5;
gameclass.wolongTable = gameclass.baseui.extend({
    node: null,
    playerObj: null,
    tableData: null,
    personData: null,
    myUid: null,
    severChair: null,
    UpArr: null,
    clockTimer: null,
    nowYouIndex: null,
    cardNode: null,
    IsAllAuto: null,
    ctor: function () {
        this._super();
        this.nowYouIndex = 0;
        this.IsAllAuto = false;
        this.playerObj = {};
        this.UpArr = [];
        this.clockTimer = null;
    },

    show: function () {
        this.node = this.game.uimgr.createnode(res.wolongTableJson, true);
        this.node.setPosition((cc.winSize.width - this.node.getContentSize().width) / 2, 0);
        this.addChild(this.node);
        var _this = this;

        this.btnCaiDan = ccui.helper.seekWidgetByName(this.node, "btnCaiDan");
        this.tuoGuang = ccui.helper.seekWidgetByName(this.node, "tuoGuang");
        this.chatBtn = ccui.helper.seekWidgetByName(this.node, "chatBtn");
        this.saidBtn = ccui.helper.seekWidgetByName(this.node, "saidBtn");
        this.inviteBtn = ccui.helper.seekWidgetByName(this.node, "inviteBtn");
        this.sendCardBtnLayer = ccui.helper.seekWidgetByName(this.node, "sendCardBtnLayer");
        this.sendCardBtnLayer.setVisible(false);

        this.myCardLayer = ccui.helper.seekWidgetByName(this.node, "myCardLayer");
        this.touchPanel = ccui.helper.seekWidgetByName(this.node, "touchPanel");

        this.readyLayer = ccui.helper.seekWidgetByName(this.node, "ready");
        this.readyLayer.setVisible(false);


        this.chatAnimationLayer = ccui.helper.seekWidgetByName(this.node, "animateLayer");

        this.tuoGuangLayer = ccui.helper.seekWidgetByName(this.node, "touGuangLayer");
        this.tuoGuangLayer.setVisible(false);

        this.playerNodeArr = ccui.helper.seekWidgetByName(this.node, "playerPanel").getChildren();

        this.tableScore = ccui.helper.seekWidgetByName(this.node, "tableScore");
        this.tableScore.setVisible(false);
        for (var i = 0; i < this.playerNodeArr.length; i++) {
            this.playerNodeArr[i].setVisible(false);
        }
        for (var i = 0; i < this.sendCardBtnLayer.getChildren().length; i++) {
            this.sendCardBtnLayer.getChildren()[i].setTag(i + 1);
            this.sendCardBtnLayer.getChildren()[i].addTouchEventListener(this._chuPaiBtnLayerCallBack.bind(this));
        }
        gameclass.createbtnpress(this.node, "btnCaiDan", function () {
            ccui.helper.seekWidgetByName(_this.node, "caiDanLayer").setVisible(true);
        });
        gameclass.createbtnpress(this.node, "caiDanLayer", function () {
            ccui.helper.seekWidgetByName(_this.node, "caiDanLayer").setVisible(false);
        });
        gameclass.createbtnpress(this.node, "tuoGuang", function () {
            _this.mod_wolong.gametuoguan();
        });
        gameclass.createbtnpress(this.node, "quxiaoTuoGuan", function () {
            if (_this.IsAllAuto) return;
            _this.mod_wolong.gamenotuoguan();
        });
        gameclass.createbtnpress(this.node, "readyBtn", function () {
            _this.mod_wolong._socketSendReady()
        });
        gameclass.createbtnpress(this.node, "setBtn", function () {
            _this.game.uimgr.showui("gameclass.settingui");
        });
        gameclass.createbtnpress(this.node, "inviteBtn", function () {
            _this.share();
        });
        gameclass.createbtnpress(this.node, "jieSuanBtn", function () {
            _this.game.uimgr.showui("gameclass.msgboxui");
            _this.game.uimgr.uis["gameclass.msgboxui"].setString("是否想要解散房间？", function () {
                _this.mod_wolong.dissmissroom(1);
            });
        });
        gameclass.createbtnpress(this.node, "chatBtn", function () {
            _this.game.uimgr.showui("gameclass.chatui");
            _this.game.uimgr.uis["gameclass.chatui"].setmod(_this.mod_wolong);
        });
        gameclass.createbtnpress(this.node, "saidBtn", function () {
            _this.game.uimgr.showui("gameclass.chatui");
            _this.game.uimgr.uis["gameclass.chatui"].setmod(_this.mod_wolong);
        });
        gameclass.createbtnpress(this.node, "btn_safe", function () {
            _this.mod_game = gameclass.mod_platform.game.modmgr.mod_login.getfirstgame();
            if (!_this.mod_game) return;
            var people = _this.mod_game.view.personData.person;
            var linePeople = [];
            for (var i = 0; i < people.length; i++) {
                if (people[i].line) linePeople.push(people[i]);
            }
            _this.node.getChildByName("safeLayer").safeBtncallFunc(linePeople);
        });
        cc.spriteFrameCache.addSpriteFrames(res.cardsPlistBig);

        this.safeLayer = new gameclass.checkSafeLayer(this.node, this.game, ccui.helper.seekWidgetByName(this.node, "btn_safe"));
        this.safeLayer.setName("safeLayer");
        this.node.addChild(this.safeLayer);
        this._addTouchEvent();
        this.schedule(this._timeClockUpdate.bind(this), 1);
        this.timeState();

        mod_sound.playbmg(woLongMusics.bmg_wl, true);
    },
    //微信邀请文字
    share: function () {
        if (this.personData == null) return;

        var wanfa = StaticData.getRoomSetStrFromParam(this.personData.type, this.personData.param1, this.personData.param2, 1);

        var sharetxt = "我在[" + StaticData.GAME_NAME + "]开了" + this.personData.maxstep + "局" + "," + wanfa + ",";

        sharetxt += "快来一起玩吧!";

        gameclass.mod_platform.invitefriend(
            sharetxt,
            gameclass.download,
            "摸 " + StaticData.GAME_NAME + " 房号【" + this.personData.roomid + "】");
    },
    _timeClockUpdate: function () {
        if (!this.clockTimer || this.clockTimer < 0) return;
        this.clockTimer--;
    },
    _chuPaiBtnLayerCallBack: function (sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            var _tag = sender.getTag();
            this._seekBtnCallBackByTag(_tag);
        }
    },
    _seekBtnCallBackByTag: function (_tag) {
        if (_tag == 0) {
            var data = {cards: [], abscards: []};
            this.mod_wolong.gameStep(data);
        } else if (_tag == 1) {
            if (this.nowTuiJianIndex == null) return;
            this.nowTuiJianIndex--;
            if (this.nowTuiJianIndex < 0) {
                this.nowTuiJianIndex = this.tuiJianIndex;
            }
            if (!this.playerObj[this.myUid].infoData.convertCardArr[this.nowTuiJianIndex]) return;
            var _cardArr = this.playerObj[this.myUid].infoData.convertCardArr[this.nowTuiJianIndex].card;
            this.UpArr = [];
            for (var i = 0; i < this.myCardLayer.getChildren().length; i++) {
                if (_cardArr[0] == this.myCardLayer.getChildren()[i]._cardNum) {
                    this.UpArr = this.myCardLayer.getChildren().slice(i, i + _cardArr.length);
                    break
                }
            }
            var _myCardLayerArr = this.myCardLayer.getChildren();
            for (var j = 0; j < _myCardLayerArr.length; j++) {
                _myCardLayerArr[j].y = this.myCardLayer.height / 2;
            }
            for (var j = 0; j < this.UpArr.length; j++) {
                this.UpArr[j].y = this.myCardLayer.height / 2 + 20;
            }
        } else if (_tag == 2) {
            if (!this.UpArr.length) return;
            var _cardArr = [];
            for (var i = 0; i < this.UpArr.length; i++) {
                _cardArr[i] = this.UpArr[i]._cardNum;
            }
            if (!this._checkRule(_cardArr, this.infoData.lastcard) && this.infoData.befstep != this.myUid) {
                return;
            }
            // for(var i=0;i<_cardArr.length;i++){
            //      var _index=this.playerObj[this.myUid].infoData.card.indexOf(_cardArr[i]);
            //      if(_index>-1) this.playerObj[this.myUid].infoData.card.splice(_index,1);
            // }
            // this.playerObj[this.myUid]._initHandCard();
            var data = {cards: _cardArr, abscards: []};
            this.mod_wolong.gameStep(data);
        }
    },
    bindMod: function (mod_wolong, personData) {
        cc.log("niuniu setmod");
        this.mod_wolong = mod_wolong;
        this.personData = personData;
        this.myUid = this.game.modmgr.mod_login.logindata.uid;

        if (window.wx) {
            this.share();
        }
        this.micLayerState();
        if (this.personData.time != 0) {
            this.game.uimgr.showui("gameclass.exitroom", false);
            this.game.uimgr.uis["gameclass.exitroom"].setData(this.mod_wolong, this.personData);
        }
        if (parseInt(this.personData.param2 / 1000) % 10 == 1) {
            ccui.helper.seekWidgetByName(this.node, "quxiaoTuoGuan").loadTextures(res.allAutoPic, res.allAutoPic, res.allAutoPic);
            this.IsAllAuto = true;
        }
    },
    checkSafe: function (people) {
        this.safeLayer.checkSafe(people);
    },
    timeState: function () {
        var titiletime = ccui.helper.seekWidgetByName(this.node, "curTime");
        var reftime = function () {
            var myDate = new Date();
            var str = myDate.Format("hh:mm");
            titiletime.setString(str);
        };
        reftime();
        var func = cc.repeatForever(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
            reftime();
        })));
        titiletime.runAction(func);
    },
    onGameStep: function (data) {
        this.infoData.curstep = data.curstep;
        if (data.card.length) {
            this.infoData.befstep = data.uid;
        }
        this.infoData.lastcard = data.lastcard;
        this.playerObj[this.infoData.befstep].outPoker(this.infoData.lastcard);
        this.infoData.end = data.end;
        if (data.card.length) {
            for (var i in this.playerObj) {
                this.playerObj[i].headCardPanel.removeAllChildren(true);
            }
        }
        var _sexStr = "Woman";
        if (this.playerObj[data.uid].personData.sex == 1) {
            _sexStr = "Man";
        }
        if (data.card && data.card.length && data.lastcard.length) {
            mod_sound.playeffect(woLongMusics.wl_chuPai, false);
            if (data.befstep && data.befstep != data.uid) {
                var _Index = parseInt(Math.random() * woLongMusic["yasiMusic_" + _sexStr].length);
                mod_sound.playeffect(woLongMusic["yasiMusic_" + _sexStr][_Index]);
            }else{
                var num = data.card.length;
                var numTypeStr = "";
                var cardNum = 0;
                if(num <= 3 && num > 0){
                    cc.log(_sexStr + "_" + numTypeStr + data.card[0])
                    if(num == 1){
                        numTypeStr = "";
                        if(data.card[0] == 1000){
                            cardNum = 14;
                        }else if(data.card[0] == 2000){
                            cardNum = 15;
                        }else{
                            cardNum = parseInt(data.card[0] / 10);
                        }
                        mod_sound.playeffect(woLongMusics[_sexStr + "_" + numTypeStr + cardNum]);
                    }else if(num == 2){
                        numTypeStr = "dui";
                        if(data.card[0] != 1000 && data.card[0] != 2000){
                            cardNum = parseInt(data.card[0] / 10);
                            mod_sound.playeffect(woLongMusics[_sexStr + "_" + numTypeStr + cardNum]);
                        }
                    }else if(num == 3){
                        numTypeStr = "tuple";
                        if(data.card[0] != 1000 && data.card[0] != 2000){
                            cardNum = parseInt(data.card[0] / 10);
                            mod_sound.playeffect(woLongMusics[_sexStr + "_" + numTypeStr + cardNum]);
                        }
                    }
                }
            }
        } else {
            var _Index = parseInt(Math.random() * woLongMusic["pauseMusic_" + _sexStr].length);
            mod_sound.playeffect(woLongMusic["pauseMusic_" + _sexStr][_Index]);
        }
        this.playerObj[data.uid].outPoker(data.card);
        this.playerObj[data.uid]._setCardNum(data.cardnum + "");
        if (this.playerObj[data.uid].infoData.cardnum == 0) {
            this.playerObj[data.uid].NYou.setVisible(true);
            this.playerObj[data.uid].NYou.loadTexture(res["you" + (Number(this.nowYouIndex) + 1)]);
            this.playerObj[data.uid].infoData.rating = Number(this.nowYouIndex) + 1;
            this.nowYouIndex++;
        }
        if (data.uid == this.myUid) {
            for (var i = 0; i < data.card.length; i++) {
                var _index = this.playerObj[this.myUid].infoData.card.indexOf(data.card[i]);
                if (_index > -1) this.playerObj[this.myUid].infoData.card.splice(_index, 1);
            }
            this.playerObj[this.myUid]._initHandCard();
            this.UpArr = [];
        }


        var jscorepool = data.jscorepool;
        if (jscorepool) {
            this.tableScore.setVisible(true);
        } else this.tableScore.setVisible(false);
        this.tableScore.setString("桌面分：" + jscorepool);

        this.playerObj[data.uid].playJiangFenAnimate(data);
        if (data.uid == this.myUid) {
            this._showSendCardBtn(false);
        } else if (data.curstep == this.myUid) {
            this._showSendCardBtn(true);
        }
        this.playerObj[data.curstep].headCardPanel.removeAllChildren(true);
    },
    _runNext: function (_uid) {
        for (var i in this.playerObj) {
            if (i == _uid) {
                this.playerObj[i]._setControlTime(this.clockTimer);
            } else {
                this.playerObj[i]._setControlTime(-1);
            }
        }
    },
    onGameJscore: function (data) {
        this.playerObj[data.uid].playJianFenAnimate(data.score);
    },
    onGameWoLongEnd: function (data) {
        this.infoData.state = 2;
        var _this = this;
        this._showSendCardBtn(false);
        this.node.scheduleOnce(function () {
            _this.game.uimgr.showui("gameclass.woLongResultOneUi").setData(_this.mod_wolong, _this);
        }, 1);

        var maxScore = 0;
        var myScore;
        for(var i = 0;i<data.info.length;i++){
            if(data.info[i].uid == this.myUid){
                myScore = data.info[i].curscore;
            }
            if(data.info[i].curscore > maxScore){
                maxScore = data.info[i].curscore;
            }
        }
        if(myScore >= maxScore){
            mod_sound.playeffect(woLongMusics.wl_win);
        }else{
            mod_sound.playeffect(woLongMusics.wl_lost);
        }
    },
    micLayerState: function () {
        var _this = this;

        var mic = ccui.helper.seekWidgetByName(_this.node, "saidBtn");
        var miclayer = ccui.helper.seekWidgetByName(_this.node, "miclayer");
        miclayer.setVisible(false);
        //var imgmic = ccui.helper.seekWidgetByName(_this.node, "imgmic");
        //var ani = cc.sequence(cc.scaleTo(0.8, 1), cc.scaleTo(0.8, 0.8));
        //imgmic.runAction(cc.repeatForever(ani));
        var anim = sp.SkeletonAnimation.createWithJsonFile(res.voiceJson, res.voiceAtlas);
        anim.setPosition(64, 64);
        anim.setScale(0.7);
        miclayer.addChild(anim);
        anim.setAnimation(0, 'animation', true);

        var oldvnum = mod_sound.getEffectsVolume();
        var oldmnum = mod_sound.getMusicVolume();
        mic.addTouchEventListener(function (sender, type) {
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
        });
    },
    _initTablePerson: function (data) {
        // for(var i in this.playerObj){
        //     this.playerObj[i].node.setVisible(false);
        // }
        //this.playerObj={};
        this.checkSafe(this.personData.person);
        this.personData = data;
        this.hostUid = this.personData.host;
        this._setJuShuLabel();
        this._setRulePanel();
        for (var m in this.playerObj) {
            var _ishave = false;
            for (var i = 0; i < this.personData.person.length; i++) {
                if (this.personData.person[i].uid == m) {
                    _ishave = true;
                    break;
                }
            }
            if (!_ishave) {
                this.playerObj[m].node.setVisible(false);
                delete  this.playerObj[m];
            }
        }
        for (var i = 0; i < this.personData.person.length; i++) {
            var _uid = this.personData.person[i].uid;
            var _index = this._getIndexByUid(_uid);
            if (!this.playerObj[_uid]) {
                this.playerObj[_uid] = new gameclass.wolongPlayer(_index, this);
            }
            this.playerObj[_uid]._initPerson(this.personData.person[i]);
        }

    },
    _initTableInfo: function (data, _isReconnet) {
        if (this.personData.step == 0) {
            this.inviteBtn.setVisible(true);
        } else {
            this.inviteBtn.setVisible(false);
        }
        this.infoData = data;
        var _this = this;
        this._showSendCardBtn(false);
        for (var i = 0; i < this.infoData.info.length; i++) {
            this.playerObj[this.infoData.info[i].uid]._initInfo(this.infoData.info[i], this.infoData.state, _isReconnet);
        }
        if (this.infoData.state == 0) {

        } else if (this.infoData.state == 1 || this.infoData.state == 2) {
            var befstep = data.befstep;
            var curstep = data.curstep;
            var lastcard = data.lastcard;
            var jscorepool = data.jscorepool;
            if (jscorepool) {
                this.tableScore.setVisible(true);
            } else this.tableScore.setVisible(false);
            this.tableScore.setString("桌面分：" + jscorepool);
            for (var i in this.playerObj) {
                this.playerObj[i].headCardPanel.removeAllChildren(true);
                this.playerObj[i].outArr = [];
            }
            if (befstep && this.playerObj[befstep].infoData.cardnum) {
                this.playerObj[befstep].outPoker(lastcard);
                //if(this.playerObj[befstep].infoData.rating) this.infoData.lastcard=[];
            }

            if (_isReconnet) {
                this.clockTimer = this.infoData.endtime;
                if (curstep == this.myUid) this._showSendCardBtn(true);
                this.playerObj[curstep].headCardPanel.removeAllChildren(true);


                var buYaoArr = [];
                var _isBeginPush = false;
                for (var i = 0; i < this.infoData.info.length * 2; i++) {
                    var _num = i;
                    if (_num >= this.infoData.info.length) _num -= this.infoData.info.length;
                    if (_isBeginPush == true && this.infoData.info[_num].uid == curstep) {
                        break;
                    }
                    if (_isBeginPush == true) {
                        buYaoArr.push(this.infoData.info[_num].uid);
                    }
                    if (this.infoData.info[_num].uid == befstep) {
                        _isBeginPush = true;
                    }
                }
                for (var i = 0; i < buYaoArr.length; i++) {
                    if (this.playerObj[buYaoArr[i]].infoData.cardnum) {
                        this.playerObj[buYaoArr[i]].outPoker([]);
                    }
                }
                if (this.infoData.state == 2 && !this.playerObj[this.myUid].infoData.ready && !_this.game.uimgr.uis["gameclass.woLongResultAllUi"]) {
                    _this.game.uimgr.showui("gameclass.woLongResultOneUi").setData(_this.mod_wolong, _this);
                }
            } else {
                this.nowYouIndex = 0;
                for (var i in this.playerObj) {
                    this.playerObj[i]._setCardNum(0);
                }
                var totalDelaytime = 0;
                totalDelaytime = (parseInt(this.playerObj[this.myUid].infoData.card.length) + 1) * 0.1 + 0.2;
                this.scheduleOnce(function () {
                    if (this.infoData.curstep == this.myUid) this._showSendCardBtn(true);
                }, totalDelaytime)
            }
            this._runNext(_this.infoData.curstep);
        }
    },
    gameBye: function () {
        if (this.mod_wolong.isEnd) return;
        this.game.uimgr.closeui("gameclass.woLongResultAllUi");
        this.game.uimgr.showui("gameclass.woLongResultAllUi").setData(this.mod_wolong);
    },
    _checkRule: function (_lastCardArr, sendCardArr) {
        var _lastTouObj = this._getTouShuObj(_lastCardArr);
        var sendTouObj = this._getTouShuObj(sendCardArr);
        if (_lastTouObj.touShu != sendTouObj.touShu && _lastTouObj.touShu < 4 && sendTouObj.touShu) return false;
        var _nowCardIndex = Number(_lastTouObj._cardIndex);
        var lastCardIndex = Number(sendTouObj._cardIndex);
        if (_nowCardIndex <= 2) _nowCardIndex += 13;
        if (lastCardIndex <= 2) lastCardIndex += 13;
        if (_lastTouObj.touShu > sendTouObj.touShu || (_lastTouObj.touShu == sendTouObj.touShu && _nowCardIndex > lastCardIndex)) return true;
        return false;
    },
    _addTouchEvent: function () {
        var _this = this;
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var _pos = touch.getLocation();
                var _myCardLayerArr = _this.myCardLayer.getChildren();
                for (var i = _myCardLayerArr.length - 1; i >= 0; i--) {
                    var _cardPos = _myCardLayerArr[i].convertToNodeSpace(_pos);
                    var _rect = cc.rect(0, 0, _myCardLayerArr[i].width, _myCardLayerArr[i].height)
                    if (cc.rectContainsPoint(_rect, _cardPos)) {
                        _this.UpArr = [];
                        var _upArr = [];
                        for (var j = 0; j < _this.playerObj[_this.myUid].infoData.convertCardArr.length; j++) {
                            var _obj = _this.playerObj[_this.myUid].infoData.convertCardArr[j];
                            for (var k = 0; k < _obj.card.length; k++) {
                                if (_myCardLayerArr[i]._cardNum == _obj.card[k]) {
                                    _upArr = _obj.card.slice(0);
                                    break;
                                }
                            }
                        }
                        for (var j = 0; j < _myCardLayerArr.length; j++) {
                            _myCardLayerArr[j].y = _this.myCardLayer.height / 2;
                            for (var k = 0; k < _upArr.length; k++) {
                                if (_myCardLayerArr[j]._cardNum == _upArr[k]) {
                                    _upArr[k] = 0;
                                    _this.UpArr.push(_myCardLayerArr[j]);
                                    break;
                                }
                            }
                        }
                        for (var m = 0; m < _this.UpArr.length; m++) {
                            _this.UpArr[m].y = _this.myCardLayer.height / 2 + 20;
                        }
                        return true;
                    }
                }
                return false;
            },
        }), this.touchPanel);
    },
    _setJuShuLabel: function () {
        var _str = "局数：" + this.personData.step + "/" + this.personData.maxstep;
        ccui.helper.seekWidgetByName(this.node, "juShuLabel").setString(_str);
    },
    _setRulePanel: function () {
        var _roomid = this.personData.roomid;
        var param1 = this.personData.param1;
        var param2 = this.personData.param2;
        ccui.helper.seekWidgetByName(this.node, "fangHao").setString("房号：" + _roomid + "");
        var _renShuNum = "三人";
        if (parseInt(this.personData.param1 / 1000) % 10 == 3) {
            _renShuNum = "三人";
        } else if (parseInt(this.personData.param1 / 1000) % 10 == 4) {
            _renShuNum = "四人";
        } else if (parseInt(this.personData.param1 / 1000) % 10 == 5) {
            _renShuNum = "五人";
        }
        var ruleText = "";
        if (parseInt(this.personData.param1) % 10 == 0) {
            ruleText += "同色无奖   ";
        } else if (parseInt(this.personData.param1) % 10 == 1) {
            ruleText += "同色加1奖    ";
        } else if (parseInt(this.personData.param1) % 10 == 2) {
            ruleText += "同色加N奖    ";
        }
        if (parseInt(this.personData.param1 / 10) % 10 == 0) {
            ruleText += "顺奖无奖   ";
        } else if (parseInt(this.personData.param1 / 10) % 10 == 1) {
            ruleText += "顺奖连1奖    ";
        } else if (parseInt(this.personData.param1 / 10) % 10 == 2) {
            ruleText += "顺奖连N奖    ";
        }
        if (parseInt(this.personData.param1 / 100) % 10 == 0) {
            ruleText += "无奖加10奖   ";
        } else if (parseInt(this.personData.param1 / 100) % 10 == 1) {
            ruleText += "无奖加15奖    ";
        }
        if (parseInt(this.personData.param2) % 10 == 1) {
            ruleText += "单牌为奖   ";
        }
        if (parseInt(this.personData.param2 / 10) % 10 == 1) {
            ruleText += "独奖翻倍    ";
        }
        if (parseInt(this.personData.param2 / 100) % 10 == 1) {
            ruleText += "断分玩法     ";
        }
        ccui.helper.seekWidgetByName(this.node, "renShuNum").setString(_renShuNum);
        ccui.helper.seekWidgetByName(this.node, "ruleText").setString(ruleText);
    },
    _showReadyBtn: function (b) {
        if (this.IsAllAuto) {
            this.readyLayer.setVisible(false);
            return;
        }
        this.readyLayer.setVisible(b);
    },
    _showSendCardBtn: function (b) {
        if (this.IsAllAuto) {
            this.sendCardBtnLayer.setVisible(false);
            return;
        }
        ;
        if (b) {
            if (this.infoData.befstep && this.infoData.befstep != this.myUid) {
                var _isHaveBest = false;
                this.betTouShuObj = this._getTouShuObj(this.infoData.lastcard);
                this.playerObj[this.myUid].infoData.convertCardArr = this.playerObj[this.myUid].infoData.convertCardArr || [];
                for (var i = this.playerObj[this.myUid].infoData.convertCardArr.length - 1; i >= 0; i--) {
                    var _obj = this.playerObj[this.myUid].infoData.convertCardArr[i];
                    if (_obj.touShu != this.betTouShuObj.touShu && _obj.touShu < 4 && this.betTouShuObj.touShu) continue;
                    var _nowCardIndex = Number(_obj._cardIndex);
                    var lastCardIndex = Number(this.betTouShuObj._cardIndex);
                    if (_nowCardIndex <= 2) _nowCardIndex += 13;
                    if (lastCardIndex <= 2) lastCardIndex += 13;

                    if (_obj.touShu > this.betTouShuObj.touShu || (_obj.touShu == this.betTouShuObj.touShu && _nowCardIndex > lastCardIndex)) {
                        this.tuiJianIndex = i;
                        this.nowTuiJianIndex = i + 1;
                        _isHaveBest = true;
                        break;
                    }
                }
                if (!_isHaveBest) {
                    this.scheduleOnce(function () {
                        this._seekBtnCallBackByTag(0);
                    }, 1)
                    this.tuiJianIndex = null;
                    this.nowTuiJianIndex = null;
                } else {
                    if (!this.IsAllAuto) {
                        this._seekBtnCallBackByTag(1);
                    }
                }
            } else {
                this.tuiJianIndex = 0;
                this.nowTuiJianIndex = this.playerObj[this.myUid].infoData.convertCardArr.length;
                if (!this.IsAllAuto) {
                    this._seekBtnCallBackByTag(1);
                }
            }

        }
        this.sendCardBtnLayer.setVisible(b);
    },
    _getIndexByUid: function (_uid) {
        var _nowIndex = null;
        for (var i = 0; i < this.personData.person.length; i++) {
            if (this.personData.person[i].uid == this.myUid) {
                this.severChair = i;
            }
            if (this.personData.person[i].uid == _uid) {
                _nowIndex = i;
            }
        }
        _nowIndex = ((_nowIndex - this.severChair) + WOLONGMAXPLAYER) % WOLONGMAXPLAYER;
        return _nowIndex;
    },
    update: function (dt) {

    },
    _getTouShuObj: function (_arr) {
        var _obj = {};
        var _isDuPai = true;
        if (_arr.length < 3) _isDuPai = false;
        else {
            var krr = [];
            for (var i = 0; i < _arr.length; i++) {
                krr[parseInt(_arr[i] / 10)] = krr[parseInt(_arr[i] / 10)] || 0;
                krr[parseInt(_arr[i] / 10)]++;
                if (krr[parseInt(_arr[i] / 10)] > 1) {
                    _isDuPai = false;
                    break;
                }
            }
        }
        if (_isDuPai) {
            _obj._cardIndex = 2.5;
            _obj.card = _arr.slice(0);
            _obj.touShu = _arr.length + 4;
            return _obj;
        }
        _obj._cardIndex = parseInt(_arr[0] / 10);
        _obj.card = _arr.slice(0);
        _obj.touShu = _arr.length;
        if ((_obj._cardIndex == 100 || _obj._cardIndex == 200) && _arr.length > 1) {
            var dwNum = 0;
            var xwNum = 0;
            for (var j = 0; j < _arr.length; j++) {
                if (_arr[j] == 1000) {
                    xwNum++;
                } else {
                    dwNum++;
                }
            }
            var maxNum = dwNum > xwNum ? dwNum : xwNum;
            _obj.touShu = _obj.touShu * 2;
            if (_arr.length < 5 && maxNum != _arr.length) {
                if (_arr.length == 2) _obj.touShu = 1;
                else _obj.touShu--;
            }
            else if (_arr.length == 5 && maxNum == 3) _obj.touShu -= 2;
            else if (_arr.length == 6 && maxNum == 3) _obj.touShu -= 3;
            else if (_arr.length == 2 && maxNum == 2) _obj.touShu -= 2;
        }
        return _obj;
    },
});
gameclass.wolongTable.prototype.getSex = function(_uid){
    var sex =  this.playerObj[_uid].personData.sex;
    if(sex == 1 || sex == 2){
        return sex-1;
    }else{
        return 0;
    }
},
gameclass.wolongTable.prototype.onchat = function (data) {
    //cc.log(data)
    var _this = this;
    for (var i = 0; i < 13; i++) {
        if (g_chatstrNew[i] == data.chat) {
            mod_sound.playeffect(g_music["fix_msg_" + (i+1)],false);
            // mod_sound.playeffect(this.getSex(data.uid) == 0 ? nys_manTalk[i + 1] : nys_womanTalk[i + 1]);
        }
    }
    var player = _this.playerObj[data.uid];
    var i = player._index;
    var playernode = ccui.helper.seekWidgetByName(player.node, "playerBg");
    var _node = null;
    if (data.type != 4) {
        var _node = new ccui.Layout();

        var s9 = null;
        if (i == 1) {
            s9 = new cc.Scale9Sprite(res.chatbg_rd);
        } else if(i == 2 || i == 3){
            s9 = new cc.Scale9Sprite(res.chatbg_lt);
        }else {
            s9 = new cc.Scale9Sprite(res.chatbg_ld);
        }

        // s9.setCapInsets(cc.rect(77, 77, 20, 20));
        // s9.setAnchorPoint(cc.p(0, 0));
        // s9.setPosition(cc.p(-15, -15));
        s9.setCapInsets(cc.rect(60, 10, 10, 10));
        s9.setAnchorPoint(cc.p(0, 0));
        s9.setPosition(cc.p(-18, -18));
        s9.setContentSize(s9.getContentSize());
        _node.addChild(s9);
    }

    if (data.type == 1) {
        var helloLabel = new cc.LabelTTF(data.chat, "Arial", 30);
        helloLabel.setAnchorPoint(cc.p(0, 0));
        helloLabel.setColor(cc.color(0, 0, 0));
        // helloLabel.y += 20;
        _node.addChild(helloLabel);

        if (i == 1) {
            _node.setPosition(cc.p(-(helloLabel.getContentSize().width - _node.getContentSize().width), playernode.getContentSize().height))
        } else if(i == 2 || i == 3){
            _node.setPosition(cc.p(0, -helloLabel.getContentSize().height))
        }else {
            _node.setPosition(cc.p(0, playernode.getContentSize().height))
        }
        s9.setContentSize(helloLabel.getContentSize().width + 30, helloLabel.getContentSize().height + 30);
    } else if (data.type == 2) {

        var index = Math.floor(Number(data.chat));
        var _dh = 80;
        var _dw = 80;
        var spr = new cc.Sprite();
        spr.initWithFile(g_face[index]);
        spr.setAnchorPoint(cc.p(0.5, 0.5));
        spr.setPosition(cc.p(_dw / 2, _dh / 2));
        // if(spr.getContentSize().height>spr.getContentSize().width){
        //     spr.setScale(_dh/spr.getContentSize().height);
        // }else{
        //     spr.setScale(_dw/spr.getContentSize().width);
        // }
        spr.setScale(1.5);
        _node.addChild(spr);

        if (i == 1 || i == 2 || i == 3) {
            _node.setPosition(cc.p(-50, playernode.getContentSize().height));
        } else {
            _node.setPosition(cc.p(100, playernode.getContentSize().height))
        }
        s9.setContentSize(spr.getContentSize().width + 30, spr.getContentSize().height + 30);
        s9.setVisible(false);
    } else if (data.type == 3) {
        gameclass.mod_platform.playurl(data.chat);

        var spr = new cc.Sprite();
        spr.initWithFile(res.soundopen2);
        spr.setAnchorPoint(cc.p(0.5, 0.5));
        spr.setPosition(cc.p(spr.getContentSize().width / 2, spr.getContentSize().height / 2));

        _node.addChild(spr);

        if (i == 1 || i == 2 || i == 3) {
            _node.setPosition(cc.p(-50, playernode.getContentSize().height));
        } else {
            _node.setPosition(cc.p(100, playernode.getContentSize().height))
        }
    } else if (data.type == 4) {
        var _senderObj = JSON.parse(data.chat);
        var _animateNode = new cc.Node();
        _animateNode.setScale(0.8);
        mod_sound.playeffect(g_music["magic" + _senderObj.type], false);
        _senderObj.type += 1;
        var sucAnim = sp.SkeletonAnimation.createWithJsonFile(g_magic_chat["magic_chat_" + _senderObj.type + "_1_json"], g_magic_chat["magic_chat_" + _senderObj.type + "_1_atlas"]);
        sucAnim.setAnimation(0, 'animation', false);
        sucAnim.setAnchorPoint(0.5, 0.5);
        _animateNode.addChild(sucAnim);
        var senderPos = _this.playerObj[data.uid]._pos;
        _animateNode.setPosition(senderPos);
        var hitPos = null;
        var player = _this.playerObj[_senderObj.hitUid];
        hitPos = player._pos;
        this.chatAnimationLayer.addChild(_animateNode);
        _animateNode.runAction(cc.sequence(cc.delayTime(1), cc.spawn(cc.rotateTo(0.5, 360), cc.moveTo(0.5, hitPos)), cc.callFunc(function (_animateNode, sucAnim) {
            sucAnim.removeFromParent(true);
            var sucAnim1 = sp.SkeletonAnimation.createWithJsonFile(g_magic_chat["magic_chat_" + _senderObj.type + "_2_json"], g_magic_chat["magic_chat_" + _senderObj.type + "_2_atlas"]);
            sucAnim1.setAnimation(0, 'animation', false);
            sucAnim1.setAnchorPoint(0.5, 0.5);
            _animateNode.addChild(sucAnim1);
            _animateNode.scheduleOnce(function () {
                _animateNode.removeFromParent(true)
            }, 1)
        }, _animateNode, sucAnim)))
    }
    if (_node) {
        playernode.addChild(_node);

        var seq = cc.sequence(cc.delayTime(3), cc.callFunc(function () {
            _node.removeFromParent(true);
        }));
        _node.runAction(seq);
    }
};




