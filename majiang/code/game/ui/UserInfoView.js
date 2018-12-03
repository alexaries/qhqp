/**
 * Created by yang on 2016/11/21.
 */

gameclass.UserInfoView = gameclass.baseui.extend({
    bgLayer: null,
    sprite: null,
    node: null,
    headImg: null,
    nameTxt: null,
    uidTxt: null,
    uipTxt: null,
    addressTxt: null,
    ctor: function () {
        this._super();
    },
    show: function () {
        var bg = new ccui.Layout();
        this.addChild(bg);
        bg.setTouchEnabled(true);
        bg.setContentSize(cc.winSize);

        this.bgLayer = new cc.LayerColor(cc.color(0, 0, 0, 155), cc.winSize.width, cc.winSize.height);
        bg.addChild(this.bgLayer);

        this.node = this.game.uimgr.createnode(res.userInfoPanelJson, true);
        this.addChild(this.node);

        this.node.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));

        this.headImg = ccui.helper.seekWidgetByName(this.node, "headback_0");
        this.nameTxt = ccui.helper.seekWidgetByName(this.node, "name");
        this.uidTxt = ccui.helper.seekWidgetByName(this.node, "uid_Text");
        this.uipTxt = ccui.helper.seekWidgetByName(this.node, "uip_Text");
        this.addressTxt = ccui.helper.seekWidgetByName(this.node, "address_Text");

        var _this = this;
        bg.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_ENDED) {
                _this.game.uimgr.closeui("gameclass.UserInfoView");
            }
        }, this);



    },
    updateView:function (url, name, id, ip, address) {
        gameclass.mod_base.showtximg(this.headImg, url, 0, 0, "im_headbg2");
        this.nameTxt.setString(name);
        this.uidTxt.setString(id.toString());
        this.uipTxt.setString(ip);
        this.addressTxt.setString(address);

    },
});