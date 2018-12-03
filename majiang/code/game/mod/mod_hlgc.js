/**
 * Created by yang on 2016/11/10.
 */

gameclass.mod_hlgc = gameclass.mod_base.extend({
    roominfo: null,
    isPaoLong:null,
    mywebsocket: null,
    ongameready: null,
    ongameniuniuend: null,
    serverchair: null,
    ongameview: null,
    isOver: null,
    endinfo: null,
    gamestate: null,
    onchat: null,
    chatlst: null,
    gameEndInfo: null,   // 一盘结束的服务器信息
    gameEndAllInfo: null, // 总结算的服务器信息
    curDrawCardIndex: null,
    myUid: 0,
    maxNum: 0,//游戏开始时候的人数
    bankerUid: 0,
    HSZinfo: null,//牌局是否是换三张
    queType: -1,
    leftCardArr: [],
    //开局需要的用户数量
    _needUserNum: 0,
    _readyList: [],
    isSmothing:null,
    isDaiPaoLong:null,
    isHaveingSeat:null,
    _mySeat:null,
    isHouse:null,
    isGenzhuang:null,
    _nchupaiNum:null,
    dealCard : null,
    isSure:null,
    _turn:null,
    _houseId:null,
    _readyNum:null,

    ctor: function () {
        this.isOver = false;
        this.gamestate = 0;
        this.chatlst = [];
        this.queArr = [];
        this.leftCardArr = [];
        this._readyList = [];
        this.isPaoLong = false;
        this.isSmothing = false;
        this.isDaiPaoLong = false;
        this.isHaveingSeat = false;
        this._mySeat = -1;
        this.isHouse = false;
        this.isGenzhuang = 0;
        this._nchupaiNum = 0;
        this.dealCard = null;
        this.isSure = false;
        this._turn = 0;
        this._houseId = 0;
        this._readyNum = 0;
    },

    //服务器返回的消息
    entergame: function (_roominfo, _mywebsocket) {
        this.roominfo = _roominfo;
        this.mywebsocket = _mywebsocket;
        this.myUid = this.game.modmgr.mod_login.logindata.uid;

        this._houseId = this.roominfo.host;
        if( this.roominfo.host == this.game.modmgr.mod_login.logindata.uid)
        {
            this.isHouse = true;
        }
        else
        {
            this.isHouse = false;
        }

        var roomSetData = StaticData.getSetObj(_roominfo.type);
        this.roomSetArr = StaticData.roomParamAnalyze(_roominfo.type, _roominfo.param1, _roominfo.param2, 0, roomSetData.param1Arr);

        this._needUserNum = parseInt(_roominfo.param1 / 1000 % 10);
        // cc.log(_roominfo);
        this.updateroominfo(this.roominfo);

        // this.game.uimgr.showui(["gameclass.msgboxui"]).setString(_roominfo.type+"|"+_roominfo.param1+"|"+roomSetData.param1Arr.toString()+"|"+this.roomSetArr.toString(), function () {
        //
        // });


        var _this = this;
        this.mywebsocket.setonmsgfunc(function (ws, data) {
             cc.log("LVXIN_DATA",data);
            switch (data.msghead) {
                case "roominfo":
                    _this.joinRoomInfo(data.msgdata);
                    _this.view.checkSafe(data.msgdata.person);
                    break;
                case "gametime":
                    _this.view.showRuSteaTime(data.msgdata.time,true);
                    break;
                case "stopgametime":
                    _this.view.showRuSteaTime(null,false);
                    break;
                case "joinroomfail":
                    _this.mywebsocket.onclosefunc = null;
                    _this.game.modmgr.mod_login.dissmissroom();
                    break;
                case "exitroom":
                    _this.game.uimgr.closeui("gameclass.exitroom");
                    if (!_this.isOver) {
                        _this.mywebsocket.onclosefunc = null;
                        _this.game.modmgr.mod_login.dissmissroom();
                    }
                    break;

                case "tickroom":
                    _this.mywebsocket.onclosefunc = null;
                    _this.game.modmgr.mod_login.backlogin();
                    _this.game.uimgr.showui("gameclass.msgboxui");
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString("您的账号已在其他地方登陆");
                    break;
                case "gameseatqh":
                    _this.isHaveingSeat = true;
                    _this.checkSelfReady(data.msgdata);

                    _this.updateReady(data.msgdata.info);
                    _this.updateGameInfo(data.msgdata);

                    break;
                case "gameQHMJbegin":


                    for (var i = 0; i < data.msgdata.info.length; i++) {
                        var info = data.msgdata.info[i];
                        if (info.uid == _this.myUid) {
                            gameclass.isCheat = info.cheat_allowed;
                            break;
                        }
                    }


                    _this.gamestate = 1;
                    //_this.setAllReady();
                    _this.view.roomInfo.step += 1;
                    _this.updateGameInfo(data.msgdata);

                    //if(_this.roominfo.step == 0)
                    //{
                    //    _this.roominfo.step++;
                    //    _this.updateGameInfo(data.msgdata);
                    //    //_this.view._runBeginAction(function(){
                    //    //
                    //    //})
                    //}
                    //else
                    //{
                    //    _this.updateGameInfo(data.msgdata);
                    //}
                    _this.view.setSeatState();
                    _this.gameBegin(data.msgdata);
                    _this._nchupaiNum = 0;
                    _this.isGenzhuang = 0;
                    //for(var j =0;j< 4;j++)
                    //{
                    //    _this.isGenzhuang[j] = false;
                    //}
                    _this._turn = 0;
                    _this.dealCard = null;
                    _this.isSure =false;
                    // cc.log("开始张数:"+data.msgdata.num);

                    //防止最后一个人进来没检测同IP
                    if(_this.roominfo.step == 0){
                        _this.view.checkSafe(_this.roominfo.person);
                    }


                    var dealArr = [];
                    var queArr = [];

                    var slectThree = [];
                    var msgInfo = _this.offsetPlayer(data.msgdata.info);
                    for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
                        if (msgInfo[i] != null) {
                            dealArr.push(msgInfo[i].card.card1);
                            queArr.push(msgInfo[i].que);
                            slectThree.push(msgInfo[i].three);
                        } else {
                            dealArr.push([]);
                            queArr.push(0);
                            slectThree.push(0);
                        }
                    }
                    _this.queArr = queArr;
                    _this.view.onDealCards(dealArr);
                    // if (!_this.HSZinfo.isHSZ) {
                    //     _this.view.showQue(queArr);
                    // } else {//如果选择的是换三张，看谁没选
                    //     _this.view.showSlectLayout(slectThree);
                    //     _this.view.showSystemCard();
                    // }
                    //add by lish
                    _this.gameInfo = data.msgdata;
                    _this.getBankId();
                    _this.view.updateCardCommon();
                    break;
                case "gamebets":
                    _this.view.gamebets(data.msgdata.uid, data.msgdata.bets);
                    break;
                case "gameQHMJinfo":
                    _this.leftCardArr = data.msgdata.remain;

                    var chargenum = 0;
                    for (var i = 0; i < data.msgdata.info.length; i++) {
                        var info = data.msgdata.info[i];
                        //if (info.uid == _this.myUid) {
                        //    gameclass.isCheat = info.cheat_allowed;
                        //    break;
                        //}
                        if(info.deal && info.card.card2[0])
                        {
                            _this.dealCard = info.card.card2[0];
                        }
                        var _leng = info.card.card2.length;
                        chargenum += _leng;
                        if(chargenum < 4)
                        {
                            _this._turn = 0;
                        }
                        else
                        {
                            _this._turn = 1;
                        }

                    }
                    _this.chargeNum(data.msgdata.info);
                    for (var i = 0; i < data.msgdata.info.length; i++) {
                        var info = data.msgdata.info[i];
                        if (info.uid == _this.myUid) {
                            gameclass.isCheat = info.cheat_allowed;
                            break;
                        }
                    }

                    _this.updateReady(data.msgdata.info);

                    //_this.setAllReady();
                    _this._readyNum ++;
                    _this.updateGameInfo(data.msgdata);
                    _this.view.updateReadyView();
                    _this.view.betCheck();
                    //_this.updateGameInfo(data.msgdata);

                    _this.view.checkSafe(_this.roominfo.person);
                    break;

                case "gamethree":
                    _this.slectThree(data.msgdata);
                    break;

                case "gameQHMJthree":
                    _this.allSlectThree(data.msgdata);
                    _this.view.showQue(_this.queArr);
                    break;

                case "gameque":
                    _this.changeState(data.msgdata.uid, data.msgdata.bets);
                    break;

                case "gameallque":
                    _this.changeAllState(data.msgdata);
                    break;
                case "updcard":
                    var ss = data.msgdata;
                    break;
                case "gameview":
                    _this.ongameview();
                    break;
                case "dissmissroom":
                    // 关闭前一个框，不关的话可能导致叠加。
                    _this.game.uimgr.closeui("gameclass.exitroom");
                    _this.game.uimgr.showui("gameclass.exitroom", false);
                    _this.game.uimgr.uis["gameclass.exitroom"].setData(_this, data.msgdata);
                    break;
                case "nodissmissroom":
                    _this.game.uimgr.closeui("gameclass.exitroom");
                    _this.game.uimgr.showui("gameclass.msgboxui");
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString("有人不同意解散房间");
                    break;
                case "seastate":
                    _this.view.showSeaState();
                case "chatroom":
                    _this.chatlst[_this.chatlst.length] = data.msgdata;
                    //var curTalkIndex = _this.getPlayerIndexById(data.msgdata.uid);
                    var curTalkIndex = -1;
                    var _mrr=[null,null,null,null];
                    for(var i=0;i<_this.gameInfo.info.length;i++){
                        if(!_this.gameInfo.info[i]||_this.gameInfo.info[i].seat<0) continue;
                        _mrr[(_this.gameInfo.info[i].seat-_this._mySeat+4)%4]=gameclass.mod_base.deepCopy(_this.gameInfo.info[i]);
                    }
                    for(var i =0;i< _mrr.length;i++)
                    {
                        if(_mrr[i]&&_mrr[i].uid == data.msgdata.uid)
                        {
                            curTalkIndex = i;
                        }
                    }
                    _this.view.chatshowinfo(curTalkIndex, data.msgdata);
                    if (_this.game.uimgr.uis["gameclass.chatui"]) {
                        _this.game.uimgr.uis["gameclass.chatui"].pushstr(data.msgdata);
                    }
                    if (_this.onchat) {
                        _this.onchat(data.msgdata);
                    }
                    break;

                // 起牌
                case "gameQHMJ_draw":
                    var tm = new Date().getTime();
                    cc.log('收到服务器消息，开始处理起牌逻辑,时间戳:' + tm);
                    _this.DrawCard(data.msgdata);

                    var tm2 = new Date().getTime();
                    cc.log('客户端处理起牌完毕,时间戳:' + tm2 +', 耗时:' +(tm2-tm) +'ms');
                    break;
                //隐藏光标
                case "gameQHMJclose":
                    _this.view.closeArrow();
                    break;

                //出牌
                case "gameQHMJstep":
                    _this.DisplayStepCard(data.msgdata);
                    break;

                // 是否进行碰杠胡操作
                case "gameQHMJ_operator":
                    _this.isOperator(data.msgdata);
                    break;

                // 有人碰
                case "gameQHMJ_peng":
                    _this.isPeng(data.msgdata);
                    break;

                // 有人杠
                case "gameQHMJ_gang":
                    _this.isGang(data.msgdata);
                    break;
                //擦杠单独处理。因为擦杠可能会被胡的人抢,当胡的人点过时候。才可以擦杠
                case "gameQHMJ_cagang":
                    _this.isGang(data.msgdata);
                    break;

                case "gameQHMJhu":
                    _this.onHu(data.msgdata);
                    break;
                case "gameQHMJlast":
                    _this.leftCardArr = data.msgdata;
                    break;
                case "gameQHMJbao":
                    _this.view.showBao(data.msgdata);
                    // _this.view.showBao([1, 2]);
                    break;
                //单局结束 给单局结算数据
                case "gameQHMJend":
                    _this._readyList = [];
                    _this.gameInfo.begin = false;
                    _this.onSimpleEnd(data.msgdata);
                    break;
                //gameready 消息    第二局服务器才发送
                case "gameready":
                    _this.isOk(data.msgdata);
                    break;
                //gamegcbye 游戏结束 给总结算数据
                case "gameQHMJbye":
                    _this.isOver = true;
                    _this.gameEndAllInfo = data.msgdata;
                    _this.mywebsocket.onclosefunc = null;
                    _this.view.gameBye();

                    break;
                case "lineperson":
                    if (!_this.roominfo.person) return;
                    //_this.setuserReady(data.msgdata.uid, data.msgdata.line);
                    _this.view.setSelectSeatLine(data.msgdata);
                    if( !_this.roominfo.begin && _this.roominfo.step == 0)
                    {
                        //_this.view.setLivePlayerView(data.msgdata.uid);
                    }
                    // var curIndex = _this.getPlayerIndexById(data.msgdata.uid);
                    var curIndex = -1;
                    var _mrr=[null,null,null,null];
                    for(var i=0;i<_this.gameInfo.info.length;i++){
                        if(!_this.gameInfo.info[i]||_this.gameInfo.info[i].seat<0) continue;
                        _mrr[(_this.gameInfo.info[i].seat-_this._mySeat+4)%4]=gameclass.mod_base.deepCopy(_this.gameInfo.info[i]);
                    }
                    for(var i =0;i< _mrr.length;i++)
                    {
                        if(_mrr[i] && _mrr[i].uid == data.msgdata.uid)
                        {
                            curIndex = i;
                        }
                    }
                    if (curIndex >= 0) {
                        _this.view.initUserBaseView(data.msgdata,curIndex);
                    }

                    break;
                case "gameline":
                    if (_this.gamestate == 1 || _this.gamestate == 0) {
                        //var curIndex = _this.getPlayerIndexById(data.msgdata.uid);
                        // _this.view.userLineOut(curIndex, _this.persons[curIndex]);
                        _this.view.setSelectSeatLine(data.msgdata);
                        var curIndex = -1;
                        var _mrr=[null,null,null,null];
                        for(var i=0;i<_this.gameInfo.info.length;i++){
                            if(!_this.gameInfo.info[i]||_this.gameInfo.info[i].seat<0) continue;
                            _mrr[(_this.gameInfo.info[i].seat-_this._mySeat+4)%4]=gameclass.mod_base.deepCopy(_this.gameInfo.info[i]);
                        }
                        for(var i =0;i< _mrr.length;i++)
                        {
                            if(_mrr[i] && _mrr[i] && _mrr[i].uid == data.msgdata.uid)
                            {
                                curIndex = i;
                            }
                        }
                        _this.view.userLineOut(curIndex, data.msgdata);
                        _this.getplayerdatabyuid(data.msgdata.uid).line=data.msgdata.line;
                    }
                    break;
                case "gamekwxmygod":
                    if (this.game.uimgr.uis["gameclass.hlgc.cheatPlayMo"]) {
                        this.game.uimgr.uis["gameclass.hlgc.cheatPlayMo"].updateAllCard(data.msgdata.info);
                    }
                    break;
            }
        });
    },
    chargeNum: function (data) {
        var cardArr = [];
        var numAll = 0;
        if(data.length >= 4)
        {
            for(var i =0;i< 4;i++)
            {
                var card = data[i].card.card2;
                cardArr.push(card[0]);
                if(card && card.length > 0)
                {
                    var cardleng = card.length;
                    numAll += cardleng;
                }
            }
            this._nchupaiNum = numAll;

            for(var j =0;j< cardArr.length;j++)
            {
                if( cardArr[j] && cardArr[j] == this.dealCard)
                {
                    this.isGenzhuang  += 1;
                }
            }


        }

        //for(var j =0;j< 4;j++)
        //{
        //    this.isGenzhuang[j] = false;
        //}
    },
    //检查一张牌是否是癞子
    isCardsCommon: function (card) {
        if (this.gameInfo.Razz == null) return false;
        for (var i = 0; i < this.gameInfo.Razz.length; i++) {
            if(card == this.gameInfo.Razz[i])return true;
        }
        return false;
    },
    setAllReady: function () {
        this._readyList = [];
        for (var i = 0; i < this.persons.length; i++) {
            var person = this.persons[i];
            if (person == null) continue;
            this._readyList.push({uid: person.uid, ready: true});
        }
    },
    checkSelfReady: function (data) {
        if (!data.begin) {
            for (var i = 0; i < data.info.length; i++) {
                var userInfo = data.info[i];
                if (userInfo.uid == this.game.modmgr.mod_login.logindata.uid) {
                    if (!userInfo.ready) {
                        this.sendGameReady();
                    }
                    break;
                }
            }
        }
    },
    findPlayer:function(id){
        var arr = [];
        for(var i =0;i< this.roominfo.person.length;i++)
        {
            arr.push(this.roominfo.person[i].uid);
        }
        for(var i =0;i< arr.length;i++)
        {
            if(arr.indexOf(id) != -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        return false;
    },
    updateReady: function (infos) {
        this._readyList = [];
        for (var i = 0; i < infos.length; i++) {
            var info = infos[i];
            this._readyList.push({uid: info.uid, ready: info.ready});
        }
    },
    checkAllReady:function()
    {
        var num = 0;
        for (var i = 0; i < this._readyList.length; i++) {
            if(this._readyList[i].ready)
            {
                num++;
            }
        }
        if(num == 4)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    setuserReady: function (uid, isReady) {
        for (var i = 0; i < this._readyList.length; i++) {
            var obj = this._readyList[i];
            if (obj.uid == uid) {
                obj.ready = isReady;
                return;
            }
        }
        this._readyList.push({uid: uid, ready: true})
    },
    /**↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 给服务器发消息 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓**/

    //发送出牌的消息
    sendCard: function (data, func, _haveOutPoke, _specialOperate) {
        var datas = {
            card: data,
        };
        if (this.curDrawCardIndex == 0 && !_haveOutPoke && !_specialOperate) {
            this.mywebsocket.send("gamestep", datas);
        }
        else if (this.curDrawCardIndex == 0 && _specialOperate) {
            this.view.sendGuoCallBack();
            this.mywebsocket.send("gamestep", datas);
        }
        else {
            func();
        }
    },
    //发送选座位消息
    sendSeat:function(index){
        var datas = {seat: index,};
        this.mywebsocket.send("gameseatqh",datas);
    },
    //发送碰牌消息
    sendPeng: function () {
        this.mywebsocket.send("gamepeng", {});
    },
    sendGetBet: function (value) {
        var datas = {bets: value,};
        this.mywebsocket.send("gamebets", datas);
    },
    //发送杠牌消息
    sendGang: function (data) {
        var datas = {
            card: data,
        };
        this.mywebsocket.send("gamegang", datas);
        this.view.sendGangCallBack();
    },

    //发送胡牌消息
    sendHu: function () {
        this.mywebsocket.send("gamehu", {});
    },
    //发送过牌消息
    sendGuo: function () {
        this.view.saveArr = [];
        this.mywebsocket.send("gameguo", {});
    },

    //发送gameready，第二局开始才会发送
    sendGameReady: function () {
        this.mywebsocket.send("gameready", {});
    },

    dissmissroom: function (num) {
        var data = {type: num};
        this.mywebsocket.send("dissmissroom", data);
    },
    //测试胡牌的协议 直接发送一副定制好的 胡牌
    Testcard: function (data) {
        this.mywebsocket.send("gamekwxneed", data);
    },

    sendCheat: function (cardArr) {
        var data = {"card": cardArr};
        this.mywebsocket.send("gamekwxneed", data);
    },
    chat: function (type, info) {
        var data = {"type": type, "chat": info};
        this.mywebsocket.send("chatroom", data);
    },

    nodissmissroom: function () {
        var data = {};
        this.mywebsocket.send("nodissmissroom", data);
    },

    /**↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑   服务器【发来消息】   ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑**/

    //广播出牌
    DisplayStepCard: function (data) {
        var card = data.card;
        var _index = -1;
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        for(var i =0;i< _mrr.length;i++)
        {
            if(_mrr[i].uid == data.uid)
            {
                _index = i;
            }
            if(_mrr[i].deal && _mrr[i].uid == data.uid && this._turn == 0)
            {
                this.dealCard = data.card;
            }

        }
        if(this._turn == 0 && this._nchupaiNum < 4)
        {
            if(this.dealCard == data.card)
            {
                this.isGenzhuang ++;
                cc.log(this.isGenzhuang);
            }
            //else
            //{
            //    this.isGenzhuang = false;
            //}
        }
        else
        {
            this._nchupaiNum = 0;
            this._turn = 1;
            //for(var j =0;j< 4;j++)
            //{
            this.isGenzhuang= 0;
            // }

        }

        //var _index = this.getPlayerIndexById(data.uid);

        // if(this.roomSetArr[5] == 1){
        //     this.view.onSendCard(0, _index);
        // }else{
        this.view.onSendCard(card, _index);
        // }

        this._nchupaiNum++;
        if(this._nchupaiNum >=4 )
        {
            this._turn = 1;
            this.isGenzhuang = 0;
        }
    },

    slectThree: function (data) {
        var _index = -1;
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        for(var i =0;i< _mrr.length;i++)
        {
            if(_mrr[i].uid == data.uid)
            {
                _index = i;
            }
        }
        // var _index = this.getPlayerIndexById(data.uid);
        var slectCard = data.three;
        this.view.showThree(_index, slectCard);
    },

    allSlectThree: function (data) {
        var buArr = data.get;
        var removeArr = data.remove;
        this.view.allSlectThree(buArr, removeArr);
    },

    //起牌
    DrawCard: function (data) {
        var _index = -1;
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        for(var i =0;i< _mrr.length;i++)
        {
            if(_mrr[i].uid == data.uid)
            {
                _index = i;
            }
        }
        // var _index = this.getPlayerIndexById(data.uid);
        this.curDrawCardIndex = _index;
        var nowIndex = this.getPlayerSeatById(data.uid);
        this.view.onDrawCard(nowIndex,_index, data);


    },

    //是否有碰杠胡的操作
    isOperator: function (data) {
        this.view.onOperate(data);
    },
    //碰
    isPeng: function (data) {
        var pengbackIndex = this.getPengBackIndex(data.uid, data.ouid);

        // var _index = this.getPlayerIndexById(data.uid);
        var _index = -1;
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        for(var i =0;i< _mrr.length;i++)
        {
            if(_mrr[i].uid == data.uid)
            {
                _index = i;
            }
        }
        this.curDrawCardIndex = _index;
        var nowIndex = this.getPlayerSeatById(data.uid);
        this.view.onPeng(nowIndex,_index, data.card, pengbackIndex);


        // cc.log("pengBackIndex=="+pengbackIndex)
    },
    //获取碰牌时，需要盖牌索引
    getPengBackIndex: function (uid, ouid) {
        var result = 0;

        var pengIndex = 0;
        var bepengIndex = 0;
        for (var i = 0; i < this.persons.length; i++) {
            if (this.persons[i] && this.persons[i].uid == uid) {
                pengIndex = i;
            } else if (this.persons[i] && this.persons[i].uid == ouid) {
                bepengIndex = i;
            }
        }

        if ((bepengIndex + 1 + gameclass.HLGC_MAX_USER) % gameclass.HLGC_MAX_USER == pengIndex) {
            return 0;
        } else if ((bepengIndex - 1 + gameclass.HLGC_MAX_USER) % gameclass.HLGC_MAX_USER == pengIndex) {
            return 2;
        } else {
            return 1;
        }
    },
    //杠
    isGang: function (data) {
        //var _index = this.getPlayerIndexById(data.uid);
        var _index = -1;
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        for(var i =0;i< _mrr.length;i++)
        {
            if(_mrr[i].uid == data.uid)
            {
                _index = i;
            }
        }
        this.curDrawCardIndex = _index;
        this.view.onGang(_index, data.card, data.view);//0 暗杠 、1 明杠 2、补杠
    },
    //有玩家胡
    onHu: function (data) {
        //
        var _index = -1;
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        for(var i =0;i< _mrr.length;i++)
        {
            if(_mrr[i].uid == data.uid)
            {
                _index = i;
            }
        }
        //var _index = this.getPlayerIndexById(data.uid);
        // var huIndex = parseInt(data.hutype / 10);//第几个胡牌
        // var type = data.hutype % 10;//点炮还是自摸
        // var huNum = data.hucard;
        this.view.onHu(_index, 0, data.ouid, data.card);
    },
    //单局结算
    onSimpleEnd: function (data) {
        var info = this.offsetPlayer(data.info);
        var totalArr = [];


        var _mrr=[null,null,null,null];
        for(var i=0;i<data.info.length;i++){
            if(!data.info[i]||data.info[i].seat<0) continue;
            _mrr[(data.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(data.info[i]);
        }

        for (var i = 0; i < _mrr.length; i++) {
            if (_mrr[i] != null) {
                totalArr.push(_mrr[i].total);
            } else {
                totalArr.push(0);
            }
        }
        this.view.reflashScore(totalArr);

        this.gameEndInfo = {"hz": data.hz, "lastcard": data.lastcard, "info": data.info, "bao": data.bao};
        this.view.onSimpleEnd();

    },

    getplayerdatabyuid: function (uid) {
        for (var i = 0; i < this.roominfo.person.length; i++) {
            if (this.roominfo.person[i].uid == uid) {
                return this.roominfo.person[i];
            }
        }
    },
    //--------------------------------------logic---------------------------------------------------
    //与UI的JS文件 绑定
    bindUI: function (ui) {
        this.view = ui;
    },

    //玩家选缺后更新显示
    changeState: function (uid, bet) {
        var _index = -1;
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        for(var i =0;i< _mrr.length;i++)
        {
            if(_mrr[i].uid == uid)
            {
                _index = i;
            }
        }
        //var curIndex = this.getPlayerIndexById(uid);
        this.view.changeState(_index, bet);
    },
    //所有玩家选缺后更新显示
    changeAllState: function (data) {
        data = this.offsetPlayer(data.queinfo);
        var queArr = [];
        //modify by lish
        for (var i = 0; i < data.length; i++) {
            queArr[i] = data[i].bets;
        }
        this.view.showQue(queArr);
    },

    //加入房间
    joinRoomInfo: function (data) {
        this.roominfo.person = data.person;

        this.maxNum = this.roominfo.person.length;
        this.getCurPlayerIndex(data.person, this.myUid);
        data = this.offsetPlayer(data.person);
        this.persons = data;
        if (this.gameInfo.begin || this.roominfo.step > 0) {
            this.view.setPlayerState(this.persons);
        }
        else
        {
            this.view.setUnSelectSeatLine(this.persons);
        }
        //this.view.updatePlayerinfo(this.persons);
    },

    getPlayerSeatById: function (uid) {
        var tempData=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            tempData[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        for (var i = 0; i <tempData.length; i++) {
            if (tempData[i] && tempData[i].uid == uid) {
                return i;
            }
        }
        return -1;
    },
    //找到key 0123
    getPlayerIndexById: function (uid) {
        for (var i = 0; i < this.persons.length; i++) {
            if (this.persons[i] && this.persons[i].uid == uid) {
                return i;
            }
        }
        return -1;
    },
    _getPersonDataByUid:function(_uid){
        for(var i=0;i<this.roominfo.person.length;i++){
            if(this.roominfo.person[i] && this.roominfo.person[i].uid==_uid){
                return this.roominfo.person[i];
            }
        }
        return -1;
    },
    _getnewPersonDataByUid:function(data,_uid){
        for(var i=0;i< data.length;i++){
            if(data[i] && data[i].uid==_uid){
                return data[i];
            }
        }
        return -1;
    },
    //通过ID 找到索引位置
    getCurPlayerIndex: function (arr, uid) {
        if(arr)
        {
            for (var i = 0; i < arr.length; i++) {
                if (!arr[i]) {
                    continue;
                }
                if (arr[i].uid == uid) {
                    this.curPlayerIndex = i;
                    break;
                }
            }
            return this.curPlayerIndex;
        }

    },
    //将进房间的玩家 顺序排序
    offsetPlayer: function (arr) {
        for (var i = 0; i < this._needUserNum; i++) {
            if (i >= arr.length) {
                arr.push({});
            }
        }

        var player = [];
        for (var x = 0; x < gameclass.HLGC_MAX_USER; x++) {
            var index = this.getSceneIndexFromS(x);
            // cc.log("index="+index);
            player[index] = arr[x] ? arr[x] : null;
        }
        // cc.log("-------");
        return player;
    },

    updateGameInfo: function (gameInfo) {
        this.gameInfo = gameInfo;

        // this.view.updatePlayerinfo(this.persons);
        for(var i=0;i<gameInfo.info.length;i++){
            if(gameInfo.info[i].uid==this.myUid){
                this._mySeat=gameInfo.info[i].seat;
                break;
            }
        }
        var _mrr=[null,null,null,null];
        for(var i=0;i<gameInfo.info.length;i++){
            if(!gameInfo.info[i]||gameInfo.info[i].seat<0) continue;
            _mrr[(gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(gameInfo.info[i]);
        }
        this.getBankId();
        this.view.setRoomInfo(this.roominfo);
        if(gameInfo.begin || this.roominfo.step > 0)
        {
            if(this.game.modmgr.mod_login.logindata.uid == this.myUid)
            {
                this.isHaveingSeat = true;
            }

        }
        this.view.updatePlayerinfo(_mrr);
        this.view.updateCardCommon();

        if (gameInfo.begin || this.roominfo.step > 0) {
            for(var j = 0;j< 4;j++)
            {
                var ss = _mrr;
                this.view.gamebets(_mrr[j].uid,_mrr[j].piao);
            }
            this.reconnectionShow();
            return;
        }
        //else
        //{
        //    if(this.game.modmgr.mod_login.logindata.uid == this.myUid)
        //    {
        //        this.isHaveingSeat = true;
        //    }
        //}
    },
    //_sortGameInfoArr:function(){
    //    var _this=this;
    //    var _mrr=[null,null,null,null];
    //    for(var i=0;i<this.gameInfo.info.length;i++){
    //        if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
    //        _mrr[(this.gameInfo.info[i].seat-this.serverchair+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
    //    }
    //    for(var i=0;i<_mrr.length;i++){
    //        this.gameInfo.info[i]=gameclass.mod_base.deepCopy(_mrr[i]);
    //    }
    //    cc.log("八一八一八一",this.gameInfo.info);
    //},
    getUserRead: function (uid) {
        for (var i = 0; i < this._readyList.length; i++) {
            var obj = this._readyList[i];
            if (obj.uid == uid) {
                return obj.ready;
            }
        }
        return false;
    },
    //准备
    isOk: function (data) {
        this.setuserReady(data.uid, true);
        this.view.updateReadyView();
        this.view.betCheck();
        // var _index = this.getPlayerIndexById(data.uid);

        // this.gameBegin(this.gameInfo);

        // var playerInfo = this.offsetPlayer(this.gameInfo.info);
        // this.view.gameReady(playerInfo, this.roominfo, 0);
    },
    getBankId: function () {
        if (!this.gameInfo) return;
        if (!this.gameInfo.info) return;
        var playerInfo = this.offsetPlayer(this.gameInfo.info);
        this.bankerUid = 0;

        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }

        for (var i = 0; i < _mrr.length; i++) {
            if (_mrr[i] && _mrr[i].deal) {
                this.bankerUid = _mrr[i].uid;
                break;
            }
        }
    },
    reconnectionShow: function () {
        if (this.gameInfo.begin) {
            // this.roominfo.step--;
            this.gameBegin(this.gameInfo);
            this.chuliData(this.gameInfo);
            this.view.setSeatState();
        } else {
            if (!this.gameInfo.info) return;
            var playerInfo = this.offsetPlayer(this.gameInfo.info);

            var _mrr=[null,null,null,null];
            for(var i=0;i<this.gameInfo.info.length;i++){
                if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
                _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
            }
            this.view.reconnectionShow(_mrr, this.roominfo, this.persons);
            if (playerInfo[0].ready) {

            } else {
                this.gameEndInfo = {
                    "hz": this.gameInfo.hz,
                    "lastcard": this.gameInfo.lastcard,
                    "info": this.gameInfo.info,
                    "bao": this.gameInfo.bao,
                };
                this.game.uimgr.showui("gameclass.hlgcResultOneUi").setDjjsMod(this);
            }
        }
    },
    clearDesk: function () {

    },
    gameBegin: function (data) {

        this.view.setSeatBtn();

        var playerInfo = this.offsetPlayer(data.info);
        var _mrr=[null,null,null,null];
        for(var i=0;i<data.info.length;i++){
            if(!data.info[i]||data.info[i].seat<0) continue;
            _mrr[(data.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(data.info[i]);
        }
        this.view.gameReady(_mrr, this.roominfo, data.num);

        var totalArr = [];
        for (var i = 0; i < _mrr.length; i++) {
            if (_mrr[i]) {
                totalArr.push(_mrr[i].total);
            } else {
                _mrr.push(0);
            }
        }
        this.view.reflashScore(totalArr);

    },

    updateroominfo: function (roominfo) {
        this.roominfo = {
            agree: roominfo.agree,
            maxStep: roominfo.maxstep,
            roomid: roominfo.roomid,
            step: roominfo.step,
            time: roominfo.time,
            type: roominfo.type,
            param1: roominfo.param1,
            param2: roominfo.param2,

            fd: parseInt(roominfo.param1 / 1000000) % 10,//3111111
            zmjd: parseInt(roominfo.param1 / 100000) % 10,
            dgh: parseInt(roominfo.param1 / 10000) % 10,
            hsz: parseInt(roominfo.param1 / 1000) % 10,
            yjdj: parseInt(roominfo.param1 / 100) % 10,
            mqq: parseInt(roominfo.param1 / 10) % 10,
            tdh: roominfo.param1 % 10,

            person: roominfo.person,
        };
        this.persons = roominfo.person;
        this.HSZinfo = {"isHSZ": this.roominfo.hsz == 1, "hasSlectNum": 0};
        //modify by lish
        this.maxNum = 4;
        this.getCurPlayerIndex(this.persons, this.myUid);
        this.persons = this.offsetPlayer(this.persons);

        if (this.roominfo.time != 0) {
            this.game.uimgr.showui("gameclass.exitroom", false);
            this.game.uimgr.uis["gameclass.exitroom"].setData(this, this.roominfo);
        }
    },
    //==============================================断线重连=============================
    chuliData: function (data) {
        this.gamestate = (data.begin == true ? 1 : 0);
        var curStepIndex = null;
        var lastOutIndex = null;
        var lastPokerNum = null;
        this.view.setArrowBg(this._mySeat);
        //摸牌Index
        if (data.curstep > 0) {

            var nowIndex = this.getPlayerSeatById(data.curstep);
            //curStepIndex = this.getPlayerIndexById(data.curstep);
            var _mrr=[null,null,null,null];
            for(var i=0;i<this.gameInfo.info.length;i++){
                if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
                _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
            }
            for(var i =0;i< _mrr.length;i++)
            {
                if(_mrr[i].uid ==data.curstep)
                {
                    curStepIndex = i;
                }
            }
            this.view.setArrowTowards(nowIndex);
        }
        //上一个出牌的人
        var _mrr=[null,null,null,null];
        for(var i=0;i<this.gameInfo.info.length;i++){
            if(!this.gameInfo.info[i]||this.gameInfo.info[i].seat<0) continue;
            _mrr[(this.gameInfo.info[i].seat-this._mySeat+4)%4]=gameclass.mod_base.deepCopy(this.gameInfo.info[i]);
        }
        if (data.befstep > 0) {
            //lastOutIndex = this.getPlayerIndexById(data.befstep);
            for(var i =0;i< _mrr.length;i++)
            {
                if(_mrr[i].uid == data.befstep)
                {
                    lastOutIndex = i;
                }
            }
            lastPokerNum = data.lastcard;
        }
        //
        var msgInfo = this.offsetPlayer(data.info);

        var handCard = [];
        var sendCard = [];
        var drawCard = [];
        var pengGangCard = [];
        var queArr = [];
        var huArr = [];
        var huNum = [];
        var slectThree = [];

        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            pengGangCard[i] = [];
            if(_mrr[i])
            {
                sendCard.push(_mrr[i].card.card2);
            }
            else
            {
                sendCard.push([]);
            }
        }
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            if (msgInfo[i] != null) {
                handCard.push(msgInfo[i].card.card1);
                //sendCard.push(msgInfo[i].card.card2);
                drawCard.push(msgInfo[i].card.cardm);
                queArr.push(msgInfo[i].que);
                huArr.push(msgInfo[i].hutype);
                huNum.push(msgInfo[i].hucard);
                slectThree.push(msgInfo[i].three);

                //碰牌数组
                for (var j = 0; j < msgInfo[i].card.cardp.length; j++) {
                    var card = msgInfo[i].card.cardp[j];
                    var $pengbackIndex = this.getPengBackIndex(msgInfo[i].uid, msgInfo[i].peng_uids[card]);
                    pengGangCard[i].push({type: 'peng', index: i, nums: [card], pengbackIndex: $pengbackIndex});
                }

                //明杠以及擦杠数组
                var newArr = msgInfo[i].card.cardmg.concat(msgInfo[i].card.cardcg);
                for (var j = 0; j < newArr.length; j++) {
                    pengGangCard[i].push({type: 'gang', index: i, nums: [newArr[j]], gangType: 1});
                }

                //旋风杠
                if(msgInfo[i].card.cardxfg.length > 0){
                    pengGangCard[i].push({type: 'gang', index: i, nums: [StaticData.WIND_GANG], gangType: 1});
                }

                //暗杠数组
                for (var j = 0; j < msgInfo[i].card.cardag.length; j++) {
                    pengGangCard[i].push({
                        type: 'gang',
                        index: i,
                        nums: [msgInfo[i].card.cardag[j] % 100],
                        gangType: 0
                    });
                }
            } else {
                handCard.push([]);
                sendCard.push([]);
                drawCard.push([]);
                queArr.push(0);
                huArr.push(0);
                huNum.push(0);
                slectThree.push([]);
            }
        }
        this.view.whoHasHu(huArr);
        this.view.onDealCards(handCard);
        this.queArr = queArr;

        this.curDrawCardIndex = curStepIndex;
        // cc.log("断线重连谁打牌:"+this.curDrawCardIndex);

        if (lastPokerNum > 0) {
            this.view.connet_setLastInfo(lastOutIndex, lastPokerNum);
        }
        this.view.connect_showTableCard(sendCard);
        this.view.connect_showPengGangCard(pengGangCard);
        this.view.showHuPoke(huNum);

        //是否显示缺门
        // if (!this.HSZinfo.isHSZ) {
        //     this.view.showQue(queArr);
        // } else {//如果选择的是换三张，看谁没选
        //     var selctPeople = 0;
        //     //modify by lish
        //     for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
        //         if (slectThree[i].length == 3) {
        //             selctPeople++;
        //         }
        //     }
        //     //modify by lish
        //     if (selctPeople < gameclass.HLGC_MAX_USER) {
        //         this.view.allSlect = false;
        //         this.view.showSlectLayout(slectThree);
        //     } else {
        //         this.view.showQue(queArr);
        //     }
        // }
        //显示起牌
        var mopaiIndex = null;
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            if (huArr[i] == 0) {
                if (msgInfo[i] != null && msgInfo[i].num - msgInfo[i].card.card1.length == 1) {
                    //if(msgInfo[i].card.cardm > 0){
                    mopaiIndex = i;
                    var drawData = {"card": drawCard[i]};
                    var nowIndex = this.getPlayerSeatById(data.curstep);
                    this.view.onDrawCard(nowIndex,i, drawData);
                    break;
                }
            }
        }
        this.view.setCardAcount(data.num);
        //this.view.setIgnoreCard(mopaiIndex,handCard[0],pengGangCard[0]);

        //显示是否可能操作
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            if (msgInfo[i] != null && msgInfo[i].uid == this.game.modmgr.mod_login.logindata.uid) {
                var res = {
                    huType: msgInfo[i].hutype,
                    peng: msgInfo[i].peng,
                    gang: msgInfo[i].gang,
                    hu: msgInfo[i].hu,
                };
                this.view.onOperate(res);
                break;
            }
        }

        if (lastOutIndex) {
            this.view.connect_isHaveOutPoke(curStepIndex, (curStepIndex == lastOutIndex));
        }
        this.view.chuliDataCheckListen();
    },
});
gameclass.mod_hlgc.prototype.onSendmygod = function () {
    this.mywebsocket.send("gamekwxmygod", {});
};
gameclass.mod_hlgc.prototype.onSendgetmygod = function (cardnum) {
    this.mywebsocket.send("kwxgetmygod", {"card": parseInt(cardnum)});
};
gameclass.mod_hlgc.prototype.getserverchair = function (cur) {
    return (gameclass.HLGC_MAX_USER + cur + this.curDrawCardIndex ) % gameclass.HLGC_MAX_USER;
};
/**
 * 根据服务器座位索引，获取场景座位索引
 * @param serverIndex
 * @return {number}
 */
gameclass.mod_hlgc.prototype.getSceneIndexFromS = function (serverIndex) {
    return (gameclass.HLGC_MAX_USER + serverIndex - this.curPlayerIndex ) % gameclass.HLGC_MAX_USER;
};
//最多参战人数
gameclass.HLGC_MAX_USER = 4;
//最大的字牌：29--九万
gameclass.HLGC_MAX_TxtCARD_NUM = 30;
//最大的牌：37--北风
gameclass.HLGC_MAX_CARD_NUM = 37;




