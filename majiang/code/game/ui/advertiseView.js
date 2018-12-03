gameclass.advertiseView = gameclass.baseui.extend({
    ctor: function () {
        this._super();


    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.advertiseJson, true);
        this.addChild(this.node);

        this.picContain = ccui.helper.seekWidgetByName(this.node, "picContain");

        var _this = this;
        gameclass.createbtnpress(this.node, "closeBtn", function () {
            _this.game.uimgr.closeui("gameclass.advertiseView");
        });
    },
    updateView: function (obj) {
        this.picContain.removeAllChildren();

        staticFunction.loadNetIcon(this.picContain, gameclass.phpAddressPrev + obj.img_url);
    },
});