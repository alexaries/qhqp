gameclass.title = "秦皇棋牌";   //! 标题
gameclass.download = "http://47.105.36.150/download/";  //! 下载链接
gameclass.endpoint = "oss-cn-shanghai.aliyuncs.com";  //! 语音
gameclass.keyid = "LTAIXdTH2TL5dREA";    //! 语音
gameclass.secretid = "F1CwnUS45SgwxxKkPXEu71jnMpgQGy";    //! 语音
gameclass.bucket = "dfvoice";
gameclass.test = "false";
gameclass.isCheat = true;
gameclass.isAgent = false;
gameclass.phpAddressPrev = "http://qp2.77309477.gaofangh.com";
gameclass.agentPostAdd = "/gxddz/Admin/Api/";
gameclass.advertiseAdd = "/gxddz/Admin/Api/getImgUrl";
gameclass.isShowAdvertised = false;

var HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    ctor: function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                var label = event.getCurrentTarget();
                if (cc.KEY.back == keyCode) {
                    // var _msgbox = uimgr.showui("Msgbox");
                    // _msgbox.showmsgbox2(2,jbstring.Getetstring("str137"),function(){
                    if (!cc.sys.isNative) {
                    }
                    else {
                        if (cc.sys.os == sys.OS_IOS) {

                        } else if (cc.sys.os == sys.OS_ANDROID) {
                            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JsCall", "exit", "(Ljava/lang/String;)V", "");
                        }
                        else {

                        }
                    }

                    // });
                    //cc.log("onKeyPressedonKeyPressedonKeyPressedonKeyPressed");
                }

            },
            onKeyReleased: function (keyCode, event) {
                //var label = event.getCurrentTarget();
                //cc.log("onKeyReleasedonKeyReleasedonKeyReleasedonKeyReleasedonKeyReleased");
            }
        }, this);

        return true;
    }
});

var game = null;

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
        var _this = this;
        game = new gameclass.game;

        getcsvmgr.init();

        game.uimgr.showui("gameclass.loginui");

        //gameclass.mod_platform.setbaseinfo(JSON.stringify({"title":gameclass.title, "download":gameclass.download, "endpoint":gameclass.endpoint, "keyid":gameclass.keyid, "secretid":gameclass.secretid, "bucket":gameclass.bucket, "test":gameclass.test}));
        var seq = cc.sequence(cc.delayTime(1),cc.callFunc(function () {
            gameclass.mod_platform.pertocpp();
        }));

        _this.runAction(cc.repeatForever(seq))
       // if (cc.sys.isNative) {
            //if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
                //进入后台充错
                cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function(event){
                    cc.log("game.EVENT_HIDE");
                    if (g_isgame) {
                        var mysocket = game.modmgr.mod_login.mod_game.mywebsocket;
                        var data = {"line": false};
                        mysocket.send("gameline", data);
                    }
                    mod_sound.stopallsound();
                });
                //恢复显示
                cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function(event){
                    cc.log("game.EVENT_SHOW");
                    if (g_isgame) {
                        var mysocket = game.modmgr.mod_login.mod_game.mywebsocket;
                        var data = {"line": true};
                        mysocket.send("gameline", data);
                    }
                    mod_sound.playbmg(mod_sound.bmgName,mod_sound.bmgLoop);
                });
            }
       // }
    //}
});

window.onerror = function (msg, url, l, columnNumber, errorObj) {
//Handle the error here
//     cc.log("**********************************onError*******************************");
//     cc.log("msg:" + msg);
//     cc.log("file:" + url);
//     cc.log("line:" + l);
    // try {
    //     cc.log("debuginfo:" + errorObj.stack);
    // } catch (error) {
    //     cc.log(error);
    // }
    // cc.log("debuginfo:" + errorObj.stack);

    //alert("ok");
    // alert(errorObj.stack);
    // cc.log("**********************************onError*******************************");
    // return true;
}


Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

