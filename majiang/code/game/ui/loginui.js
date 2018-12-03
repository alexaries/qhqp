/**
 * Created by yang on 2016/11/9.
 */

gameclass.loginui = gameclass.baseui.extend({
    sprite: null,
    node:null,
    agreement:null,
    check:null,
    ctor: function () {
        this._super();
    },
    show:function(){
        //cc.log(getcsvmgr.csv_item.length);
        //cc.log(getcsvmgr.csv_item["1001_name"]);
        //var handsCard = [11, 11, 1000, 21, 21, 131, 101, 91, 91, 81, 81, 81, 71, 71, 51, 41, 31];
        //var stepsCard = [61, 61, 61, 61];
        //cc.log(new gameclass.tool_wildcardType().tipsCard(handsCard, stepsCard, 1, 1, []))

        this.node = this.game.uimgr.createnode(res.loginui_loginpngpjson,true);

        var bg = ccui.helper.seekWidgetByName(this.node, "bg");


        //var jiazai=new gameclass.loadzip();
        //jiazai.parseZipFile();
        //jiazai.loadFile('res/data/all.tbl');
        //jiazai.loadFile('http://localhost:8031/majiang/res/data/all.tbl');
        // bg.setScaleX(cc.winSize.width / 1136);

        //var sten = new cc.Sprite();
        //sten.initWithFile("res/ui/niuniunew/logo_saoguang.png");
        //var clipnode = gameclass.mod_base.cliper("res/ui/niuniunew/title1.png");
        //clipnode.setPosition(cc.p(568.00, 404.03));
        //this.node.addChild(clipnode);
        //clipnode.addChild(sten);
        //sten.setPosition(cc.p(-40.02 - 568 / 2, 0));
        //var act = cc.repeatForever(cc.sequence(cc.moveTo(2, cc.p(610, 0)), cc.moveTo(0,cc.p(-40.02 - 568 / 2, 0))));
        //sten.runAction(act);

        //var action = ccs.load(res.loginui_loginpngpjson).action;
        //this.node.runAction(action);
        //action.gotoFrameAndPlay(0, 80, true);

        if(cc.sys.localStorage.getItem("saveSetting")){
            var settingInfo = cc.sys.localStorage.getItem("saveSetting");
            settingInfo = JSON.parse(settingInfo);

            mod_sound.setMusicVolume(settingInfo.yinyue);
            mod_sound.setEffectsVolume(settingInfo.yinxiao);
        }else{
            mod_sound.setMusicVolume(0.5);
            mod_sound.setEffectsVolume(0.5);
        }

        if(window.wx) {
            gameclass.mod_platform.wxshare(StaticData.GAME_NAME, 0, "大家一起过来玩de吧。")
        }

        this.addChild(this.node);

        var jiazai=new gameclass.loadzip();
        jiazai.useTableArr();

        //this.game.uimgr.showui("gameclass.inputcode");
        this.check = ccui.helper.seekWidgetByName(this.node, "CheckType0");
        this.check.setSelected(true);
        this.agreement = ccui.helper.seekWidgetByName(this.node, "agreement");
        var clickMent = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    _this.game.uimgr.showui("gameclass.agreement");
                    break;
            }
        }
        this.agreement.addTouchEventListener(clickMent);

        var guestBtn = ccui.helper.seekWidgetByName(this.node, "guestBtn");
        guestBtn.setVisible(false);
        var wxBtn = ccui.helper.seekWidgetByName(this.node, "wxBtn");
        wxBtn.setVisible(true);
        var codeinput = ccui.helper.seekWidgetByName(this.node, "codeinput");
        var version = ccui.helper.seekWidgetByName(this.node, "version");

        mod_sound.playbmg(g_music.bmg,true);

        if(gameclass.test == "true") {  //! 测试环境
            wxBtn.setVisible(false)
            guestBtn.setVisible(true)
        } else {
            if(cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS){ //! ios判断
                gameclass.mod_platform.startmap();
            }
        }

        var _this = this;

        //===========test=============
         if(cc.sys.isNative){
           //codeinput.setVisible(true);
           //guestBtn.setVisible(true);
           //wxBtn.setVisible(false);
         }
        //====================

        if(cc.sys.os === cc.sys.OS_IOS || cc.sys.os === cc.sys.OS_ANDROID) {
            codeinput.setVisible(false);
            version.setVisible(true);
        } else {
            codeinput.setVisible(true);
            version.setVisible(false);
        }
        version.setVisible(true);
        version.setString("当前版本:" + gameclass.version);

        var clickGuest = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    if(!_this.check.isSelected()) {
                        _this.game.uimgr.showui("gameclass.msgboxui");
                        _this.game.uimgr.uis["gameclass.msgboxui"].setString("请先同意用户协议");
                        return;
                    }
                    _this.game.modmgr.mod_login.guestlogin(codeinput.getString());
                    break;
            }
        }
        
        guestBtn.addTouchEventListener(clickGuest);

        var clickwxBtn = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    if(!_this.check.isSelected()) {
                        _this.game.uimgr.showui("gameclass.msgboxui");
                        _this.game.uimgr.uis["gameclass.msgboxui"].setString("请先同意用户协议");
                        return;
                    }
                    if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS)
                    {
                        if (mod_userdefault.globaldata.code != "" && (new Date()).getTime() - mod_userdefault.globaldata.time < 86400000 * 7) { //! 有这个记录
                            // _this.game.uimgr.showui("gameclass.msgboxui").setString("code="+mod_userdefault.globaldata.code);
                            _this.game.modmgr.mod_login.wxlogin("")
                        } else {
                            // _this.game.uimgr.showui("gameclass.msgboxui").setString("code==null");
                            mod_userdefault.globaldata.code = ""
                            gameclass.mod_platform.loginwx();
                        }
                    }
                    else
                    {
                        if (cc.sys.os == cc.sys.OS_WINDOWS){
                            if(cc.sys.isNative){
                                _this.game.modmgr.mod_login.guestlogin(codeinput.getString());
                            }else{
                                var _code = (function(name) {
                                    var r = null;
                                    if(window && window.location){
                                        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                                        var r = window.location.search.substr(1).match(reg);
                                    }
                                    if (r != null) return unescape(r[2]); return null;
                                })("code");
                                _code = _code || codeinput.getString();
                                _this.game.modmgr.mod_login.guestlogin(_code);
                            }

                        }else if (code != null){
                            _this.game.modmgr.mod_login.wxlogin(code);
                        }else{
                            _this.game.modmgr.mod_login.guestlogin(codeinput.getString());
                        }
                    }
                    break;
            }
        };

        wxBtn.addTouchEventListener(clickwxBtn);

    },
    showGuest:function () {
        var guestBtn = ccui.helper.seekWidgetByName(this.node, "guestBtn");
        guestBtn.setVisible(true);
    }
    
});