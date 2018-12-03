/**
 * Created by yang on 2016/11/17.
 */

gameclass.hlgcResultAllUi = gameclass.baseui.extend({

    sprite: null,
    node: null,
    sharelayer: null,
    chulitu: null,
    shareing: null,
    round: null,
    curtime: null,
    mod_hlgc: null,
    playerInfo: null,
    majiangLayout:null,
    last_card:null,
    typeString:null,
    nScore:null,
    paoText:null,
    _Razz:null,
    ctor: function () {
        this._super();
        this.shareing = false;
        this._Razz = null;
    },

    show: function () {
        var _this = this;
        this.node = this.game.uimgr.createnode(res.hlgcResultAll, true);
        this.addChild(this.node);
        this.playerInfo = [];
        this.last_card = null;
        this.majiangLayout = ccui.helper.seekWidgetByName(this.node,"majiangLayout");
        this.typeString = ccui.helper.seekWidgetByName(this.node,"typeText");
        this.nScore = ccui.helper.seekWidgetByName(this.node,"scoreText");
        this.paoText = ccui.helper.seekWidgetByName(this.node,"paoText");
        this.typeString.setVisible(false);
        this.nScore.setVisible(false);
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            this.playerInfo[i] = ccui.helper.seekWidgetByName(this.node, "playerInfo" + i);
            ccui.helper.seekWidgetByName(this.playerInfo[i], "winerImg").setVisible(false);
            ccui.helper.seekWidgetByName(this.playerInfo[i], "fangzhu").setVisible(false);
        }

        //返回
        gameclass.createbtnpress(this.node, "back", function () {
            _this.game.uimgr.showui("gameclass.hallui");
            _this.game.uimgr.uis["gameclass.hallui"].update();
            _this.game.uimgr.closeui("gameclass.hlgcResultAllUi");
        });
        //返回
        gameclass.createbtnpress(this.node, "backBtn", function () {
            _this.game.uimgr.showui("gameclass.hallui");
            _this.game.uimgr.closeui("gameclass.hlgcResultAllUi");
        });

        //分享
        gameclass.createbtnpress(this.node, "share", function () {
            gameclass.mod_platform.savescreen(function (url) {
                if (window.wx) {
                    url = JSON.parse(url);
                    if (url.error == 0) {
                        _this.share(url.url);
                    }
                }
            });
        });
    },

    setData: function (mod) {
        this.mod_hlgc = mod;
        var scoreInfo = this.mod_hlgc.gameEndAllInfo.info;
        var roominfo = this.mod_hlgc.roominfo;


        ccui.helper.seekWidgetByName(this.node, "infoLeft").setString("房号ID：" + roominfo.roomid);
        ccui.helper.seekWidgetByName(this.node, "masterTxt").setString("房主ID：" + this.mod_hlgc.bankerUid);

        var myDate = new Date();
        var time = myDate.Format("yyyy-MM-dd hh:mm");
        var curStep = roominfo.step;
        if(curStep > roominfo.maxStep){
            curStep = roominfo.maxStep;
        }
        ccui.helper.seekWidgetByName(this.node, "maxstep_Text").setString("局数:" + curStep + "/" + roominfo.maxStep);
        ccui.helper.seekWidgetByName(this.node, "infoRight").setString(time);

        ccui.helper.seekWidgetByName(this.playerInfo[0], "fangzhu").setVisible(true);
        cc.log(roominfo.person);
        cc.each(scoreInfo, function (o, i) {
            if (o.uid == roominfo.person[i].uid) {
                scoreInfo[i]["name"] = roominfo.person[i]["name"];
                scoreInfo[i]["imgurl"] = roominfo.person[i]["imgurl"];
            }
        });

        var scoreArr = [];
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            if (i >= scoreInfo.length) {
                this.playerInfo[i].setVisible(false);
                continue;
            }

            ccui.helper.seekWidgetByName(this.playerInfo[i], "name").setString(scoreInfo[i]["name"]);
            ccui.helper.seekWidgetByName(this.playerInfo[i], "id").setString("ID:" + scoreInfo[i]["uid"]);
            ccui.helper.seekWidgetByName(this.playerInfo[i], "mingci").setString("自摸次数 " + scoreInfo[i]["zm"]);
            ccui.helper.seekWidgetByName(this.playerInfo[i], "anci").setString("接炮次数 " + (scoreInfo[i]["Hu"] - scoreInfo[i]["zm"]));
            ccui.helper.seekWidgetByName(this.playerInfo[i], "pici").setString("点炮次数 " + scoreInfo[i]["fp"]);
            ccui.helper.seekWidgetByName(this.playerInfo[i], "zimo").setString("暗杠次数 " + scoreInfo[i]["ag"]);
            ccui.helper.seekWidgetByName(this.playerInfo[i], "baoci").setString("明杠次数 " + (scoreInfo[i]["mg"] + scoreInfo[i]["cg"]));
            ccui.helper.seekWidgetByName(this.playerInfo[i], "fenshu").setString(scoreInfo[i]["score"]);
            var head_Img = ccui.helper.seekWidgetByName(this.playerInfo[i], "headImg");
            gameclass.mod_base.showtximg(head_Img, scoreInfo[i]["imgurl"], 0, 0, "im_headbg2");
            scoreArr[i] = scoreInfo[i]["score"];

            ccui.helper.seekWidgetByName(this.playerInfo[i], "paoIcon").setVisible(false);
        }
        var _index = scoreArr.indexOf(Math.max.apply(null, scoreArr));
        if(_index >= 0 && scoreArr[_index] > 0){
            ccui.helper.seekWidgetByName(this.playerInfo[_index], "winerImg").setVisible(true);
        }

        if(this.mod_hlgc.gameEndInfo)
        {
            this.last_card = this.mod_hlgc.gameEndInfo.lastcard;
        }
        for (var i = 0; i < scoreInfo.length; i++) {
            if (scoreInfo[i].uid == this.game.modmgr.mod_login.logindata.uid && this.mod_hlgc.gameEndInfo) {
                this._myCard(scoreInfo[i].max_card);
            }
        }

    },
    _myCard:function(cardinfo){

        var handCard = [];
        var pengGangCard = [];
        var hupaiInfo = [];
        var startPos = cc.p(200, 75);
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
        if(cardinfo.razz.length > 0)
        {
            this._Razz = cardinfo.razz;
        }
        handCard = cardinfo.card1;
        if(handCard)
        {
            if (cardinfo.cardm > 0) {
                this.last_card = cardinfo.cardm;
                var index = handCard.indexOf(this.last_card);
                if (index >= 0) {
                    handCard.splice(index, 1);
                }
            }
        }

        //handCard.push(handCardArr);
        if(cardinfo.state)
        {
            hupaiInfo.push(cardinfo.state);
        }

        pengGangCard = [];


        //碰牌数组
        var pengArr = cardinfo.cardp;
        if(pengArr)
        {
            for (var j = 0; j < pengArr.length; j++) {
                pengGangCard.push({type: 'peng', index: 2, nums: [pengArr[j]], gangType: 0});
            }
        }
        //明杠及擦杠数组
        var newArr = cardinfo.cardmg;
        if(newArr)
        {
            for (var j = 0; j < newArr.length; j++) {
                pengGangCard.push({type: 'gang', index: 2, nums: [newArr[j]], gangType: 1});
            }
        }
        //暗杠数组
        if(cardinfo.cardag)
        {
            for (var j = 0; j < cardinfo.cardag.length; j++) {
                pengGangCard.push({type: 'gang', index: 2, nums: [cardinfo.cardag[j]], gangType: 0});
            }
        }
        //旋风杠
        if(cardinfo.cardxfg)
        {
            for (var j = 0; j < cardinfo.cardxfg.length; j++) {
                pengGangCard.push({type: 'gang', index: 2, nums: [StaticData.WIND_GANG], gangType: 1});
                j+=3;
            }
        }
        //////////////////////////////////////
        if(handCard)
        {
            handCard.sort(function (a, b) {
                return a - b;
            });
        }

        if(pengGangCard)
        {
            for (var j = 0; j < pengGangCard.length; j++) {
                var obj = pengGangCard[j];
                var pengGangBox = new gameclass.OpBox(obj);
                //暗杠要翻一张
                if (obj.type == "gang" && obj.gangType == 0) {
                    pengGangBox.setScale(0.55);
                }
                //
                pengGangBox.setAnchorPoint(0, 0);
                this.majiangLayout.addChild(pengGangBox);
                pengGangBox.setPosition(startPos);
                startPos.x += pengGangBox.getContentSize().width * pengGangBox.getScale() + 15;
            }
        }

        if(handCard)
        {
            for (var m = 0; m < handCard.length; m++) {
                var handSp = gameclass.hlgc.Table.CreateCard(handCard[m], 2, 2, 0);
                this.majiangLayout.addChild(handSp);
                handSp.setPosition(startPos);
                startPos.x += (handSp.getContentSize().width * handSp.getScale());

                if(this.isCardsCommon(handCard[m])){
                    var logo = new cc.Sprite("res/ui/qhqp/img_hun@2x.png");
                    handSp.addChild(logo);
                    logo.setPosition(20, 110);
                }
            }
            if(this.last_card){
                startPos.x+=10;
                var handSp = gameclass.hlgc.Table.CreateCard(this.last_card, 2, 2, 0);
                this.majiangLayout.addChild(handSp);
                handSp.setPosition(startPos);
            }
        }



        var typeStrArr =[];
        var _myScore = 1;
        this.typeString.setVisible(true);
        this.nScore.setVisible(true);
        if(cardinfo.state)
        {
            var leng = cardinfo.state.length;
            if( leng > 0 )
            {
                for (var k = 0; k <leng; k++) {
                    var stateObj = cardinfo.state[k];
                    var state = stateObj.id;
                    typeStrArr.push(typeArr[state]);

                }
                var stateMaxObj = cardinfo.state[leng-1];
                _myScore = stateMaxObj.score * 3;
                _myScore ="+"+_myScore;
                this.typeString.setString(typeStrArr.toString());
                this.nScore.setString(_myScore);
            }
            else
            {
                this.typeString.setString("");
                this.nScore.setString("+0");
            }
        }

        var piaonum = cardinfo.piao;
        if(piaonum > 0)
        {
            var paoString = "";
            if( piaonum == 0)
            {
                paoString = "不跑";
            }else if( piaonum == 1)
            {
                paoString = "跑1";
            }else if(piaonum == 2)
            {
                paoString = "跑2";
            }
            this.paoText.setVisible(true);
            this.paoText.setString(paoString);
        }
        else
        {
            this.paoText.setVisible(false);
            this.paoText.setString("");
        }
        ///////////////////////////////////////
    },
    isCardsCommon: function (card) {
        if (this._Razz == null) return false;
        for (var i = 0; i < this._Razz.length; i++) {
            if(card == this._Razz[i])return true;
        }
        return false;
    },

});

gameclass.resultui.prototype.share = function (url) {
    gameclass.mod_platform.wxsharelink(StaticData.GAME_NAME + "结算", "战绩", url);
};