/**
 * Created by Administrator on 2017-6-29.
 */


gameclass.recommendUI = gameclass.baseui.extend({
    node:null,
    isInvite:false,//是否使用过邀请码
    inviteInfo:null,


    ctor: function () {
        this._super();
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.recommendUi,true);
        this.addChild(this.node);

        this.layoutOne = ccui.helper.seekWidgetByName(this.node,"Panel_1");
        this.layoutTwo = ccui.helper.seekWidgetByName(this.node,"Panel_2");
        this.btn_ok = ccui.helper.seekWidgetByName(this.layoutOne,"btn_ok");
        this.btnEvent();

        this.isInvite = this.game.modmgr.mod_login.inviteData.isinvite;
        this.inviteInfo = this.game.modmgr.mod_login.inviteData.invite;

        ccui.helper.seekWidgetByName(this.layoutOne,"Text_5").setString(this.game.modmgr.mod_login.logindata.uid);
        if(this.isInvite){
            this.setNoSend();
        }
    },

    btnEvent:function(){
        var _this = this;

        gameclass.createbtnpress(this.node, "btn_close", function () {
            _this.game.uimgr.closeui("gameclass.recommendUI");
        });

        gameclass.createbtnpress(this.layoutOne, "btn_record", function () {
            _this.layoutOne.setVisible(false);
            _this.layoutTwo.setVisible(true);
            _this.showInviteRecord();
        });

        gameclass.createbtnpress(this.layoutOne, "btn_ok", function () {
            var code = ccui.helper.seekWidgetByName(_this.layoutOne,"inputBox").getString();
            //cc.log(this.game);
            _this.game.modmgr.mod_center.sendInviteCode(code);
        });

        gameclass.createbtnpress(this.layoutOne,"btn_copy",function(){

        })
    },

    setNoSend:function(){
        var inputBox = ccui.helper.seekWidgetByName(this.layoutOne,"inputBox");
        inputBox.setString("你已经使用过邀请码");
        inputBox.setTouchEnabled(false);
        this.btn_ok.setEnabled(false);
        this.btn_ok.setBright(false);
    },

    showInviteRecord:function(){
        ccui.helper.seekWidgetByName(this.layoutTwo,"friendNum").setString(this.inviteInfo.length);
        ccui.helper.seekWidgetByName(this.layoutTwo,"fangkaNum").setString(this.inviteInfo.length*5);

        var listView = ccui.helper.seekWidgetByName(this.layoutTwo,"listView");
        listView.removeAllChildren();

        cc.log(this.inviteInfo.length);
        for(var i = 0;i < this.inviteInfo.length;i++){
            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(500,30));
            var strName = this.inviteInfo[i].name || "游客";
            var userName = new cc.LabelTTF(strName, "Arial", 24);
            userName.setColor(cc.color(73,85,96));
            userName.setPosition(500,0);

            var strTime = this.getDate(this.inviteInfo[i].time);
            var inviteTime = new cc.LabelTTF(strTime, "Arial", 24);
            inviteTime.setColor(cc.color(73,85,96));
            inviteTime.setPosition(150,0);

            layout.addChild(userName);
            layout.addChild(inviteTime);
            listView.pushBackCustomItem(layout);
        }
    },

    getDate:function(date){
        var d = new Date(date * 1000);
        var date = (d.getFullYear()) + "年" +
            (d.getMonth() + 1) + "月" +
            (d.getDate()) + "日";
        return date;
    },
});


