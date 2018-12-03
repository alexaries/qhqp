/**
 * Created on 2017/12/27.
 */
gameclass.hlgc = gameclass.hlgc || {};
gameclass.hlgc.cheatPrevPlay = gameclass.baseui.extend({
    _allContain: null,
    _selectContain: null,
    _selectCardArr: [],
    mod_hlgc: null,
    //允许选中的数量
    _selectMaxNum:-1,
    ctor: function () {
        this._super();
        this._selectCardArr = [];
        this._selectMaxNum = 13;
    },
    setmod:function (mod) {
        this.mod_hlgc = mod;
    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.hlgcCheatJson, true);
        this.addChild(this.node);

        this._allContain = ccui.helper.seekWidgetByName(this.node, "allContain");
        this._selectContain = ccui.helper.seekWidgetByName(this.node, "selectContain");

        var _this = this;
        // gameclass.createbtnpress(this.node, "backBtn", function () {
        //     _this.game.uimgr.closeui("gameclass.hlgc.cheatView");
        // });
        gameclass.createbtnpress(this.node, "okBtn", function () {
            _this.okHandle();
        });

        this.createAllCard();
    },
    createAllCard: function () {
        var allCards = [];
        for (var i = 1; i <= 37; i++) {
            if (i != 10 && i != 20 && i != 30) {
                allCards.push(i);
            }
        }
        for (var i = 0; i < allCards.length; i++) {
            var card = allCards[i];
            var cardContain = this.createCard(this._allContain, card, 0.7, 9, 0, 20);
            cardContain.addTouchEventListener(this.selectCard, this);
        }
    },
    createCard: function (parent, card, scale, horLen, disX, disY) {
        var index = parent.getChildrenCount();
        var cardContain = new ccui.Layout();
        var horChildCard = gameclass.hlgc.Table.CreateCard(card, 2, 2, 0);
        horChildCard.setScale(scale);
        var cardW = horChildCard.getContentSize().width * horChildCard.getScale();
        var cardH = horChildCard.getContentSize().height * horChildCard.getScale();
        cardContain.addChild(horChildCard);
        horChildCard.setAnchorPoint(0, 0);
        cardContain.setPositionX((index % horLen) * (cardW + disX));
        cardContain.setPositionY(parseInt(index / horLen) * (cardH + disY));
        cardContain.setContentSize(cc.size(cardW, cardH));
        cardContain.card = card;
        cardContain.setTouchEnabled(true);
        parent.addChild(cardContain);
        return cardContain;
    },
    selectCard: function (sender, type) {
        if (type != ccui.Widget.TOUCH_ENDED) return;

        if (this._selectCardArr.length >= this._selectMaxNum) return;

        var num = staticFunction.numCheck(this._selectCardArr, sender.card);
        // cc.log("card=" + sender.card + ",num=" + num);
        if (num >= 4) return;

        var cardContain = this.createCard(this._selectContain, sender.card, 0.75, 9, 0, 0)
        cardContain.addTouchEventListener(this.delCard, this);
        this.resortSelect();

        this._selectCardArr.push(sender.card);
    },
    delCard: function (sender, type) {
        if (type != ccui.Widget.TOUCH_ENDED) return;

        var index = this._selectCardArr.indexOf(sender.card);
        if (index < 0) return;

        this._selectCardArr.splice(index, 1);

        sender.removeFromParent();
        this.resortSelect();
    },
    resortSelect: function () {
        for (var i = 0; i < this._selectContain.getChildrenCount(); i++) {
            var contain = this._selectContain.getChildren()[i];
            contain.setPositionX(i * (contain.getContentSize().width + 0));
            this._selectContain.setContentSize(cc.size(contain.getPositionX() + contain.getContentSize().width, contain.getContentSize().height))
        }
    },
    okHandle: function () {
        if (this._selectCardArr.length != this._selectMaxNum) {
            this.closeSelf();
        } else {
            this.sendCheat();
            this.closeSelf();
        }
    },
    sendCheat:function () {
        this.mod_hlgc.sendCheat(this._selectCardArr);
    },
    closeSelf: function () {
        this.game.uimgr.closeui("gameclass.hlgc.cheatPrevPlay");
    },
});