/**
 * Created by yang on 2016/11/28.
 */
gameclass.chatui = gameclass.baseui.extend({
    sprite: null,
    node: null,
    left: null,
    chatNode:null,
    ctor: function () {
        this._super();
    },
    show: function () {
        var self = this;
        this.node = this.game.uimgr.createnode(res.chatui, true);
        this.btn_close = ccui.helper.seekWidgetByName(this.node, "btn_close");
        this.chatNode = ccui.helper.seekWidgetByName(this.node, "chatnode");

        this.addChild(this.node);
        this.left = [];

        var pressfunc = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    self.mod_kwx.chat(2, "" + sender.index);
                    self.game.uimgr.closeui("gameclass.chatui");
                    break;
            }
        };

        var btnClosefunc = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    self.game.uimgr.closeui("gameclass.chatui");
                    break;
            }
        }

        this.btn_close.addTouchEventListener(btnClosefunc);


        // var _bx = 0;
        // var _by = -70;
        var _dw = 50;
        var _dh = 50;

        for (var i = 0; i < 7; i++) {
            this.left[i] = ccui.helper.seekWidgetByName(this.node, "left" + i);
            this.left[i].setItemsMargin(13);
        }

        for (var i = 0; i < g_face.length; i++) {
            var widget = new ccui.Layout();
            widget.index = i;
            widget.setContentSize(_dw, _dh);
            var spr = new cc.Sprite();
            spr.initWithFile(g_face[i]);
            spr.setAnchorPoint(cc.p(0.5, 0.5));
            spr.setPosition(30, 20);
            if (spr.getContentSize().height > spr.getContentSize().width) {
                spr.setScale(_dh / spr.getContentSize().height);
            } else {
                spr.setScale(_dw / spr.getContentSize().width);
            }
            widget.addChild(spr);
            // var _x = _bx + _dw * (i % 9);

            widget.setTouchEnabled(true);
            this.left[Math.floor(i / 8)].addChild(widget);

            widget.addTouchEventListener(pressfunc);
        }
    },
    setmod: function (_mod_niuniu) {
        var self = this;
        this.mod_kwx = _mod_niuniu;


        var btnArr = [];
        var listViewArr = [];

        for (var i = 0; i < 2; i++) {
            btnArr[i] = ccui.helper.seekWidgetByName(this.node, "btn" + i);
            listViewArr[i] = ccui.helper.seekWidgetByName(this.node, "list" + i);
        }

        this.page = 1;

        var changepage = function (page) {
            self.page = page;

            for (var i = 0; i < 2; i++) {
                btnArr[i].getChildByName("select").setVisible(page == i);
                btnArr[i].getChildByName("normal").setVisible(!btnArr[i].getChildByName("select").isVisible());
                listViewArr[i].setVisible(page == i);
            }
        };
        changepage(this.page);


        gameclass.createbtnpress(this.node, "btn0", function () {
            changepage(0);
            self.chatNode.setVisible(false);
        });

        gameclass.createbtnpress(this.node, "btn1", function () {
            changepage(1);
            self.chatNode.setVisible(true);
        });

        gameclass.createbtnpress(this.node, "textfield", function () {

        });

        var textfield = ccui.helper.seekWidgetByName(this.node, "textfield");

        gameclass.createbtnpress(this.node, "sendbtn", function () {
            self.mod_kwx.chat(1, textfield.getString());
            self.game.uimgr.closeui("gameclass.chatui");
        });



        var txtArr = [];
        if(this.mod_kwx.GameType == gameclass.gameddz || this.mod_kwx.GameType == gameclass.gamelzddz){
            txtArr = g_chatstrDdz;
        }else if(this.mod_kwx.GameType == gameclass.gamewolong||this.mod_kwx.GameType==gameclass.gameniuniu
            ||this.mod_kwx.GameType==gameclass.gamejxnn||this.mod_kwx.GameType==gameclass.gameptj){
            txtArr = g_chatstrNew;
        }else{
            txtArr = g_chatstr;
        }

        var pressfunc = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    self.mod_kwx.chat(1, txtArr[sender.index]);
                    self.game.uimgr.closeui("gameclass.chatui");
                    break;
            }
        };

        for (var i = 0; i < txtArr.length; i++) {
            var widget = new ccui.Layout();
            //widget.setContentSize(listViewArr[1].getContentSize().width, 150);
            //widget.setBackGroundImage(res.talkBg);
            //widget.setBackGroundImageScale9Enabled(true);

            var sprBg = new cc.Sprite(res.talkBg);
            sprBg.setScaleX(0.97);
            widget.index = i;
            widget.setTouchEnabled(true);

            var helloLabel = new cc.LabelTTF(txtArr[i], "Arial", 22);
            helloLabel.setColor(cc.color(0, 0, 0));
            helloLabel.setAnchorPoint(cc.p(0, 0));
            helloLabel.setPosition(20, 10);
            sprBg.setAnchorPoint(cc.p(0, 0));
            sprBg.setPosition(0, 0);
            // sprBg.addChild(helloLabel);
            widget.addChild(sprBg);
            widget.addChild(helloLabel);
            widget.setContentSize(cc.size(510, 55));
            listViewArr[1].pushBackCustomItem(widget);
            widget.addTouchEventListener(pressfunc);
        }
        //聊天记录
        for (var i = 0; i < this.mod_kwx.chatlst.length; i++) {
            var data = this.mod_kwx.chatlst[i];
            if (data != null) {
                self.pushstr(data);
            }
        }
    },

    //聊天记录
    pushstr: function (data) {

    }
});


