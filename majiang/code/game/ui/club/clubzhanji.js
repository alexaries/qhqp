/**
 * Created by Administrator on 2017/7/18.
 */
gameclass.clubzhanji = gameclass.baseui.extend({
    node:null,
    game:null,
    ctor: function ($node, game) {
        this.node = $node;
        this.game = game;
        this._super();
    },

    show: function () {

    },
    addzhanjiTableview:function(clubzjinfos){
        //test
        // var len = parseInt(Math.random() * 15);
        // for (var i = 0; i < len; i++) {
        //     var obj = {};
        //     obj.roomid = parseInt(Math.random()  * 100000);
        //     obj.gametype = 90;
        //     obj.time1 = "2017-12-08";
        //     obj.time2 = "09:33";
        //     obj.num = 2;
        //     obj.wanfa = "sdgsdgsdhg第三个第三个第三个";
        //
        //     var perlist = [];
        //     for (var k = 0; k < 4; k++) {
        //         var per = {
        //             "name": "name" + k,
        //             "head": "",
        //             "score": parseInt(Math.random() * 100),
        //             "uid": parseInt(Math.random() * 15000)
        //         }
        //         perlist.push(per);
        //     }
        //     obj.perlist = perlist;
        //     clubzjinfos.push(obj);
        // }

        var tabview = new clubTableview(this.game,clubzjinfos,6);
        this.node.addChild(tabview);
    },
});
