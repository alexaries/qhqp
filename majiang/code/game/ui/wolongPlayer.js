/**
 * Created by Administrator on 2017/12/19.
 */
gameclass.wolongPlayer = gameclass.baseui.extend({
    _table: null,
    _icon: null,
    infoData: null,
    personData: null,
    outArr: null,
    state: null,
    ctor: function (_index, _table) {
        this._super();
        this.infoData = null;
        this._table = _table;
        this.personData = null;
        this.outArr = [];
        this.node = _table.playerNodeArr[_index];
        this.NYou = ccui.helper.seekWidgetByName(this.node, "NYou");
        this._index = _index;
        this._icon = ccui.helper.seekWidgetByName(this.node, "icon");
        this.node.addTouchEventListener(this._touchCallBack, this);
        this._pos = this._icon.getParent().convertToWorldSpace(this._icon.getPosition());
        this._nameLabel = ccui.helper.seekWidgetByName(this.node, "playerName");
        this.cardIcon = ccui.helper.seekWidgetByName(this.node, "cardIcon");
        this.cardIcon.setVisible(false);
        this.headCardPanel = ccui.helper.seekWidgetByName(this._table.node, "outPokerLayer").getChildren()[_index];
        this.okImg = ccui.helper.seekWidgetByName(this.node, "ok");
        this.timeBarNodePos = ccui.helper.seekWidgetByName(this.node, "timeBarNode").getParent().convertToWorldSpace(ccui.helper.seekWidgetByName(this.node, "timeBarNode").getPosition());
        this.tuoGuangSp = ccui.helper.seekWidgetByName(this.node, "tuoGuangSp");
        var timeBar = ccui.helper.seekWidgetByName(this.node, "timeBar");
        timeBar.setVisible(false);
        this.timeBar = new cc.ProgressTimer(timeBar);
        this.timeBar.setScale(timeBar.getScale());
        this.timeBar.setAnchorPoint(0.5, 0.5);
        this.timeBar.type = cc.ProgressTimer.TYPE_RADIAL;
        this.timeBar.setReverseDirection(true);
        this.timeBar.setPosition(timeBar.getPosition());
        this.node.addChild(this.timeBar);
        this.timeBar.setVisible(false);
        this.node.setVisible(false);
        this.NYou.setVisible(false);
        this.okImg.setVisible(false);
        this.tuoGuangSp.setVisible(false);
        ccui.helper.seekWidgetByName(this.node, "totalScore").setString("0");
        ccui.helper.seekWidgetByName(this.node, "jiangFen").setString("0");
        ccui.helper.seekWidgetByName(this.node, "jianFen").setString("0");
    },
    _initPerson: function (data) {
        this.personData = data;
        this.node.setVisible(true);
        this._setBaseInfo(data);
    },
    _initInfo: function (data, state, _isReconnet) {
        this.state = state;
        this.infoData = data;
        this._setDataInfo(data, _isReconnet);
    },
    _setBaseInfo: function (data) {
        gameclass.mod_base.showtximg(this._icon, data.imgurl, 0, 0, "im_headbg2", data.ip == "");
        this._nameLabel.setString(data.name);
    },
    _setDataInfo: function (data, _isReconnet) {
        ccui.helper.seekWidgetByName(this.node, "totalScore").setString(data.total);
        ccui.helper.seekWidgetByName(this.node, "jiangFen").setString(data.award);
        ccui.helper.seekWidgetByName(this.node, "jianFen").setString(data.jscore);
        if (!this.infoData.rating) this.NYou.setVisible(false);
        else {
            if (this._table.nowYouIndex < this.infoData.rating) {
                this._table.nowYouIndex = this.infoData.rating;
            }
            this.NYou.setVisible(true);
            this.NYou.loadTexture(res["you" + this.infoData.rating]);
        }
        this.onGameTouGuang(this.infoData.deposit);
        if (this.state == 0) {
            this.okImg.setVisible(data.ready);
            this.cardIcon.setVisible(false);
            if (this.personData.uid == this._table.myUid && !data.ready) {
                if (this._table.personData.step == 0) {
                    this._table.mod_wolong._socketSendReady();
                } else {
                    this._table._showReadyBtn(true);
                }
            }
        } else if (this.state == 1 || this.state == 2) {
            if (this.state == 2) {
                this.okImg.setVisible(data.ready);
            } else this.okImg.setVisible(false);
            if (_isReconnet) {
                this._setCardNum(-1);
                if (this.personData.uid == this._table.myUid) {
                    this._initHandCard();
                }
            } else {
                //不是断线重连就是开始游戏的发牌
                if (this.personData.uid == this._table.myUid) {
                    this._initHandCard();
                    var _posArr = [];
                    var delaytime = 0;
                    var totalDelaytime = 0;
                    var _index = 0;
                    var _this = this;
                    for (var i = 0; i < this._table.myCardLayer.getChildren().length; i++) {
                        _posArr[i] = cc.p(this._table.myCardLayer.getChildren()[i].x, this._table.myCardLayer.getChildren()[i].y);
                        this._table.myCardLayer.getChildren()[i].x += 400;
                        this._table.myCardLayer.getChildren()[i].setVisible(false);
                        this._table.myCardLayer.getChildren()[i].cardSortIndex = i + 1;
                        this._table.myCardLayer.getChildren()[i].runAction(cc.sequence(cc.delayTime(delaytime), cc.callFunc(function (_node) {
                            for (var i in _this._table.playerObj) {
                                _this._table.playerObj[i]._setCardNum(_node.cardSortIndex + "");
                            }
                            _node.setVisible(true);
                            mod_sound.playeffect(woLongMusics.wl_faPai);
                        }, this._table.myCardLayer.getChildren()[i]), cc.moveTo(0.2, _posArr[i])));
                        _index++;
                        if (_index > 0) {
                            delaytime += 0.1;
                            totalDelaytime += delaytime;
                            _index = 0;
                        }
                    }
                }
            }
        }
    },
    _setCardNum: function (_num) {
        var _cardNum = _num;
        if (_cardNum < 0) _cardNum = this.infoData.cardnum;
        else this.infoData.cardnum = _num;
        this.cardIcon.setVisible(true);
        this.cardIcon.getChildByName("cardNum").setString(_cardNum);
    },
    onGameReady: function () {
        if (!this.infoData) this.infoData = {};
        this.infoData.uid = this.personData.uid;
        this.infoData.ready = true;
        this.okImg.setVisible(true);
        this.okImg.setScale(3);
        this.okImg.runAction(cc.scaleTo(0.2, 1, 1));
    },
    resetIcon: function () {
        gameclass.mod_base.showtximg(this._icon, this.personData.imgurl, 0, 0, "im_headbg2", this.personData.ip == "");
    },
    outPoker: function (cardArr) {
        var _this = this;
        this.headCardPanel.removeAllChildren(true);
        if (Number(this.infoData.cardnum) == 0) return;
        this.outArr = cardArr;
        if (cardArr.length) {
            cardArr.sort(function (a, b) {
                var ruleA = _this._convertColor(a % 10);
                var ruleB = _this._convertColor(b % 10);
                return ruleA - ruleB;
            })
            var _touShu = this._table._getTouShuObj(cardArr).touShu;
            this.headCardPanel.width = (cardArr.length - 1) * 40 + 148;

            for (var i = 0; i < cardArr.length; i++) {
                var _sp = new woLongPokerSp(cardArr[i]);
                this.headCardPanel.addChild(_sp);
                var _pos = cc.p(0, 0);
                _pos.x = (_sp.width * 0.5 + i * 40);
                _pos.y = this.headCardPanel.height / 2;
                _sp.setPosition(_pos);
            }

            var _node = this._table.game.uimgr.createnode(res.yishuLabel);
            var text = _node.getChildByName("text");
            text.setString(_touShu + "");
            text.ignoreContentAdaptWithSize(true);
            _node.setPosition(120, 160);
            _node.setScale(2.5);
            _sp.addChild(_node);
        } else {
            var _yaobuqiSp = new cc.Sprite(res.yaobuqi);
            this.headCardPanel.width = _yaobuqiSp.width;
            _yaobuqiSp.setPosition(this.headCardPanel.width / 2, this.headCardPanel.height / 2);
            this.headCardPanel.addChild(_yaobuqiSp);
        }

    },
    onGameTouGuang: function (_b) {
        this.infoData.deposit = _b;
        this.tuoGuangSp.setVisible(_b);
        if (this._table.IsAllAuto) {
            this._table.tuoGuangLayer.setVisible(true);
        } else if (this.personData.uid == this._table.myUid) {
            this._table.tuoGuangLayer.setVisible(_b);
        }
        if (_b || this._table.IsAllAuto) {
            this._playAnimate();
        } else {
            this.tuoGuangSp.stopAllActions();
        }
    },
    playJianFenAnimate: function (score) {
        this.infoData.jscore += score;
        var _pos = cc.p(this._pos.x, this._pos.y);
        if (_pos.x < cc.winSize.width / 2) _pos.x += 50;
        if (_pos.x > cc.winSize.height / 2) _pos.y -= 70;
        if (score) {
            // gameclass.showYSText(this.infoData.jscore,_pos,this._table.node);
            var _label = new cc.LabelBMFont("+" + score, res.jiangFont);
            _label.setPosition(this._icon.getPosition());
            this.node.addChild(_label);
            _label.setVisible(false);
            _label.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(function (sender) {
                sender.setVisible(true);
            }), cc.delayTime(0.2), cc.moveBy(0.5, cc.p(0, 50)), cc.delayTime(0.5), cc.callFunc(function (sender) {
                sender.removeFromParent(true);
            })))
        }
        ccui.helper.seekWidgetByName(this.node, "jianFen").setString(this.infoData.jscore);
    },
    playJiangFenAnimate: function (_obj) {
        var _offscore = _obj.award - this.infoData.award;
        if (_offscore) {
            var _pos = cc.p(this._pos.x, this._pos.y);
            var _iconPos = this._icon.getPosition();
            if (_pos.x < cc.winSize.width / 2) _iconPos.x += 50;
            if (_pos.x > cc.winSize.width / 2) _iconPos.x -= 50;
            if (_pos.y > cc.winSize.height / 2) _iconPos.y -= 50;
            if (_obj.boomaward) {
                var _label = new cc.LabelBMFont("奖+" + _obj.boomaward, res.jiangFont);
                _label.setPosition(_iconPos);
                this.node.addChild(_label);
                _label.setVisible(false);
                _label.runAction(cc.sequence(cc.callFunc(function (sender) {
                    sender.setVisible(true);
                }), cc.delayTime(0.2), cc.moveBy(0.5, cc.p(0, 50)), cc.delayTime(0.5), cc.callFunc(function (sender) {
                    sender.removeFromParent(true);
                })))
            }

            if (_obj.saward) {
                var _label = new cc.LabelBMFont("连奖+" + _obj.saward, res.jiangFont);
                _label.setPosition(_iconPos);
                this.node.addChild(_label);
                _label.setVisible(false);
                _label.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function (sender) {
                    sender.setVisible(true);
                }), cc.delayTime(0.2), cc.moveBy(0.5, cc.p(0, 50)), cc.delayTime(0.5), cc.callFunc(function (sender) {
                    sender.removeFromParent(true);
                })))
            }

            if (_obj.taward) {
                var _label = new cc.LabelBMFont("同色奖+" + _obj.taward, res.jiangFont);
                _label.setPosition(_iconPos);
                this.node.addChild(_label);
                _label.setVisible(false);
                _label.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function (sender) {
                    sender.setVisible(true);
                }), cc.delayTime(0.2), cc.moveBy(0.5, cc.p(0, 50)), cc.delayTime(0.5), cc.callFunc(function (sender) {
                    sender.removeFromParent(true);
                })))
            }
        }
        this.infoData.award = _obj.award;
        ccui.helper.seekWidgetByName(this.node, "jiangFen").setString(_obj.award);

    },
    _initHandCard: function () {
        this._table.myCardLayer.removeAllChildren(true);
        var _allCardWith = 148;

        var _arr = this.infoData.card;
        this.infoData.convertCardArr = this._reSortCard(_arr);
        var _brr = [];
        for (var i = 0; i < _arr.length; i++) {
            _brr[parseInt(_arr[i] / 10)] = _brr[parseInt(_arr[i] / 10)] || 0;
            _brr[parseInt(_arr[i] / 10)]++
        }
        var _isFristtuo = true;
        for (var i = 0; i < _brr.length; i++) {
            if (!_brr[i]) continue;
            var _num = _brr[i];
            _allCardWith += ((_num - 1) * 17);
            if (!_isFristtuo) {
                _allCardWith += 45;
            }
            _isFristtuo = false;
        }
        this._table.myCardLayer.setContentSize(_allCardWith, this._table.myCardLayer.height);
        var _lastCardPos = null;
        var _sp = null;
        for (var i = 0; i < this.infoData.convertCardArr.length; i++) {
            if (i != 0) _lastCardPos.x += 45;
            // var cardLength=this.infoData.convertCardArr[i].card.length;
            for (var j = 0; j < this.infoData.convertCardArr[i].card.length; j++) {
                //_sp=new cc.Sprite();
                _sp = new woLongPokerSp(this.infoData.convertCardArr[i].card[j]);
                if (!_lastCardPos) _lastCardPos = cc.p(_sp.width / 2, this._table.myCardLayer.height / 2);

                var _cardLengthObj = {};
                for (var m = 0; m < this.infoData.convertCardArr[i].card.length; m++) {
                    _cardLengthObj[parseInt(this.infoData.convertCardArr[i].card[m] / 10)] = _cardLengthObj[parseInt(this.infoData.convertCardArr[i].card[m] / 10)] || 0;
                    _cardLengthObj[parseInt(this.infoData.convertCardArr[i].card[m] / 10)]++;
                }
                var totalLength = 0;
                var _mLengthArr = [];
                for (var k in _cardLengthObj) {
                    totalLength += _cardLengthObj[k];
                    _mLengthArr.push(totalLength);
                }
                var _isEndSameColor = false;
                for (var m = 0; m < _mLengthArr.length; m++) {
                    if (j == _mLengthArr[m] - 1) {
                        var _node = this._table.game.uimgr.createnode(res.yishuLabel);
                        var text = _node.getChildByName("text");
                        text.setString(_cardLengthObj[parseInt(this.infoData.convertCardArr[i].card[j] / 10) + ""] + "");
                        text.ignoreContentAdaptWithSize(true);
                        _node.setPosition(20, 20);
                        _node.setScale(1.5);
                        _sp.addChild(_node);
                    }
                    if (j == _mLengthArr[m]) {
                        _isEndSameColor = true;
                        // break;
                    }
                }
                if (_isEndSameColor) {
                    _lastCardPos.x += 45;
                } else if (j) {
                    _lastCardPos.x += 17;
                }
                _sp.setPosition(_lastCardPos);
                this._table.myCardLayer.addChild(_sp);
            }
            if (this.infoData.convertCardArr[i].touShu > 3 && (this.infoData.convertCardArr[i]._cardIndex == 100 || this.infoData.convertCardArr[i]._cardIndex == 2.5)) {
                var _touShuNode = this._table.game.uimgr.createnode(res.toushuLabel);
                var touShuText = ccui.helper.seekWidgetByName(_touShuNode, "textLabel");
                touShuText.setString(this.infoData.convertCardArr[i].touShu + "");
                touShuText.ignoreContentAdaptWithSize(true);
                _touShuNode.setPosition(20, 60);
                _sp.addChild(_touShuNode);
            }
        }
    },
    _convertColor: function (_type) {
        if (_type == 4) {
            _type = 2;
        } else if (_type == 3) {
            _type = 3;
        } else if (_type == 2) {
            _type = 1;
        } else if (_type == 1) {
            _type = 4;
        }
        return _type;
    },
    _reSortCard: function (_arr) {
        var _this = this;
        var convertObj = {};
        var _mrr = _arr.slice();
        for (var i = 0; i < _mrr.length; i++) {
            var _cardIndex = parseInt(_mrr[i] / 10);
            if (_mrr[i] >= 1000) {
                _cardIndex = 100;
            }
            convertObj[_cardIndex] = convertObj[_cardIndex] || {};
            convertObj[_cardIndex].card = convertObj[_cardIndex].card || [];
            convertObj[_cardIndex].card.push(_mrr[i]);
        }
        if (convertObj[100] && convertObj[100].card.length == 2) {
            convertObj[100].card.sort(function (a, b) {
                return a - b;
            })
            if (convertObj[100].card[0] == 1000 && convertObj[100].card[1] == 2000) {
                convertObj[100].card.pop();
                convertObj[200] = {};
                convertObj[200].card = [2000];
                convertObj[200].touShu = 1;
                convertObj[100].touShu = 1;
            }
        }
        var _danArr = [];
        var _danIndexArr = [];
        for (var i in convertObj) {
            convertObj[i].card.sort(function (a, b) {
                var ruleA = _this._convertColor(a % 10);
                var ruleB = _this._convertColor(b % 10);
                if (ruleA == 0) ruleA = a;
                if (ruleB == 0) ruleB = b;
                return ruleA - ruleB;
            })
            convertObj[i].touShu = convertObj[i].card.length;
            if (i == 100 || i == 200) {
                if (convertObj[i].card.length == 1 || convertObj[i].card.length == 2) {
                    convertObj[i].touShu = convertObj[i].card.length;
                    if (convertObj[i].touShu == 1) {
                        _danArr.push(convertObj[i]);
                        _danIndexArr.push(i);
                    }
                    continue;
                }
                var dwNum = 0;
                var xwNum = 0;
                for (var j = 0; j < convertObj[i].card.length; j++) {
                    if (convertObj[i].card[j] == 1000) {
                        xwNum++;
                    } else {
                        dwNum++;
                    }
                }
                var maxNum = dwNum > xwNum ? dwNum : xwNum;
                convertObj[i].touShu = convertObj[i].touShu * 2;
                if (convertObj[i].card.length < 5 && maxNum != convertObj[i].card.length) {
                    if (convertObj[i].card.length == 2) convertObj[i].touShu = 1;
                    else convertObj[i].touShu--;
                }
                else if (convertObj[i].card.length == 5 && maxNum == 3) convertObj[i].touShu -= 2;
                else if (convertObj[i].card.length == 6 && maxNum == 3) convertObj[i].touShu -= 3;
                else if (convertObj[i].card.length == 2 && maxNum == 2) convertObj[i].touShu -= 2;
            }
            if (convertObj[i].touShu == 1) {
                _danArr.push(convertObj[i]);
                _danIndexArr.push(i);
            }
        }
        if (this._table.personData.param2 % 10 == 1 && _danArr.length >= 3) {
            var _obj = {};
            _obj.touShu = _danArr.length + 4;
            var _card = [];
            for (var i = 0; i < _danArr.length; i++) {
                _card = _card.concat(_danArr[i].card);
                delete convertObj[_danIndexArr[i]];
            }
            _obj.card = _card;
            convertObj[2.5] = _obj;
        }
        var convertArr = [];
        for (var i in convertObj) {
            var _obj = convertObj[i];
            _obj._cardIndex = i;
            convertArr.push(_obj)
        }
        convertArr.sort(function (a, b) {
            if (a.touShu == b.touShu) {
                var _anum = Number(a._cardIndex);
                var _bnum = Number(b._cardIndex);
                if (_anum <= 2) _anum = (_anum) + 13;
                if (_bnum <= 2) _bnum = (_bnum) + 13;
                return (_bnum - _anum) || -1;
            }
            return b.touShu - a.touShu;
        })
        return convertArr;
    },
    _playAnimate: function () {
        // var animatioin=new cc.Animation();
        // for(var i=0;i<4;i++){
        //     animatioin.addSpriteFrameWithFile(res["img_auto"+(i+1)]);
        // }
        // animatioin.setDelayPerUnit(0.2);
        // animatioin.setRestoreOriginalFrame(true);
        // var action=cc.animate(animatioin);
        // var _num=Math.random()*3;
        // this.tuoGuangSp.runAction(cc.repeatForever(cc.sequence(cc.delayTime(_num),action,cc.delayTime(3-_num))));
        this.tuoGuangSp.setVisible(true);
    },
    _touchCallBack: function (sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            if (this._index == 0) return;
            this._table.game.uimgr.showui("gameclass.chatMicLayer");
            this._table.game.uimgr.uis["gameclass.chatMicLayer"].setPlayerInfo(this.personData, this._table.mod_wolong);
        }
    },
    _setControlTime: function (time) {
        this.timeBar.setVisible(true);
        this.timeBar.stopAllActions();
        var numPercentage = 100;
        var runTime = 15;
        if (time && time > 0) {
            numPercentage = (time / 15) * 100;
            runTime = time;
        } else {
            this.timeBar.setVisible(false);
            return;
        }
        var to1 = cc.progressFromTo(runTime, numPercentage, 0);
        this.timeBar.runAction(cc.sequence(to1, cc.callFunc(function () {
        })));
    }
})
