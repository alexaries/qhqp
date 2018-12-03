/**
 * Created by Administrator on 2018/1/10.
 */
var woLongPokerSp=cc.Sprite.extend({
    _cardNum:null,
    _cardColor:null,
    _cardType:null,
    ctor:function(_cardNum){
        this._super();
        this.setAnchorPoint(0.5,0.5);
        this.setSpriteFrame("bg.png");
        this._cardNum=_cardNum;
        this._cardType=parseInt(_cardNum/10);
        this._cardColor=_cardNum%10;
        this._attachSp();
    },
    _attachSp:function(){
        var cardColorBig=new cc.Sprite();
        var cardColor=new cc.Sprite();
        var cardNum=new cc.Sprite();
        this.addChild(cardColorBig);
        this.addChild(cardColor);
        this.addChild(cardNum);
        cardColorBig.setAnchorPoint(0.5,0.3);
        cardNum.setAnchorPoint(0.5,1);
        cardColorBig.setPosition(85.77,60.51);
        cardColor.setPosition(23.22,119.75);
        cardNum.setPosition(25.62,188.53);
        var _numStr=this._cardType+"";
        if(this._cardType==100){
            _numStr="jokerwordblack.png";
            cardColor.setVisible(false);
        }else if(this._cardType==200){
            _numStr="jokerwordred.png";
            cardColor.setVisible(false);
        }else{
            var _colorStr="red.png";
            if(this._cardColor%2==0){
                _colorStr="black.png";
            }
            _numStr+=_colorStr;
        }
        cardNum.setSpriteFrame(_numStr);
        var _bigColorStr="";
        var _smallColorStr="";
        switch (this._cardColor){
            case 1:
                _bigColorStr="squareBig.png";
                _smallColorStr="squareSmall.png";
                break;
            case 2:
                _bigColorStr="plumBig.png";
                _smallColorStr="plumSmall.png";
                break;
            case 3:
                _bigColorStr="heartBig.png";
                _smallColorStr="heartSmall.png";
                break;
            case 4:
                _bigColorStr="spadeBig.png";
                _smallColorStr="spadeSmall.png";
                break;
        }
        if(this._cardType<100){
            cardColor.setSpriteFrame(_smallColorStr);
            cardColorBig.setSpriteFrame(_bigColorStr);
        }else{
            var _bigColorStr="";
            if(this._cardType==100){
                _bigColorStr="jokerblack.png";
            }else if(this._cardType==200){
                _bigColorStr="jokerred.png";
            }
            cardColorBig.setSpriteFrame(_bigColorStr);
        }

    }
})