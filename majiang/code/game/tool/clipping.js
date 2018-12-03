/**
 *@filename:mod.baseui.class.js
 *@autor:wenzhao.tang
 *@time:2017-07-22 14:11:12
 **/
var clipping = {
    //spriteNode 为要添加流光的对象
    //light为流光对象
    //流光运行的时间
    getClipnode : function(spriteNode, light, time){
        time = time||1.3;
        var clipnode = this._cliper(spriteNode._normalFileName);
        spriteNode.parent.removeChild(light,false);
        var point = cc.p(spriteNode.getContentSize().width+110,0);
        light.setPosition(point);
        light.runAction(cc.repeatForever( cc.sequence(cc.moveTo(time,cc.p(0,0)),cc.moveTo(0,point))));
        clipnode.addChild( light);
        clipnode.setPosition(spriteNode.getPosition());
        return clipnode;
    },

    _cliper : function(frameName){
        //创建一个遮罩的模板
        var sten = new cc.Sprite(frameName);
        //创建一个ClippingNode 并设置一些基础属性 容器宽高与模板有关
        var clipnode = new cc.ClippingNode();
        clipnode.attr({
            stencil:sten,
            anchorX:0.5,
            anchorY:0.5,
            alphaThreshold:1,//设置裁剪透明值阀值 默认值为1 等于1時 alpha = 0的部分也被裁剪
        });
        return clipnode;
    },
};

