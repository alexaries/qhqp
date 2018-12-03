/**
 * Created by yang on 2016/11/14.
 */
gameclass.woLongResultOneUi = gameclass.baseui.extend({
    sprite: null,
    node:null,
    mod_woLong:null,
    niuniutable:null,
    ctor: function () {
        this._super();
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.wlEndPlayWindowJson,true);

        this.addChild(this.node);
    },
    setData: function (mod_woLong) {
        this.mod_woLong = mod_woLong;
        this.woLongTable = mod_woLong.view;


        var _this = this;
        gameclass.createbtnpress(this.node, "nextBtn", function () {
            if( _this.mod_woLong.isOver){
                _this.game.uimgr.showui("gameclass.woLongResultAllUi");
                _this.game.uimgr.uis["gameclass.woLongResultAllUi"].setData(_this.mod_woLong);
            }
            _this.game.uimgr.closeui("gameclass.woLongResultOneUi");
            _this.mod_woLong._socketSendReady();
        });
        gameclass.createbtnpress( this.node, "shareBtn", function () {
            gameclass.mod_platform.savescreen( function( url ){
                if ( window.wx )
                {
                    url = JSON.parse(url);
                    if(url.error == 0){
                        _this.share(url.url);
                    }
                }
            });
        });
        ccui.helper.seekWidgetByName(this.node, "roomid").setString("房间号:" + this.woLongTable.personData.roomid);

        var myDate = new Date();
        var str = myDate.Format("yy-MM-dd hh:mm");
        ccui.helper.seekWidgetByName(this.node, "time").setString(str);

        var curstep = this.woLongTable.personData.step;
        if (curstep > this.woLongTable.personData.maxstep){
            curstep = this.woLongTable.personData.maxstep;
        } else if(curstep == 0) {
            curstep = 1;
        }
        if(_this.mod_woLong.isOver){
            ccui.helper.seekWidgetByName(this.node, "nextBtn").loadTextures(res.lookZhanJi,res.lookZhanJi,res.lookZhanJi);
        }
        ccui.helper.seekWidgetByName(this.node, "step").setString("局数:" + curstep + "/" + this.woLongTable.personData.maxstep);
        this._setRulePanel();
        var playerPanelArr=ccui.helper.seekWidgetByName(this.node,"playerPanel").getChildren();
        for(var i=0;i<playerPanelArr.length;i++){
            playerPanelArr[i].setVisible(false);
        }
        this.woLongTable.infoData.info.sort(function(a,b){
            return a.rating-b.rating;
        })
        var minJianShu=100000;
        for(var i=0;i<this.woLongTable.infoData.info.length;i++){
             if(this.woLongTable.infoData.info[i].award<minJianShu){
                 minJianShu=this.woLongTable.infoData.info[i].award;
             }
        }
        for(var i=0;i<this.woLongTable.infoData.info.length;i++){
            playerPanelArr[i].setVisible(true);
            var personData=this._getPersonData(this.woLongTable.infoData.info[i].uid);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"playername").setString(personData.name);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"id").setString(personData.uid);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"jiangshu").setString((this.woLongTable.infoData.info[i].award-minJianShu)+"("+this.woLongTable.infoData.info[i].award+"-"+minJianShu+")");
            ccui.helper.seekWidgetByName(playerPanelArr[i],"jianfen").setString(this.woLongTable.infoData.info[i].jscore);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"jiangfen").setString(this.woLongTable.infoData.info[i].AwardScore);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"danjudefen").setString(this.woLongTable.infoData.info[i].curscore);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"zongdefen").setString(this.woLongTable.infoData.info[i].total);
            gameclass.mod_base.showtximg(ccui.helper.seekWidgetByName(playerPanelArr[i],"icon"),personData.imgurl,0,0,"im_headbg2");
            if(personData.uid==this.woLongTable.infoData.host){
                ccui.helper.seekWidgetByName(playerPanelArr[i],"fangZhu").setVisible(true);
            }else{
                ccui.helper.seekWidgetByName(playerPanelArr[i],"fangZhu").setVisible(false);
            }
            if(this.woLongTable.infoData.info[i].rating){
                ccui.helper.seekWidgetByName(playerPanelArr[i],"wintype").setVisible(true);
                ccui.helper.seekWidgetByName(playerPanelArr[i],"wintype").loadTexture(res["you"+this.woLongTable.infoData.info[i].rating])
            }else{
                ccui.helper.seekWidgetByName(playerPanelArr[i],"wintype").setVisible(false);
            }

            if(!this.woLongTable.infoData.info[i].maxcard||!this.woLongTable.infoData.info[i].maxcard.length)ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").setVisible(false);
            else{
                ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").setVisible(true);
                var width=48+(this.woLongTable.infoData.info[i].maxcard.length-1*10);
                ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").width=width;
                var _obj=this.woLongTable._getTouShuObj(this.woLongTable.infoData.info[i].maxcard);
                if(_obj._cardIndex!=100&&_obj._cardIndex!=200&&_obj._cardIndex!=2.5){

                    var _sp=new woLongPokerSp(_obj._cardIndex*10+3);

                    _sp.setScale(0.3);
                    _sp.setPosition(ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").width/2,ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").height/2);
                    ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").addChild(_sp);
                    var _touShuNode=this.woLongTable.game.uimgr.createnode(res.toushuLabel);
                    var touShuText =ccui.helper.seekWidgetByName(_touShuNode,"textLabel");
                    touShuText.setString(_obj.touShu+"");
                    _touShuNode.setScale(1.4);
                    touShuText.ignoreContentAdaptWithSize(true);
                    _touShuNode.setPosition(120,160);
                    _sp.addChild(_touShuNode);
                }else{
                    var _mrr=[];
                    for(var k=0;k<this.woLongTable.infoData.info[i].maxcard.length;k++){
                        var _index=this.woLongTable.infoData.info[i].maxcard[k];
                        _mrr[parseInt(_index/10)]=_mrr[parseInt(_index/10)]||0;
                        _mrr[parseInt(_index/10)]++;
                    }
                    var cardTypeLength=0;
                    for(var k=0;k<_mrr.length;k++){
                        if(_mrr[k]){
                            var _sp=new cc.Sprite();
                            var _num=Number(k)*10;
                            if(k<50) _num+=3;
                            _sp=new woLongPokerSp(_num);
                            _sp.setScale(0.3);
                            ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").addChild(_sp);

                            var _node=this.woLongTable.game.uimgr.createnode(res.yishuLabel);
                            var text = _node.getChildByName("text");
                            text.setString(_mrr[k]+"");
                            text.ignoreContentAdaptWithSize(true);
                            _node.setPosition(20,20);
                            _sp.addChild(_node);
                            _node.setScale(2);
                            cardTypeLength++;
                        }
                    }
                }
                var _touShuNode=this.woLongTable.game.uimgr.createnode(res.toushuLabel);
                var touShuText =ccui.helper.seekWidgetByName(_touShuNode,"textLabel");
                touShuText.setString(_obj.touShu+"");
                touShuText.ignoreContentAdaptWithSize(true);
                _touShuNode.setPosition(120,160);
                _touShuNode.setScale(1.4);
                _sp.addChild(_touShuNode);

                var _cardSpArr=ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").getChildren();
                for(var k=0;k<_cardSpArr.length;k++){
                    _cardSpArr[k].x=(k-(_cardSpArr.length-1)/2)*50+ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").width/2;
                    _cardSpArr[k].y=ccui.helper.seekWidgetByName(playerPanelArr[i],"cardPanel").height/2;
                }
            }
        }


    },
    _getPersonData:function(_uid){
       for(var i=0;i<this.woLongTable.personData.person.length;i++){
           if(this.woLongTable.personData.person[i].uid==_uid){
               return this.woLongTable.personData.person[i];
           }
       }
    },
    _setRulePanel:function(){
        var param1=this.woLongTable.personData.param1;
        var param2=this.woLongTable.personData.param2;
        var ruleText="";
        if(parseInt(this.woLongTable.personData.param1)%10==0){
            ruleText+="同色无奖 ";
        }else if(parseInt(this.woLongTable.personData.param1)%10==1){
            ruleText+="同色加1奖 ";
        }else if(parseInt(this.woLongTable.personData.param1)%10==2){
            ruleText+="同色加N奖 ";
        }
        if(parseInt(this.woLongTable.personData.param1/10)%10==0){
            ruleText+="顺奖无奖 ";
        }else if(parseInt(this.woLongTable.personData.param1/10)%10==1){
            ruleText+="顺奖连1奖 ";
        }else if(parseInt(this.woLongTable.personData.param1/10)%10==2){
            ruleText+="顺奖连N奖 ";
        }
        if(parseInt(this.woLongTable.personData.param1/100)%10==0){
            ruleText+="无奖加10奖 ";
        }else if(parseInt(this.woLongTable.personData.param1/100)%10==1){
            ruleText+="无奖加15奖 ";
        }
        if(parseInt(this.woLongTable.personData.param2)%10==1){
            ruleText+="单牌为奖 ";
        }
        if(parseInt(this.woLongTable.personData.param2/10)%10==1){
            ruleText+="独奖翻倍 ";
        }
        if(parseInt(this.woLongTable.personData.param2/100)%10==1){
            ruleText+="断分玩法 ";
        }
        ccui.helper.seekWidgetByName(this.node,"roomType").setString(ruleText);
    },
    share:function(url){
        gameclass.mod_platform.wxsharelink( "上饶棋牌-窝龙单局结算", "战绩", url );
    },
});