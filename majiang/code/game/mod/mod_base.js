/**
 * Created by my on 2016/4/12.
 */

gameclass.servertype = 2;//1正式服 2测试服
gameclass.clientver = 1002;
gameclass.version = "1008";

gameclass.gameniuniu = 1;
gameclass.gameddz = 6;
gameclass.gameszp = 7;
gameclass.gamelzddz = 8;
gameclass.gamesdb = 10;
gameclass.gamechg = 11;
gameclass.gamettz = 17;
gameclass.gameptj = 19;
gameclass.gamehlgc = 185;
gameclass.gamejxnn = 16;//江西牛牛
gameclass.gamegoldkwx = 10000; //卡五星大于等于10000，小于20000
// gameclass.gamehlgc = 181;
gameclass.gamelyc = 64;
gameclass.gamesaolei = 36;
gameclass.gamewolong=130;

gameclass.mapinfo = null;

gameclass.battery = 100;
gameclass.area = 0; //! 地区

var setservertype = function (type) {
    gameclass.servertype = type;
    if (gameclass.servertype == 1) {
        // gameclass.baseurl = "game.xzdd.hbyouyou.com:8031";
        // gameclass.baseurl = "175.25.51.36:8031";
        gameclass.baseurl = "47.105.36.150:8031";
        gameclass.imgurl = "image.hbyouyou.com/youyou.image/Index/proxyIcon";
    } else if (gameclass.servertype == 2) {
        // gameclass.baseurl = "192.168.13.249:8031";
        gameclass.baseurl = "120.26.163.168:8031";
        gameclass.imgurl = "image.hbyouyou.com/youyou.image/Index/proxyIcon";
    }
     //gameclass.baseurl = "192.168.13.121:8031";
    //gameclass.baseurl = "120.26.163.168:8031";
    gameclass.baseurl = "47.105.36.150:8031";
};

setservertype(gameclass.servertype);

gameclass.mod_base = cc.Class.extend({
    data: null,
    game: null,
    ctor: function () {
        this._super();
    },
    setgame: function (_game) {
        this.game = _game;
    },
});

