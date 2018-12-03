/**
 * Created by Administrator on 2018/4/21.
 */
/**
 * Created by yang on 2016/11/11.
 */

gameclass.couponLayer = gameclass.baseui.extend({
    sprite: null,
    node:null,

    isInvite:false,//是否使用过邀请码
    inviteInfo:null,
    _backUrl:null,
    ctor: function () {
        this._super();
        this.isInvite = 0;
        this._backUrl = "http://47.105.36.150/qhqp/Pay/bind/";
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.couponLayer,true,1);
        this.addChild(this.node);
        var _this = this;

        gameclass.createbtnpress(this.node, "backBtn", function () {

            _this.game.uimgr.closeui("gameclass.couponLayer");
        });

        var url  = _this._backUrl + "checkBind/uid/" + _this.game.modmgr.mod_login.logindata.uid;
        RequestURL(url, function (obj) {
            //var num = parseInt(obj);
            _this.isInvite = parseInt(obj.substring(0,3));
            var uid=parseInt(obj.substring(2));
            if(_this.isInvite == 200){

                inputBox.setString("已绑定："+uid);
                inputBox.setTouchEnabled(false);
                sureBtn.setEnabled(false);
                sureBtn.setBright(false);
                //_this.game.uimgr.showui("gameclass.msgboxui");
                //_this.game.uimgr.uis["gameclass.msgboxui"].setString("您的账号已在其他地方登陆");
            }
        });
        var sureBtn = ccui.helper.seekWidgetByName(this.node,"Button_ok");
        this.isInvite = this.game.modmgr.mod_login.inviteData.isinvite;
        this.inviteInfo = this.game.modmgr.mod_login.inviteData.invite;

        var inputBox = ccui.helper.seekWidgetByName(this.node,"TextField_1");


        gameclass.createbtnpress(this.node, "Button_ok", function () {
            var _this = this;
            if(this.isInvite == 200)
            {
                _this.game.uimgr.showui("gameclass.msgboxui");
                _this.game.uimgr.uis["gameclass.msgboxui"].setString("您的账号已绑定");
                return;
            }
            var code = inputBox.getString();
            if(code == "")
            {
                _this.game.uimgr.showui("gameclass.msgboxui");
                _this.game.uimgr.uis["gameclass.msgboxui"].setString("请填写优惠码");
                return;
            }
            var url = "http://47.105.36.150/qhqp/Pay/bind/invite/uid/" + _this.game.modmgr.mod_login.logindata.uid + "/code/" + code;
            RequestURL(url, function (obj) {
                var num = parseInt(obj);
                _this.game.uimgr.showui("gameclass.msgboxui");
                if(num == 200)
                {
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString("绑定成功");
                }
                else  if(num == 403)
                {
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString("代理或者绑定用户不存在");
                }
                else  if(num == 404)
                {
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString("已经绑定过，不能再绑定");
                }
                else  if(num == 401)
                {
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString("绑定失败");
                }

            });

            //_this.game.modmgr.mod_center.sendInviteCode(code);
        });

    },


});
