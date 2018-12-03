/**
 * Created on 2017/12/26.
 */

gameclass.rechargeHistory = gameclass.baseui.extend({
    _listView: null,
    _itemStyle: null,
    _sendUid: 0,
    ctor: function () {
        this._super();
        this._curPage = 0;
    },
    setGame: function ($game) {
        this.game = $game;
        this._sendUid = this.game.modmgr.mod_login.logindata.uid;

        //test
        // this._sendUid = 2412;
        //test end

        var _this = this;
        var data = {"uid": _this._sendUid};

        this.game.modmgr.mod_login.agentPostRequest(gameclass.phpAddressPrev + gameclass.agentPostAdd, "getSendCardLog", data, function (retdata) {
            if (retdata) {
                _this.updateList(retdata);
            } else {
                // _this.game.uimgr.showui("gameclass.msgboxui").setString("找不到该用户!");
                return;
            }
        });
    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.rechargeHisJson, true);
        this.addChild(this.node);

        this._listView = ccui.helper.seekWidgetByName(this.node, "listView");
        this._itemStyle = this._listView.getChildren()[0];


        var _this = this;
        gameclass.createbtnpress(this.node, "backBtn", function () {
            _this.game.uimgr.closeui("gameclass.rechargeHistory");
        });
        gameclass.createbtnpress(this.node, "closeBtn", function () {
            _this.game.uimgr.closeui("gameclass.rechargeHistory");
        });


        this._listView.removeAllChildren();

        //test
        // this.updateList([]);
        //test end
    },
    updateList: function (arr) {
        if (arr == null) return;

        this._listView.removeAllChildren();

        var len = arr.length;

        //test
        // len = 10;
        //test end

        for (var i = 0; i < len; i++) {
            var layout = new ccui.Layout();

            var childNode = this.game.uimgr.createnode(res.rechargeHisItemJson);
            layout.addChild(childNode);
            layout.setContentSize(childNode.getContentSize());

            // var child = this._itemStyle.clone();
            var jsonSub = arr[i];
            // var json = JSON.parse(jsonSub);
            ccui.helper.seekWidgetByName(childNode, "timeTxt").setString(jsonSub.time);
            ccui.helper.seekWidgetByName(childNode, "idTxt").setString(jsonSub.uid);
            ccui.helper.seekWidgetByName(childNode, "nameTxt").setString(jsonSub.nickname);
            ccui.helper.seekWidgetByName(childNode, "cardNumTxt").setString(jsonSub.card);
            var stateTxt = ccui.helper.seekWidgetByName(childNode, "stateTxt");
            if(jsonSub.status == 2){
                stateTxt.setString("成功");
            }else if(jsonSub.status == -1){
                stateTxt.setString("失败");
            }else if(jsonSub.status == -2){
                stateTxt.setString("未到账");
            }else{
                stateTxt.setString(jsonSub.code.toString());
            }

            this._listView.addChild(layout);
        }

    },
});