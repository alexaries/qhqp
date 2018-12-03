/**
 * Created by yang on 2016/11/9.
 */

gameclass.shopView = gameclass.baseui.extend({
    sprite: null,
    node: null,
    _horNum: 4,
    //横向间距
    _horDis: 20,
    //纵向间距
    _verDis: 0,
    _itemW: 206,
    _itemH: 277,
    _indexNum: 8,
    _isRun: false,
    _targetRotation: 0,
    _moneyArr:null,
    _circleNode:null,
    _leftNumText:null,
    _jifenText:null,
    _jifenNum:null,
    _leftNum:null,
    _exchangeArr:null,
    _requestFrontUrl:"http://47.105.36.150:9080",
    _requestBackUrl:null,

    tableArr: [
        {
            name: "充值",
            normalImg: "res/ui/qhqp/15-recharge/qh_txt_cz2@2x.png",
            selectImg: "res/ui/qhqp/15-recharge/qh_txt_cz1@2x.png",
            datas: [
                {name: "6钻石", btnTxt: "¥6.00", icon: ""},
                {name: "18钻石", btnTxt: "¥18.00", icon: ""},
                {name: "30钻石", btnTxt: "¥30.00", icon: ""},
                {name: "68钻石", btnTxt: "¥68.00", icon: ""},
                {name: "128钻石", btnTxt: "¥128.00", icon: ""},
                {name: "328钻石", btnTxt: "¥328.00", icon: ""},
            ]
        },
        {
            name: "转盘抽奖",
            normalImg: "res/ui/qhqp/15-recharge/qh_txt_zpcj2@2x.png",
            selectImg: "res/ui/qhqp/15-recharge/qh_txt_zpcj1@2x.png",
        },
        {
            name: "实物兑换",
            normalImg: "res/ui/qhqp/15-recharge/qh_txt_swdh2@2x.png",
            selectImg: "res/ui/qhqp/15-recharge/qh_txt_swdh1@2x.png",
            datas: [
                {name: "10话费", btnTxt: "xx积分", icon: "res/ui/qhqp/17-exchange/icon_huafei@2x.png"},
                {name: "10房钻", btnTxt: "xx积分", icon: "res/ui/qhqp/17-exchange/icon_dianyuan@2x.png"},
                {name: "移动电源", btnTxt: "xx积分", icon: "res/ui/qhqp/17-exchange/icon_dianyuan@2x.png"},
                {name: "米", btnTxt: "xx积分", icon: "res/ui/qhqp/17-exchange/icon_dami@2x.png"},
                {name: "面", btnTxt: "xx积分", icon: "res/ui/qhqp/17-exchange/icon_choujiang@2x.png"},
            ]
        },
    ],
    ctor: function () {
        this._super();

        this._address = gameclass.mod_platform.getAddress();

        this._singleRotate = 360 / this._indexNum;
        this._moneyArr = [6,18,30,68,128,328];
        this._jifenText = null;
        this._leftNumText = null;
        this._jifenNum = 0;
        this._leftNum = 0;
        //this._requestFrontUrl = "http://192.168.100.54:9080";
        this._requestFrontUrl = "http://47.105.36.150:9080";
        this._requestBackUrl = "http://47.105.36.150";
    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.shopLayerJson, true);
        this.addChild(this.node);

        this._male = ccui.helper.seekWidgetByName(this.node, "male");
        this._famale = ccui.helper.seekWidgetByName(this.node, "famale");
        this._rightContain = ccui.helper.seekWidgetByName(this.node, "rightContain");
        this._circleNode = ccui.helper.seekWidgetByName(this.node,"Node_1");
        this._circleNode.setRotation(0);
        this._leftNumText = ccui.helper.seekWidgetByName(this.node,"leftTxt");
        this._jifenText = ccui.helper.seekWidgetByName(this.node,"Text_jifen");
        this._jifenText.setString("积分："+ this._jifenNum);
        this._leftNum = parseInt(this._jifenNum / 50);

        this.listView = ccui.helper.seekWidgetByName(this.node, "listView");
        this.btnStyle = this.listView.getChildByName("btnStyle");
        this.circle = ccui.helper.seekWidgetByName(this.node, "circle");
        this._male.setVisible(false);
        this.getExchangeArr();

        this.updateNextNum();
        gameclass.createbtnpress(this.node, "buyroomcard", function () {
            //_this.game.uimgr.showui("gameclass.buycardui");
        });
        //点击开始转盘抽奖
        gameclass.createbtnpress(this.node, "Button_3", function () {
            _this.drawHandle();
        });

        var head = ccui.helper.seekWidgetByName(this.node, "headback");
        head.setTouchEnabled(true);
        //gameclass.mod_base.showtximg(head, this.game.modmgr.mod_login.logindata.imgurl, 0, 0, "im_headbg2");
        var name = ccui.helper.seekWidgetByName(this.node, "name");
        var id = ccui.helper.seekWidgetByName(this.node, "id");
        var card = ccui.helper.seekWidgetByName(this.node, "money");

        name.setString(this.game.modmgr.mod_login.logindata.name);
        id.setString(this.game.modmgr.mod_login.logindata.uid.toString());
        card.setString(this.game.modmgr.mod_login.logindata.card.toString());
        if (this.game.modmgr.mod_login.logindata.sex == 0) {
            this._male.setVisible(false);
            this._famale.setVisible(true);
        } else {
            this._male.setVisible(true);
            this._famale.setVisible(false);
        }

        var _this = this;
        gameclass.createbtnpress(this.node, "headback", function () {
            var userInfoView = _this.game.uimgr.showui("gameclass.UserInfoView");
            userInfoView.updateView(
                _this.game.modmgr.mod_login.logindata.imgurl,
                _this.game.modmgr.mod_login.logindata.name,
                "ID：" + _this.game.modmgr.mod_login.logindata.uid,
                "IP：" + _this.game.modmgr.mod_login.logindata.ip,
                "地址：" + _this._address);
        });

        gameclass.createbtnpress(this.node, "closeBtn", function () {
            _this.game.uimgr.closeui("gameclass.shopView");
        });
        gameclass.createbtnpress(this.node, "drawBtn", function () {
            _this.drawHandle();
        });
        gameclass.createbtnpress(this.node, "checkBtn", function () {
            _this.game.uimgr.showui("gameclass.zhuanpanList");
        });

        this.btnGroupCtr = new gameclass.buttonGroupControl(this.tabClickHandle.bind(this));


        this.listView.removeAllChildren();
        var btnControlArr = [];

        for (var i = 0; i < this.tableArr.length; i++) {
            var btn = this.btnStyle.clone();
            var txtArr = staticFunction.addTabBtn(btn, this.tableArr[i].normalImg, this.tableArr[i].selectImg);
            // var selectTxt = txtArr[1];
            // selectTxt.setPositionX(selectTxt.getPositionX() - 4);
            // selectTxt.setPositionY(selectTxt.getPositionY() + 7);
            this.listView.addChild(btn);
            btnControlArr.push(new gameclass.baseButtonControl(btn, ["normal"], ["select"]));
        }

        this.btnGroupCtr.initData(btnControlArr);
        this.btnGroupCtr.setSelectIndex(0);

        this.tabClickHandle();


        this.scheduleUpdate();
    },
    updateNextNum:function(){
        var url = this._requestBackUrl + "/qhqp/admin/api/getRoulette/uid/" + this.game.modmgr.mod_login.logindata.uid;
        var _this = this;
        RequestURL(url, function (obj) {

            _this._leftNum = parseInt(obj);
            _this._leftNumText.setString("剩"+_this._leftNum + "次");
        })


    },
    getExchangeArr:function(){
        var url = this._requestBackUrl + "/qhqp/admin/api/getExchangeList";
        var _this = this;
        RequestURL(url, function (obj) {
            var data = JSON.parse(obj);
            _this.setExchange(data);
        })
    },
    setExchange:function(data){
        this._exchangeArr = data;
        this.updateRight();
    },
    setAward:function(index)
    {
        if(index > 0)
        {
            this._targetRotation = this._singleRotate * (index + 1);
            //cc.log("randomIndex=" + randomIndex + ",targetRotation=" + this._targetRotation)
            this._targetRotation = this._targetRotation + 360 * 15;

            var self = this;
            var toMax = cc.rotateTo(6, this._targetRotation,this._targetRotation).easing(cc.easeInOut(4.0));
            self._isRun = true;
            self._circleNode.runAction(cc.sequence(toMax, cc.callFunc(function () {
                self._isRun = false;
                self._circleNode.setRotation(self._targetRotation % 360);
                self._updateLeftNum(index);
                self.updateNextNum();
            })));
        }

    },
    _updateLeftNum:function(kind){

        var url = this._requestBackUrl + "/qhqp/admin/api/updateRoulette/uid/" + this.game.modmgr.mod_login.logindata.uid;
        var _this = this;
        RequestURL(url, function (obj) {

            //_this._leftNum = parseInt(obj);
            //if(_this._leftNum >= 0)
            //{
            //    _this._leftNumText.setString("剩"+_this._leftNum + "次");
            //}

        })

        var url = _this._requestFrontUrl + "/usergift?uid=" + this.game.modmgr.mod_login.logindata.uid + "&giftid=" + kind;
        RequestURL(url, function () {

        })
    },
    updateRight: function () {
        for (var i = 0; i < this.tableArr.length; i++) {
            var datas = this.tableArr[i].datas;
            var rule = this._rightContain.getChildren()[i];
            if (i == 0) {
                var list = ccui.helper.seekWidgetByName(rule, "list");
                this.updateContent(list, datas ,i);
            }
            else if(i == 2)
            {
                var list = ccui.helper.seekWidgetByName(rule, "list");
                this.updateContent(list, this._exchangeArr ,i);
            }
        }
    },
    tabClickHandle: function () {
        for (var i = 0; i < this._rightContain.getChildrenCount(); i++) {
            var rule = this._rightContain.getChildren()[i];
            if (i == this.btnGroupCtr._selectIndex) {
                rule.setVisible(true);
            } else {
                rule.setVisible(false);
            }
        }
        if(this.btnGroupCtr._selectIndex == 2)
        {
            this.updateJifen();
        }
    },
    updateJifen:function(){
        var url = this._requestFrontUrl + "/userscore?uid=" + this.game.modmgr.mod_login.logindata.uid;
        var _this = this;
        RequestURL(url, function (obj) {
            var data = JSON.parse(obj);
            _this._jifenNum = data.score;
            _this._jifenText.setString("积分："+_this._jifenNum);
        })
    },
    updateContent: function (listView, datas,index) {
        listView.removeAllChildren();
        var len = datas.length;
        var verContain;
        for (var i = 0; i < len; i++) {
            if (i % this._horNum == 0) {
                verContain = new ccui.Layout();
                verContain.setContentSize(cc.size(this._itemW, this._itemH));
            }
            var item = this.game.uimgr.createnode(res.shopLayerItemJson, true);
            this.setItem(item, datas[i],index,this._exchangeArr[i]);
            var itemLayout = new ccui.Layout();
            itemLayout.setContentSize(cc.size(this._itemW, this._itemH));
            itemLayout.addChild(item);
            itemLayout.setTouchEnabled(true);
            if(index == 0)
            {
                itemLayout.setTag(i);
            }
            else if(index == 2)
            {
                itemLayout.setTag(i + 9);
            }

            itemLayout.addTouchEventListener(this.itemClickHandle, this);
            verContain.addChild(itemLayout);
            if (verContain.getChildrenCount() > 1) {
                itemLayout.setPositionX((verContain.getChildrenCount() - 1) * (this._itemW + this._horDis));
            }
            if (verContain.getChildrenCount() == this._horNum) {
                listView.addChild(verContain);
            } else if (i == len - 1) {
                listView.addChild(verContain);
            }
        }
        listView.refreshView();
    },
    setItem: function (item, obj,index,data) {
        if(index == 0)
        {
            ccui.helper.seekWidgetByName(item, "nameTxt").setString(obj.name);
            var textMoney = ccui.helper.seekWidgetByName(item, "Text_8");
            textMoney.setString(obj.btnTxt);

            if (obj.icon) {
                var icon = ccui.helper.seekWidgetByName(item, "icon");
                icon.setTexture(obj.icon);
            }
        }
        else if(index == 2)
        {
            ccui.helper.seekWidgetByName(item, "nameTxt").setString(data.name);
            var textMoney = ccui.helper.seekWidgetByName(item, "Text_8");
            textMoney.setString(data.score + "积分");
            var icon = ccui.helper.seekWidgetByName(item, "icon");
            cc.log(data.image);
            if(data.image != "")
            {
                var headurl = this._requestBackUrl + data.image;
                this._showAward(item,headurl,icon);
            }
            else
            {
                icon.setTexture("");
            }
            icon.setTexture("");

        }

    },
    _showAward:function(node,url,parent){

        //var clipnode = gameclass.mod_base.cliper("res/ui/qhqp/17-exchange/icon_dianyuan@2x.png");
        //
        //clipnode.setPosition(parent.getPosition());
        //
        //node.removeChildByTag(1231);
        //node.addChild(clipnode);
        //clipnode.setTag(1231);
        //clipnode.setAnchorPoint(cc.p(0, 0));
        var bo2 = new cc.Sprite();//(mod_base.userdata.photo);
        this._loadicon(url, function (tex, target) {
            var size = tex.getContentSize();
            //bo2.setScale(node.getContentSize().width / size.width);
            target.initWithTexture(tex);
            bo2.setAnchorPoint(cc.p(0.5, 0.5));
            //bo2.setScale(parent.getContentSize().width / size.width);
           // bo2.setPosition(node.getContentSize().width* 0.5,node.getContentSize().height * 0.5);
            var s = parent.getPosition();
            bo2.setPosition(s);
            node.addChild(bo2);
        }, bo2);
        //bo2.setAnchorPoint(cc.p(0.5, 0.5));

    },
    _loadicon : function (url, callback, target) {
        target.retain();
        cc.loader.loadImg(url, {isCrossOrigin: true}, function (res, tex) {
            if (typeof(tex) != "undefined" && tex != null && callback != null) {

                if (!cc.sys.isNative) {
                    var texture2d = new cc.Texture2D();
                    texture2d.initWithElement(tex);
                    texture2d.handleLoadedTexture();

                    callback(texture2d, target);
                }
                else {
                    callback(tex, target);
                }

                //cc.textureCache.removeTexture(tex);
            } else if (typeof(res) != "undefined") {
                //cc.log("res:" + res);
            }
            target.release();
            //cc.textureCache.removeTexture(tex);

        });
    },
    itemClickHandle: function (sender, type) {
        var _this = this;
        if (type != ccui.Widget.TOUCH_ENDED) return;
        var moneyIndex = sender.getTag();
        var nMoney = _this._moneyArr[moneyIndex];
        if(_this.btnGroupCtr._selectIndex == 0)
        {
            cc.sys.openURL(_this._requestBackUrl + "/qhqp/Pay/MobilePay/index/uid/" + _this.game.modmgr.mod_login.logindata.uid +"/money/" + nMoney);
        }
        else if(_this.btnGroupCtr._selectIndex == 2)
        {
            var obj  = _this._exchangeArr[moneyIndex - 9];
            //if(_this._jifenNum < obj.score )
            //{
            //    _this.game.uimgr.showui("gameclass.msgboxui").setString("您的积分不足" + obj.score);
            //    return;
            //}
            var url =  _this._requestFrontUrl + "/getproduct?uid=" + this.game.modmgr.mod_login.logindata.uid + "&giftid=" + moneyIndex;
            RequestURL(url, function (obj) {
                if(obj == "兑换成功")
                {
                    _this.game.uimgr.showui("gameclass.msgboxui").setString("兑换成功，请联系客服领取");
                    _this.updateJifen();
                    _this.getExchangeArr();
                }
               else
                {
                    _this.game.uimgr.showui("gameclass.msgboxui").setString(obj);
                }

            })

        }

    },
    drawHandle: function () {
        if(this._leftNum == 0) return;
        if(this._isRun) return;
        var url = this._requestFrontUrl + "/giftId";

        var xhr = cc.loader.getXMLHttpRequest();

        //xhr.setRequestHeader("Access-Control-Allow-Origin", "*")             //允许访问所有域
        //xhr.("Access-Control-Allow-Headers", "Content-Type") //header的类型

        xhr.open("GET", url);
        var _awardNum = 0;
        var _this = this;
        xhr.onreadystatechange = function (str) {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                var httpStatus = xhr.statusText;
                var response = xhr.responseText;
                var data = JSON.parse(response);
                _awardNum = data.id;
                _this.setAward(_awardNum);
                cc.log("555555555555555555555");
            }
        };
        xhr.send();

    },
    updateUIMsg : function(msgtype) {
        if(msgtype == "updcard") {
            var gold = ccui.helper.seekWidgetByName(this.node, "buyroomcard");
            var text = gameclass.changeShow(this.game.modmgr.mod_login.logindata.gold);
            gold.setString(text);
        }
    },
    update: function (dt) {

    }
});