//------------------------------------------------------------------------


/**
 * Created by yang on 2016/11/28.
 */
gameclass.chatuinew = gameclass.baseui.extend({
    sprite: null,
    node: null,
    chat_cy: [],
    chat_bq: [],
    tb_cyy: null,
    tb_qb: null,
    mod_game: null,
    ctor: function () {
        this._super();
    },
    show: function () {
        var _this = this;
        this.node = this.game.uimgr.createnode(res.chatui, true);

        this.chat_cy[0] = ccui.helper.seekWidgetByName(this.node, "chat_cy1");
        this.chat_cy[1] = ccui.helper.seekWidgetByName(this.node, "chat_cy2");
        this.chat_bq[0] = ccui.helper.seekWidgetByName(this.node, "chat_bq1");
        this.chat_bq[1] = ccui.helper.seekWidgetByName(this.node, "chat_bq2");

        this.tb_cyy = ccui.helper.seekWidgetByName(this.node, "cyy");
        this.tb_qb = ccui.helper.seekWidgetByName(this.node, "qb");

        this.addChild(this.node);

        this.showCYY();

        gameclass.createbtnpress(this.node, "bg", function () {
            _this.game.uimgr.closeui("gameclass.chatuinew");
        });

        gameclass.createbtnpress(this.node, "Button_close", function () {
            _this.game.uimgr.closeui("gameclass.chatuinew");
        });

        gameclass.createbtnpress(this.node, "Button_4", function () {
            var text = ccui.helper.seekWidgetByName(_this.node, "input").getString();
            if (text == "") {
                return;
            }
            _this.mod_game.chat(1, text);
            _this.game.uimgr.closeui("gameclass.chatuinew");
        });

        var clickcyy = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    _this.showCYY();
                    break;
            }
        };
        this.chat_cy[1].addTouchEventListener(clickcyy);

        var clickbq = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    _this.showBQ();
                    break;
            }
        };
        this.chat_bq[1].addTouchEventListener(clickbq);



        for (var i = 1; i <= 8; i++) {
            var chat = ccui.helper.seekWidgetByName(this.tb_cyy, "chat_" + i.toString());
            chat.setTag(i);
            chat.addTouchEventListener(clickchat);
        }

        var clickbq = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    _this.mod_game.chat(2, (sender.getTag() - 1).toString());
                    _this.game.uimgr.closeui("gameclass.chatuinew");
                    break;
            }
        };


        var clickchat = function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    _this.mod_game.chat(1, g_chatstr[sender.getTag() - 1]);
                    _this.game.uimgr.closeui("gameclass.chatuinew");
                    break;
            }
        };
        for (var i = 1; i <= 20; i++) {
            var bq = ccui.helper.seekWidgetByName(this.tb_qb, "b_" + i.toString());
            bq.setTag(i);
            bq.addTouchEventListener(clickbq);
        }
    },
    setmod: function (_mod_game) {
        var _this = this;
        this.mod_game = _mod_game;
    },

    //! 显示常用于
    showCYY: function () {
        this.chat_cy[0].setVisible(true);
        this.chat_cy[1].setVisible(false);
        this.chat_bq[0].setVisible(false);
        this.chat_bq[1].setVisible(true);

        this.tb_cyy.setVisible(true);
        //this.tb_qb.setVisible(false);
    },

    //! 显示表情
    showBQ: function () {
        this.chat_cy[0].setVisible(false);
        this.chat_cy[1].setVisible(true);
        this.chat_bq[0].setVisible(true);
        this.chat_bq[1].setVisible(false);

        this.tb_cyy.setVisible(false);
        //this.tb_qb.setVisible(true);
    },
});