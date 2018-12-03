/**
 * Created by Leon on 2017/1/17.
 */

gameclass.ReplayWindow = gameclass.baseui.extend({
    node: null,
    isQiPai: false,
    curCards: null,
    curCardsSP: null,
    pengGangArr: null,
    pengGangNodeArr: null,
    lastPlayedCard: null,
    deskCardsNum: null,
    handNode: null,
    lastOrderNum: -1,
    isPause: false,
    speed: 1.5,
    stepIndex: 0,
    cardCommonNode:null,
    hunPaiCardArr:null,
    ctor: function () {
        this._super();
        this.deskCardsNum = [];
        this.handNode = [];
        this.queType = [];
        this.isHasHu = [];
        this.isQue = [];
        this.huLogoSP = [];
        this.cardCommonNode=null;
        this.hunPaiCardArr = null;

    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.hlgcReplayUI, true);
        for (var i = 0; i < 4; i++) {
            this.huLogoSP[i] = ccui.helper.seekWidgetByName(this.node, "hulogo" + i);
            this.huLogoSP[i].setVisible(false);
        }
        cc.spriteFrameCache.addSpriteFrames(res.mah_bg_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_text_plist);

        cc.spriteFrameCache.addSpriteFrames(res.mah_down_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_out_left_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_out_right_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_out_ver_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mah_back_plist);

        this.node.setContentSize(1080, 540);
        this.addChild(this.node);


        // 播放or暂定
        var playBtn = ccui.helper.seekWidgetByName(this.node, "playbtn");
        playBtn.addTouchEventListener((function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) {
                return false;
            }
            this.isPause = !this.isPause;
            sender.loadTextureNormal(this.isPause ? res.btn_bofang : res.btn_zanting);
        }).bind(this));


        //关闭战绩
        var closeBtn = ccui.helper.seekWidgetByName(this.node, "close");
        closeBtn.addTouchEventListener((function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) {
                return false;
            }
            this.unscheduleAllCallbacks();
            this.game.uimgr.showui("gameclass.hallui");
            this.game.uimgr.closeui("gameclass.ReplayWindow");
        }).bind(this));

        //快进
        var btn_qianjin = ccui.helper.seekWidgetByName(this.node, "btn_qianJin");
        btn_qianjin.addTouchEventListener((function (sender, type) {
            this.unscheduleAllCallbacks();
            this.speed = this.speed < 1 ? 1.5 : 0.8;
            // cc.log("this.speed="+this.speed);
            this.startReplay(this.speed);
        }).bind(this));

        //后退
        var btn_houTui = ccui.helper.seekWidgetByName(this.node, "btn_houTui");
        btn_houTui.addTouchEventListener((function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) {
                return false;
            }
            this.playerNextRecord(0);
        }).bind(this));

        // 上一局
        var btn_shangJu = ccui.helper.seekWidgetByName(this.node, "btn_shangJu");
        btn_shangJu.addTouchEventListener((function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) {
                return false;
            }
            this.playerNextRecord(-1);
        }).bind(this));

        // 下一局
        var btn_xiaJu = ccui.helper.seekWidgetByName(this.node, "btn_xiaJu");
        btn_xiaJu.addTouchEventListener((function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) {
                return false;
            }
            this.playerNextRecord(1);
        }).bind(this));

        this.cardCommonNode = ccui.helper.seekWidgetByName(this.node, "cardCommonNode");
    },

    initReplayData: function () {
        this.stepUid = [];
        this.curCards = [[], [], [], []];
        this.curCardsSP = [[], [], [], []];
        this.stepCards = [];
        this.handNode = [];
        this.queType = [-1, -1, -1, -1];
        this.isHasHu = [false, false, false, false];
        for (var i = 0; i < 4; i++) {
            this.huLogoSP[i].setVisible(false);
        }
        this.isQue = [true, true, true, true];
        this.tableNode = new cc.Layer();
        this.node.addChild(this.tableNode);

        for (var i = 0; i < 4; i++) {
            var myLayer = new cc.Layer();
            this.handNode[i] = myLayer;
            this.node.addChild(myLayer);
        }
        for (var dN = 0; dN < 4; dN++) {
            this.deskCardsNum[dN] = 0;
        }
        this.startPosArr = [cc.p(320, 30), cc.p(960, 100), cc.p(800, 500), cc.p(140, 470)];
        this.pengGangPosArr = [cc.p(340, 60), cc.p(987, 100), cc.p(760, 529), cc.p(163, 470)];

        this.CONST_STARTPOS = this.startPosArr.slice(0);
        this.CONST_PENGGANGPOS = this.pengGangPosArr.slice(0);

        this.outPokerPosArr = [cc.p(400, 210), cc.p(820, 180), cc.p(750, 400), cc.p(320, 410)];
        this.drawCardPosArr = [cc.p(830, 30), cc.p(960, 500), cc.p(290, 500), cc.p(140, 60)];

        this.pengGangArr = [[], [], [], []];
        this.pengGangNodeArr = [[], [], [], []];
    },


    setMod: function (record_info) {
        this.mod_record = record_info;
        this.initReplayData();

        var strArr = [res.img_tiao, res.img_tong, res.img_wan];

        this.mod_record.getRecordBureau(function (datas) {
            if(datas.info == null || datas.info == "")return;
            this.record_info = JSON.parse(datas.info);
            // cc.log(this.record_info);
            //this.steps = datas.step;

            var stepObj = this.record_info.step;
            if(stepObj)
            {
                for(var i =0;i< stepObj.length;i++)
                {
                    if(stepObj[i].uid == 0)
                    {
                        this.hunPaiCardArr = stepObj[i].card;
                    }
                }
            }

            this.updateCardCommon();
            ccui.helper.seekWidgetByName(this.node, "record_id").setString("战绩回放码：" + this.record_info.roomid.toString()
                + this.game.modmgr.mod_login.logindata.uid.toString());

            var _junumstr = this.record_info.roomid.toString().slice(-2);
            ccui.helper.seekWidgetByName(this.node, "jushu").setString("第" + _junumstr + "局");

            var paoString = ["不跑","跑 x1","跑 x2"];
            // for(var i=0; i < this.record_info.person.length; i++){
            for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
                var userhead = ccui.helper.seekWidgetByName(this.node, "userhead" + i);
                var usernameTxt = userhead.getChildByName("username");
                var userscoreTxt = userhead.getChildByName("userscore");
                var paoText = userhead.getChildByName("Text_pao");
                var quelogo = ccui.helper.seekWidgetByName(this.node, "queLogo" + i);
                var headborder = ccui.helper.seekWidgetByName(this.node, "head" + i);
                if (this.record_info.person.length <= i) {
                    userhead.setVisible(false);
                    usernameTxt.setVisible(false);
                    userscoreTxt.setVisible(false);
                    quelogo.setVisible(false);
                    headborder.setVisible(false);
                    paoText.setVisible(false);
                    break;
                }

                this.curCards[i] = this.record_info.person[i].card;
                //this.curCards[i].sort(function(a,b){return a-b});

                this.stepUid[i] = this.record_info.person[i].uid;
                this.queType[i] = this.record_info.person[i].que;
                this.mySort(i);


                var username = this.record_info.person[i].name;
                if (username == "") {
                    username = "游客";
                }
                usernameTxt.setString(username);
                if (this.queType[i] < 0) {
                    quelogo.setVisible(false);
                } else {
                    quelogo.setTexture(strArr[this.queType[i]]);
                }
                var userScore = this.record_info.person[i].score;
                userscoreTxt.setString(userScore);

                var userPao = this.record_info.person[i].piao;

                if(userPao < 0)
                {
                    paoText.setString("");
                }
                else
                {
                    paoText.setString(paoString[userPao].toString());
                }

                gameclass.mod_base.showtximg(userhead, this.record_info.person[i].head, 0, 0, "im_headbg2");
                this.renderAllCard(i);
            }
            if (this.stepCards) {
                this.stepCards = this.record_info.step;
                this.caishen=this.stepCards[0].card;
                var randomStr = "card_" +this.caishen[0]+ ".png";
                ccui.helper.seekWidgetByName(this.node, "caishen").initWithSpriteFrameName(randomStr);
                this.stepCards.shift();
                this.startReplay(this.speed);
            }
        }.bind(this));
    },


    renderAllCard: function (index) {
        for (var i = 0; i < 4; i++) {
            this.startPosArr[index] = cc.p(this.CONST_STARTPOS[index]);
            this.pengGangPosArr[index] = cc.p(this.CONST_PENGGANGPOS[index]);
        }
        this.handNode[index].removeAllChildren();
        this.renderPengGangCard(index);
        this.renderHandCard(index);
    },

    renderPengGangCard: function (index) {
        for (var i = 0; i < this.pengGangArr[index].length; i++) {
            var box = new gameclass.OpBox(this.pengGangArr[index][i]);
            box.setAnchorPoint(0, 0);
            box.setPosition(this.pengGangPosArr[index]);
            switch (index) {
                case 0:
                    this.startPosArr[index].x += (box.getContentSize().width + 0);
                    this.pengGangPosArr[index].x += box.getContentSize().width;
                    break;
                case 1:
                    this.startPosArr[index].y += (box.getContentSize().height - 20);
                    this.pengGangPosArr[index].y += (box.getContentSize().height - 20);
                    box.setLocalZOrder(20 - i);
                    break;
                case 2:
                    this.startPosArr[index].x -= box.getContentSize().width;
                    this.pengGangPosArr[index].x -= box.getContentSize().width;
                    break;
                case 3:
                    this.startPosArr[index].y = this.startPosArr[index].y - box.getContentSize().height + 10;
                    this.pengGangPosArr[index].y = this.pengGangPosArr[index].y - box.getContentSize().height + 10;


                    // if (i == 0) {
                    //     this.startPosArr[index].y = this.startPosArr[index].y - box.getContentSize().height + 15;
                    // } else {
                    //     this.startPosArr[index].y -= box.getContentSize().height;
                    // }
                    //
                    // this.pengGangPosArr[index].y -= box.getContentSize().height;
                    break;
            }
            this.handNode[index].addChild(box);
        }
    },

    renderHandCard: function (index) {
        if (index == 0) {
            this.startPosArr[index].x += 10;
        } else if (index == 1) {
            // this.startPosArr[index].y -= 15;
        } else if (index == 3) {
            // this.startPosArr[index].x -= 15;
        } else if (index == 4) {
            // this.startPosArr[index].y -= 15;
        }


        this.creatPokerWithArr(index, this.curCards[index]);
        var len = this.curCardsSP[index].length;

        for (var i = 0; i < len; i++) {
            var cardSp = this.curCardsSP[index][i];
            cardSp.setAnchorPoint(0, 0);
            cardSp.setPosition(this.startPosArr[index]);
            switch (index) {
                case 0:
                    this.startPosArr[index].x += ((cardSp.getContentSize().width * cardSp.getScale()) - 2);
                    this.pengGangPosArr[index].x += ((cardSp.getContentSize().width * cardSp.getScale()) - 2);
                    break;
                case 1:
                    this.startPosArr[index].y += 29;
                    this.pengGangPosArr[index].y += 29;
                    cardSp.setLocalZOrder(20 - i);
                    break;
                case 2:
                    this.startPosArr[index].x -= ((cardSp.getContentSize().width * cardSp.getScale()) - 2);
                    this.pengGangPosArr[index].x -= ((cardSp.getContentSize().width * cardSp.getScale()) - 2);
                    break;
                case 3:
                    this.startPosArr[index].y -= 30;
                    this.pengGangPosArr[index].y -= 30;
                    cardSp.setLocalZOrder(i);
                    break;
            }
            //设置起牌位置
            if (this.isQiPai && i == len - 1) {
                cardSp.setPosition(this.drawCardPosArr[index]);
            }
            this.handNode[index].addChild(cardSp);
        }
    },

    creatPokerWithArr: function (index, _arr) {
        this.curCardsSP[index] = [];
        for (var i = 0; i < _arr.length; i++) {
            var cardSp = gameclass.hlgc.Table.CreateCard(_arr[i], index, 3, 0);
            if(this.isCardsCommon(_arr[i])){
                var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
                cardSp.addChild(logo);

                if(index == 1)
                {
                    logo.setScale(0.5);
                    logo.setRotation(-90);
                    logo.setPosition(10, 25);
                }
                else if(index == 3)
                {
                    logo.setScale(0.5);
                    logo.setRotation(90);
                    logo.setPosition(40, 35);
                }
                else
                {
                    logo.setScale(1);
                    logo.setPosition(20, 110);
                }
            }
            if (this.isHasHu[index]) {
                cardSp.setColor(new cc.color(127, 127, 127));
                this.huLogoSP[index].setVisible(true);
                this.huLogoSP[index].setLocalZOrder(8888);
            }
            if (this.isQue[index] && this.queType[index] >= 0) {
                if (_arr[i] < this.queType[index] * 10 || _arr[i] > (this.queType[index] + 1) * 10) {
                    cardSp.setColor(new cc.color(127, 127, 127));
                }
            }
            this.curCardsSP[index][i] = cardSp;
        }
    },

    //起牌
    onDrawCard: function (index, _cardNum) {
        this.isQiPai = true;
        if (_cardNum > this.queType[index] * 10 && _cardNum < (this.queType[index] + 1) * 10) {
            this.isQue[index] = true;
        }
        this.curCards[index].push(_cardNum);
        this.renderAllCard(index);
    },

    //出牌
    onSendCard: function (index, _cardNum) {
        this.isQiPai = false;
        for (var i = 0; i < this.curCards[index].length; i++) {
            if (this.curCards[index][i] == _cardNum) {
                this.curCards[index].splice(i, 1);
                break;
            }
        }
        if (_cardNum > 0) {
            //staticFunction.playUserTalk("m" + cardNum, this.getSex(_index),this.mod_hlgc.isPaoLong);

            //if(this.mod_hlgc.isPaoLong)
            //{
            //    mod_sound.playeffect(g_music["mjClick"]);
            //}
            //else
            //{

                var strCard = _cardNum < 10 ? "0" + String(_cardNum) : String(_cardNum);
                //var _sex = this.record_info.person[index].sex;
                var str = String("0"+String(strCard));
                mod_sound.playeffect(g_music[str]);
           // }
        }
        //this.curCards[index].sort(function(a,b){
        //    return a-b;
        //});
        this.mySort(index);
        this.renderAllCard(index);

        //staticFunction.playUserTalk("m" + _cardNum, 0);
    },

    //碰牌
    onPeng: function (index, _cardNum) {
        this.pengGangArr[index].push({type: 'peng', index: index, nums: [_cardNum], state: "huifang"});
        for (var i = 0; i < this.curCards[index].length; i++) {
            if (this.curCards[index][i] == _cardNum) {
                this.curCards[index].splice(i, 2);
                break;
            }
        }
        this.renderAllCard(index);

        //var _sex = this.record_info.person[index].sex;
        mod_sound.playeffect(g_music.mpeng);

        //staticFunction.playUserTalk("peng", 0);
    },

    //type为杠的类型，0为暗杠，1为明杠、2为擦杠
    onGang: function (index, _cardNum, type) {
        if (type != 2) {
            this.pengGangArr[index].push({
                type: 'gang',
                index: index,
                nums: [_cardNum],
                gangType: type,
                state: "huifang"
            });
        } else if (type == 2) {
            var isGet = false;
            for (var i = 0; i < this.pengGangArr[index].length; i++) {
                if (this.pengGangArr[index][i].nums[0] == _cardNum) {
                    this.pengGangArr[index].splice(i, 1, {
                        type: 'gang',
                        index: index,
                        nums: [_cardNum],
                        gangType: 2
                    });
                    isGet = true;
                    break;
                }
            }
            //以下为容错处理，可能服务器数据错误，是擦杠，又找不到碰牌
            if (!isGet) {
                this.onGang(index, _cardNum, 1);
                return;
            }
            //end
        }
        //this.curCards[index].sort(function(a,b){
        //    return a-b;
        //})
        this.mySort(index);
        var deleteNum = null;
        if (type == 0) deleteNum = 4;
        else if (type == 1) deleteNum = 3;
        else if (type == 2) deleteNum = 1;

        //add on lish，容错处理，服务器错将暗杠杠当做明杠
        deleteNum = staticFunction.numCheck(this.curCards[index], _cardNum);


        for (var i = 0; i < this.curCards[index].length; i++) {
            if (this.curCards[index][i] == _cardNum) {
                this.curCards[index].splice(i, deleteNum);
                break;
            }
        }
        // if (type == 2) {
        //     for (var i in this.pengGangArr[index]) {
        //         if (this.pengGangArr[index][i].nums[0] == _cardNum) {
        //             this.pengGangArr[index].splice(i, 1, {type: 'gang', index: index, nums: [_cardNum], gangType: 2});
        //             break;
        //         }
        //     }
        // }




        this.renderAllCard(index);




        //staticFunction.playUserTalk("gang", 0);
        //var _sex = this.record_info.person[index].sex;
        mod_sound.playeffect(g_music.mgang);
    },

    startReplay: function (delay) {
        var _this = this;
        this.schedule(function () {
            if (_this.isPause) {
                return;
            }
            // cc.log("curStep="+_this.stepIndex+",len="+_this.stepCards.length);
            _this.ReplayStep(_this.stepIndex);
            _this.stepIndex++;
            if (this.stepCards) {
                if (_this.stepIndex >= _this.stepCards.length || _this.stepIndex <= 0) {
                    _this.unscheduleAllCallbacks();
                }
            }
        }, delay);
    },

    isCardsCommon: function (card) {
        if (this.hunPaiCardArr.length == 0) return false;
        for (var i = 0; i <this.hunPaiCardArr.length; i++)
        {
            var cardobj = this.hunPaiCardArr[i];
            if(card == cardobj)
            {
                return true;
            }
        }
        return false;
    },
    //更新混牌
    updateCardCommon: function () {
        this.cardCommonNode.removeAllChildren();

        if (this.hunPaiCardArr.length == 0) return;

        for (var i = 0; i < this.hunPaiCardArr.length; i++) {
          var cardObj = this.hunPaiCardArr[i];
            var handSp = gameclass.hlgc.Table.CreateCard(cardObj, 2, 2, 0);
            this.cardCommonNode.addChild(handSp);
            handSp.setPositionX(i * 40);
            var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
            handSp.addChild(logo);
            logo.setPosition(20,110);
        }
    },
    playerNextRecord: function (cur) {
        var maxJu = 0;
        for (var i = 0; i < this.mod_record.maxJu.length; i++) {
            if (this.mod_record.maxJu[i].roomId == parseInt(this.record_info.roomid / 100)) {
                maxJu = this.mod_record.maxJu[i].maxJu;
                break;
            }
        }
        if (parseInt(this.mod_record.curBureauid % 100) + cur > maxJu) return;
        if (parseInt(this.mod_record.curBureauid % 100) + cur <= 0) return;
        cc.log("maxJu:" + maxJu);

        this.stepIndex = 0;
        if (this.stepCards) {
            this.stepCards.length = 0;
        }
        this.unscheduleAllCallbacks();
        for (var i = 0; i < 4; i++) {
            this.handNode[i].removeFromParent(true);
        }
        this.tableNode.removeFromParent(true);
        this.isQiPai = false;

        this.mod_record.setCurBureauid(this.mod_record.curBureauid + cur);
        this.setMod(this.mod_record);
    },

    // 查找uid在数组中的序号
    UidToOrder: function (uid) {
        for (var i = 0; i < this.stepUid.length; i++) {
            if (uid == this.stepUid[i])
                return i;
        }
    },

    playAnim: function (index, type) {
        var operateSp = ccui.helper.seekWidgetByName(this.node, "operateSp" + index);

        var str = "";
        if (type == 2) str = res.img_peng;
        else if (type == 3) str = res.img_hu;
        else if (type == 4 || type == 5 || type == 6) str = res.img_gang;

        operateSp.setTexture(str);
        operateSp.setVisible(true);
        operateSp.setLocalZOrder(11111);
        operateSp.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.7, 1.25), cc.fadeOut(0.7)), cc.callFunc(function () {
            operateSp.setVisible(false);
        })));
    },

    mySort: function (index) {
        var mySaveArr = [];
        this.curCards[index].sort(function (a, b) {
            return a - b;
        });
        if (this.queType[index] >= 0) {
            for (var i = 0; i < this.curCards[index].length; i++) {
                if (this.curCards[index][i] > this.queType[index] * 10 && this.curCards[index][i] < (this.queType[index] + 1) * 10) {
                    mySaveArr.push(this.curCards[index][i]);
                }
            }
        }
        if (mySaveArr.length > 0) {
            this.isQue[index] = true;
        } else {
            this.isQue[index] = false;
        }
        for (var i = 0; i < this.curCards[index].length; i++) {
            if (this.curCards[index][i] > this.queType[index] * 10 && this.curCards[index][i] < (this.queType[index] + 1) * 10) {
                this.curCards[index].splice(i, mySaveArr.length);
                break;
            }
        }
        //!!!!
        for (var i = 0; i < mySaveArr.length; i++) {
            this.curCards[index].push(mySaveArr[i]);
        }
        //this.curCards = this.curCards.concat(mySaveArr);
    },

    onHu: function (index) {
        this.isHasHu[index] = true;
        this.renderAllCard(index);
    },
});