gameclass.mod_base.prototype.getver = function (head, data, func, clientdata) {
    var response = {"msghead": head, "msgdata": JSON.stringify(data)};
    var jsonData = JSON.stringify(response);
    // cc.log(jsonData);
    cc.log("httpPos----->url:" + gameclass.baseurl + "||head:" + head + "||data=" + jsonData);
    var _this = this;
    PostURL("http://" + gameclass.baseurl + "/versionmsg", "", function (str) {
        // cc.log(str);
        if (func != null) {
            var serverver = Number(str);

            if (serverver < gameclass.clientver) {

            }
            func(serverver < gameclass.clientver, clientdata);

        }
        // {"msghead":"login","msgsign":"","msgdata":"{\"openid\":\"0f7c62d9876a875f0a60503319b3b8e0\",\"name\":\"游客\",\"imgurl\":\"\",\"card\":8,\"ip\":\"\",\"room\":0}"}
        //{"msghead":"login","msgsign":"","msgdata":"{\"openid\":\"0f7c62d9876a875f0a60503319b3b8e0\",\"name\":\"游客\",\"imgurl\":\"\",\"card\":7,\"ip\":\"http://120.24.215.214:8091/servermsg\",\"room\":150005}"}
    });
};
//HTTP数据请求（包含房卡相关请求）
gameclass.mod_base.prototype.agentPostRequest = function (url, head, data, func, clientdata) {
    url = url + head;
    var dataStr = "";
    for(var key in data){
        dataStr = dataStr + key + "=" + data[key] + "&";
    }
    if(dataStr != ""){
        dataStr = dataStr.substr(0, dataStr.length - 1);
    }


    var _this = this;
    PostURLPHP(url, dataStr, function (str) {
        // cc.log("str="+str);
        if (func != null) {
            var recvObj = {};
            if(str != ""){
                recvObj = JSON.parse(str);
            }

            func(recvObj);
        }
    });
};
gameclass.mod_base.prototype.sendhttp = function (head, data, func, clientdata) {
    var response = {"msghead": head, "msgdata": JSON.stringify(data)};
    var jsonData = JSON.stringify(response);
    // cc.log(jsonData);
    cc.log("httpPos----->url:" + gameclass.baseurl + "||head:" + head + "||data=" + jsonData);

    var url = "http://" + gameclass.baseurl + "/loginmsg?" + encodeURI("msgdata=" + jsonData);

    // cc.log("url="+url);

    var _this = this;
    PostURL(url, "", function (str) {
        // cc.log("str="+str);
        if (func != null) {
            var recvdata = JSON.parse(str);
            var msgsign = JSON.parse(recvdata.msgsign);
            if (msgsign.encode && msgsign.encode == 1) {
                var data = new Uint8Array(BASE64.decoder(recvdata.msgdata));
                recvdata.msgdata = Bytes2Str(pako.inflate(data));
            }
            if (recvdata.msghead == "err") {
                _this.game.uimgr.showui("gameclass.msgboxui");
                var data = JSON.parse(recvdata.msgdata);
                if (data.info.toString() == "当前版本号过低，请下载最新版本进行游戏") {
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString(data.info, function () {
                        gameclass.mod_platform.openurl(gameclass.download);
                    });
                } else {
                    _this.game.uimgr.uis["gameclass.msgboxui"].setString(data.info);
                }
            } else {
                cc.log("httpGet--->" + recvdata.msgdata.toString())
                func(JSON.parse(recvdata.msgdata), "", recvdata);
            }
        }
        // {"msghead":"login","msgsign":"","msgdata":"{\"openid\":\"0f7c62d9876a875f0a60503319b3b8e0\",\"name\":\"游客\",\"imgurl\":\"\",\"card\":8,\"ip\":\"\",\"room\":0}"}
        //{"msghead":"login","msgsign":"","msgdata":"{\"openid\":\"0f7c62d9876a875f0a60503319b3b8e0\",\"name\":\"游客\",\"imgurl\":\"\",\"card\":7,\"ip\":\"http://120.24.215.214:8091/servermsg\",\"room\":150005}"}
    });
};

