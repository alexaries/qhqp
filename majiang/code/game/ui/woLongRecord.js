/**
 * Created by Administrator on 2017/8/10.
 */
gameclass.woLongRecord = gameclass.baseui.extend({
    timer:null,
    totalTime:null,
    fadeTimer:null,
    nowJuShuIndex:null,
    nowStep:null,
    speed:null,
    isPause:null,
    isTouMovePause:null,
    speedArr:null,
    nowSpeedIndex:null,
    ctor: function () {
        this._super();
        this.isTouMovePause=false;
        this.speedArr=[1,2,4];
        this.nowJuShuIndex=0;
    },
    show: function () {
        this.myUid=this.game.modmgr.mod_login.logindata.uid;
        this.node = this.game.uimgr.createnode(res.wlReCordSceneJson,true);
        cc.spriteFrameCache.addSpriteFrames(res.cardsPlistBig);
        this.timeControlPanel=ccui.helper.seekWidgetByName(this.node,"timeControlPanel");
        this.touchNode=ccui.helper.seekWidgetByName(this.node,"touchNode");
        this.timeBarBg=ccui.helper.seekWidgetByName(this.node,"timeBarBg");
        this.timeBar=ccui.helper.seekWidgetByName(this.node,"timeBar");
        this.myCardLayer=ccui.helper.seekWidgetByName(this.node,"myCardLayer");
        this.addChild(this.node);
        var _this=this;
        this._changePuseState(false);
        gameclass.createbtnpress(this.node, "backBtn", function () {
            _this.game.modmgr.mod_login.dissmissroom();
            _this.unscheduleUpdate();
        });
        gameclass.createbtnpress(this.node, "lastBtn", function () {
            var nowJuShuIndex=_this.nowJuShuIndex-1;
            if(nowJuShuIndex<0)return;
            _this._changeJu(nowJuShuIndex);
        });
        gameclass.createbtnpress(this.node, "playBtn", function () {
            _this._changePuseState(!_this.isPause);
        });
        gameclass.createbtnpress(this.node, "nextBtn", function () {
            var nowJuShuIndex=_this.nowJuShuIndex+1;
            if(nowJuShuIndex>=_this.recordData.length)return;
            _this._changeJu(nowJuShuIndex);
        });
        gameclass.createbtnpress(this.node, "changeSpeedBtn", function () {
            var nowSpeedIndex=_this.nowSpeedIndex;
            nowSpeedIndex++;
            if(nowSpeedIndex>=_this.speedArr.length) nowSpeedIndex=0;
            _this._changeSpeedState(nowSpeedIndex);
        });
    },
    setMod:function(recordData,selectRoomid){
        this.fadeTimer=3;
        this.speed=1;
        this.recordData=recordData;
        var nowJuShuIndex=null;
        for(var i=0;i<recordData.length;i++){
            if(recordData[i].roomid==selectRoomid){
                nowJuShuIndex=i;
                break;
            }
        }
        this._setRulePanel();
        this._madeMyCardArr();
        this._changeJu(nowJuShuIndex);
        this.scheduleUpdate();
        this._addTouchListener();
    },
    _changeJu:function(nowJuShuIndex){
        this.timer=0;
        this.nowStep=null;
        this.nowJuShuIndex=nowJuShuIndex;
        this.totalTime=this.recordData[this.nowJuShuIndex].step.length-1;
        this._setJuShuLabel();
        this._initPlayer();
        this.reflashTable();
    },
    //根据step数组填充没步玩家自己的手牌数组
    _madeMyCardArr:function(){
        for(var i=0;i<this.recordData.length;i++){
            for(var j=0;j<this.recordData[i].step.length;j++){
                for(var k=0;k<this.recordData[i].step[j].info.length;k++){
                    var data=this.recordData[i].step[j].info[k];
                    if(data.uid==this.myUid){
                        if(!data.card){
                            data.card=this.recordData[i].step[j-1].info[k].card.slice(0);
                            if(this.recordData[i].step[j].curstep==this.myUid){
                                if(j!=0){
                                    this._deletArr(data.card,this.recordData[i].step[j].curcard)
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
    },
    _deletArr:function(_arr,_brr){
       for(var i=0;i<_brr.length;i++){
           for(var j=0;j<_arr.length;j++){
               if(_arr[j]==_brr[i]){
                   _arr.splice(j,1);
                   break;
               }
           }
       }
    },
    _initPlayer:function(){
        var personArr=this.recordData[this.nowJuShuIndex].person;
        var playerNodeArr=ccui.helper.seekWidgetByName(this.node,"playerPanel").getChildren();
        var headCardPanelArr=ccui.helper.seekWidgetByName(this.node,"outPokerLayer").getChildren();
        this.playerObj={};
        this.mySeverChair=null;
        for(var i=0;i<5;i++){
            playerNodeArr[i].setVisible(false);
        }
        for(var i=0;i<personArr.length;i++){
           if(personArr[i].uid==this.myUid){
               this.mySeverChair=i;
               break;
           }
        }
        for(var i=0;i<personArr.length;i++){
            var _num=i-this.mySeverChair;
            if(_num<0) _num+=5;
            this.playerObj[personArr[i].uid]=this.playerObj[personArr[i].uid]||{};
            this.playerObj[personArr[i].uid].data=personArr[i];
            this.playerObj[personArr[i].uid]._node=playerNodeArr[_num];
            playerNodeArr[_num].setVisible(true);
            this.playerObj[personArr[i].uid].headCardPanel=headCardPanelArr[_num];

            ccui.helper.seekWidgetByName(playerNodeArr[_num],"playerName").setString(personArr[i].name);
            ccui.helper.seekWidgetByName(playerNodeArr[_num],"totalScore").setString(personArr[i].total);
            gameclass.mod_base.showtximg(ccui.helper.seekWidgetByName(playerNodeArr[_num],"icon"),personArr[i].head,0,0,"im_headbg2");
        }
    },
    _changePuseState:function(_isPuse){
       this.isPause=_isPuse;
       if(_isPuse){
           ccui.helper.seekWidgetByName(this.node,"playBtn").loadTextures(res.reCordPlayerBtnImg1,res.reCordPlayerBtnImg1,res.reCordPlayerBtnImg1);
       }else{
           ccui.helper.seekWidgetByName(this.node,"playBtn").loadTextures(res.reCordPlayerBtnImg2,res.reCordPlayerBtnImg2,res.reCordPlayerBtnImg2);
       }
    },
    _setJuShuLabel:function(){
        var _str="局数："+(this.nowJuShuIndex+1)+"/"+this.recordData.length;
        ccui.helper.seekWidgetByName(this.node,"juShuLabel").setString(_str);
    },
    _changeSpeedState:function(nowSpeedIndex){
        this.nowSpeedIndex=nowSpeedIndex;
        this.speed=this.speedArr[nowSpeedIndex];
        ccui.helper.seekWidgetByName(this.node,"speedImg").loadTexture(res["reCordSpeed"+this.speed]);
    },
    update:function(dt){
        this.fadeTimer-=dt;
        if(this.fadeTimer<0){
            this.fadeTimer=0;
            this.timeControlPanel.setVisible(false);
        }
        if(!this.isPause&&!this.isTouMovePause){
            this.timer+=(dt*this.speed);
        };
        if(this.timer<0){
            this.timer=0;
            return;
        }
        if(this.timer>this.recordData[this.nowJuShuIndex].step.length-1){
            this.timer=this.recordData[this.nowJuShuIndex].step.length-1;
            this._changePuseState(true);
        }
        var _scale=this.timer/this.totalTime;
        this.timeBar.setScaleX(_scale);
        this.reflashTable();
    },
    _setRulePanel:function(){
        var _roomid=parseInt(this.recordData[this.nowJuShuIndex].roomid/10);
        var param1=this.recordData[this.nowJuShuIndex].param1;
        var param2=this.recordData[this.nowJuShuIndex].param2;
        ccui.helper.seekWidgetByName(this.node,"fangHao").setString("房号："+_roomid+"");
        var _renShuNum="三人";
        if(parseInt(param1/1000)%10==3){
            _renShuNum="三人";
        }else if(parseInt(param1/1000)%10==4){
            _renShuNum="四人";
        }else if(parseInt(param1/1000)%10==5){
            _renShuNum="五人";
        }
        var ruleText="";
        if(parseInt(param1)%10==0){
            ruleText+="同色无奖   ";
        }else if(parseInt(param1)%10==1){
            ruleText+="同色加1奖    ";
        }else if(parseInt(param1)%10==2){
            ruleText+="同色加N奖    ";
        }
        if(parseInt(param1/10)%10==0){
            ruleText+="顺奖无奖   ";
        }else if(parseInt(param1/10)%10==1){
            ruleText+="顺奖连1奖    ";
        }else if(parseInt(param1/10)%10==2){
            ruleText+="顺奖连N奖    ";
        }
        if(parseInt(param1/100)%10==0){
            ruleText+="无奖加10奖   ";
        }else if(parseInt(param1/100)%10==1){
            ruleText+="无奖加15奖    ";
        }
        if(parseInt(param2)%10==1){
            ruleText+="单牌为奖   ";
        }
        if(parseInt(param2/10)%10==1){
            ruleText+="独奖翻倍    ";
        }
        if(parseInt(param2/100)%10==1){
            ruleText+="断分玩法     ";
        }
        ccui.helper.seekWidgetByName(this.node,"renShuNum").setString(_renShuNum);
        ccui.helper.seekWidgetByName(this.node,"ruleText").setString(ruleText);
    },
    reflashTable:function(){
       var stepArr=this.recordData[this.nowJuShuIndex].step;
       var _step=parseInt(this.timer);
       if(_step==this.nowStep)return;
        this.nowStep=_step;
        var _obj=stepArr[this.nowStep];
        var buYaoArr=[];
        var _isBeginPush=false;
        for(var i=0;i<_obj.info.length;i++){
            this.playerObj[_obj.info[i].uid].headCardPanel.removeAllChildren(true);
        }
        for(var i=0;i<_obj.info.length*2;i++){
            var _num=i;
            if(_num>=_obj.info.length) _num-=_obj.info.length;
            if(_isBeginPush==true&&_obj.info[_num].uid==_obj.curstep){
                break;
            }
            if(_isBeginPush==true){
                buYaoArr.push(_obj.info[_num].uid);
            }
            if(_obj.info[_num].uid==_obj.befstep){
                _isBeginPush=true;
            }
        }
        for(var j=0;j<buYaoArr.length;j++){
            this.outPoker(this.playerObj[buYaoArr[j]].data.uid,[]);
        }

        if(_obj.befstep){
            this.outPoker(_obj.befstep,_obj.lastcard);
        }
        if(_obj.curstep){
            this.outPoker(_obj.curstep,_obj.curcard);
        }

        for(var i=0;i<_obj.info.length;i++){
            var _node=this.playerObj[_obj.info[i].uid]._node;
            ccui.helper.seekWidgetByName(_node,"jiangFen").setString(_obj.info[i].award);
            ccui.helper.seekWidgetByName(_node,"jianFen").setString(_obj.info[i].jscore);

            if(_obj.info[i].rating){
                ccui.helper.seekWidgetByName(_node,"NYou").setVisible(true);
                ccui.helper.seekWidgetByName(_node,"NYou").loadTexture(res["you"+_obj.info[i].rating])
            }else{
                ccui.helper.seekWidgetByName(_node,"NYou").setVisible(false);
            }

            ccui.helper.seekWidgetByName(_node,"cardIcon").getChildByName("cardNum").setString(_obj.info[i].cardnum);
            if(_obj.info[i].rating){
                if(_obj.curstep!=_obj.info[i].uid&&_obj.befstep!=_obj.info[i].uid){
                    this.playerObj[_obj.info[i].uid].headCardPanel.removeAllChildren(true);
                }
            }
            if(_obj.info[i].uid==this.myUid){
                this._initHandCard(_obj.info[i].card);
            }
        }
    },
    _initHandCard:function(card){
        this.myCardLayer.removeAllChildren(true);
        var _allCardWith=148;
        var _arr=card;
        var convertCardArr=this._reSortCard(_arr);
        var _brr=[];
        for(var i=0;i<_arr.length;i++){
            _brr[parseInt(_arr[i]/10)]=_brr[parseInt(_arr[i]/10)]||0;
            _brr[parseInt(_arr[i]/10)]++
        }
        var _isFristtuo=true;
        for(var i=0;i<_brr.length;i++){
            if(!_brr[i])continue;
            var _num=_brr[i];
            _allCardWith+=((_num-1)*17);
            if(!_isFristtuo){
                _allCardWith+=35;
            }
            _isFristtuo=false;
        }
        this.myCardLayer.setContentSize(_allCardWith,this.myCardLayer.height);
        var _lastCardPos=null;
        var _sp=null;
        for(var i=0;i<convertCardArr.length;i++){
            if(i!=0) _lastCardPos.x+=35;
            for(var j=0;j<convertCardArr[i].card.length;j++){
                _sp=new woLongPokerSp(convertCardArr[i].card[j]);
                if(!_lastCardPos)_lastCardPos=cc.p(_sp.width/2,this.myCardLayer.height/2);

                var _cardLengthObj={};
                for(var m=0;m<convertCardArr[i].card.length;m++){
                    _cardLengthObj[parseInt(convertCardArr[i].card[m]/10)]=_cardLengthObj[parseInt(convertCardArr[i].card[m]/10)]||0;
                    _cardLengthObj[parseInt(convertCardArr[i].card[m]/10)]++;
                }
                var totalLength=0;
                var _mLengthArr=[];
                for(var k in _cardLengthObj){
                    totalLength+=_cardLengthObj[k];
                    _mLengthArr.push(totalLength);
                }
                var _isEndSameColor=false;
                for(var m=0;m<_mLengthArr.length;m++){
                    if(j==_mLengthArr[m]-1){
                        var _node=this.game.uimgr.createnode(res.yishuLabel);
                        var text = _node.getChildByName("text");
                        text.setString(_cardLengthObj[parseInt(convertCardArr[i].card[j]/10)+""]+"");
                        text.ignoreContentAdaptWithSize(true);
                        _node.setPosition(20,20);
                        _node.setScale(1.5);
                        _sp.addChild(_node);
                    }
                    if(j==_mLengthArr[m]){
                        _isEndSameColor=true;
                    }
                }
                if(_isEndSameColor){
                    _lastCardPos.x+=35;
                }else if(j){
                    _lastCardPos.x+=17;
                }
                _sp.setPosition(_lastCardPos);
                this.myCardLayer.addChild(_sp);
            }
            if(convertCardArr[i].touShu>3&&(convertCardArr[i]._cardIndex==100||convertCardArr[i]._cardIndex==2.5)){
                var _touShuNode=this.game.uimgr.createnode(res.toushuLabel);
                var touShuText =ccui.helper.seekWidgetByName(_touShuNode,"textLabel");
                touShuText.setString(convertCardArr[i].touShu+"");
                touShuText.ignoreContentAdaptWithSize(true);
                _touShuNode.setPosition(20,60);
                _sp.addChild(_touShuNode);
            }
        }
    },
    _convertColor:function(_type){
        if(_type==4){
            _type=2;
        }else if(_type==3){
            _type=3;
        }else if(_type==2){
            _type=1;
        }else if(_type==1){
            _type=4;
        }
        return _type;
    },
    outPoker:function(uid,cardArr){
        var headCardPanel=this.playerObj[uid].headCardPanel;
        headCardPanel.removeAllChildren(true);
        if(cardArr.length){
            headCardPanel.width=(cardArr.length-1)*40+148;

            for(var i=0;i<cardArr.length;i++){
                var _sp=new woLongPokerSp(cardArr[i]);
                headCardPanel.addChild(_sp);
                var _pos=cc.p(0,0);
                _pos.x=(_sp.width*0.5+i*40);
                _pos.y=headCardPanel.height/2;
                _sp.setPosition(_pos);
            }
        }else{
            var _yaobuqiSp=new cc.Sprite(res.yaobuqi);
            headCardPanel.width=_yaobuqiSp.width;
            _yaobuqiSp.setPosition(headCardPanel.width/2,headCardPanel.height/2);
            headCardPanel.addChild(_yaobuqiSp);
        }

    },
    _reSortCard:function(_arr){
        var _this=this;
        var convertObj={};
        var _mrr=_arr.slice();
        for(var i=0;i<_mrr.length;i++) {
            var _cardIndex=parseInt(_mrr[i]/10);
            if(_mrr[i]>=1000){
                _cardIndex=100;
            }
            convertObj[_cardIndex]=convertObj[_cardIndex]||{};
            convertObj[_cardIndex].card=convertObj[_cardIndex].card||[];
            convertObj[_cardIndex].card.push(_mrr[i]);
        }
        if(convertObj[100]&&convertObj[100].card.length==2){
            convertObj[100].card.sort(function(a,b){
                return a-b;
            })
            if(convertObj[100].card[0]==1000&&convertObj[100].card[1]==2000){
                convertObj[100].card.pop();
                convertObj[200]={};
                convertObj[200].card=[2000];
                convertObj[200].touShu=1;
                convertObj[100].touShu=1;
            }
        }
        var _danArr=[];
        var _danIndexArr=[];
        for(var i in convertObj){
            convertObj[i].card.sort(function(a,b){
                var ruleA=_this._convertColor(a%10);
                var ruleB=_this._convertColor(b%10);
                if(ruleA==0) ruleA=a;
                if(ruleB==0) ruleB=b;
                return ruleA-ruleB;
            })
            convertObj[i].touShu=convertObj[i].card.length;
            if(i==100||i==200){
                if(convertObj[i].card.length==1||convertObj[i].card.length==2){
                    convertObj[i].touShu=convertObj[i].card.length;
                    if(convertObj[i].touShu==1){
                        _danArr.push(convertObj[i]);
                        _danIndexArr.push(i);
                    }
                    continue;
                }
                var dwNum=0;
                var xwNum=0;
                for(var j=0;j<convertObj[i].card.length;j++){
                    if(convertObj[i].card[j]==1000){
                        xwNum++;
                    }else{
                        dwNum++;
                    }
                }
                var maxNum=dwNum>xwNum?dwNum:xwNum;
                convertObj[i].touShu=convertObj[i].touShu*2;
                if(convertObj[i].card.length<5&&maxNum!=convertObj[i].card.length){
                    if(convertObj[i].card.length==2)  convertObj[i].touShu=1;
                    else convertObj[i].touShu--;
                }
                else if(convertObj[i].card.length==5&&maxNum==3) convertObj[i].touShu-=2;
                else if(convertObj[i].card.length==6&&maxNum==3) convertObj[i].touShu-=3;
            }
            if(convertObj[i].touShu==1){
                _danArr.push(convertObj[i]);
                _danIndexArr.push(i);
            }
        }
        if(this.recordData[this.nowJuShuIndex].param2%10==1&&_danArr.length>=3){
            var _obj={};
            _obj.touShu=_danArr.length+4;
            var _card=[];
            for(var i=0;i<_danArr.length;i++){
                _card=_card.concat(_danArr[i].card);
                delete convertObj[_danIndexArr[i]];
            }
            _obj.card=_card;
            convertObj[2.5]=_obj;
        }
        var convertArr=[];
        for(var i in convertObj){
            var _obj=convertObj[i];
            _obj._cardIndex=i;
            convertArr.push(_obj)
        }
        convertArr.sort(function(a,b){
            if(a.touShu==b.touShu){
                var _anum=Number(a._cardIndex);
                var _bnum=Number(b._cardIndex);
                if(_anum<=2)_anum=(_anum)+13;
                if(_bnum<=2)_bnum=(_bnum)+13;
                return (_bnum-_anum)||-1;
            }
            return b.touShu-a.touShu;
        })
        return convertArr;
    },
    _addTouchListener:function(){
        var _this=this;
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                _this.timeControlPanel.setVisible(true);
                _this.fadeTimer=3;
                return false;
            },
        }),this.touchNode);

        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if(!_this.timeControlPanel.isVisible())return false;
                _this.fadeTimer=3;
                var _node=event.getCurrentTarget();
                var _pos=_node.convertToNodeSpace(touch.getLocation());
                var _rect=cc.rect(-10,-20,_node.width+20,_node.height+40);
                if(cc.rectContainsPoint(_rect,_pos)){
                    _this.isTouMovePause=true;
                    return true;
                }
                return false;
            },
            onTouchMoved:function(touch,event){
                _this.fadeTimer=3;
                var _node=event.getCurrentTarget();
                var _pos=_node.convertToNodeSpace(touch.getLocation());
                var _scaleX=_pos.x/_node.width;
                if(_scaleX<0)_scaleX=0;
                if(_scaleX>1)_scaleX=1;
                _this.timeBar.setScaleX(_scaleX);
               return true;
            },
            onTouchEnded:function(touch,event){
                var _node=event.getCurrentTarget();
                var _pos=_node.convertToNodeSpace(touch.getLocation());
                var _scaleX=_pos.x/_node.width;
                if(_scaleX<0)_scaleX=0;
                if(_scaleX>1)_scaleX=1;
                _this.timeBar.setScaleX(_scaleX);
                _this.timer=_scaleX*_this.totalTime;
                _this.isTouMovePause=false;
            },
            onTouchCancelled:function(touch,event){
                var _node=event.getCurrentTarget();
                var _pos=_node.convertToNodeSpace(touch.getLocation());
                var _scaleX=_pos.x/_node.width;
                if(_scaleX<0)_scaleX=0;
                if(_scaleX>1)_scaleX=1;
                _this.timeBar.setScaleX(_scaleX);
                _this.timer=_scaleX*_this.totalTime;
                _this.isTouMovePause=false;
            }
        }),this.timeBarBg);
    }
});