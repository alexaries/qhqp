/**
 * Created by yang on 2016/11/16.
 */

gameclass.ruleui = gameclass.baseui.extend({
    node:null,
    pl_niuniu:null,
    pl_ddz:null,
    pl_szp:null,
    tb_niuniu:[],
    tb_ddz:[],
    tb_szp:[],
    ctor: function () {
        this._super();
    },
    show:function(){
        //this.node = this.game.uimgr.createnode(res.ruleui,true);

        this.addChild(this.node);

        this.pl_niuniu = ccui.helper.seekWidgetByName(this.node, "niuniu");
        this.pl_ddz = ccui.helper.seekWidgetByName(this.node, "ddz");
        this.pl_szp = ccui.helper.seekWidgetByName(this.node, "szp");

        this.tb_niuniu[0] = ccui.helper.seekWidgetByName(this.node, "tb_niuniu1");
        this.tb_niuniu[1] = ccui.helper.seekWidgetByName(this.node, "tb_niuniu2");
        this.tb_ddz[0] = ccui.helper.seekWidgetByName(this.node, "tb_ddz1");
        this.tb_ddz[1] = ccui.helper.seekWidgetByName(this.node, "tb_ddz2");
        this.tb_szp[0] = ccui.helper.seekWidgetByName(this.node, "tb_szp1");
        this.tb_szp[1] = ccui.helper.seekWidgetByName(this.node, "tb_szp2");

        var _this = this;
        gameclass.createbtnpress(this.node, "Button_1", function () {
            _this.game.uimgr.closeui("gameclass.ruleui");
        });
        this.showSZP();

        var clickniuniu = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    _this.showNiuNiu();
                    break;
            }
        };
        this.tb_niuniu[1].addTouchEventListener(clickniuniu);

        var clickddz = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    _this.showDDZ();
                    break;
            }
        };
        this.tb_ddz[1].addTouchEventListener(clickddz);

        var clickszp = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    _this.showSZP();
                    break;
            }
        };
        this.tb_szp[1].addTouchEventListener(clickszp);
    },

    showNiuNiu:function() {
        this.tb_niuniu[0].setVisible(true);
        this.tb_niuniu[1].setVisible(false);
        this.tb_ddz[0].setVisible(false);
        this.tb_ddz[1].setVisible(true);
        this.tb_szp[0].setVisible(false);
        this.tb_szp[1].setVisible(true);
        this.pl_niuniu.setVisible(true);
        this.pl_ddz.setVisible(false);
        this.pl_szp.setVisible(false);
    },

    showDDZ:function(){
        this.tb_niuniu[0].setVisible(false);
        this.tb_niuniu[1].setVisible(true);
        this.tb_ddz[0].setVisible(true);
        this.tb_ddz[1].setVisible(false);
        this.tb_szp[0].setVisible(false);
        this.tb_szp[1].setVisible(true);
        this.pl_niuniu.setVisible(false);
        this.pl_ddz.setVisible(true);
        this.pl_szp.setVisible(false);
    },

    showSZP:function(){
        this.tb_niuniu[0].setVisible(false);
        this.tb_niuniu[1].setVisible(true);
        this.tb_ddz[0].setVisible(false);
        this.tb_ddz[1].setVisible(true);
        this.tb_szp[0].setVisible(true);
        this.tb_szp[1].setVisible(false);
        this.pl_niuniu.setVisible(false);
        this.pl_ddz.setVisible(false);
        this.pl_szp.setVisible(true);
    },
});