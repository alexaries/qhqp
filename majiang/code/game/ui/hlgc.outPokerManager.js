/**
 * Created by Administrator on 2017-5-5.
 */
gameclass.outPokerLayer = cc.Class.extend({
    node: null,
    parent: null,
    playerSendNum: null,
    outCardsArrSP: null,
    outCardsArr: null,
    curOutStartPos: null,
    viewNodeArr: null,

    ctor: function (obj) {
        this.node = obj.outNode;
        this.parent = obj.parent;
        this.outCardsArr = [[], [], [], []];
        this.outCardsArrSP = [[], [], [], []];
        this.curOutStartPos = [cc.p(568, 200), cc.p(910, 320), cc.p(560, 430), cc.p(250, 320)];
        this.startPos = [cc.p(385, 230), cc.p(820, 203), cc.p(760, 410), cc.p(330, 457)];
        this.constStartPos = [cc.p(400, 180), cc.p(860, 200), cc.p(740, 500), cc.p(280, 457)];
        this.viewNodeArr = [];
        //modify by lish
        for (var i = 0; i < gameclass.HLGC_MAX_USER; i++) {
            var node = new cc.Node();
            this.viewNodeArr[i] = node;
            this.node.addChild(node);
        }
    },

    renderCards: function (index) {
        this.outCardsArrSP[index] = [];
        this.viewNodeArr[index].removeAllChildren();
        var startPos = cc.p(this.constStartPos[index]);
        var cards = this.outCardsArr[index];
        for (var x = 0; x < cards.length; x++) {
            var sp = this.creatCardSp(index, cards[x], x);
            var size = cc.size(sp.getContentSize().width * sp.getScale(), sp.getContentSize().height * sp.getScale());
            // cc.log("size=="+size)
            startPos = this.cpPosition(index, x, size, startPos);
            sp.setPosition(startPos);
            sp.setTag(index * 100 + x);
            // cc.log(startPos.x+","+startPos.y);
            this.outCardsArrSP[index].push(sp);
            this.viewNodeArr[index].addChild(sp);
        }
        // cc.log("---")
    },

    cpPosition: function (index, _i, size, startPos) {
        var differY = [11, 14, 14, 12];
        var up = false;
        var constPos = cc.p(this.constStartPos[index]);
        var row = Math.floor(_i / 10) % 2;

        if (_i >= 20) {
            up = true;
        }
        _i = _i % 10;

        switch (index) {
            case 0:
                startPos.x = _i * (size.width - 2) + constPos.x;
                startPos.y = row * 44 + constPos.y + (up == true ? differY[index] : 0);
                break;
            case 1:
                startPos.x = row * 47 * -1 + constPos.x;
                startPos.y = _i * 29 + constPos.y + (up == true ? differY[index] : 0);
                break;
            case 2:
                startPos.x = _i * (size.width - 2) * -1 + constPos.x;
                startPos.y = row * 44 * -1 + constPos.y + (up == true ? differY[index] : 0);
                break;
            case 3:
                startPos.x = row * 47 + constPos.x;
                startPos.y = _i * 29 * -1 + constPos.y + (up == true ? differY[index] : 0);
                break;
        }
        return startPos;
    },

    removePengGangSp: function (lastOutIndex, cardNum) {
        for (var i in this.outCardsArr[lastOutIndex]) {
            if (this.outCardsArr[lastOutIndex][i] == cardNum) {
                this.outCardsArr[lastOutIndex].splice(i, 1);
                break;
            }
        }
        this.renderCards(lastOutIndex);
    },

    //setCurOutStartPos:function(pos){
    //    this.curOutStartPos = pos;
    //},

    getConnectTableData: function (arr) {
        this.outCardsArr = arr;
    },

    creatCardSp: function (index, cardNum, x) {
        x = parseInt(x);

        var sp;
        if(this.parent.mod_hlgc.roomSetArr[5] == 1){
            if(index == 0){
                sp = gameclass.hlgc.Table.CreateCard(cardNum, 2, 1, 0);
            }else{
                sp = gameclass.hlgc.Table.CreateCard(cardNum, index, 1, 0);
            }
        }else{
            sp = gameclass.hlgc.Table.CreateCard(cardNum, index, 3, 0);
        }


        if (index == 0) {
            //创建对应牌躺着的精灵
            sp.setLocalZOrder(1000 - x);
            if (x >= 20) sp.setLocalZOrder(1000000 - x);
        } else if (index == 1) {
            sp.setLocalZOrder(1000 - x);
            if (x >= 20) sp.setLocalZOrder(100000 - x);
        } else if (index == 2) {
            sp.setLocalZOrder(x);
        } else {
            if(x < 10){
                sp.setLocalZOrder(1000 + x);
            }else if(x < 20){
                sp.setLocalZOrder(100 + x);
            }
            if (x >= 20) sp.setLocalZOrder(10000 + x);
        }
        // if (index == 0) {
        //     //创建对应牌躺着的精灵
        //     sp.setLocalZOrder(x);
        // } else if (index == 1) {
        //     sp.setLocalZOrder(1000 - x)
        //     if (x >= 20) sp.setLocalZOrder(10000 - x);
        // } else if (index == 2) {
        //     sp.setLocalZOrder(1000 - x);
        //     if (x >= 20) sp.setLocalZOrder(1000 + x);
        // } else {
        //     sp.setLocalZOrder(x);
        // }
        sp.setAnchorPoint(0.5, 0.5);
        return sp;
    },

    flyMajonAct: function (index, num) {
        var startPos = this.curOutStartPos[index] ;

        var connt =  this.outCardsArrSP[index].length;
        var endPos = cc.p(0,0);

        var tempSp = this.creatCardSp(index,num,connt);
        tempSp.setPosition(startPos);
        if(index == 0 || index == 2){
            tempSp.setScale(0.8);
        }else{
            tempSp.setScale(1.6);
        }


        if(connt == 0){
           endPos = cc.p( this.constStartPos[index] );
        }else{
           var lassp = this.outCardsArrSP[index][connt - 1];
           endPos = this.cpPosition(index,connt,lassp.getContentSize()  , lassp.getPosition());
        }

        var _this = this;
        // this.viewNodeArr[index].addChild(tempSp);
        this.node.addChild(tempSp);
        // cc.log(tempSp.getPositionX()+"-=-="+tempSp.getPositionY())
        tempSp.stopAllActions();
        tempSp.runAction(cc.sequence(cc.delayTime(0.1), cc.moveTo(0, endPos), cc.callFunc(function(){
        // tempSp.runAction(new cc.Sequence(new cc.MoveTo(0,endPos), new cc.DelayTime(5.2) , new cc.CallFunc(function(){
           // _this.parent.setPointerAct(tempSp,index);
           tempSp.removeFromParent();
           // _this.outCardsArr[index].push(num);
           // _this.renderCards(index);

            _this.outCardsArr[index].push(num);
            _this.renderCards(index);
            var len = _this.outCardsArrSP[index].length;
            _this.parent.setPointerAct(_this.outCardsArrSP[index][len - 1], index);
        })));

        // this.outCardsArr[index].push(num);
        // this.renderCards(index);
        // var len = this.outCardsArrSP[index].length;
        // this.parent.setPointerAct(this.outCardsArrSP[index][len - 1], index);
    },


    checkTableCard: function (_num) {
        //modify by lish
        for (var i = 0; i < this.parent.mod_hlgc.maxNum; i++) {
            for (var j = 0; j < this.outCardsArr[i].length; j++) {
                if (_num == this.outCardsArr[i][j]) {
                    this.viewNodeArr[i].getChildByTag(i * 100 + j).setColor(cc.color(150, 150, 150));
                } else {
                    this.viewNodeArr[i].getChildByTag(i * 100 + j).setColor(cc.color(255, 255, 255));
                }
            }
        }
    },

    removeTableCard: function () {
        this.outCardsArr = [[], [], [], []];
        for (var i = 0; i < 4; i++) {
            this.renderCards(i);
        }
    },

});
