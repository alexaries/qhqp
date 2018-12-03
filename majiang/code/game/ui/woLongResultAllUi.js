/**
 * Created by yang on 2016/11/17.
 */

gameclass.woLongResultAllUi = gameclass.baseui.extend({
    sprite: null,
    node:null,
    shareing:null,
    round:null,
    curtime:null,
    roomid:null,
    ctor: function () {
        this._super();
        this.shareing = false;
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.wlAllEndPlayWindowJson,true);
        this.addChild(this.node);
    },
    setData:function(mod_woLong){
        this.mod_woLong = mod_woLong;
        this.woLongTable = mod_woLong.view;

        var _this = this;
        gameclass.createbtnpress(this.node, "backBtn", function () {
            _this.game.uimgr.closeui("gameclass.woLongResultAllUi");
            _this.woLongTable.game.modmgr.mod_login.dissmissroom();
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
        ccui.helper.seekWidgetByName(this.node, "step").setString("局数:" + curstep + "/" + this.woLongTable.personData.maxstep);
        this._setRulePanel();
        var playerPanelArr=ccui.helper.seekWidgetByName(this.node,"playerPanel").getChildren();
        for(var i=0;i<playerPanelArr.length;i++){
            playerPanelArr[i].setVisible(false);
        }
        var maxTotalIndex=-1;
        var maxTotalNum=-1;
        for(var i=0;i<this.woLongTable.infoData.info.length;i++){
            if(maxTotalNum<this.mod_woLong.gameEndAllInfo.info[i].total){
                maxTotalNum=this.mod_woLong.gameEndAllInfo.info[i].total;
                maxTotalIndex=i;
            }
        }
        for(var i=0;i<this.woLongTable.infoData.info.length;i++){
            playerPanelArr[i].setVisible(true);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"playername").setString(this.woLongTable.personData.person[i].name);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"id").setString(this.woLongTable.personData.person[i].uid);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"totalTouShu").setString("最大奖头数    "+this.mod_woLong.gameEndAllInfo.info[i].headnum);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"totalJiangShu").setString("累计总奖数    "+this.mod_woLong.gameEndAllInfo.info[i].allaward);
            ccui.helper.seekWidgetByName(playerPanelArr[i],"totalScoreNum").setString(this.mod_woLong.gameEndAllInfo.info[i].total);
            gameclass.mod_base.showtximg(ccui.helper.seekWidgetByName(playerPanelArr[i],"icon"),this.woLongTable.personData.person[i].imgurl,0,0,"im_headbg2");
            if(this.woLongTable.personData.person[i].uid==this.woLongTable.infoData.host){
                ccui.helper.seekWidgetByName(playerPanelArr[i],"fangZhu").setVisible(true);
            }else{
                ccui.helper.seekWidgetByName(playerPanelArr[i],"fangZhu").setVisible(false);
            }
            if(i==maxTotalIndex){
                ccui.helper.seekWidgetByName(playerPanelArr[i],"winer").setVisible(true);
            }else ccui.helper.seekWidgetByName(playerPanelArr[i],"winer").setVisible(false);

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