gameclass.mod_base.getTextrue = function (url, callback, target) {
    target.retain();
    //cc.log("mod_base.loadicon");
    cc.loader.loadImg(url, {isCrossOrigin: true}, function (res, tex) {
        //cc.log("download ok");

        //cc.log("res:" + typeof(res));
        //cc.log("tex:" + typeof(tex));
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
};
gameclass.mod_base.loadicon = function (url, callback, target) {
    if (!cc.sys.isNative) {
        //http://120.24.215.214:9999/getimage?image=aHR0cDovL3d4LnFsb2dvLmNuL21tb3Blbi9GWmNUUHA2UDRnbEN3OHRHWnJpYWljSGljUFBheU5RM2daRTYzVWxjWWlhdVdHcnViaWNhSVpkWkRyN1RHNEtIaWJFaWNLbFZQOThiSzgxWkpldWlhRVFreGF6dlZrNXo5U290cmlja2ljLzA=
        //url = "http://" + gameclass.imgurl  + "/getimage?size=96&img=" + gameclass.base64.encoder(url);
        if (gameclass.servertype == 1) {
            url = "http://" + gameclass.imgurl + "/getimage?size=96x96&img=" + encodeURI(url);
        } else if (gameclass.servertype == 2) {
            url = "res/ui/common/zhanji/userinfo_head.png";//"http://" + gameclass.imgurl  + "/getimage?img=" + gameclass.base64.encoder(url);
        }
    }
    else {

    }
    target.retain();
    //cc.log("mod_base.loadicon");
    cc.loader.loadImg(url, {isCrossOrigin: true}, function (res, tex) {
        //cc.log("download ok");

        //cc.log("res:" + typeof(res));
        //cc.log("tex:" + typeof(tex));
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
};
//深拷贝
gameclass.mod_base.deepCopy = function(_obj){
    var copyObj=null;
    if(_obj instanceof Array){
        copyObj=[];
        for(var i=0;i<_obj.length;i++){
            if(_obj[i] instanceof Array||_obj[i] instanceof Object){
                var _newObj=this.deepCopy(_obj[i]);
                copyObj[i]=_newObj;
            }else{
                copyObj[i]=_obj[i];
            }
        }
    }else if(_obj instanceof Object){
        copyObj={};
        for(var i in _obj){
            if(_obj[i] instanceof Array||_obj[i] instanceof Object){
                var _newObj=this.deepCopy(_obj[i]);
                copyObj[i]=_newObj;
            }else{
                copyObj[i]=_obj[i];
            }
        }
    }else{
        copyObj=_obj;
    }
    return copyObj;
};

gameclass.mod_base.cliper = function (name) {
    //创建一个遮罩的模板
    var sten = new cc.Sprite();
    sten.initWithFile(name);
    //创建一个ClippingNode 并设置一些基础属性 容器宽高与模板有关
    var clipnode = new cc.ClippingNode();
    clipnode.attr({
        stencil: sten,
        anchorX: 0.5,
        anchorY: 0.5,
        alphaThreshold: 0.8,//设置裁剪透明值阀值 默认值为1 等于1時 alpha = 0的部分也被裁剪
    });
    clipnode.setCascadeOpacityEnabled(true);
    clipnode.setPosition(cc.p(sten.getContentSize().width, sten.getContentSize().height));
    return clipnode;
};

//精灵变灰函数
gameclass.mod_base.createGraySprite = function (sprite, texture) {
//判断运行的平台是不是浏览器
    var isHtml5 = (typeof document !== 'undefined');

    if (isHtml5) {
        //cc.log("isHtml5");
        var canvas = document.createElement('canvas');
        var image = texture.getHtmlElementObj();

//将图片的高宽赋值给画布
        canvas.width = image.width;
        canvas.height = image.height;

//获得二维渲染上下文
        if (canvas.getContext) {//为了安全起见，先判断浏览器是否支持canvas
            var context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);//将得到的image图像绘制在canvas对象中
            var canvasData = context.getImageData(0, 0, canvas.width, canvas.height);//返回ImageData对象


// 填充灰色【读取像素值和实现灰度计算】
            for (var x = 0; x < canvasData.width; x++) {
                for (var y = 0; y < canvasData.height; y++) {
// Index of the pixel in the array
                    var idx = (x + y * canvasData.width) * 4;
                    var r = canvasData.data[idx + 0];
                    var g = canvasData.data[idx + 1];
                    var b = canvasData.data[idx + 2];
// 灰度的计算
                    var gray = .299 * r + .587 * g + .114 * b;
// assign gray scale value
                    canvasData.data[idx + 0] = gray; // Red channel
                    canvasData.data[idx + 1] = gray; // Green channel
                    canvasData.data[idx + 2] = gray; // Blue channel
//canvasData.data[idx + 3] = 255; // Alpha channel
// 新增黑色边框
                    if (x < 8 || y < 8 || x > (canvasData.width - 8) || y > (canvasData.height - 8)) {
                        canvasData.data[idx + 0] = 0;
                        canvasData.data[idx + 1] = 0;
                        canvasData.data[idx + 2] = 0;
                    }
                }
            }
            context.putImageData(canvasData, 0, 0); // 处理完成的数据重新载入到canvas二维对象中


            var tempTexture = new cc.Texture2D();
            tempTexture.initWithElement(canvas);
            tempTexture.handleLoadedTexture();

            sprite.initWithTexture(tempTexture);
            return;
        }
    }

//使用shader方式实现图片变灰（适用于app和浏览器不支持canvas的情况）
    if (!cc.GLProgram.createWithByteArrays) {
        cc.GLProgram.createWithByteArrays = function (vert, frag) {
            var shader = new cc.GLProgram();
            shader.initWithVertexShaderByteArray(vert, frag);
            shader.link();
            shader.updateUniforms();
            setTimeout(function () {
                shader.link();
                shader.updateUniforms();
            }, 0);
            return shader;
        }
    }


    var SHADER_POSITION_GRAY_FRAG =
        "varying vec4 v_fragmentColor;\n" +
        "varying vec2 v_texCoord;\n" +
        (isHtml5 ? "uniform sampler2D CC_Texture0;\n" : "") +
        "void main()\n" +
        "{\n" +
        "    vec4 v_orColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);\n" +
        "    float gray = dot(v_orColor.rgb, vec3(0.299, 0.587, 0.114));\n" +
        "    gl_FragColor = vec4(gray, gray, gray, v_orColor.a);\n" +
        "}\n";


    var SHADER_POSITION_GRAY_VERT =
        "attribute vec4 a_position;\n" +
        "attribute vec2 a_texCoord;\n" +
        "attribute vec4 a_color;\n" +
        "\n" +
        "varying vec4 v_fragmentColor;\n" +
        "varying vec2 v_texCoord;\n" +
        "\n" +
        "void main()\n" +
        "{\n" +
        "gl_Position = " + (isHtml5 ? "(CC_PMatrix * CC_MVMatrix)" : "CC_PMatrix") + " * a_position;\n" +
        "v_fragmentColor = a_color;\n" +
        "v_texCoord = a_texCoord;\n" +
        "}";


    sprite.initWithTexture(texture);
    var shader = cc.GLProgram.createWithByteArrays(SHADER_POSITION_GRAY_VERT, SHADER_POSITION_GRAY_FRAG);
    shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    shader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    sprite.setShaderProgram(shader);
    //cc.log("setShaderProgram");
};
gameclass.mod_base.getSpByWebUrl = function(url,clipNodeUrl,perent)
{
    var bo2 = new cc.Sprite();//(mod_base.userdata.photo);
    gameclass.mod_base.getTextrue("",function(tex,target){
        var size = tex.getContentSize();
        bo2.setScale(perent.getContentSize().width / size.width);
        target.initWithTexture(tex);
        bo2.setAnchorPoint(cc.p(0.5,0.5));
        bo2.setPosition(cc.p(0,0));
    },bo2,url);
    bo2.setAnchorPoint(cc.p(0.5,0.5));
    bo2.setPosition(cc.p(0,0));
    perent.addChild(bo2);
    return perent;
};
gameclass.mod_base.showtximg = function (perent, url, x, y, name, gray) {
    if (url == "") {
        //url = "res/HelloWorld.png";
        url = "http://wx.qlogo.cn/mmopen/FZcTPp6P4glCw8tGZriaicHicPPayNQ3gZE63UlcYiauWGrubicaIZdZDr7TG4KHibEicKlVP98bK81ZJeuiaEQkxazvVk5z9Sotrickic/0";
    }
    if (!name) {
        name = "im_headbg2";
    }
    if (!gray) {
        gray = false;
    }
    var clipnode = gameclass.mod_base.cliper("res/" + name + ".png");

    //clipnode.setPosition(cc.p(37,37));

    perent.removeChildByTag(1231);
    perent.addChild(clipnode);
    clipnode.setTag(1231);
    clipnode.setAnchorPoint(cc.p(0, 0));
    var bo2 = new cc.Sprite();//(mod_base.userdata.photo);
    gameclass.mod_base.loadicon(url, function (tex, target) {
        var size = tex.getContentSize();
        bo2.setScale(perent.getContentSize().width / size.width);
        if (gray) {
            gameclass.mod_base.createGraySprite(target, tex);
        } else {
            target.initWithTexture(tex);
        }


        bo2.setAnchorPoint(cc.p(0.5, 0.5));
        bo2.setPosition(cc.p(0, 0));

        if (x != null) {
            clipnode.setPosition(cc.p(perent.getContentSize().width / 2 + x, perent.getContentSize().height / 2 + y));
        } else {
            clipnode.setPosition(cc.p(perent.getContentSize().width / 2, perent.getContentSize().height / 2));
        }


    }, bo2);
    bo2.setAnchorPoint(cc.p(0.5, 0.5));
    bo2.setPosition(cc.p(0, 0));
    //bo2.setScale(perent.getContentSize().width / bo2.getContentSize().width);

    clipnode.addChild(bo2);

    return clipnode;
};


