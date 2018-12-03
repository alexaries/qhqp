/**
 * Created by Administrator on 2018/5/9.
 */
/**
 * Created by yang on 2016/11/16.
 */

gameclass.roomListLayer = gameclass.baseui.extend({
    node:null,
    selectType:null,
    houseTableView:null,
    houseListArray:[],
    ctor: function () {
        this._super();
        this.selectType=0;
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.roomListLayerJson,true);
        this.addChild(this.node);
        this._reShowBtn(0);
        this.reflashRoomListUpdate();

        var _this = this;

        var listPanel=ccui.helper.seekWidgetByName(this.node,"RoomListLayer");
        var listView2=listPanel.getChildByName("ListView_2");
        listView2.setVisible(false);
        gameclass.createbtnpress(this.node, "closeBtn", function () {
            _this.game.uimgr.closeui("gameclass.roomListLayer");
        });
        //this._createTableView();
        gameclass.createbtnpress(this.node, "yiKaiBtn", function () {
            _this.selectType=0;
            _this._reShowBtn(0);
            _this.reflashRoomListUpdate();
        });
        gameclass.createbtnpress(this.node, "jiLuBtn", function () {
            _this.selectType=1;
            _this._reShowBtn(1);
            _this.reflashRoomListUpdate();
        });
        //gameclass.createbtnpress(this.node, "reflash", function () {
        //    _this.reflashRoomListUpdate();
        //});
    },
//    _createTableView:function(){
//        var contentNode = ccui.helper.seekWidgetByName(this.node,"contentNode");
//        if(!this.houseTableView)
//        {
//            var _tableView = new cc.TableView(this,contentNode.getContentSize());
//            _tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
//            _tableView.setAnchorPoint(cc.p(0.5,0.5));
//            _tableView.x = 0;
//            _tableView.y = 0;
//            _tableView.setDelegate(this);
//            _tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_BOTTOMUP);
//            contentNode.addChild(_tableView);
//            _tableView.reloadData;
//            this.houseTableView = _tableView;
//        }
//        else
//        {
//            this.houseTableView.reloadData();
//        }
//    },
//    tableCellTouched:function(table,cell)
//    {
//
//    },
//    numberOfCellsInTableView:function (table, idx) {
//    return this.houseListArray.length;
//},
//
//tableCellAtIndex:function (table, idx) {
//    var _this=this;
//    var strValue = idx.toFixed(0);
//    var cell = table.dequeueCell();
//    var panel;
//
//    if (!cell) {
//        cell = new cc.TableViewCell();
//        var oneCell = ccui.helper.seekWidgetByName(this,"Panel_16");
//        panel = oneCell.clone();
//        panel.setVisible(true);
//        panel.setTag(123);
//        panel.setPosition(0, 0);
//        cell.addChild(panel);
//    } else {
//        panel = cell.getChildByTag(123);
//    }
//    if (panel) {
//        this.setCellData(strValue, panel ,this.houseListArray[strValue]);
//    }
//    return cell;
//},
    _reShowBtn:function(_num){
        var _b=true;
        if(_num==1) _b=false;
        ccui.helper.seekWidgetByName(this.node,"yiKaiBtn").getChildren()[0].setVisible(_b);
        ccui.helper.seekWidgetByName(this.node,"jiLuBtn").getChildren()[0].setVisible(!_b);
    },
    reflashRoomListUpdate:function(){
        var _callFunc=this.refashRoomList.bind(this);
        this.game.modmgr.mod_login.getroomlist(_callFunc);
    },
    getDate:function(date){
        var d = new Date(date * 1000);    //根据时间戳生成的时间对象
        var date = (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            (d.getHours()) + ":" +
            (d.getMinutes())
        return date;
    },
    refashRoomList:function(data){
        var _this=this;
        var listPanel=ccui.helper.seekWidgetByName(this.node,"RoomListLayer");
        var tipImage =  ccui.helper.seekWidgetByName(this.node,"Image_85");
        if(data.info.length == 0)
        {
            tipImage.setVisible(true);
        }
        else
        {
            tipImage.setVisible(false);
        }
        if(this.selectType == 1 || this.selectType == 0)
        {
            var listView1=listPanel.getChildByName("ListView_1");
            var listView2=listPanel.getChildByName("ListView_2");
            listView2.setVisible(false);
            listView1.setVisible(true);

            var listPanelArr=listPanel.getChildByName("ListView_1").getChildren();

            listPanelArr[0].setVisible(false);
            for(var i=listPanelArr.length-1;i>=1;i--){
                listPanel.getChildByName("ListView_1").removeItem(i);
            }
            var _isfristItem=true;
            var _itemIndex=0;
            for(var i=0;i<data.info.length;i++){
                if(_this.selectType==0&&data.info[i].state==2)continue;
                else if(_this.selectType!=0&&data.info[i].state!=2)continue;
                var roomItem=null;
                if(_isfristItem){
                    _isfristItem=false;
                    roomItem=listPanelArr[0];
                    roomItem.setVisible(true);
                }else{
                    roomItem=listPanelArr[0].clone();
                    listPanel.getChildByName("ListView_1").insertCustomItem(roomItem,_itemIndex);
                }
                _itemIndex++;

                var playerArr=ccui.helper.seekWidgetByName(roomItem,"playerPanel").getChildren();
                for(var k=0;k<playerArr.length;k++){
                    playerArr[k].setVisible(false);
                }
                var memdata = data.info[i].mem;
                var leng = memdata.length;
                var newdata = [];

                if(leng > 0 )
                {

                    for(var j =0 ;j< leng;j++)
                    {
                      newdata[memdata[j].uid] = memdata[j];

                    }
                    var m =0;
                    for( var key in newdata)
                    {
                        if(key == "remove") break;
                        var obj = newdata[key];
                        playerArr[m].setVisible(true);
                        ccui.helper.seekWidgetByName(playerArr[m],"name").setString(obj.name);
                        var playerHead = ccui.helper.seekWidgetByName(playerArr[m],"Icon");
                        //gameclass.mod_base.showtximg(ccui.helper.seekWidgetByName(playerArr[k],"Icon"), data.info[i].mem[k].head, 0, 0,"im_headbg2");
                        gameclass.mod_base.showtximg(playerHead, obj.head || '', 0, 0, '', false);
                        m++;
                    }
                    //for(var obj of newdata)
                    //{
                    //    var ss = obj;
                    //
                    //}

                    //for(var k=0;k<newdata.length;k++){
                    //    playerArr[k].setVisible(true);
                    //    ccui.helper.seekWidgetByName(playerArr[k],"name").setString(newdata[k].uid);
                    //    var playerHead = ccui.helper.seekWidgetByName(playerArr[k],"Icon");
                    //    //gameclass.mod_base.showtximg(ccui.helper.seekWidgetByName(playerArr[k],"Icon"), data.info[i].mem[k].head, 0, 0,"im_headbg2");
                    //    gameclass.mod_base.showtximg(playerHead, data.head || '', 0, 0, '', false);
                    //}
                }


                //for(var k=0;k<data.info[i].mem.length;k++){
                //    if(data.info[i].mem[k+1])
                //    playerArr[k].setVisible(true);
                //    ccui.helper.seekWidgetByName(playerArr[k],"name").setString(data.info[i].mem[k].name);
                //    var playerHead = ccui.helper.seekWidgetByName(playerArr[k],"Icon");
                //    //gameclass.mod_base.showtximg(ccui.helper.seekWidgetByName(playerArr[k],"Icon"), data.info[i].mem[k].head, 0, 0,"im_headbg2");
                //    gameclass.mod_base.showtximg(playerHead, data.head || '', 0, 0, '', false);
                //}
                var roomState="未开始";
                if(data.info[i].state==1){
                    roomState="进行中";
                }else if(data.info[i].state==2){
                    roomState="已结束";
                }
                var jushuLabel="";
                var gameType="";
                var _fenXiangText="";
                if(data.info[i].type==gameclass.gameddz)
                {
                    if(data.info[i].num==1){
                        jushuLabel="10局"
                    }else if(data.info[i].num==2){
                        jushuLabel="20局"
                    }

                    gameType = "秦皇斗地主";
                    _fenXiangText=this._getFenXianText(data.info[i]);

                }
                else if(data.info[i].type==gameclass.gamehlgc)
                {
                    if(data.info[i].num==1){
                        jushuLabel="8局"
                    }else if(data.info[i].num==2){
                        jushuLabel="16局"
                    }
                    gameType = "秦皇麻将";
                    _fenXiangText=this._getFenXianText(data.info[i]);
                }
                var minturn = data.info[i].cur;
                var maxturn = data.info[i].max;
                var _gameturn = minturn + "/" + maxturn;

                ccui.helper.seekWidgetByName(roomItem,"fanNum").setString(data.info[i].roomid);
                ccui.helper.seekWidgetByName(roomItem,"shijian").setString(_this.getDate(data.info[i].time));
                ccui.helper.seekWidgetByName(roomItem,"stateText").setString(roomState);
                // ccui.helper.seekWidgetByName(roomItem,"ruleLabel").setString(_fenXiangText);
                ccui.helper.seekWidgetByName(roomItem,"juShuLabel").setString("0/"+jushuLabel);
                //ccui.helper.seekWidgetByName(roomItem,"gameType").setString(gameType);

                if(data.info[i].state==0){
                    ccui.helper.seekWidgetByName(roomItem,"stateText").setColor(cc.color(0,255,0,255));
                }else if(data.info[i].state==1){
                    ccui.helper.seekWidgetByName(roomItem,"stateText").setColor(cc.color(255,215,0,255));
                }else if(data.info[i].state==2){
                    ccui.helper.seekWidgetByName(roomItem,"stateText").setColor(cc.color(144,0,0,255));
                }
                var enterbtn = ccui.helper.seekWidgetByName(roomItem,"enterBtn");
                var inviteBtn = ccui.helper.seekWidgetByName(roomItem,"shareBtn");
                var deleteBtn = ccui.helper.seekWidgetByName(roomItem,"deleteBtn");
                deleteBtn.setTag(i);

                enterbtn.data=data.info[i];
                enterbtn.addTouchEventListener(function(sender,type){
                    if(type==ccui.Widget.TOUCH_ENDED){
                        _this.game.modmgr.mod_login.joinwithroomid(sender.data.roomid);
                    }
                })
                roomItem.setTag(i);
                roomItem._fenXiangText=_fenXiangText;
                gameclass.createbtnpress(roomItem, "shareBtn", function () {//战绩
                    var strtxt = gameType+roomItem._fenXiangText+"-"+jushuLabel+"大家都等您，快来吧。"
                    gameclass.mod_platform.invitefriend(strtxt, "http://www.hbyouyou.com/down/zznsn", data.info[roomItem.getTag()].roomid+"-秦皇棋牌");
                });

                deleteBtn.addTouchEventListener(function(sender,type){
                    var _Item = listView1.getItems();
                    var cell = sender.getParent();

                    var sequence = _Item.indexOf(cell);

                    var roomText = cell.getChildByName("fanNum");
                    var roomNum = parseInt(roomText.getString());
                    var myId = _this.game.modmgr.mod_login.logindata.uid;
                    listView1.removeItem(sequence);

                    //var roomNum = cell.
                    _this.game.modmgr.mod_login.sendDeleteRoom(roomNum,myId);
                });
                if(this.selectType == 0)
                {
                    enterbtn.setVisible(true);
                    inviteBtn.setVisible(true);
                    deleteBtn.setVisible(false);
                }
                else if(this.selectType == 1)
                {
                    enterbtn.setVisible(false);
                    inviteBtn.setVisible(false);
                    deleteBtn.setVisible(true);
                }
            }
        }
        //else if(this.selectType == 0)
        //{
        //    //this.houseTableView.setVisible(true);
        //    //for(var i= 0;i<data.info.length;i++){
        //    //    if(data.info[i].state==2){
        //    //        this.houseListArray.push(data.info[i]);
        //    //    }
        //    //}
        //    //if(this.houseTableView)this.houseTableView.reloadData();
        //
        //    var listView1=listPanel.getChildByName("ListView_1");
        //    var listView2=listPanel.getChildByName("ListView_2");
        //    listView1.setVisible(false);
        //    listView2.setVisible(true);
        //    var listPanelArr=listPanel.getChildByName("ListView_2").getChildren();
        //    listPanelArr[0].setVisible(false);
        //    for(var i=listPanelArr.length-1;i>=1;i--){
        //        listPanel.getChildByName("ListView_2").removeItem(i);
        //    }
        //    var _isfristItem=true;
        //    var _itemIndex=0;
        //
        //    for(var i=0;i<data.info.length;i++){
        //        //if(_this.selectType==0&&data.info[i].state==2)continue;
        //        //else if(_this.selectType!=0&&data.info[i].state!=2)continue;
        //        cc.log("sssssssssssssssss",data.info[i]);
        //        if(data.info[i].state !=2)
        //        {
        //            if(_this.selectType != 2)
        //            {
        //                var roomItem=null;
        //                if(_isfristItem){
        //                    _isfristItem=false;
        //                    roomItem=listPanelArr[0];
        //                    roomItem.setVisible(true);
        //                }else{
        //                    roomItem=listPanelArr[0].clone();
        //                    listPanel.getChildByName("ListView_2").insertCustomItem(roomItem,_itemIndex);
        //                }
        //                _itemIndex++;
        //
        //                //var playerArr=ccui.helper.seekWidgetByName(roomItem,"playerPanel").getChildren();
        //                //for(var k=0;k<playerArr.length;k++){
        //                //    playerArr[k].setVisible(false);
        //                //}
        //                //for(var k=0;k<data.info[i].mem.length;k++){
        //                //    playerArr[k].setVisible(true);
        //                //    ccui.helper.seekWidgetByName(playerArr[k],"name").setString(data.info[i].mem[k].name);
        //                //    gameclass.mod_base.showtximg(ccui.helper.seekWidgetByName(playerArr[k],"Icon"), data.info[i].mem[k].head, 0, 0,"im_headbg2");
        //                //}
        //                //var roomState="未开始";
        //                //if(data.info[i].state==1){
        //                //    roomState="进行中";
        //                //}else if(data.info[i].state==2){
        //                //    roomState="已结束";
        //                //}
        //                var jushuLabel="";
        //                var gameType="";
        //                var _fenXiangText="";
        //                if(data.info[i].type==gameclass.gamewolong){
        //                    if(data.info[i].num==1){
        //                        jushuLabel="共4局"
        //                    }else if(data.info[i].num==2){
        //                        jushuLabel="共8局"
        //                    }
        //
        //                    _fenXiangText=this._getFenXianText(data.info[i]);
        //
        //                }else if(data.info[i].type==gameclass.gamehlgc){
        //                    if(data.info[i].num==1){
        //                        jushuLabel="共6局"
        //                    }else if(data.info[i].num==2){
        //                        jushuLabel="共12局"
        //                    }
        //                    // gameType="上饶麻将";
        //                    _fenXiangText=this._getFenXianText(data.info[i]);
        //                }
        //                var _gameType= data.info[i].type;
        //                if( _gameType == gameclass.gamesznys){
        //                    gameType+="牛牛上庄";
        //                    _fenXiangText = "牛牛上庄";
        //                }
        //                else if(_gameType == gameclass.gamebrnys){
        //                    gameType="八人明牌";
        //                    _fenXiangText = "八人明牌";
        //                }
        //                else if(_gameType == gameclass.gamezynys){
        //                    gameType="自由抢庄";
        //                    _fenXiangText = "自由抢庄";
        //                }
        //                else if(_gameType == gameclass.gamenys){
        //                    gameType="明牌抢庄";
        //                    _fenXiangText = "明牌抢庄";
        //                }
        //                var minmumber = data.info[i].cur;
        //                var maxmumber = data.info[i].max;
        //                var maxturn = data.info[i].num * 10;
        //                //if(gameType == "八人明牌")
        //                //{
        //                //
        //                //    maxmumber = 8;
        //                //}
        //                var _gameturn =  maxturn;
        //                var _playernum = minmumber +"/" + maxmumber;
        //                var _bottomScore = 0;
        //                var _bottomSelect = 0;
        //                if(data.info[i].param1 < 1000000)
        //                {
        //                    _bottomScore = 0;
        //                }
        //                else
        //                {
        //                    _bottomScore = parseInt(data.info[i].param1/1000000);
        //                }
        //                if(_bottomScore == 0)
        //                {
        //                    _bottomSelect = "1/2";
        //                }
        //                else if(_bottomScore == 1)
        //                {
        //                    _bottomSelect = "2/4"
        //                }
        //                else if(_bottomScore == 2)
        //                {
        //                    _bottomSelect = "3/6"
        //                }
        //                else if(_bottomScore == 3)
        //                {
        //                    _bottomSelect = "4/8"
        //                }
        //                else if(_bottomScore == 4)
        //                {
        //                    _bottomSelect = "5/10"
        //                }
        //
        //                ccui.helper.seekWidgetByName(roomItem,"houseNumText").setString(data.info[i].roomid);
        //                //ccui.helper.seekWidgetByName(roomItem,"shijian").setString(_this.getDate(data.info[i].time));
        //                //ccui.helper.seekWidgetByName(roomItem,"stateText").setString(roomState);
        //                //ccui.helper.seekWidgetByName(roomItem,"ruleLabel").setString(_fenXiangText);
        //                ccui.helper.seekWidgetByName(roomItem,"totalTurnText").setString(_gameturn);
        //                ccui.helper.seekWidgetByName(roomItem,"playruleText").setString(gameType);
        //                ccui.helper.seekWidgetByName(roomItem,"playerNumText").setString(_playernum);
        //                ccui.helper.seekWidgetByName(roomItem,"scoreText").setString(_bottomSelect);
        //                //if(data.info[i].state==0){
        //                //    ccui.helper.seekWidgetByName(roomItem,"stateText").setColor(cc.color(0,255,0,255));
        //                //}else if(data.info[i].state==1){
        //                //    ccui.helper.seekWidgetByName(roomItem,"stateText").setColor(cc.color(255,215,0,255));
        //                //}else if(data.info[i].state==2){
        //                //    ccui.helper.seekWidgetByName(roomItem,"stateText").setColor(cc.color(144,0,0,255));
        //                //}
        //                var enterbtn=ccui.helper.seekWidgetByName(roomItem,"joinBtn");
        //                var shareBtn = ccui.helper.seekWidgetByName(roomItem,"inviteBtn");
        //
        //                if(data.info[i].state ==2)
        //                {
        //                    enterbtn.setVisible(false);
        //                    shareBtn.setVisible(false);
        //                }
        //                else
        //                {
        //                    enterbtn.setVisible(true);
        //                    shareBtn.setVisible(true);
        //                }
        //
        //                enterbtn.data=data.info[i];
        //                enterbtn.addTouchEventListener(function(sender,type){
        //                    if(type==ccui.Widget.TOUCH_ENDED){
        //                        _this.game.uimgr.closeui("gameclass.roomListLayer");
        //                        _this.game.modmgr.mod_login.joinwithroomid(sender.data.roomid);
        //
        //                    }
        //                })
        //                roomItem.setTag(i);
        //                roomItem._fenXiangText=_fenXiangText;
        //                gameclass.createbtnpress(roomItem, "inviteBtn", function () {//战绩
        //                    var strtxt = gameType+roomItem._fenXiangText+"-"+jushuLabel+"大家都等您，快来吧。"
        //                    gameclass.mod_platform.invitefriend(strtxt, "http://www.hbyouyou.com/down/zznsn", data.info[roomItem.getTag()].roomid+"-至尊牛帅牛");
        //                    _this.game.uimgr.closeui("gameclass.roomListLayer");
        //                });
        //            }
        //
        //        }
        //
        //
        //    }
        //    if(_itemIndex ==0)
        //    {
        //        tipImage.setVisible(true);
        //    }
        //}

    },
    _getFenXianText:function(data){
        var _ruleText="";
        if(data.type==gameclass.gameddz){
            var wanfaArr = StaticData.getRoomSetArrFromParam(data.type, data.param1,data.param2, 1);
            var typeArr = [];
            if(wanfaArr[1] != "")
            {
                typeArr.push(wanfaArr[1]);
            }
            if(wanfaArr[2] != "")
            {
                typeArr.push(wanfaArr[2]);
            }
            if(wanfaArr[3] != "")
            {
                typeArr.push(wanfaArr[3]);
            }
            if(wanfaArr[4] != "")
            {
                typeArr.push(wanfaArr[4]);
            }
            var sss = typeArr.toString();
            _ruleText = sss;

        }else if(data.type==gameclass.gamehlgc){
            var wanfaArr = StaticData.getRoomSetArrFromParam(data.type, data.param1,data.param2, 1);
            var typeArr = [];
            if(wanfaArr[3] != "")
            {
                typeArr.push("带跑龙");
            }
            if(wanfaArr[4] != "")
            {
                typeArr.push("七个混");
            }
            if(wanfaArr[5] != "")
            {
                typeArr.push("扣牌打");
            }
            if(wanfaArr[6] != "")
            {
                typeArr.push(wanfaArr[6]);
            }
            var sss = typeArr.toString();
            _ruleText = sss;
        }
        return _ruleText;

    },
});