// 打牌流程
gameclass.ReplayWindow.prototype.ReplayStep = function (stepNum) {
    if (!this.stepCards) return;
    if (stepNum >= this.stepCards.length) return;


    var orderNum = this.UidToOrder(this.stepCards[stepNum].uid);

    switch (this.stepCards[stepNum].type) {
        // 起牌
        case 0:
            this.onDrawCard(orderNum, this.stepCards[stepNum].card[0]);
            break;
        // 出牌
        case 1:
            this.onSendCard(orderNum, this.stepCards[stepNum].card[0]);

            var newSp = gameclass.hlgc.Table.CreateCard(this.stepCards[stepNum].card[0], orderNum, 3, 0);
            if (orderNum == 0) {
                newSp.setPosition(this.outPokerPosArr[0].x + (newSp.getContentSize().width * newSp.getScale() - 1) * (this.deskCardsNum[0] % 10),
                    this.outPokerPosArr[0].y - Math.floor(this.deskCardsNum[0] / 10) * 44);
                newSp.setLocalZOrder(this.deskCardsNum[0]);
            } else if (orderNum == 1) {
                newSp.setPosition(this.outPokerPosArr[1].x + Math.floor(this.deskCardsNum[1] / 10) * 47,
                    this.outPokerPosArr[1].y + 30 * (this.deskCardsNum[1] % 10));
                newSp.setLocalZOrder(1000 - this.deskCardsNum[1]);
            } else if (orderNum == 2) {
                newSp.setPosition(this.outPokerPosArr[2].x - (newSp.getContentSize().width * newSp.getScale() - 1) * (this.deskCardsNum[2] % 10),
                    this.outPokerPosArr[2].y + Math.floor(this.deskCardsNum[2] / 10) * 44);
                newSp.setLocalZOrder(1000 - this.deskCardsNum[2]);
            } else if (orderNum == 3) {
                newSp.setPosition(this.outPokerPosArr[3].x - Math.floor(this.deskCardsNum[3] / 10) * 47,
                    this.outPokerPosArr[3].y - 30 * (this.deskCardsNum[3] % 10));
                newSp.setLocalZOrder(this.deskCardsNum[3]);
            }
            this.tableNode.addChild(newSp);
            this.deskCardsNum[orderNum]++;
            this.lastOrderNum = orderNum;
            this.lastPlayedCard = newSp;
            break;
        // 碰牌
        case 2:
            this.deskCardsNum[this.lastOrderNum]--;
            if (this.lastPlayedCard) this.lastPlayedCard.removeFromParent();
            this.onPeng(orderNum, this.stepCards[stepNum].card[0]);
            this.playAnim(orderNum, 2);
            break;

        // 暗杠
        case 3:
            this.onGang(orderNum, this.stepCards[stepNum].card[0], 0);
            this.playAnim(orderNum, 4);
            break;

        // 明杠
        case 4:
            this.deskCardsNum[this.lastOrderNum]--;
            if (this.lastPlayedCard) this.lastPlayedCard.removeFromParent();
            this.onGang(orderNum, this.stepCards[stepNum].card[0], 1);
            this.playAnim(orderNum, 4);
            break;

        // 补杠
        case 5:
            this.onGang(orderNum, this.stepCards[stepNum].card[0], 2);
            this.playAnim(orderNum, 4);
            break;

        // 自摸胡
        case 6:
            this.onHu(orderNum);
            this.playAnim(orderNum, 3);

            //staticFunction.playUserTalk("zimo", 0);
            //var _sex = this.record_info.person[orderNum].sex;
            mod_sound.playeffect( g_music.mhu);
            break;

        //点炮胡
        case 7:
            this.onHu(orderNum);
            this.playAnim(orderNum, 3);

            //staticFunction.playUserTalk("dianpao", 0);
            //var _sex = this.record_info.person[orderNum].sex;
            mod_sound.playeffect(g_music.fdianpao);
            break;
    }
}








