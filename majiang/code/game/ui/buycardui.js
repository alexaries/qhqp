/**
 * Created by yang on 2016/11/21.
 */

gameclass.buycardui = gameclass.baseui.extend({
    sprite: null,
    node:null,
    ctor: function () {
        this._super();
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.buycardui,true);

        this.addChild(this.node);

        var _this = this;
        gameclass.createbtnpress(this.node, "root", function () {
            _this.game.uimgr.closeui("gameclass.buycardui");
        });
    }
});