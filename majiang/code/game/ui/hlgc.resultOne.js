/**
 * Created by yang on 2016/11/14.
 */
gameclass.hlgcResultOneUi = gameclass.baseui.extend({

    node: null,
    mod_hlgc: null,
    leftCardListView: null,
    title: null,
    _baoContain: null,
    stateEnum: {
        win: 0,
        lost: 1,
        draw: 2,
        liuju: 3
    },
    ctor: function () {
        this._super();
    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.hlgcResultOne, true);
        this.addChild(this.node);

        this.leftCardListView = ccui.helper.seekWidgetByName(this.node, "leftCardListView");
        this.title = ccui.helper.seekWidgetByName(this.node, "title");
        this._baoContain = ccui.helper.seekWidgetByName(this.node, "baoContain");
    },
    setDjjsMod: function (mod) {
        this.mod_hlgc = mod;
        var _this = this;
        var player = [];

        var persons = _this.mod_hlgc.roominfo.person;
        var scoreInfo = _this.mod_hlgc.gameEndInfo.info;
        var directArr = ["东","西","南","北"];

        //排序
        var firstIndex = 0;
        var dealIndex = 0;
        for (var i = 0; i < scoreInfo.length; i++) {
            if (scoreInfo[i].uid == this.game.modmgr.mod_login.logindata.uid) {
                firstIndex = i;
            }0
            if (scoreInfo[i].deal) {
                dealIndex = i;
            }
        }
        var director = 0;
        for (var i = dealIndex; i < scoreInfo.length; i++) {
            scoreInfo[i].director = director++;
            if (scoreInfo.length == 3 && scoreInfo[i].director == 2) {
                scoreInfo[i].director = 3;
            }
        }
        for (var i = 0; i < dealIndex; i++) {
            scoreInfo[i].director = director++;
            if (scoreInfo.length == 3 && scoreInfo[i].director == 2) {
                scoreInfo[i].director = 3;
            }
        }
        var personArr = [];
        var index = 0;
        for (var i = firstIndex; i < persons.length; i++) {
            personArr[index++] = persons[i];
        }
        for (var i = 0; i < firstIndex; i++) {
            personArr[index++] = persons[i];
        }
        var scoreInfoArr = [];
        index = 0;
        for (var i = firstIndex; i < scoreInfo.length; i++) {
            scoreInfoArr[index++] = scoreInfo[i];
        }
        for (var i = 0; i < firstIndex; i++) {
            scoreInfoArr[index++] = scoreInfo[i];
        }
        //----------

        //可能是胡的牌
        //var last_card = _this.mod_hlgc.gameEndInfo.lastcard;
        var last_card = [];
        var handCard = [];
        var pengGangCard = [];
        var hupaiInfo = [];
        var startPos = [];
        var typeArr = [
            "",
            "平胡X1",
            "门前清X2",
            "素胡X2",
            "飘胡X2",
            "混吊X2",
            "混吊混X4",
            "双清X4",
            "七对胡X4",
            "大吊车X4",
            "天胡X10",
            "地胡X10",
            "混杠X10",
            "天地胡七对X10",
            "地胡七对X10",
            "杠上开花X2",
            "海底捞X2",
            "飘胡X4",
            "门清飘X4",
            "双清飘X8",
            "豪华X8",
            "双豪华X16",
            "三豪华X32",
            "天胡豪华X20",
            "天胡双豪华X40",
            "天胡三豪华X80",
            "地胡豪华X20",
            "地胡双豪华X40",
            "地胡三豪华X80"
        ];
        var baoArr = [];
        if (_this.mod_hlgc.gameEndInfo.bao != null) {
            baoArr = _this.mod_hlgc.gameEndInfo.bao;
        }

        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            player[i] = ccui.helper.seekWidgetByName(this.node, "player" + i);
            if (i >= scoreInfoArr.length) {
                player[i].setVisible(false);
                continue;
            }

            var handCardArr = scoreInfoArr[i].card.card1;
            if (scoreInfoArr[i].huid > 0) {
                if (scoreInfoArr[i].card.cardm > 0) {
                    last_card[scoreInfoArr[i].uid] = scoreInfoArr[i].card.cardm;
                    var index = handCardArr.indexOf(scoreInfoArr[i].card.cardm);
                    if (index >= 0) {
                        handCardArr.splice(index, 1);
                    }
                }
            }

            handCard.push(handCardArr);
            hupaiInfo.push(scoreInfoArr[i].state);
            pengGangCard[i] = [];
            startPos.push(cc.p(0, 30));

            //碰牌数组
            for (var j = 0; j < scoreInfoArr[i].card.cardp.length; j++) {
                var card = scoreInfoArr[i].card.cardp[j];
                if (scoreInfoArr[i].peng_uids != null) {
                    var $pengbackIndex = _this.mod_hlgc.getPengBackIndex(scoreInfoArr[i].uid, scoreInfoArr[i].peng_uids[card]);
                    pengGangCard[i].push({
                        type: 'peng',
                        index: 2,
                        nums: [scoreInfoArr[i].card.cardp[j]],
                        pengbackIndex: $pengbackIndex
                    });
                } else {
                    pengGangCard[i].push({
                        type: 'peng',
                        index: 2,
                        nums: [scoreInfoArr[i].card.cardp[j]],
                        pengbackIndex: 0
                    });
                }
            }
            //明杠及擦杠数组
            var newArr = scoreInfoArr[i].card.cardmg.concat(scoreInfoArr[i].card.cardcg);
            for (var j = 0; j < newArr.length; j++) {
                pengGangCard[i].push({type: 'gang', index: 2, nums: [newArr[j]], gangType: 1});
            }
            //暗杠数组
            for (var j = 0; j < scoreInfoArr[i].card.cardag.length; j++) {
                pengGangCard[i].push({type: 'gang', index: 0, nums: [scoreInfoArr[i].card.cardag[j]], gangType: 0});
            }
            //旋风杠
            for (var j = 0; j < scoreInfoArr[i].card.cardxfg.length; j++) {
                pengGangCard[i].push({type: 'gang', index: 2, nums: [StaticData.WIND_GANG], gangType: 1});
                j+=3;
            }
        }

        var mineState;
        for (var i = 0; i < scoreInfoArr.length; i++) {
            player[i].getChildByName("name").setString(personArr[i].name);
            player[i].getChildByName("zongfenNum").setString(scoreInfoArr[i].curscore);
            player[i].getChildByName("img_zhuang").setVisible(scoreInfoArr[i].deal);
            player[i].getChildByName("cardType").setString(this.getTotalStr(hupaiInfo[i]));
            player[i].getChildByName("huLogo").setVisible(false);
            var directIndex =  scoreInfoArr[i].seat;
            if(directIndex == 0)
            {
                directIndex = 3;
            }
            else
            {
                directIndex = directIndex - 1;
            }

            player[i].getChildByName("director" + directIndex).setVisible(true);

            var paoString = "";
            if( scoreInfoArr[i].piao == 0)
            {
                paoString = "不跑";
            }else if( scoreInfoArr[i].piao == 1)
            {
                paoString = "跑1";
            }else if( scoreInfoArr[i].piao == 2)
            {
                paoString = "跑2";
            }
            player[i].getChildByName("paoText").setString(paoString);

            if (scoreInfoArr[i].uid == this.game.modmgr.mod_login.logindata.uid) {
                if (scoreInfoArr[i].curscore > 0 && scoreInfoArr[i].huid > 0) {
                    mineState = this.stateEnum.win;
                } else if (scoreInfoArr[i].curscore < 0) {
                    mineState = this.stateEnum.lost;
                } else {
                    mineState = this.stateEnum.draw;
                }
            }

            handCard[i].sort(function (a, b) {
                return a - b;
            })

            for (var j = 0; j < pengGangCard[i].length; j++) {
                var obj = pengGangCard[i][j];
                var pengGangBox = new gameclass.OpBox(obj);
                //暗杠要翻一张
                if (obj.type == "gang" && obj.gangType == 0) {
                    pengGangBox.setScale(0.55);
                }
                //
                pengGangBox.setAnchorPoint(0, 0);
                player[i].getChildByName("majiangLayout").addChild(pengGangBox);
                pengGangBox.setPosition(startPos[i]);
                startPos[i].x += pengGangBox.getContentSize().width * pengGangBox.getScale() + 15;
            }

            for (var j = 0; j < handCard[i].length; j++) {
                var handSp = gameclass.hlgc.Table.CreateCard(handCard[i][j], 2, 2, 0);
                player[i].getChildByName("majiangLayout").addChild(handSp);
                handSp.setPosition(startPos[i]);
                if(_this.mod_hlgc.isCardsCommon(handCard[i][j])){
                    var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
                    handSp.addChild(logo);
                    logo.setPosition(20, 110);
                }
                startPos[i].x += (handSp.getContentSize().width * handSp.getScale());
            }

            // if (scoreInfoArr[i].card.cardm > 0) {
            //     var zimoSp = gameclass.hlgc.Table.CreateCard(scoreInfoArr[i].card.cardm, 2, 2, 0);
            //     player[i].getChildByName("majiangLayout").addChild(zimoSp);
            //     zimoSp.setPosition(startPos[i].x + 25, startPos[i].y);
            // }
            if (scoreInfoArr[i].huid > 0) {
                // cc.log("last_card=" + last_card);
                var husp = gameclass.hlgc.Table.CreateCard(scoreInfoArr[i].card.cardm, 2, 2, 0);
                player[i].getChildByName("majiangLayout").addChild(husp);
                if(_this.mod_hlgc.isCardsCommon(scoreInfoArr[i].card.cardm)){
                    var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
                    husp.addChild(logo);
                    logo.setPosition(20, 110);
                }
                husp.setPosition(startPos[i].x + 25, startPos[i].y);
            }

            var typeStrArr = [];
            if (scoreInfoArr[i].huid == 1) {
                //typeStrArr.push("自摸");
            }

            for (var k = 0; k < scoreInfoArr[i].state.length; k++) {
                var stateObj = scoreInfoArr[i].state[k];
                var state = stateObj.id;
                typeStrArr.push(typeArr[state]);
            }

            player[i].getChildByName("cardType").setString(typeStrArr.toString());
        }

        this._baoContain.removeAllChildren();
        for (var i = 0; i < baoArr.length; i++) {
            var baoCard = baoArr[i];
            var baoCardItem = gameclass.hlgc.Table.CreateCard(baoCard, 2, 2, 0);
            baoCardItem.setAnchorPoint(0, 0);
            this._baoContain.addChild(baoCardItem);
            baoCardItem.setPositionX(i * (baoCardItem.getContentSize().width * baoCardItem.getScale() + 10));
            if(_this.mod_hlgc.isCardsCommon(baoCard)){
                var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
                baoCardItem.addChild(logo);
                logo.setPosition(20, 110);
            }
        }

        gameclass.createbtnpress(this.node, "nexttbtn", function () {
            _this.game.uimgr.closeui("gameclass.hlgcResultOneUi");
            if (_this.mod_hlgc.isOver) {
                _this.game.uimgr.showui("gameclass.hlgcResultAllUi").setData(_this.mod_hlgc);
            } else {
                _this.mod_hlgc.sendGameReady();
                _this.mod_hlgc.view.betCheck();
            }
        });
        gameclass.createbtnpress(this.node, "closeBtn", function () {
            _this.game.uimgr.closeui("gameclass.hlgcResultOneUi");
            if (_this.mod_hlgc.isOver) {
                _this.game.uimgr.showui("gameclass.hlgcResultAllUi").setData(_this.mod_hlgc);
            } else {
                _this.mod_hlgc.sendGameReady();
                _this.mod_hlgc.view.betCheck();
            }
        });
        gameclass.createbtnpress(this.node, "shareBtn", function () {
            gameclass.mod_platform.savescreen(function (url) {
                if (window.wx) {
                    url = JSON.parse(url);
                    if (url.error == 0) {
                        _this.share(url.url);
                    }
                }
            });
        });

        if (_this.mod_hlgc.gameEndInfo.hz) {
            mineState = this.stateEnum.liuju;
        }

        if (mineState == this.stateEnum.win) {
            this.title.setTexture("res/ui/qhqp/13-djjs/qh_title_win@2x.png");
        } else if (mineState == this.stateEnum.lost) {
            this.title.setTexture("res/ui/qhqp/13-djjs/qh_title_fail@2x.png");
        } else if (mineState == this.stateEnum.draw) {
            this.title.setTexture("res/ui/qhqp/13-djjs/qh_title_draw@2x.png");
        } else {
            this.title.setTexture("res/ui/qhqp/13-djjs/qh_title_draw@2x.png");
        }

        var myDate = new Date();
        var time = myDate.Format("yyyy-MM-dd hh:mm");
        ccui.helper.seekWidgetByName(this.node, "maxstep_Text").setString("局数:" + this.mod_hlgc.roominfo.step + "/" + this.mod_hlgc.roominfo.maxStep);
        ccui.helper.seekWidgetByName(this.node, "infoRight").setString(time);

        //test
        // this.mod_hlgc.leftCardArr = [7,6,37,5,37,34,19,37,14,12,8,2,17,9,21,1,11,4,33,26,11,23,32,16,5,27,23,11,35,28,26,6,16,15,7,6,37,5,37,34,19,37,14,12,8,2,17];
        //test end

        if (this.mod_hlgc.leftCardArr == null) return;

        var horNum = 6;
        var tmp = 0;
        var horList = new ccui.Layout();
        ;
        var len = this.mod_hlgc.leftCardArr.length;
        for (var i = 0; i < len; i++) {
            var card = this.mod_hlgc.leftCardArr[i];
            var horChildCard = gameclass.hlgc.Table.CreateCard(card, 2, 2, 0);
            horList.addChild(horChildCard);
            horChildCard.setAnchorPoint(cc.p(0, 1));
            horChildCard.setPositionX(tmp * 41);
            if(_this.mod_hlgc.isCardsCommon(card)){
                var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
                horChildCard.addChild(logo);
                logo.setPosition(20, 110);
            }

            tmp++;

            if ((i + 1) % horNum == 0) {
                tmp = 0;
                horList = new ccui.Layout();
                horList.setContentSize(cc.size(1195, 50));
            } else if (i % (horNum - 1) == 0) {
                this.leftCardListView.addChild(horList);
            }
        }
    },


    getTotalStr: function (arr) {
        var str = "";
        for (var i = 0; i < arr.length; i++) {
            str += arr[i];
        }
        return str;
    }
});


