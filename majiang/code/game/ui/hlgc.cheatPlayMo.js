gameclass.hlgc.cheatPlayMo = gameclass.hlgc.cheatPrevPlay.extend({
    ctor: function () {
        this._super();
        this._selectMaxNum = 1;
    },
    setmod: function (mod) {
        this._super(mod);
        this.mod_hlgc.onSendmygod();
    },
    updateAllCard:function (arr) {
        var allCards = [];
        for (var i = 1; i <= 37; i++) {
            if (i != 10 && i != 20 && i != 30) {
                allCards.push(i);
            }
        }

        var cardNumObj = staticFunction.getArrayNumObj(arr);
        for(var i = 0;i<allCards.length;i++){
            var card = allCards[i];
            var cardNum = staticFunction.getCardNumFromObj(cardNumObj, card);
            if(cardNum == 0){
                cardNumObj[card] = 0;
            }
        }


        for(var key in cardNumObj){
            var card = key;
            var cardContain = this.createCard(this._allContain, card, 0.7, 9, 0, 20);
            var cardChild = cardContain.getChildren()[0];
            var cardW = cardChild.getContentSize().width * cardChild.getScale();

            //var numTxt = new cc.LabelTTF(cardNumObj[key].toString(), "Arial", 36);
            //numTxt.setAnchorPoint(cc.p(0, 0));
            //numTxt.setPosition(0, -30);
            //numTxt.setColor(cc.color(255, 255, 255));
            //cardContain.addChild(numTxt);
            //numTxt.setPositionX((cardW - numTxt.getContentSize().width) / 2);

            cardContain.addTouchEventListener(this.selectCard, this);
        }
    },
    createAllCard: function () {

    },
    selectCard: function (sender, type) {
        if (type != ccui.Widget.TOUCH_ENDED) return;

        if (this._selectCardArr.length == 1 && this._selectCardArr[0] == sender.card) return;

        this._selectContain.removeAllChildren();
        var cardContain = this.createCard(this._selectContain, sender.card, 0.75, 9, 0, 0)
        cardContain.addTouchEventListener(this.delCard, this);

        this._selectCardArr = [];
        this._selectCardArr.push(sender.card);
    },
    sendCheat: function () {
        if (this._selectCardArr.length != 1) return;
        this.mod_hlgc.onSendgetmygod(this._selectCardArr[0]);
    },
    closeSelf: function () {
        this.game.uimgr.closeui("gameclass.hlgc.cheatPlayMo");
    },
});