/**
 * Created by Administrator on 2017-4-24.
 */
gameclass.hlgc = gameclass.hlgc || {};

gameclass.hlgc.Player = cc.Class.extend({
    parent: null,
    gameUiLayer: null,
    node: null,
    index: null,
    sex: null,

    curCards: null,//手牌数组
    curCardsSP: null,//手牌精灵数组

    pengGangArr: null,//
    pengGangNodeArr: null,//

    flowerArr: null,//花牌数组

    startPos: null,
    drawCardPos: null,
    sendCardPos: null,
    pengGangPos: null,

    expressionPosArr: null,

    name_text: null,
    scoreBg: null,
    score_text: null,
    head_img: null,
    _headContain: null,
    _masterIcon: null,
    operateSp: null,
    zhuang_img: null,

    isQiPai: false,

    talkText: null,
    voiceSp: null,

    haveOutPoke: false,
    specialOperate: false,//是否自己有特殊操作，可以碰。杠。。

    queType: null,//1、2、3
    isQue: true,//是否还有缺门的牌
    isHasHu: false,//是否已经胡牌
    hasDelete: false,//因为换三张的时候最后一个人不会收到gamethree消息,所以用这个变量看这个人是否已经删除那三张
    isTing: false,
    //:false,
    Jiang: 0,//将的标志
    gangNum: null,//点击杠的牌
    _data: null,
    _game: null,
    offLineImg: null,
    _tingCardArr: [],
    _myId:null,
    isHaveSendCard:null,
    jokerCards:null,
    tingtohand:null,
    laizishu:0,  //不管癞子皮
    ctor: function (node, index, gameUiLayer, controlLayer, parent) {
        this.node = node;
        this.index = index;
        this.parent = parent;
        this.gameUiLayer = gameUiLayer;
        this.controlLayer = controlLayer;

        this.curCards = [];
        this.jokerCards = [];
        this.curCardsSP = [];

        this.pengGangArr = [];
        this.pengGangNodeArr = [];
        this.expressionPosArr = [];
        this.flowerArr = [];
        this.mahNodeArr = [];
        this.slectArr = [];
        this.huLogoSP = [];
        this.tingtohand = {};
        this._myId = null;
        this.isHaveSendCard = false;
        //this.ignoreCard = [];

        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.expressionPosArr.push(ccui.helper.seekWidgetByName(this.gameUiLayer, "expressionNode" + i).getPosition());
            this.mahNodeArr[i] = ccui.helper.seekWidgetByName(this.gameUiLayer, "mah" + i);
            this.huLogoSP[i] = ccui.helper.seekWidgetByName(this.gameUiLayer, "hulogo" + i);
            this.huLogoSP[i].setVisible(false);
        }

        var startPosArr = [cc.p(30, 30), cc.p(950, 140), cc.p(835, 550), cc.p(160, 540)];
        var pengGangPosArr = [cc.p(50, 80), cc.p(950, 150), cc.p(795, 580), cc.p(160, 540)];
        var drawCardPosArr = [cc.p(1030, 30), cc.p(950, 572), cc.p(300, 550), cc.p(160, 140)];

        this.CONST_STARTPOS = startPosArr[this.index];
        this.CONST_PENGGANGPOS = pengGangPosArr[this.index];
        this.drawCardPos = drawCardPosArr[this.index];

        this.name_text = ccui.helper.seekWidgetByName(this.node, "playerName");
        this.scoreBg = ccui.helper.seekWidgetByName(this.node, "scoreBG");
        this.score_text = ccui.helper.seekWidgetByName(this.node, "playerscore0");
        this.betTxt = ccui.helper.seekWidgetByName(this.node, "betTxt");
        this.betTxt.setString("");

        this.offLineImg = ccui.helper.seekWidgetByName(this.node, "offLine");
        this.offLineImg.setVisible(false);

        this.voiceSp = ccui.helper.seekWidgetByName(this.node, "voice");
        this.voiceSp.setVisible(false);

        this.operateSp = this.node.getChildByName("operateSp");
        if (this.index == 1) {
            this.voiceSp.setPosition(-50, 100);
            this.operateSp.setPosition(-50, 120);
        }
        this.head_img = ccui.helper.seekWidgetByName(this.node, "headBg");
        this._headContain = ccui.helper.seekWidgetByName(this.node, "headContain");
        this._masterIcon = ccui.helper.seekWidgetByName(this.node, "masterIcon");
        this.c = ccui.helper.seekWidgetByName(this.node, "cBtn0");

        this._masterIcon.setVisible(false);

        this.handNode = new cc.Layer();
        this.controlLayer.addChild(this.handNode, this.index * -1 + 100);
        this.zhuang_img = ccui.helper.seekWidgetByName(this.node, "zhuang");
        this.zhuang_img.setVisible(false);
        this.addHeadClick();
        this.bindEvent();


        this.readyIcon = ccui.helper.seekWidgetByName(this.node, "readyIcon");
        if (this.index == 0) {
            this.readyIcon.setPosition(this.node.getContentSize().width / 2, this.node.getContentSize().height + 30);
        } else if (this.index == 1) {
            this.readyIcon.setPosition(-this.node.getContentSize().width + 50, this.node.getContentSize().height / 2 + 20);
        } else if (this.index == 2) {
            this.readyIcon.setPosition(this.node.getContentSize().width / 2, -20);
        } else {
            this.readyIcon.setPosition(this.node.getContentSize().width + 20, this.node.getContentSize().height / 2 + 20);
        }
        this.initBaseView();
        this.changeTingtohand();


        // if(this.index == 0){
        //     this.curCards = [7,7,8,8,9,9,2,2,3,3,3,4,4,33];
        //     this.checkListen();
        // }
    },
    initBaseView: function () {
        //this.name_text.setString("");
        //
        //this.scoreBg.setVisible(false);
        //this.score_text.setVisible(false);

        this.updateRead(false);
        //this.head_img.removeAllChildren();

       // gameclass.mod_base.showtximg(this.head_img, "" || '', 0, 0, '', false);
    },
    updateRead: function (isReady) {
        this.readyIcon.setVisible(isReady);
    },
    setGame: function ($game) {
        this._game = $game;
    },
    setVisible: function (b) {
        this.node.setVisible(b);
    },
    addHeadClick: function () {
        var _this = this
        this.c.addTouchEventListener(function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) return;
            if (_this._data == null) return;
            if (_this._data.name == null) return;
            var userInfoView = _this._game.uimgr.showui("gameclass.UserInfoView", false);
            userInfoView.updateView(
                _this._data.head,
                _this._data.name,
                "ID：" + _this._data.uid,
                "IP：" + _this._data.uip,
                "地址：" + _this._data.address);
        }, this);
    },
    bindEvent: function () {
        var _this = this;
        var dragBeginPos = cc.p(0, 0);
        this.eventManger = new gameclass.majonLisenter({
            cards: this.curCardsSP,
            plane: this.handNode,
        });
        this.eventManger.on('drag', function (_node, pos) {
            if(gameclass.mod_hlgc.isSmothing)
            {
                if (_this.parent.allSlect) return;
            }
            else
            {
                if (!_this.parent.allSlect) return;
            }
            if (_this.isHasHu) return;
            var _num = _this.curCards[_node.getTag() % 100];
            if (_this.parent.mod_hlgc.isCardsCommon(_num)) return;
            if (_this.isQue) {
                if (_num < (_this.queType - 1) * 10 || _num > (_this.queType) * 10) return;
            }
            _node.setPosition(pos.x - _node.getContentSize().width * 0.5, pos.y - _node.getContentSize().height * 0.5);
            //cc.log('drag');
        });
        this.eventManger.on('dragBegin', function (_node, pos, beginPos) {

            dragBeginPos = beginPos;
            //cc.log('dragbegin');
        });
        this.eventManger.on('dragEnd', function (_node, pos, func) {
            //func();
            if(gameclass.mod_hlgc.isSmothing)
            {
                if (_this.parent.allSlect) return;
            }
            else
            {
                if (!_this.parent.allSlect) return;
            }
            if (pos.y < 120 || _this.curCardsSP.length % 3 != 2) {
                //if(pos.y < 120){
                _node.runAction(cc.sequence(cc.moveTo(0.02, dragBeginPos)));
            }
            var _num = _this.curCards[_node.getTag() % 100]
      //////////////////////////////////////////////////////////////////////////////////////
      //      if (_this.isTing) {
      //          if (_this.gameUiLayer.getChildByTag(112233)) {
      //              _this.gameUiLayer.removeChildByTag(112233);
      //          }
      //          var brr = [];
      //          for (var i = 0; i < _this.tingArr.length; i++) {
      //              if (_node.getTag() % 100 == _this.tingArr[i].huIndex && !_this.curCardsSP[_node.getTag() % 100].isSelect) {
      //                  var index = brr.indexOf(_this.tingArr[i].huCard);
      //                  if (index < 0) {
      //                      brr.push(_this.tingArr[i].huCard);
      //                  }
      //              }
      //          }
      //          _this.parent.showTingWindow(brr);
      //      }
            //////////////////////////////////////////////////////////////////////////////////////

                if ((_this.index == _this.parent.mod_hlgc.curDrawCardIndex || _this.specialOperate) && _this.curCardsSP.length % 3 == 2) {
                    if (!_this.isQue) {
                        _this.sendCard(_node,dragBeginPos);
                    } else {
                        if (_num > (_this.queType - 1) * 10 && _num < (_this.queType) * 10) {
                            _this.sendCard(_node,dragBeginPos);
                        } else {
                            _this.checkCard(-1);
                            _node.isSelect = false;
                        }
                    }
                } else {
                    //_this.checkCard(-1);
                    _this.checkCard(-1);
                    _node.isSelect = false;
                }

            for (var i = 0; i < _this.curCardsSP.length; i++) {
                //_this.curCardsSP[i].setPositionY(_this.startPos.y);
                _this.curCardsSP[i].isSelect = false;
            }
            _node.isSelect = true;
            _this.checkCard(_num);
    ////// //////////////////////////////////////////////////////////////////////////////////////
            //if (pos.y < 120 || _this.curCardsSP.length % 3 != 2) {
            //    //if(pos.y < 120){
            //    _node.runAction(cc.sequence(cc.moveTo(0.02, dragBeginPos)));
            //}
            //else if (_this.isQue) {
            //    if (_num < (_this.queType - 1) * 10 || _num > (_this.queType) * 10) return;
            //    else _this.sendCard(_node, dragBeginPos);
            //}
            //else {
            //    _this.sendCard(_node, dragBeginPos);
            //}

        });
        this.eventManger.on('slide', function (_node) {
            if (!_this.parent.allSlect) return;
            if (_this.isHasHu) return;
            var _num = _this.curCards[_node.getTag() % 100];

            if (_this.isQue) {
                if (_num < (_this.queType - 1) * 10 || _num > (_this.queType) * 10) return;
            }
            for (var i = 0; i < _this.curCardsSP.length; i++) {
                _this.curCardsSP[i].up = false;
                if (_node.getTag() == _this.curCardsSP[i].getTag()) {
                    if (!_this.curCardsSP[i].up) {
                        _this.curCardsSP[i].up = true;
                    }
                    if (_this.curCardsSP[i].up) {
                        _this.curCardsSP[i].y = 30;
                    }
                } else {
                    _this.curCardsSP[i].up = false;
                    _this.curCardsSP[i].y = _this.startPos.y;
                }
            }
            //cc.log('slide');
        });
        this.eventManger.on('slideBegin', function (_node) {
            //cc.log('slidebegin');
            // if(this.parent.mod_hlgc.isCardsCommon(cardNum)){
            //     gameclass.showText("混不可以打出!");
            //     // this._game.uimgr.showui("gameclass.msgboxui").setString("混不可以打出!");
            //     return;
            // }
        });
        this.eventManger.on('slideEnd', function (_node) {
            if (!_this.parent.allSlect) return;
            _node.isSelect = true;
            //cc.log('slideEnd');
        });
        this.eventManger.on('click', function (_node) {

            if (_this.isHasHu) return;
            // if (!_this.parent.allSlect) {
            //     var _index = _node.getTag() % 100;
            //     _this.changeSlectArr(_index);
            //     return;
            // }
            var _num = _this.curCards[_node.getTag() % 100];
            //if(_this.isQue){
            //    if(_num < (_this.queType-1) *10 || _num > (_this.queType)*10){
            //        return;
            //    }
            //}
            //-------------------点击杠的牌显示杠----------------------
            //var show = false;
            //if(!_this.hasPass  && _this.curCards.length%3 == 2){
            //    _this.gangNum = null;
            //    for(var i = 0;i < _this.ignoreCard.length;i++){
            //        if(_this.ignoreCard[i] == _num){
            //            show = true;
            //            _this.gangNum = _num;
            //            break;
            //        }
            //    }
            //}
            //_this.parent.resetBtnState(show);
            //------------------tinglogic--------------------------
            if (_this.isTing) {
                if (_this.gameUiLayer.getChildByTag(112233)) {
                    _this.gameUiLayer.removeChildByTag(112233);
                }
                var brr = [];
                for (var i = 0; i < _this.tingArr.length; i++) {
                    if (_node.getTag() % 100 == _this.tingArr[i].huIndex && !_this.curCardsSP[_node.getTag() % 100].isSelect) {
                        var index = brr.indexOf(_this.tingArr[i].huCard);
                        if (index < 0) {
                            brr=_this.tingArr[i].huCard;
                        }
                    }
                }
                _this.parent.showTingWindow(brr);
            }
            if(gameclass.mod_hlgc.isSmothing) return;
            //------------------------------------------------------
            if (_node.isSelect)
            {
                if ((_this.index == _this.parent.mod_hlgc.curDrawCardIndex || _this.specialOperate) && _this.curCardsSP.length % 3 == 2) {
                    if (!_this.isQue) {
                        _this.sendCard(_node);
                    } else {
                        if (_num > (_this.queType - 1) * 10 && _num < (_this.queType) * 10) {
                            _this.sendCard(_node);
                        } else {
                            _node.isSelect = false;
                            _node.setPositionY(_this.startPos.y);
                            _this.checkCard(-1);
                        }
                    }
                } else {
                    _node.setPositionY(_this.startPos.y);
                    _node.isSelect = false;
                    _this.checkCard(-1);
                }
                return;
            }
            for (var i = 0; i < _this.curCardsSP.length; i++) {
                _this.curCardsSP[i].setPositionY(_this.startPos.y);
                _this.curCardsSP[i].isSelect = false;
            }
            _this.checkCard(_num);
            _node.isSelect = true;
            _node.y += 20;

        });
    },
    sendCardCheckListen: function (index) {
        this._tingCardArr = [];
        if (this.tingArr == null) return;
        for (var i = 0; i < this.tingArr.length; i++) {
            if (index == this.tingArr[i].huIndex) {
                //var existIndex = this._tingCardArr.indexOf(this.tingArr[i].huCard);
                //if (existIndex < 0) {
                //    this._tingCardArr.push(this.tingArr[i].huCard);
               // }
                this._tingCardArr=this.tingArr[i].huCard;
                break;
            }
        }
    },
    initData: function () {
        this.curCards = [];
        this.pengGangArr = [];
        this.flowerArr = [];

        this.queType = null;
        this.isQue = true;
        this.isHasHu = false;
        this.isQiPai = false;

        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.huLogoSP[i].setVisible(false);
        }
    },

    changeSlectArr: function (_index) {
        if (this.curCardsSP[_index].isSelect) return;

        var saveNum = this.slectArr.shift();
        this.slectArr.push(_index);

        this.curCardsSP[saveNum].isSelect = false;
        this.curCardsSP[_index].isSelect = true;

        for (var i = 0; i < this.curCardsSP.length; i++) {
            if (this.curCardsSP[i].isSelect) {
                this.curCardsSP[i].setPositionY(this.startPos.y + 20);
            } else {
                this.curCardsSP[i].setPositionY(this.startPos.y);
            }
        }
    },

    slectIndex: function () {
        var arr = [[], [], []];
        for (var i = 0; i < this.curCards.length; i++) {
            if (this.curCards[i] < 10) arr[0].push(this.curCards[i]);
            else if (this.curCards[i] > 10 && this.curCards[i] < 20) arr[1].push(this.curCards[i]);
            else arr[2].push(this.curCards[i]);
        }
        var brr = [];
        for (var i = 0; i < 3; i++) {
            var obj = {"index": i, "len": arr[i].length};
            brr.push(obj);
        }
        brr.sort(function (a, b) {
            return a.len - b.len;
        })
        for (var i = 0; i < brr.length; i++) {
            if (brr[i].len >= 3) {
                var type = brr[i].index;
                if (type == 0) {
                    this.slectArr = [0, 1, 2];
                } else if (type == 1) {
                    var len = arr[0].length;
                    this.slectArr = [len, len + 1, len + 2];
                } else {
                    var len = arr[0].length + arr[1].length;
                    this.slectArr = [len, len + 1, len + 2];
                }
                this.showSystemCard();
                return;
            }
        }
    },

    getSlectedCard: function () {
        var arr = [];
        for (var i = 0; i < 3; i++) {
            arr[i] = this.curCards[this.slectArr[i]];
        }
        return arr;
    },

    showSystemCard: function () {
        for (var i = 0; i < this.curCardsSP.length; i++) {
            this.curCardsSP[i].isSelect = false;
        }
        for (var i = 0; i < 3; i++) {
            this.curCardsSP[this.slectArr[i]].isSelect = true;
            this.curCardsSP[this.slectArr[i]].setPositionY(this.startPos.y + 20);
        }
    },

    checkCard: function (_num) {
        //桌子上的牌变灰
        this.parent.checkTableCard(_num);
    },
    setBaseInfo: function (data) {
        data = data || {};
        this._data = data;
        this.sex = data.sex;
        //不用点击显示的信息
        this.name_text.setString(data.name || "");
        //this.name_text.setString(data.id || "");
        this._myId = data.id;
        //var paoString = ["不跑","跑1","跑2"];
        //var ss = paoString[data.paonum].toString();
       // this.betTxt.setString("跑2");
        this.score_text.setString(data.total.toString() || "");
        if (data.name) {
            this.scoreBg.setVisible(true);
            this.score_text.setVisible(true);
        } else {
            this.scoreBg.setVisible(false);
            this.score_text.setVisible(false);
            this.readyIcon.setVisible(false);
        }

        if(data.line)
        {
            this.offLineImg.setVisible(false);
        }
        else
        {
            this.offLineImg.setVisible(true);
        }


        if (data.head != null) {
            //点击显示的信息
            gameclass.mod_base.showtximg(this.head_img, data.head || '', 0, 0, '', !data.line);
        } else {
            this.head_img.removeAllChildren();
        }

    },


    setQueState: function (_bet) {

    },

    showSlectLayout: function (slectArr) {
        if (slectArr.length < 3) {//这个只是告诉你哪些人选牌了
            if (this.index == 0) {
                this.parent.setSlectVisable(true);
                this.slectIndex();
            }
            this.hasDelete = false;
        } else if (slectArr.length == 3) {
            if (this.index == 0) {
                this.parent.setSlectVisable(false);
            }
            this.mahNodeArr[this.index].setVisible(true);
            this.curCards = this.deleArr(this.curCards, slectArr);
            this.hasDelete = true;
            this.renderAllCard();
        }
    },

    allSlectThree: function (buArr, removeArr) {
        if (!this.hasDelete) {
            this.curCards = this.deleArr(this.curCards, removeArr);
        }
        if (this.index == 0) {
            for (var i = 0; i < buArr.length; i++) {
                this.curCards.push(buArr[i]);
            }
            this.curCards.sort(function (a, b) {
                return a - b;
            });
        } else {
            if (this.curCards.length < 13) {
                this.curCards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            }
        }
        this.renderAllCard();
        if (this.index == 0) {
            var arr = [];
            for (var i = 0; i < this.curCards.length; i++) {
                if (this.curCards[i] == buArr[0]) {
                    buArr.splice(0, 1);
                    arr.push(i);
                }
            }
            for (var i = 0; i < arr.length; i++) {
                this.curCardsSP[arr[i]].setPositionY(this.startPos.y + 20);
            }
        }
    },

    changeShow: function () {
        this.mahNodeArr[this.index].setVisible(false);
        this.parent.setSlectVisable(false);
    },

    showTableMah: function () {
        this.mahNodeArr[this.index].setVisible(true);
    },
    dealOtherCard: function () {
        this.renderAllCard();
    },
    //_this.parent.mod_hlgc.gameInfo.Razz
    mySort: function () {
        var mySaveArr = [];
        this.curCards.sort(function (a, b) {
            return a - b;
        });
        // if (this.queType && this.queType > 0) {
        //     for (var i = 0; i < this.curCards.length; i++) {
        //         if (this.curCards[i] > (this.queType - 1) * 10 && this.curCards[i] < this.queType * 10) {
        //             mySaveArr.push(this.curCards[i]);
        //         }
        //     }
        // }
        // if (mySaveArr.length > 0) {
        //     this.isQue = true;
        // } else {
        this.isQue = false;
        //     return;
        // }
        // for (var i = 0; i < this.curCards.length; i++) {
        //     if (this.curCards[i] > (this.queType - 1) * 10 && this.curCards[i] < this.queType * 10) {
        //         this.curCards.splice(i, mySaveArr.length);
        //         break;
        //     }
        // }
        // for (var i = 0; i < mySaveArr.length; i++) {
        //     this.curCards.push(mySaveArr[i]);
        // }
        var cardsCommonArr = [];
        for (var i = this.curCards.length - 1; i >= 0; i--) {
            if (this.parent.mod_hlgc.isCardsCommon(this.curCards[i])) {
                cardsCommonArr.push(this.curCards.splice(i, 1)[0]);
            }
        }
        this.curCards = cardsCommonArr.concat(this.curCards);
        var test;
    },


    renderAllCard: function () {
        this.handNode.removeAllChildren();
        this.startPos = cc.p(this.CONST_STARTPOS);
        this.pengGangPos = cc.p(this.CONST_PENGGANGPOS);
        this.renderPengGangCardView();
        this.renderHandCardView();
        if (this.index == 0) {
            this.eventManger.setCardsArr(this.curCardsSP);
            this.eventManger._isDrag = this.eventManger._isTouch = this.eventManger._isInvalid = false;
        }
    },

    renderPengGangCardView: function () {
        for (var i = 0; i < this.pengGangArr.length; i++) {
            var box = new gameclass.OpBox(this.pengGangArr[i]);
            // cc.log("this.pengGangArr[i]=="+this.pengGangArr[i].nums[0])
            box.setAnchorPoint(0, 0);
            box.setPosition(this.pengGangPos);
            box.setTag((this.index + 1) * 1000 + i);
            switch (this.index) {
                case 0:
                    this.startPos.x += box.getContentSize().width;
                    this.pengGangPos.x += box.getContentSize().width;
                    break;
                case 1:
                    this.startPos.y = this.startPos.y + box.getContentSize().height - 10;
                    this.pengGangPos.y = this.pengGangPos.y + box.getContentSize().height - 10;
                    box.setLocalZOrder(20 - i);
                    // cc.log("this.startPos.y="+this.startPos.y+",,,,this.pengGangPos.y="+this.pengGangPos.y);
                    break;
                case 2:
                    this.startPos.x -= box.getContentSize().width;
                    this.pengGangPos.x -= box.getContentSize().width;
                    break;
                case 3:
                    this.startPos.y = this.startPos.y - box.getContentSize().height + 10;
                    this.pengGangPos.y = this.pengGangPos.y - box.getContentSize().height + 10;
                    break;
            }
            this.handNode.addChild(box);
        }
    },
    renderHandCardView: function () {
        this.createMyPokerWithArr(this.curCards);
        if (!this.curCardsSP || this.curCardsSP.length < 1) {
            return false;
        }

        if (this.index == 1) {
            this.startPos.y += 5;
        } else if (this.index == 3) {
            this.startPos.y += 15;
        }

        var len = this.curCardsSP.length;
        for (var i = 0; i < len; i++) {
            var cardSp = this.curCardsSP[i];
            cardSp.setAnchorPoint(0, 0);
            cardSp.setTag(100 + i);
            // cc.log(this.index+",i="+i+",this.startPos="+this.startPos.x+","+this.startPos.y);
            cardSp.setPosition(this.startPos);
            switch (this.index) {
                case 0:
                    this.startPos.x += (cardSp.getContentSize().width - 2) * cardSp.getScale();
                    this.pengGangPos.x += (cardSp.getContentSize().width - 2) * cardSp.getScale();
                    break;
                case 1:
                    this.startPos.y += (cardSp.getContentSize().width - 2) * cardSp.getScale();
                    this.pengGangPos.y += (cardSp.getContentSize().width - 2) * cardSp.getScale();
                    cardSp.setLocalZOrder(20 - i);
                    break;
                case 2:
                    this.startPos.x -= (cardSp.getContentSize().width - 5) * cardSp.getScale();
                    this.pengGangPos.x -= (cardSp.getContentSize().width - 5) * cardSp.getScale();
                    break;
                case 3:
                    this.startPos.y -= (cardSp.getContentSize().width - 2) * cardSp.getScale();
                    this.pengGangPos.y -= (cardSp.getContentSize().width - 2) * cardSp.getScale();
                    cardSp.setLocalZOrder(i);
                    break;
            }
            //设置起牌位置
            if (this.isQiPai && i == len - 1) {
                if (this.index == 1) {
                    var targetpos = cc.p(this.drawCardPos.x, this.startPos.y - 20);
                    if (targetpos.y > this.drawCardPos.y) {
                        targetpos.y = this.drawCardPos.y;
                    }
                    cardSp.setPosition(targetpos);
                } else if (this.index == 2) {
                    var targetpos = cc.p(this.startPos.x - 0, this.drawCardPos.y);
                    if (targetpos.x < this.drawCardPos.x) {
                        targetpos.x = this.drawCardPos.x;
                    }
                    cardSp.setPosition(targetpos);
                } else if (this.index == 3) {
                    var targetpos = cc.p(this.drawCardPos.x, this.startPos.y - 8);
                    if (targetpos.y < this.drawCardPos.y) {
                        targetpos.y = this.drawCardPos.y;
                    }
                    cardSp.setPosition(targetpos);
                } else {
                    cardSp.setPosition(this.drawCardPos);
                }
            }
            cardSp.isSelect = false;//是否被选中
            // cc.log("handCardPos:"+cardSp.getPositionY());
            this.handNode.addChild(cardSp);
        }
    },

    createMyPokerWithArr: function (_arr) {
        this.curCardsSP = [];
        this.laizishu = 0;
        for (var i = 0; i < _arr.length; i++) {
            var cardSp = gameclass.hlgc.Table.CreateCard(_arr[i], this.index, 0, this.index == 0 ? 0 : 1);
            if(this.parent.mod_hlgc.isCardsCommon(_arr[i])){
                var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
                cardSp.addChild(logo);
                logo.setPosition(20, 85);
            }
            if(this.parent.mod_hlgc.gameInfo.Razz.length>1&&this.parent.mod_hlgc.gameInfo.Razz[1]==_arr[i]){
                this.laizishu++;
            }
            else if(this.parent.mod_hlgc.gameInfo.Razz.length==1&&this.parent.mod_hlgc.gameInfo.Razz[0]==_arr[i]){
                this.laizishu++;
            }
            if (this.isHasHu) {
                cardSp.setColor(new cc.color(127, 127, 127));
                this.huLogoSP[this.index].setVisible(true);
                this.huLogoSP[this.index].setLocalZOrder(8888);
            }
            if (this.isQue && this.queType && this.queType > 0) {
                if (_arr[i] < (this.queType - 1) * 10 || _arr[i] > this.queType * 10) {
                    cardSp.setColor(new cc.color(127, 127, 127));
                }
            }
            if (cardSp) this.curCardsSP[i] = cardSp;//加到手牌精灵数组
        }
    },

    reflashScore: function (_scoreNum) {
        this.score_text.setString(_scoreNum);
    },

    onDrawCard: function (cardNum) {
        if (this.index == 0) {
            this.haveOutPoke = false;
            this.isQiPai = true;
            this.mySort();

            if (cardNum < this.queType * 10 && cardNum > (this.queType - 1) * 10) {
                this.isQue = true;
            }
            this.curCards.push(cardNum);
            this.renderAllCard();
            this.checkListen();

            this.parent.createTingContinue([]);
        } else {
            this.isQiPai = true;

            this.curCards.push(cardNum);
            this.renderAllCard();
        }
        //this.hasPass = false;
    },

    getGangNum: function (lastNum) {
        var acObj = {};
        if (lastNum) {
            if (!acObj[lastNum]) {
                acObj[lastNum] = 0;
            }
            acObj[lastNum]++;
        }

        for (var x in this.curCards) {
            var key = this.curCards[x];
            if (!acObj[key]) {
                acObj[key] = 0;
            }
            acObj[key]++;
        }

        for (var x in this.pengGangArr) {
            if (this.pengGangArr[x].type == "peng") {
                var key = this.pengGangArr[x].nums[0];
                if (!acObj[key]) {
                    acObj[key] = 0;
                }
                if (key != lastNum) {
                    acObj[key] += 3;
                }
            }
        }
        var resulrArr = [];
        for (var x in acObj) {
            if (acObj[x] >= 4) {
                resulrArr.push(parseInt(x));
            }
        }
        if (
            this.curCards.indexOf(StaticData.WIND_DONG) >= 0 &&
            this.curCards.indexOf(StaticData.WIND_NAN) >= 0 &&
            this.curCards.indexOf(StaticData.WIND_XI) >= 0 &&
            this.curCards.indexOf(StaticData.WIND_BEI) >= 0
        ) {
            resulrArr.push(StaticData.WIND_GANG);
        }
        return resulrArr;
    },

    //出牌
    sendCard: function (_nodeSp, dragBeginPos) {
        var cardIndex = _nodeSp.getTag() % 100;

        this.sendCardCheckListen(cardIndex);

        this.cardIndex = cardIndex;
        var cardNum = this.curCards[cardIndex];


        if (this.parent.mod_hlgc.isCardsCommon(cardNum)) {
            gameclass.showText("混不可以打出!");
            // this._game.uimgr.showui("gameclass.msgboxui").setString("混不可以打出!");
            return;
        }


        //this.parent.outPokerManager.setCurOutStartPos( _nodeSp.getPosition());
        var _this = this;
        if(_this.isHaveSendCard)
        {
            return;
        }
        else
        {
            this.parent.sendCard(cardNum, function () {
                if (dragBeginPos) {
                    _nodeSp.runAction(cc.sequence(cc.moveTo(0.1, dragBeginPos)));
                }
            }, this.haveOutPoke, this.specialOperate);
        }
        _this.isHaveSendCard = true;
        // cc.log("点击的牌:"+ cardNum);
    },
    //接收到广播出牌消息
    onSendCard: function (_index,cardNum) {
        this.isQiPai = false;
        this.isHaveSendCard = false;
        if (this.index == 0) {
            this.haveOutPoke = true;
            this.specialOperate = false;
            this.isTing = false;

            if (this.gameUiLayer.getChildByTag(112233)) {
                this.gameUiLayer.removeChildByTag(112233);
            }
        }
        if (this.index != 0) {
            this.cardIndex = this.curCards.length - 1;
        }
        else
        {
            this.cardIndex =  this.curCards.indexOf(cardNum);
        }
        this.checkCard(-1);//出牌的时候让牌恢复正常颜色
        this.curCards.splice(this.cardIndex, 1);
        this.mySort();
        this.renderAllCard();

        //var _mrr=[null,null,null,null];
        //for(var i=0;i<this.parent.mod_hlgc.gameInfo.info.length;i++){
        //    if(!this.parent.mod_hlgc.gameInfo.info[i]||this.parent.mod_hlgc.gameInfo.info[i].seat<0) continue;
        //    _mrr[(this.parent.mod_hlgc.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.parent.mod_hlgc.gameInfo.info[i]);
        //}
        this.parent.outPokerManager.flyMajonAct(this.index, cardNum);
        if (this.index == 0) {


            this.parent.createTingContinue(this._tingCardArr);
        }
    },

    onPeng: function (cardNum, dif_index, $pengbackIndex) {
        this.pengGangArr.push({type: 'peng', index: this.index, nums: [cardNum], pengbackIndex: $pengbackIndex});
        if (this.index == 0) {
            this.haveOutPoke = false;
            this.specialOperate = false;
            for (var i = 0; i < this.curCards.length; i++) {
                if (this.curCards[i] == cardNum) {
                    this.curCards.splice(i, 2);
                    break;
                }
            }
            this.parent.createTingContinue([]);
        } else {
            this.curCards.splice(0, 2);
        }
        this.renderAllCard();
        this.showControlAct(0);
    },
    //碰牌后，拉一张牌放到摸牌位置
    pengDragOne: function () {
        var lastCard = this.curCards.splice(this.curCards.length - 1, 1)[0];
        this.onDrawCard(lastCard);
    },
    //type为杠的类型，0为暗杠，1为明杠、2为擦杠
    onGang: function (cardNum, type) {
        if (type != 2) {
            this.pengGangArr.push({type: 'gang', index: this.index, nums: [cardNum], gangType: type});
        }
        if (this.index == 0) {
            this.haveOutPoke = false;
            this.specialOperate = false;
            this.curCards.sort(function (a, b) {
                return a - b;
            })
            //旋风杠特殊处理
            if (cardNum == StaticData.WIND_GANG) {
                var gangArr = StaticData.WIND_GANG_ARR;
                for (var i = 0; i < gangArr.length; i++) {
                    for (var j = 0; j < this.curCards.length; j++) {
                        if (this.curCards[j] == gangArr[i]) {
                            this.curCards.splice(j, 1);
                            break;
                        }
                    }
                }
            } else {
                var deleteNum = null;
                if (type == 0) deleteNum = 4;
                else if (type == 1) deleteNum = 3;
                else if (type == 2) deleteNum = 1;
                for (var i = 0; i < this.curCards.length; i++) {
                    if (this.curCards[i] == cardNum) {
                        this.curCards.splice(i, deleteNum);
                        break;
                    }
                }
            }


            this.parent.createTingContinue([]);
        } else {
            if (type == 0) this.curCards.splice(0, 4);
            else if (type == 1) this.curCards.splice(0, 3);
            else this.curCards.splice(0, 1);
        }
        if (type == 2) {
            for (var i = 0; i < this.pengGangArr.length; i++) {
                if (this.pengGangArr[i].nums[0] == cardNum) {
                    this.pengGangArr.splice(i, 1, {type: 'gang', index: this.index, nums: [cardNum], gangType: 2});
                    break;
                }
            }
        }
        this.renderAllCard();
        this.showControlAct(1);
    },

    onHu: function (huIndex, type, huNum) {
        if (this.index == 0) {
            this.specialOperate = false;
        }
        // if (huIndex > 0) {
        this.isHasHu = true;
        this.renderAllCard();
        // }
        if (type == 1) {//如果是自摸
            this.handNode.getChildren()[this.handNode.childrenCount - 1].removeFromParent();
        }
        this.showHuPoke(huNum);
        // this.showControlAct(huIndex + 1);
    },

    deleArr: function (Arr, Brr) {
        var arr = Arr.slice(0);
        var brr = Brr.slice(0);

        for (var i = 0; i < brr.length; i++) {
            if (arr.indexOf(brr[i]) > -1) {
                var j = arr.indexOf(brr[i]);
                arr.splice(j, 1);
            }
        }
        return arr;
    },
    dealCards: function (_cardArr) {
        //test
        // _cardArr = [7, 8, 9, 13, 14, 15, 17, 18, 19, 23, 24, 31, 31, 33];
        // _cardArr = [2, 2, 2, 14, 14, 21, 22, 23, 25, 26, 27, 31, 32, 32];
        // _cardArr = [7, 7, 1, 1, 9, 9, 11, 11, 18, 18, 13, 13, 21, 26]; //七小对测试
        //test end
        this.curCards = _cardArr.slice(0);//存到手牌数组
        if (this.index != 0) {
            return this.dealOtherCard();
        } else {
            return this.dealMyCard();
        }
    },

    dealMyCard: function () {
        this.mySort();
        this.renderAllCard();
        this.eventManger.setCardsArr(this.curCardsSP);

        //test
        // var _this = this;
        // this.node.scheduleOnce(function () {
        //     _this.checkListen();
        // }, 3)
        //test end
    },
    //====================================听牌Logic=====================================================
    changeData: function (arr) {
        var cardArr = [];
        for (var i = 0; i < 38; i++) {
            cardArr[i] = 0;
        }
        for (var i = 0; i < arr.length; i++) {
            cardArr[arr[i]]++;
        }

        return cardArr;
    },
    tingArrHandle1: function () {
        //听牌值
        var result = [];
        for (var i = 0; i < this.tingArr.length; i++) {
            var card = this.tingArr[i]["huIndex"];

            for (var k = 0; k < this.curCards.length; k++) {
                if (this.curCards[k] == card&&this.curCards[k]!=this.laiIndex) {
                    //this.tingArr[i]["huIndex"]=k;
                    var obj = {"huIndex": k, "huCard": this.tingArr[i]["huCard"]};
                    result.push(obj);
                }
            }
        }
        return result;
    },
    tingArrHandle: function () {
        //听牌值
        var result = [];
        for (var i = 0; i < this.tingArr.length; i++) {
            var arr = this.tingArr[i];
            if (arr && i != this.laiIndex) {
            //if (arr) {
                if (arr instanceof Array) {
                    var huCardArr = this.getHuCards(i);
                    cc.log("i:" + i + "-->" + huCardArr.toString());
                    for (var j = 0; j < huCardArr.length; j++) {
                        for (var k = 0; k < this.curCards.length; k++) {
                            if (this.curCards[k] == i) {
                                var obj = {"huIndex": k, "huCard": huCardArr[j]};
                                result.push(obj);
                            }
                        }
                    }
                } else {
                    //arr = 100，可以胡任意牌
                    for (var k = 0; k < this.curCards.length; k++) {
                        if (this.curCards[k] == i) {
                            for (var m = 0; m < StaticData.ALL_CARD.length; m++) {
                                var obj = {"huIndex": k, "huCard": StaticData.ALL_CARD[m]};
                                result.push(obj);
                            }
                        }
                    }
                    cc.log(i + "--->听任意牌");
                }

            }
        }
        return result;
    },
    getHuCards: function (cardNum) {
        var result = [];
        var leftCard = [];
        var backCurCards = this.curCards.concat();
        var index = backCurCards.indexOf(cardNum);
        for (var i = 0; i < backCurCards.length; i++) {
            if (i != index) {
                leftCard.push(backCurCards[i])
            }
        }
        var checkCardArr;
        for (var i = 0; i < StaticData.ALL_CARD.length; i++) {
            checkCardArr = leftCard.concat();
            var card = StaticData.ALL_CARD[i];
            checkCardArr.push(card);
            checkCardArr.sort(function (a, b) {
                return a - b;
            })
            if (this.getHuCardsSub(checkCardArr)) {
                result.push(card);
            }
        }

        // cc.log(cardNum + "---" + result.toString());
        return result;
    },
    getHuCardsSub: function (leftCards) {
        var lainum = 0;
        for (var i = 0; i < leftCards.length; i++) {
            if (this.parent.mod_hlgc.isCardsCommon(leftCards[i])) {
                lainum++;
                leftCards[i] = this.laiIndex;
            }
        }

        leftCards = this.changeData(leftCards);
        leftCards[this.laiIndex] = 0;

        var brr = this._qiDuiLogic(leftCards, lainum, 1);
        var crr = this._huPaiLogic(leftCards, lainum);
        if (brr || crr) return true;
        return false;
    },
    changeArr:function(_show,_newarr){
        //_show  检测听true 听完显示 false

    // 我们的手牌是1-9 条， 11-19 筒  21-29 万 31-34 东南西北 35-37 中发白

    //0-8 9-17 18- 26   万 筒 条   27-33 东南西北中发白（检测）

        //1-9     18-26 条      +17
        //11-19     9-17 筒      -2
        //21-29     0-8 万       -21
        //31-34     27-30 东南西北  -4
        //35-37     31-33 中发白    -4
        var Changecard=[];
        if(_show){
            Changecard=this.curCards.slice(0);
        }else if(_newarr instanceof  Array){
            Changecard=_newarr.slice(0);
        }
        for (var i = 0; i < Changecard.length; i++) {
            if (Changecard[i] < 10){
                if(_show){
                    Changecard[i]+=17;
                }else Changecard[i]-=17;
            }
            else if (Changecard[i] > 10 && Changecard[i] < 20){
                if(_show){
                Changecard[i]-=2;
                }else Changecard[i]+=2;

            }
            else if (Changecard[i] > 20 && Changecard[i] < 30){
                if(_show){
                Changecard[i]-=21;
                }else Changecard[i]+=21;
            }
            else if (Changecard[i] > 30 && Changecard[i] < 38){
                if(_show){
                Changecard[i]-=4;
                }else Changecard[i]+=4;
            }
        }
        return Changecard;
    },
    changeone:function(Changecard){
        //_show  检测听true 听完显示 false

        // 我们的手牌是1-9 条， 11-19 筒  21-29 万 31-34 东南西北 35-37 中发白

        //0-8 9-17 18- 26   万 筒 条   27-33 东南西北中发白（检测）
        //1-9     18-26 条      +17
        //11-19     9-17 筒      -2
        //21-29     0-8 万       -21
        //31-34     27-30 东南西北  -4
        //35-37     31-33 中发白    -4
            if (Changecard < 10){
                    Changecard+=17;

            }
            else if (Changecard > 10 && Changecard < 20){
                    Changecard-=2;
            }
            else if (Changecard > 20 && Changecard < 30){
                    Changecard-=21;
            }
            else if (Changecard > 30 && Changecard < 38){
                    Changecard-=4;
            }
        return Changecard;
    },
    changeTingtohand:function(_obj){
        var obj={};
        var type =0;
        obj[type]=[];
        //万
        for(var i=0;i<=8;i++){
            obj[type][i]=21+i;
        }

        var type =1;
        obj[type]=[];
        //筒
        for(var i=0;i<=8;i++){
            obj[type][i]=11+i;
        }

        var type =2;
        obj[type]=[];
        //条
        for(var i=0;i<=8;i++){
            obj[type][i]=1+i;
        }
        var type =3;
        obj[type]=[];
        //风
        for(var i=0;i<7;i++){
            obj[type][i]=31+i;
        }
        this.tingtohand=obj;
    },
    changeHandArr:function(){
        //万筒 条
        //0-8 9-17 18- 26   万 筒 条
        var obj={};
        var arr=['一', '二', '三', '四', '五', '六', '七', '八', '九'];

        var point =0;
        obj[point]=[];
        for(var i=0;i<=8;i++){
            obj[point][obj[point][arr[i]+'万']=i]=arr[i]+'万'
        }

        var point =1;
        obj[point]=[];
        for(var i=0;i<=8;i++){
            obj[point][obj[point][arr[i]+'筒']=i]=arr[i]+'筒'
        }

        var point =2;
        obj[point]=[];
        for(var i=0;i<=8;i++){
            obj[point][obj[point][arr[i]+'条']=i]=arr[i]+'条'
        }
    },
    //this.parent.mod_hlgc.gameInfo.Razz
    initlaizi:function(){
        //初始化一张癞子
        //var jokersStr = 12;
        var jokerCards =[];
        this.jokerCards=[];
        //var laizi = mahjong.Card.createFromCardID(jokersStr);
        //jokerCards.push(laizi);

        for (var i = 0; i < this.parent.mod_hlgc.gameInfo.Razz.length; i++) {
            var card = this.parent.mod_hlgc.gameInfo.Razz[i];
            var card1=this.changeone(card);
            this.jokerCards[i]=card1;
            var card2=mahjong.Card.createFromCardID(card1);
            jokerCards.push(card2);
        }
        gameclass.mahjong.MahjongTool.init(jokerCards, gameclass.mahjong.tableSource);
        gameclass.mahjong.MahjongTool.allow_7dui=true;
    },
    checkListenByBiao:function(){
        this.tingArr=[];
        //如果手上有四个相同的赖子，直接胡牌
        if(this.laizishu==4){
            var result=[];
            for (var k = 0; k < this.curCards.length; k++) {
                    for (var m = 0; m < StaticData.ALL_CARD.length; m++) {
                        var obj = {"huIndex": k, "huCard": StaticData.ALL_CARD};
                        result.push(obj);
                    }
            }
            this.tingArr=result;
            this.showTingLogo();
            return ;
        }
        ////初始化一张癞子
        //var jokersStr = '二筒';
        //var jokerCards = gameclass.mahjong.MahjongTool.buildCardsByStr(jokersStr);
        var jokersStr =this.jokerCards;
        //var laizi
        var fullCards = [];
        for (var i = 0, len = 34; i < len; i++) {
            if (i != 34) {
                var card = gameclass.mahjong.Card.createFromCardID(i);
                //去掉当前癞子
                if (jokersStr.indexOf(i) == -1) {
                    fullCards.push(card);
                }

            }
        }
        var handCards1=[];
        var handCards=this.changeArr(true);
        //0-8 9-17 18- 26   万 筒 条   27-33 东南西北中发白
        //var handStr=[0,1,2,4,4,18,19,20,21,9,10,11,12]
        for (var i=0;i<handCards.length;i++){
            var cards = mahjong.Card.createFromCardID(handCards[i]);
            handCards1.push(cards)
        }
        handCards1.pop();
        //新摸到的牌
        var mocard=this.curCards[this.curCards.length-1];
         mocard=this.changeone(mocard);
        var mo = mahjong.Card.createFromCardID(mocard);

        var winCards = mahjong.MahjongTool.findWinCardsWhenDraw(handCards1, mo, fullCards);


        //var tingarr=[];
        if (winCards && winCards.length) {
            //可以听牌
            for (var i = 0, len = winCards.length; i < len; i++) {
                var winCard = winCards[i];
                if (winCard) {
                    cc.log(i+"+++++"+winCard.toString());
                    var tingIndex=this.tingtohand[winCard["discard"].type][winCard["discard"].point];
                    var huCardArr=[];
                    for(var j=0;j<winCard["winCards"].length;j++){
                        huCardArr[j]=this.tingtohand[winCard["winCards"][j].type][winCard["winCards"][j].point];
                    }
                    //加入癞子
                    if(this.parent.mod_hlgc.gameInfo.Razz){
                      for(var jj=0;jj<this.parent.mod_hlgc.gameInfo.Razz.length;jj++){
                          if(huCardArr.indexOf(this.parent.mod_hlgc.gameInfo.Razz[jj])==-1){
                              huCardArr.push(this.parent.mod_hlgc.gameInfo.Razz[jj]);
                          }
                      }
                    }

                    var obj = {"huIndex": tingIndex, "huCard": huCardArr};
                    this.tingArr.push(obj);
                }
            }
            this.tingArr=this.tingArrHandle1();
            this.showTingLogo();
        } else {
            //不管打什么，都听不了牌
            //log += '不管打什么都无法听牌\n';
        }
    },
    checkListen:function(){
        this.tingArr = [];
        this.isTing = true;

        this.checkListenByBiao();
    },
    checkListen1: function () {
        this.tingArr = [];
        this.isTing = true;

        //test
        // this.parent.mod_hlgc.gameInfo.Razz = [21, 22]
        //test end

        var backCurCards = this.curCards.concat();
        this.laiIndex = 0;
        if (this.parent.mod_hlgc.gameInfo.Razz && this.parent.mod_hlgc.gameInfo.Razz.length > 0) {
            this.laiIndex = this.parent.mod_hlgc.gameInfo.Razz[0];
        }
        for (var i = 0; i < backCurCards.length; i++) {
            if (backCurCards[i] == this.laiIndex) continue;
            if (this.parent.mod_hlgc.isCardsCommon(backCurCards[i])) {
                backCurCards[i] = this.laiIndex;
            }
        }


        var cardArr = this.changeData(backCurCards);

        for (var i = 0; i < cardArr.length; i++) {
            if (!cardArr[i] || i % 10 == 0) continue;
            var testArr = cardArr.slice(0);
            testArr[i]--;
            this.laiziAcount = testArr[this.laiIndex];
            testArr[this.laiIndex] = 0;
            var lainum = this.laiziAcount;
            lainum++;
            var brr = this._qiDuiLogic(testArr, lainum, 1);
            var crr = this._huPaiLogic(testArr, lainum);

            if(brr==100){
                this.tingArr[i] = 100;
            }else {
                if(!brr)brr=[];
                if(!crr)crr=[];
                var arr=brr.concat(crr);
                if(arr&&arr.length){
                    this.tingArr[i] =arr;
                }
                if(arr==100){
                    this.tingArr[i] = 100;
                }
            }
        }
        this.tingArr = this.tingArrHandle();
        this.showTingLogo();
    },
    _huPaiLogic: function (_cardArr, laiNum) {
        var that = this;
        var isUseDui = false;
        var deguiTime = 0;
        var _callfunc = function (_cardArr, laiNum, huPaiArr) {
            // cc.log("huPaiArr=" + huPaiArr.toString() + "[" + deguiTime + "]" + _cardArr.toString());
            deguiTime++;
            var _useArr = _cardArr.slice(0);
            var _useHuPaiArr = huPaiArr.slice(0);
            var _uselaiNum = laiNum;
            for (var i = 1; i <= 7; i++) {
                if (_uselaiNum - parseInt((i - 1) / 3) < 0) continue;
                if (isUseDui && (i == 2 || i == 5)) continue;
                if (that._getFristType(i, _useArr, huPaiArr)) {
                    if (i == 2 || i == 5) {
                        if (!isUseDui) {
                            isUseDui = true;
                        }
                    }
                    _uselaiNum -= parseInt((i - 1) / 3);
                    var returnCode = _callfunc(_useArr, _uselaiNum, huPaiArr);
                    deguiTime--;
                    if (returnCode == 100) return 100;
                    if (returnCode && isUseDui) {
                        return true;
                    }
                    _useArr = _cardArr.slice(0);
                    _uselaiNum = laiNum;
                    huPaiArr.splice(0);
                    for (var j = 0; j < _useHuPaiArr.length; j++) {
                        huPaiArr[j] = _useHuPaiArr[j];
                    }
                    if (i == 2 || i == 5) {
                        isUseDui = false;
                    }
                }
            }
            var cardLength = 0;
            for (var i = 0; i < _useArr.length; i++) {
                if (_useArr[i]) {
                    cardLength += _useArr[i];
                }
            }
            if (cardLength == 0 && laiNum > 0) {
                return 100;
            }
            if (cardLength == 0) {
                return true;
            }
            return false;
        }
        var huPaiArr = [];
        var returnCode = _callfunc(_cardArr, laiNum, huPaiArr);
        if (returnCode == 100) return 100;
        if (returnCode && isUseDui) {
            // cc.log("huPaiArr---------->"+huPaiArr.toString())
            return huPaiArr;
        }
        return false;
    },
    //this.laiziArr
    _qiDuiLogic: function (_cardArr, laiNum, isMo) {
        if(!isMo){
            if(this.curCards.length != 13) return false;
        }else{
            if(this.curCards.length != 14) return false;
        }
        var _mrr=[];
        var saveArr = _cardArr.slice(0);
        for(var i=0;i<saveArr.length;i++){
            if(saveArr[i]%2 == 1 && laiNum){
                _mrr.push(i);
                if(i != this.parent.laiziNum){//如果不加这个判断，可能会导致这个癞子还没用。会被减掉。
                    laiNum--;
                    saveArr[this.parent.laiziNum]--;
                }
            }else if(saveArr[i]%2!=0 && laiNum==0){
                return false;
            }
        }
        return _mrr;
    },
    //1:顺子 2:对子 3:三个
    _getFristType: function (_type, _arr, _useHuPaiArr) {
        var temp = 0;
        var indexArr = [];

        for (var i=0;i<_arr.length;i++)
        {
            if (i>=35&&i<=37&&_arr[i]>=2)
            {
                temp++;
                indexArr.push(i);
                if (temp==3)
                {
                    for (var i=0;i<indexArr.length;i++)
                    {
                        if (_arr[indexArr[i]])
                        {
                            _arr[indexArr[i]]-=2;
                        }

                        if (i==indexArr.length-1)
                        {
                            return true;
                        }
                    }
                    break;
                }
            }
        }

        for (var i = 0; i < _arr.length; i++) {
            if (!_arr[i]) continue;
            //不用癞子顺子
            if (_type == 1)
            {
                if (i < 30)
                {
                    if (_arr[i] && _arr[i + 1] && _arr[i + 2]) {
                        _arr[i] -= 1;
                        _arr[i + 1] -= 1;
                        _arr[i + 2] -= 1;
                        return true;
                    }
                }
                if (i == 35 && _arr[i])   //中
                {
                    if (_arr[i + 1] && _arr[i + 2]) {
                        _arr[i] -= 1;
                        _arr[i + 1] -= 1;
                        _arr[i + 2] -= 1;
                        return true;
                    }
                }

                if (i == 36 && _arr[i])   //发
                {
                    if (_arr[i - 1] && _arr[i + 1]) {
                        _arr[i - 1] -= 1;
                        _arr[i] -= 1;
                        _arr[i + 1] -= 1;
                        return true;
                    }
                }

                if (i == 37 && _arr[i])   //白
                {
                    if (_arr[i - 2] && _arr[i - 1]) {
                        _arr[i - 2] -= 1;
                        _arr[i] -= 1;
                        _arr[i - 1] -= 1;
                        return true;
                    }
                }
                //不用癞子对子
            } else if (_type == 2) {
                if (_arr[i] >= 2) {
                    _arr[i] -= 2;
                    return true;
                }
                //不用癞子三个
            } else if (_type == 3) {
                if (_arr[i] >= 3) {
                    _arr[i] -= 3;
                    return true;
                }
                //用癞子三个
            } else if (_type == 4) {
                if (i < 30) {
                    if (_arr[i] && _arr[i + 1]) {
                        _arr[i] -= 1;
                        _arr[i + 1] -= 1;
                        if ((i - 1) % 10 != 0) {
                            if (_useHuPaiArr.indexOf(i - 1) < 0) {
                                _useHuPaiArr.push(i - 1);
                            }
                        }
                        if ((i + 2) % 10 != 0) {
                            if (_useHuPaiArr.indexOf(i + 2) < 0) {
                                _useHuPaiArr.push(i + 2);
                            }
                        }
                        return true
                    } else if (_arr[i] && _arr[i + 2])
                    {
                        if ((i + 1) % 10 != 0) {
                            _arr[i] -= 1;
                            _arr[i + 2] -= 1;
                            if (_useHuPaiArr.indexOf(i + 1) < 0) {
                                _useHuPaiArr.push(i + 1);
                            }
                            return true;
                        }
                    }
                }

                if (i == 35)    //中
                {
                    if (_arr[i] && _arr[i + 1]) {
                        _arr[i] -= 1;
                        _arr[i + 1] -= 1;
                        if ((i + 2) % 10 != 0) {
                            if (_useHuPaiArr.indexOf(i + 2) < 0) {
                                _useHuPaiArr.push(i + 2);
                            }
                        }
                        return true;
                    }
                    else if (_arr[i] && _arr[i + 2]) {
                        _arr[i] -= 1;
                        _arr[i + 2] -= 1;
                        if ((i + 1) % 10 != 0) {
                            if (_useHuPaiArr.indexOf(i + 1) < 0) {
                                _useHuPaiArr.push(i + 1);
                            }
                        }
                        return true;
                    }
                }

                if (i == 36)    //发
                {
                    if (_arr[i] && _arr[i - 1]) {
                        _arr[i] -= 1;
                        _arr[i - 1] -= 1;
                        if ((i + 1) % 10 != 0) {
                            if (_useHuPaiArr.indexOf(i + 1) < 0) {
                                _useHuPaiArr.push(i + 1);
                            }
                        }
                        return true;
                    }
                    else if (_arr[i] && _arr[i + 1]) {
                        _arr[i] -= 1;
                        _arr[i + 1] -= 1;
                        if ((i - 1) % 10 != 0) {
                            if (_useHuPaiArr.indexOf(i - 1) < 0) {
                                _useHuPaiArr.push(i - 1);
                            }
                        }
                        return true;
                    }
                }

                if (i == 37)    //白
                {
                    if (_arr[i] && _arr[i - 2]) {
                        _arr[i] -= 1;
                        _arr[i - 2] -= 1;
                        if ((i - 1) % 10 != 0) {
                            if (_useHuPaiArr.indexOf(i - 1) < 0) {
                                _useHuPaiArr.push(i - 1);
                            }
                        }
                        return true;
                    }
                    else if (_arr[i] && _arr[i - 1]) {
                        _arr[i] -= 1;
                        _arr[i - 1] -= 1;
                        if ((i - 2) % 10 != 0) {
                            if (_useHuPaiArr.indexOf(i - 2) < 0) {
                                _useHuPaiArr.push(i - 2);
                            }
                        }
                        return true;
                    }
                }
                //用癞子对子
            } else if (_type == 5) {
                if (_arr[i] >= 1) {
                    _arr[i] -= 1;
                    if (_useHuPaiArr.indexOf(i) < 0) {
                        _useHuPaiArr.push(i);
                    }
                    return true;
                }
                //用癞子三个
            } else if (_type == 6) {
                if (_arr[i] >= 2) {
                    _arr[i] -= 2;
                    if (_useHuPaiArr.indexOf(i) < 0) {
                        _useHuPaiArr.push(i);
                    }
                    return true;
                }
                //2个癞子一单张
            } else if (_type == 7) {
                if (_arr[i] >= 1 && i < 30) {
                    _arr[i] -= 1;
                    for (var k = i - 2; k <= i + 2; k++) {
                        if (parseInt(i / 10) == parseInt(k / 10)) {
                            if (_useHuPaiArr.indexOf(k) < 0) {
                                // if (k / 10 != 0) {
                                if (k % 10 != 0) {
                                    _useHuPaiArr.push(k);
                                }
                            }
                        }
                    }
                    return true;
                }
            }
        }
        return false;
    },
    getCommonGroupArr: function (commonNum) {
        var result = [];
        if (commonNum == 0) return [];
        if (commonNum == 1) {
            for (var i = 0; i < StaticData.CARD_ALL.length; i++) {
                result.push(StaticData.CARD_ALL[i]);
            }
        } else if (commonNum == 2) {
            for (var i = 0; i < StaticData.CARD_ALL.length; i++) {
                for (var j = 0; j < StaticData.CARD_ALL.length; j++) {
                    result.push([StaticData.CARD_ALL[i], StaticData.CARD_ALL[j]]);
                }
            }
        } else if (commonNum == 3) {
            for (var i = 0; i < StaticData.CARD_ALL.length; i++) {
                for (var j = 0; j < StaticData.CARD_ALL.length; j++) {
                    for (var k = 0; k < StaticData.CARD_ALL.length; k++) {
                        result.push([StaticData.CARD_ALL[i], StaticData.CARD_ALL[j], StaticData.CARD_ALL[k]]);
                    }
                }
            }
        }
        return result;
    },
    checkListenSub: function (cards) {
        this.changeData(cards);

        //--------胡七对---------------
        var isQidui = this.checkIsQiDui(cards);
        if (isQidui) {
            this.tingArr = this.getQiArr(cards);
        }
        //--------一般胡--------------
        var replaceArr = this.makeSureNum(cards);
        var mySaveArr = cards.slice(0);
        for (var i = 0; i < cards.length; i++) {
            for (var j = 0; j < replaceArr.length; j++) {
                var newArr = mySaveArr.slice(0);
                newArr[i] = replaceArr[j];
                this.changeData(newArr);
                this.Jiang = 0;
                if (this.checkIsHu()) {
                    var obj = {"huIndex": i, "huCard": replaceArr[j]};
                    this.tingArr.push(obj);
                }
            }
        }
        // if (this.tingArr.length > 0) {
        //     return true;
        // } else {
        //     return false;
        // }
    },
    makeSureNum: function (cards) {
        var tmpArr = [];
        for (var i = 0; i < cards.length; i++) {
            tmpArr.push(cards[i]);
            if (cards[i] < gameclass.HLGC_MAX_TxtCARD_NUM) {
                tmpArr.push(cards[i] - 1);
                tmpArr.push(cards[i] + 1);
            }
        }

        var resultArr = [];
        for (var i in tmpArr) {
            if (resultArr.indexOf(tmpArr[i]) == -1) {
                // if (tmpArr[i] > 0 && tmpArr[i] < 30 && tmpArr[i] % 10 != 0) {
                if (tmpArr[i] > 0 && tmpArr[i] % 10 != 0) {
                    resultArr.push(tmpArr[i]);
                }
            }
        }
        resultArr.sort(function (a, b) {
            return a - b;
        })
        return resultArr;
    },

    checkIsQiDui: function (cards) {
        if (cards.length != 14) return 0;
        var PAI = this.PAI.slice(0);
        var duiNum = 0;

        for (var i = 0; i <= PAI.length; i++) {
            if (PAI[i] && PAI[i] != 0) {
                if (PAI[i] == 4) {
                    return 0;
                }
                if (PAI[i] >= 2) {
                    PAI[i] -= 2;
                    duiNum++;
                }
            }
        }

        if (duiNum == 6) {
            for (var i in PAI) {
                if (PAI[i] == 1) {
                    this.tingArr.push(i);
                }
            }
            return 1;
        } else {
            return 0;
        }
        // var remain = this.Remain();
        // if (remain == 2 && duiNum == 6) {
        //     for (var i in PAI) {
        //         if (PAI[i] > 0) {
        //             this.tingArr.push(i);
        //         }
        //     }
        //     return 1;
        // } else {
        //     return 0;
        // }
    },


    checkIsHu: function () {
        var PAI = this.PAI;
        if (!this.Remain()) {
            return 1;
        }
        //3张组合(大对)
        for (var i = 1; i < PAI.length; i++) {
            if (PAI[i] && PAI[i] != 0) {
                if (PAI[i] >= 3) {
                    PAI[i] -= 3;
                    if (this.checkIsHu()) {
                        return 1;
                    }
                    PAI[i] += 3;
                }

                if (!this.Jiang && PAI[i] >= 2) {
                    this.Jiang = 1;
                    PAI[i] -= 2;
                    if (this.checkIsHu()) {
                        return 1;
                    }
                    PAI[i] += 2;
                    this.Jiang = 0;
                }

                //顺牌组合
                if (i % 10 != 8 && i % 10 != 9 && PAI[i + 1] && PAI[i + 2] && i < gameclass.HLGC_MAX_TxtCARD_NUM) {
                    PAI[i]--;
                    PAI[i + 1]--;
                    PAI[i + 2]--;
                    //   各牌数减1
                    if (this.checkIsHu()) {//   如果剩余的牌组合成功，和牌
                        return 1;
                    }
                    PAI[i]++;
                    PAI[i + 1]++;
                    PAI[i + 2]++;                                     //   恢复各牌数
                }
            }
        }
        return 0;
    },

    Remain: function () {
        var sum = 0;
        for (var i = 1; i < this.PAI.length; i++) {
            if (this.PAI[i]) {
                sum += this.PAI[i];
            }
        }
        return sum;
    },

    showTingLogo: function () {
        if (this.tingArr.length == 0) return;
        for (var i = 0; i < this.tingArr.length; i++) {
            var tinglogo = new cc.Sprite(res.img_ting);
            this.curCardsSP[this.tingArr[i].huIndex].addChild(tinglogo);
            // tinglogo.setLocalZOrder(22245);
            tinglogo.setPosition(20, 85);
        }
    },

    getQiArr: function (cards) {
        if (this.tingArr.length == 0) return;
        var newArr = [];
        var c = this.tingArr.toString();
        for (var i = 0; i < cards.length; i++) {
            if (c.indexOf(cards[i].toString()) > -1) {
                for (var j = 0; j < this.tingArr.length; j++) {
                    if (cards[i] == this.tingArr[j]) {
                        var obj = {"huIndex": i, "huCard": Number(this.tingArr[(j + 1) % 2])};
                        newArr.push(obj);
                        break;
                    }
                }
            }
        }
        return newArr;
    },
    //========================断线==========================
    showHuPoke: function (_huNum) {
        var huSp = gameclass.hlgc.Table.CreateCard(_huNum, this.index, 2, 0);
        huSp.setColor(new cc.color(127, 127, 127));
        var newPos = cc.p(this.drawCardPos);
        if (this.index == 0) {
            newPos.x += 15;
            newPos.y += (huSp.height * huSp.getScale()) / 2;
        } else if (this.index == 1) {

        } else if (this.index == 2) {
            newPos.x += 20;
            newPos.y += (huSp.height * huSp.getScale()) / 2;
        } else if (this.index == 3) {
            newPos.x += (huSp.width * huSp.getScale()) / 2;
            newPos.y += (huSp.height * huSp.getScale()) / 2;
        }
        huSp.setPosition(newPos);
        this.handNode.addChild(huSp);
    },
    //=======================================================
    onChat: function (data) {
        var _this = this;
        var arr = [
            res.chatbg_ld,
            res.chatbg_rd,
            res.chatbg_lt,
            res.chatbg_ld,
        ];
        if (data.type == 1) {//文字
            var _node = new ccui.Layout();

            var s9 = new cc.Scale9Sprite(arr[this.index]);
            s9.setCapInsets(cc.rect(60, 10, 10, 10));
            s9.setAnchorPoint(0, 0);
            s9.setPosition(-15, -15);
            _node.addChild(s9);

            _node = this.showStringChat(data, _node, s9);
            this.node.addChild(_node);
            // _node.setPositionX(this.head_img.getContentSize().width);
            var seq = cc.sequence(cc.delayTime(3), cc.callFunc(function () {
                _node.removeFromParent(true);
            }));
            _node.runAction(seq);

        } else if (data.type == 2) {//表情
            var index = Number(data.chat);
            var spr = new cc.Sprite();
            spr.initWithFile(g_face[index]);

            var bg = new ccui.Layout();
            bg.setContentSize(spr.width + 30, spr.height + 20);
            bg.setBackGroundImage(arr[this.index]);
            bg.setBackGroundImageScale9Enabled(true);
            // bg.setPosition(this.expressionPosArr[this.index]);
            bg.setAnchorPoint(0.5, 0.5);
            bg.addChild(spr);
            spr.setPosition(0.5 * bg.getContentSize().width, 0.5 * bg.getContentSize().height);

            this.node.addChild(bg, 1111);
            if (this.index == 0) {
                bg.setPositionX(this.node.getContentSize().width);
                bg.setPositionY(this.node.getContentSize().height);
            } else if (this.index == 1) {
                bg.setPositionY(this.node.getContentSize().height);
            } else if (this.index == 2) {
                bg.setPositionX(this.node.getContentSize().width);
                bg.setPositionY(50);
            } else if (this.index == 3) {
                bg.setPositionX(this.node.getContentSize().width);
                bg.setPositionY(this.node.getContentSize().height);
            }
            var seq = cc.sequence(cc.delayTime(2), cc.callFunc(function () {
                bg.removeFromParent(true);
            }));
            this.node.runAction(seq);
        } else if (data.type == 3) {
            gameclass.mod_platform.playurl(data.chat);

            this.voiceSp.setVisible(true);
            var seq = cc.sequence(cc.delayTime(2), cc.callFunc(function () {
                _this.voiceSp.setVisible(false);
            }));
            this.node.runAction(seq);
        }
    },

    showStringChat: function (data, _node, s9) {
        //文字类型
        var helloLabel = new cc.LabelTTF(data.chat, "Arial", 36);
        helloLabel.setAnchorPoint(cc.p(0, 0));
        helloLabel.setPosition(0, 5);
        if (this.index == 2) {
            helloLabel.setPosition(0, -5);
        }
        helloLabel.setColor(cc.color(0, 0, 0));
        _node.addChild(helloLabel);

        var harr = [
            this.node.getContentSize().height,
            this.node.getContentSize().height / 2,
            -0,
            this.node.getContentSize().height / 2
        ];

        var warr = [
            0,
            helloLabel.getContentSize().width * -1,
            50,
            this.node.getContentSize().width
        ];
        _node.setPosition(cc.p(warr[this.index], harr[this.index]));
        s9.setContentSize(helloLabel.getContentSize().width + 30, helloLabel.getContentSize().height + 30);
        return _node;
    },

    getConnectPengGangData: function (arr) {
        this.pengGangArr = arr;
    },

    //玩家广播操作动画
    showControlAct: function (type) {
        this.operateSp.setVisible(true);
        var _this = this;
        if (type == 0) {//碰
            this.operateSp.setTexture(res.img_peng);
        } else if (type == 1) {//杠
            this.operateSp.setTexture(res.img_gang);
        } else if (type == 2) {//一胡
            this.operateSp.setTexture(res.img_oneHu);
        } else if (type == 3) {
            this.operateSp.setTexture(res.img_twoHu);
        } else if (type == 4) {
            this.operateSp.setTexture(res.img_threeHu);
        }
        this.operateSp.stopAllActions();
        this.operateSp.runAction(cc.sequence(cc.delayTime(0.8), cc.fadeOut(0.8), cc.callFunc(function () {
            _this.operateSp.setVisible(false);
            _this.operateSp.setOpacity(255);
        })))
    },
});

