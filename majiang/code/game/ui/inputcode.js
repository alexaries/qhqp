/**
 * Created by yang on 2016/11/22.
 */

gameclass.inputcode = gameclass.baseui.extend({
    sprite: null,
    node:null,
    ctor: function () {
        this._super();
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.inputcode,true);

        this.addChild(this.node);

        var _this = this;
        gameclass.createbtnpress(this.node, "root", function () {
            _this.game.uimgr.closeui("gameclass.inputcode");
        });

        var input = ccui.helper.seekWidgetByName(this.node, "TextField_1");
        var imgback = ccui.helper.seekWidgetByName(this.node, "bg");

        if (!cc.sys.isNative) {
        }
        else {
            input.setVisible(false);
            var s9 = new cc.Scale9Sprite("res/im_headbg2.png");

            this._userName = new cc.EditBox(input.getContentSize(), s9);
            s9.setAnchorPoint(input.getContentSize().width / 2, input.getContentSize().height / 2);
            this._userName.setPosition(input.getPosition());
            this._userName.setFontSize(40);
            this._userName.setPlaceHolder("点击输入成功后赠送5张房卡");
            //this._userName.setDelegate(this);
            this._userName.setMaxLength(20);
            imgback.addChild(this._userName);
        }

        gameclass.createbtnpress(this.node, "Button_3", function () {
            if(input.isVisible()){
                _this.game.modmgr.mod_center.code(input.getString());
            }else{
                cc.log(_this._userName.getString());
                _this.game.modmgr.mod_center.code(_this._userName.getString());
            }

            _this.game.uimgr.closeui("gameclass.inputcode");
        });

    }
});