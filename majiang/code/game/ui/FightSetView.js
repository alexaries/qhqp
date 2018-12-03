/**
 * Created by yang on 2016/11/11.
 */

gameclass.FightSetView = gameclass.baseui.extend({
    sprite: null,
    node: null,
    musicSlider: null,
    soundSlider: null,
    btn_change: null,
    //btn_ok:null,

    sliderMusic: null,
    sliderEffects: null,
    mod: null,
    ctor: function () {
        this._super();

    },
    setMod: function ($mod) {
        this.mod = $mod;
    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.fightSetJson, true);
        this.musicSlider = ccui.helper.seekWidgetByName(this.node, "musicSlider");
        this.soundSlider = ccui.helper.seekWidgetByName(this.node, "effectSlider");
        //this.btn_ok = ccui.helper.seekWidgetByName(this.node,"ok");
        this.addChild(this.node);
        var _this = this;
        gameclass.createbtnpress(this.node, "root", function () {
            _this.game.uimgr.closeui("gameclass.FightSetView");
        });

        var _panelChildArr = ccui.helper.seekWidgetByName(this.node,"Panel_1").getChildren();
        if(gameclass.mod_hlgc.isSmothing == false)
        {


            _panelChildArr[0].getChildByName("Check").setSelected(true);
            _panelChildArr[1].getChildByName("Check").setSelected(false);
        }
        else if(gameclass.mod_hlgc.isSmothing == true)
        {
            _panelChildArr[0].getChildByName("Check").setSelected(false);
            _panelChildArr[1].getChildByName("Check").setSelected(true);
        }
        for(var i=0;i<_panelChildArr.length;i++) {
            var _checkBoxArr = _panelChildArr[i];

            if (_checkBoxArr.getTag() == 0) {
                _checkBoxArr.addClickEventListener(_this.checkBoxCallBack.bind(_this));
                //_checkBoxArr.addTouchEventListener(this.checkBoxCallBack.bind(this));

            }
        }

        var backBtn = ccui.helper.seekWidgetByName(this.node,"backBtn");
        var dissBtn = ccui.helper.seekWidgetByName(this.node,"dissmissBtn");
        //if(gameclass.mod_hlgc.roominfo.step == 0 && !gameclass.mod_hlgc.roominfo.begin && !_this.mod.isHouse)
        //{
        //
        //    dissBtn.setVisible(false);
        //
        //    backBtn.setPositionX(280);
        //}
        //else
        //{
        //    dissBtn.setVisible(true);
        //    backBtn.setPositionX(180);
        //}

        gameclass.createbtnpress(this.node, "exitLogin", function () {
            var obj = {
                "yinyue": _this.sliderMusic,
                "yinxiao": _this.sliderEffects
            }
            obj = JSON.stringify(obj);

            cc.log("设置:" + obj);

            _this.saveSetting(obj);
            _this.game.uimgr.closeui("gameclass.FightSetView");
        });

        gameclass.createbtnpress(_this.node, "backBtn", function () {

            if( _this.mod.roominfo.step >= 1)
            {
                //_this.mod.mywebsocket.onclosefunc = null;
                //_this.mod.mywebsocket.ws.onclose();
                //_this.game.modmgr.mod_login.dissmissroom();
                _this.game.uimgr.showui("gameclass.msgboxui");
                _this.game.uimgr.uis["gameclass.msgboxui"].setString("游戏已开始不能退出房间");
                return;
            }
            if(_this.mod.isHouse)
            {
                _this.game.uimgr.showui("gameclass.msgboxui");
                _this.game.uimgr.uis["gameclass.msgboxui"].setString("房主不能退出房间");
                return;
            }

            _this.game.uimgr.showui("gameclass.msgboxui");
            _this.game.uimgr.uis["gameclass.msgboxui"].setString("是否想要退出房间",function(){
                _this.mod.dissmissroom(0);
            });
        });
        gameclass.createbtnpress(this.node, "dissmissBtn", function () {
            _this.game.uimgr.showui("gameclass.msgboxui").setString("是否想要解散房间？", function () {
                _this.mod.dissmissroom(1);
            });
        });
        //     function () {
        //     _this.game.uimgr.showui("gameclass.msgboxui").setString("是否想要解散房间？", function () {
        //     _this.mod_hlgc.dissmissroom();
        // });

        this.btn_change = ccui.helper.seekWidgetByName(this.node, "change");
        this.btn_change.setVisible(false);
        gameclass.createbtnpress(this.node, "change", function () {
            mod_userdefault.globaldata.code = "";
            mod_userdefault.writeglobaljson();

            _this.game.uimgr.showui("gameclass.loginui");
            _this.game.uimgr.closeui("gameclass.hallui");
            _this.game.uimgr.closeui("gameclass.FightSetView");
        });

        var sliderEventbeijingmusic = function (sender, type) {
            switch (type) {
                case ccui.Slider.EVENT_PERCENT_CHANGED:
                    var slider = sender;
                    var percent = slider.getPercent();
                    var _percent = percent.toFixed(0) / 100;
                    _this.sliderMusic = _percent;
                    mod_sound.setMusicVolume(_percent);

                    break;
                default:
                    break;
            }
        };

        var sliderEventgamesond = function (sender, type) {
            switch (type) {
                case ccui.Slider.EVENT_PERCENT_CHANGED:
                    var slider = sender;
                    var percent = slider.getPercent();
                    _this.sliderEffects = percent;
                    //cc.log("Percent.........." + percent.toFixed(0));
                    var _percent = percent.toFixed(0) / 100;
                    _this.sliderEffects = _percent;
                    mod_sound.setEffectsVolume(_percent);

                    break;
                default:
                    break;
            }
        };
        this.sliderMusic = mod_sound.getMusicVolume();
        this.sliderEffects = mod_sound.getEffectsVolume();


        this.musicSlider.setPercent(this.sliderMusic * 100);
        this.musicSlider.addEventListener(sliderEventbeijingmusic);
        this.soundSlider.setPercent(this.sliderEffects * 100);
        this.soundSlider.addEventListener(sliderEventgamesond);
    },

    saveSetting: function (_obj) {
        cc.sys.localStorage.setItem("saveSetting", _obj);
    },

    getSetting: function () {
        return cc.sys.localStorage.getItem("saveSetting")
    },
    checkBoxCallBack:function (sender) {

        var childArr = sender.getParent().getChildren();
        if (!sender.getTag()) {
            for (var i = 0; i < childArr.length; i++) {

                childArr[i].getChildByName("Check").setSelected(false);
            }
            sender.getChildByName("Check").setSelected(true);
        }

        if(childArr[0].getChildByName("Check").isSelected())
        {
            gameclass.mod_hlgc.isSmothing = false;
        }
        else if(childArr[1].getChildByName("Check").isSelected())
        {
            gameclass.mod_hlgc.isSmothing = true;
        }
    },
});
gameclass.settingui.gmusic = 50;
gameclass.settingui.gamesound = 50;