gameclass.OpBox = cc.Sprite.extend({
    _cardNums: null,
    _index: null,
    _differY: null,
    _isGray: null,
    ctor: function (agr,jiesuan) {
        this._super();

        var differY = [0, 14, 0, 14];//摆位置时候的偏移量
        var gangUpNormal = [23, 14, 13, 14];//打牌时候杠牌的偏移量
        var gangUpReplay = [13, 14, 13, 14];//战绩回访的时候杠牌的偏移量
        this._cardNums = agr.nums;
        this._index = agr.index;
        this._differY = differY[agr.index];
        this.normalUp = gangUpNormal[agr.index];
        this.replayUp = gangUpReplay[agr.index];
        this._isGray = agr.isGray || false;

        switch (agr.type) {
            case 'peng':
                this.initPeng(agr.state, agr.pengbackIndex);
                break;
            case 'gang':
                this.initGang(agr.gangType, agr.state,jiesuan);
                break;
        }
    },

    initPeng: function (state, pengbackIndex) {
        var num = this._cardNums[0];
        var ex = (this._index % 2) == 0 ? 1 : 0;
        var ey = (this._index % 2) == 1 ? 1 : 0;

        if (this._index == 3) {
            if (pengbackIndex == 0) {
                pengbackIndex = 2;
            } else if (pengbackIndex == 2) {
                pengbackIndex = 0;
            }
        }

        // cc.log("num="+num);

        for (var i = 0; i < 3; i++) {
            var sp = null;
            if (state == "huifang" && this._index == 0) {
                sp = gameclass.hlgc.Table.CreateCard(num, 2, 2, 0, state);
            } else {
                if (i == pengbackIndex) {
                    sp = gameclass.hlgc.Table.CreateCard(num, this._index, 1, 0);
                } else {
                    sp = gameclass.hlgc.Table.CreateCard(num, this._index, 2, 0);
                }
            }

            if (this._isGray) {
                sp.setColor(cc.color(169, 169, 169));
            }
            if (ey) {
                sp.setLocalZOrder(100 - i);
            }
            this.addChild(sp);
        }

        var children = this.getChildren();
        var stepScale = children[0].getScale();
        var stepSize = cc.size(children[0].getContentSize().width * stepScale, children[0].getContentSize().height * stepScale);


        // cc.log("stepSizeW==="+stepSize.width);
        // cc.log("this._index============="+this._index)
        // if(num == 13){
        //     cc.log("1")
        // }

        var cw, ch;
        for (var i = 0; i < children.length; i++) {
            if (this._index == 0) {
                children[i].setPosition(i * (stepSize.width - 3) * ex, i * (stepSize.height - this._differY ) * ey);
            } else if (this._index == 1 || this._index == 3) {
                children[i].setPosition(i * (stepSize.width) * ex, i * (stepSize.height - this._differY - 3 ) * ey);
            } else {
                children[i].setPosition(i * (stepSize.width - 2) * ex, i * (stepSize.height - this._differY ) * ey);
            }
            cw = children[i].getPositionX() + stepSize.width;
            ch = children[i].getPositionY() + stepSize.height;
            // cc.log(i + ":" + children[i].getPositionX()+","+children[i].getPositionY())
        }
        this.setContentSize(cc.size(cw, ch));
        // if (ey) {
        //     this.setContentSize(stepSize.width, (stepSize.height - this._differY) * 3 + 12);
        // } else {
        //     this.setContentSize(stepSize.width * 3 + 5, stepSize.height);
        // }
        // cc.log("stepSize.height="+stepSize.height+",this._differY="+this._differY)
        // cc.log("boxSize:" + this.getContentSize().width+","+this.getContentSize().height);
    },

    initGang: function (gangType, state,jiesuan) {
        var numArr = [];
        var num = this._cardNums[0];
        if (num == StaticData.WIND_GANG) {
            numArr = StaticData.WIND_GANG_ARR;
        } else {
            numArr = [num, num, num, num];
        }

        var ex = (this._index % 2) == 0 ? 1 : 0;
        var ey = (this._index % 2) == 1 ? 1 : 0;

        // cc.log(num);

        for (var i = 0; i < 4; i++) {
            var sp = null;

            if (gangType == 0) {
                if (state == "huifang" && this._index == 0) {
                    sp = gameclass.hlgc.Table.CreateCard(numArr[i], 2, 1, 1, state);
                } else {
                    if (this._index == 0) {
                        if (i < 3) {
                            sp = gameclass.hlgc.Table.CreateCard(numArr[i], this._index, 1, 1);
                        } else {
                            sp = gameclass.hlgc.Table.CreateCard(numArr[i], this._index, 2, 0);
                        }
                    } else {
                        sp = gameclass.hlgc.Table.CreateCard(numArr[i], this._index, 1, 1);
                    }
                }
            } else {
                if (state == "huifang" && this._index == 0) {
                    sp = gameclass.hlgc.Table.CreateCard(numArr[i], 2, 2, 0, state);
                } else {
                    sp = gameclass.hlgc.Table.CreateCard(numArr[i], this._index, 2, 0);
                }
            }
            if (ey) {
                sp.setLocalZOrder(100 - i);
            }
            this.addChild(sp);
        }

        var children = this.getChildren();
        var stepScale = children[0].getScale();
        var stepSize = cc.size(children[0].getContentSize().width * stepScale, children[0].getContentSize().height * stepScale);

        var cw, ch;
        for (var i = 0; i < children.length; i++) {
            if (i < 3) {
                if (this._index == 0) {
                    children[i].setPosition(i * (stepSize.width - 3) * ex, i * (stepSize.height - this._differY ) * ey);
                } else if (this._index == 1 || this._index == 3) {
                    children[i].setPosition(i * (stepSize.width) * ex, i * (stepSize.height - this._differY - 3 ) * ey);
                } else {
                    children[i].setPosition(i * (stepSize.width - 2) * ex, i * (stepSize.height - this._differY ) * ey);
                }
                cw = children[i].getPositionX() + stepSize.width;
                ch = children[i].getPositionY() + stepSize.height;
            } else {
                if (state == "huifang" && this._index == 0) {
                    children[3].setPosition(children[1].getPosition().x, children[1].getPosition().y + this.replayUp);
                } else {
                    children[3].setPosition(children[1].getPosition().x, children[1].getPosition().y + this.normalUp);
                }
                children[3].setLocalZOrder(100);
            }
        }
        this.setContentSize(cc.size(cw, ch));
    },
});


