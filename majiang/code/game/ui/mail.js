/**
 * Created by yang on 2016/11/16.
 */

gameclass.mail = gameclass.baseui.extend({
    node:null,
    context:null,
    title:null,
    img_titles:[],
    ctor: function () {
        this._super();
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.mailjson,true);

        this.addChild(this.node);

        var _this = this;
        gameclass.createbtnpress(this.node, "close", function () {
            _this.game.uimgr.closeui("gameclass.mail", true);
        });

        this.context = ccui.helper.seekWidgetByName(this.node, "context");
        this.context.setString("");

        this.title  = ccui.helper.seekWidgetByName(this.node, "title");

        if(this.game.modmgr.mod_center.notice == null) {
            return;
        }

        var pressfunc = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    for(var i = 0; i < _this.img_titles.length; i++) {
                        if (i == sender.index) {
                            _this.img_titles[i].loadTexture(res.btn_title1, ccui.Widget.LOCAL_TEXTURE);
                        } else {
                            _this.img_titles[i].loadTexture(res.btn_title2, ccui.Widget.LOCAL_TEXTURE);
                        }
                    }
                    _this.context.setString(_this.game.modmgr.mod_center.notice[_this.game.modmgr.mod_center.notice.length - 1 - sender.index].context);
                    _this.game.modmgr.mod_center.sendReadMail(_this.game.modmgr.mod_center.notice[_this.game.modmgr.mod_center.notice.length - 1 - sender.index].id);
                    break;
            }
        };

        for(var i = 0;i < this.game.modmgr.mod_center.notice.length; i++) {
            var widget = new ccui.Layout();
            widget.index = i;
            widget.setTouchEnabled(true);
            var img_title = new ccui.ImageView();
            img_title.loadTexture(res.btn_title2, ccui.Widget.LOCAL_TEXTURE);
            img_title.setAnchorPoint(cc.p(0.5, 0.5));
            widget.addChild(img_title);
            widget.setContentSize(img_title.getContentSize());
            img_title.setPosition(img_title.getContentSize().width / 2, img_title.getContentSize().height / 2);
            this.img_titles[i] = img_title;
            this.title.pushBackCustomItem(widget);
            widget.addTouchEventListener(pressfunc);

            var text = new ccui.Text(this.game.modmgr.mod_center.notice[this.game.modmgr.mod_center.notice.length - 1 - i].title, "Arial", 25);
            img_title.addChild(text);
            text.setPosition(img_title.getContentSize().width / 2, img_title.getContentSize().height / 2);
        }
    },
});