gameclass.majonLisenter = cc.Class.extend({
    _isDrag: false,//是否是拖拽状态
    _isSlide: false,//是否是滑动状态
    _isTouch: false,
    _isInvalid: false,
    _callBacks: null,
    _beginPos: null,
    _cardsSp: null,
    _curTarget: null,
    _planeNode: null,
    _cardposition: null,
    _playerc: null,

    ctor: function (params) {
        this._playerc = params.playerc;
        this._cardsSp = params.cards || null;
        if (!this._cardsSp) {
            throw new Error('无效是牌组');
            return;
        }
        this._planeNode = params.plane || null;
        if (!this._planeNode) {
            throw new Error('无效是监听节点');
            return;
        }

        //var _this = this;
        //this._planeNode.schedule(function(){
        //    cc.log(_this._isTouch);
        //},1);

        this._callBacks = {};
        this.addClickEvent();
    },
    on: function (key, callfun) {
        this._callBacks[key] = callfun;
    },
    setCardsArr: function (_arr) {
        this._cardsSp = _arr;
    },
    addClickEvent: function () {
        var _this = this;
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if (_this._isDrag) return false;
                if (_this._isTouch) return false;
                _this._isDrag = _this._isSlide = _this._isInvalid = false;
                _this._beginPos = touch.getLocation();
                _this._isTouch = true;
                _this.checkInvalid();
                return true;
            },

            onTouchMoved: function (touch, event) {
                if (_this._isInvalid) {
                    return true;
                }
                if (_this._isDrag) {
                    if (_this._callBacks.drag) {
                        _this._callBacks.drag(_this._curTarget, touch.getLocation());
                    }
                    return true;
                } else if (_this._isSlide) {
                    var target = _this.getSpWithpos(touch.getLocation());
                    if (target) {
                        _this._curTarget = target;
                    }
                    if (_this._callBacks.slide) {
                        _this._callBacks.slide(_this._curTarget, touch.getLocation());
                    }
                    return true;
                }
                else {
                    var pos = touch.getLocation();
                    if (pos.y - _this._beginPos.y > 20) {
                        _this._isDrag = true;
                        if (_this._callBacks.dragBegin) {
                            _this._cardposition = _this._curTarget.getPosition();
                            _this._callBacks.dragBegin(_this._curTarget, touch.getLocation(), _this._curTarget.getPosition());
                        }
                        return true;
                    }
                    if (!_this.checkPosInSp(pos, _this._curTarget)) { // 如果不在第一个牌里
                        if (_this.getSpWithpos(pos)) { // 且有牌
                            if (_this._callBacks.slideBegin) {
                                _this._callBacks.slideBegin(_this._curTarget, touch.getLocation());
                            }
                        }
                    }
                    return true;
                }
            },
            onTouchEnded: function (touch) {
                //cc.log("lklklklkk",_this._isInvalid);
                _this._isTouch = false;
                if (_this._isInvalid) {
                    return true;
                }
                if (_this._isDrag) {
                    if (_this._callBacks.dragEnd) {
                        _this._isDrag = false;
                        _this._callBacks.dragEnd(_this._curTarget, touch.getLocation());
                    }

                } else if (_this._isSlide) {
                    if (_this._callBacks.slideEnd) {
                        _this._isSlide = false;
                        _this._callBacks.slideEnd(_this._curTarget, touch.getLocation());
                    }
                } else {
                    if (_this._callBacks.click) {
                        _this._callBacks.click(_this._curTarget, touch.getLocation());
                    }
                }
            },
            onTouchCancelled: function (touch) {
                _this._playerc.renderAllCard();
                return true;
            },
        }), this._planeNode);
    },

    checkInvalid: function () {
        var target = this.getSpWithpos(this._beginPos);
        if (target) {
            this._curTarget = target;
        }
        return this._isInvalid = ( target == false );
    },
    checkPosInSp: function (pos, sp, rect) {
        var _localPos = sp.convertToNodeSpace(pos);
        if (!rect) {
            rect = cc.rect(0, 0, sp.getContentSize().width, sp.getContentSize().height);
        }
        return cc.rectContainsPoint(rect, _localPos);
    },
    getSpWithpos: function (pos) {
        if (!this._cardsSp || this._cardsSp.length == 0) {
            return false;
        }
        if (!this._cardsSp || this._cardsSp.length < 1) {
            return false;
        }
        var cardSize = this._cardsSp[0].getContentSize();
        var rc = cc.rect(0, 0, cardSize.width, cardSize.height);
        for (var x = 0; x < this._cardsSp.length; x++) {
            if (this.checkPosInSp(pos, this._cardsSp[x], rc)) {
                return this._cardsSp[x];
            }
        }
        return false;
    },
})