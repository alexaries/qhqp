/**
 * Created by yang on 2016/11/21.
 */

gameclass.GameRuleView = gameclass.baseui.extend({
    node: null,
    closeBtn: null,
    listView: null,
    btnGroupCtr: null,
    //标准TAB按钮
    btnStyle: null,
    ctor: function () {
        this._super();
    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.gameRuleJson, true);
        this.addChild(this.node);

        this.closeBtn = ccui.helper.seekWidgetByName(this.node, "backBtn");
        this.listView = ccui.helper.seekWidgetByName(this.node, "listView");
        this.ruleContain = ccui.helper.seekWidgetByName(this.node, "ruleInfoContain");
        this.btnStyle = this.listView.getChildByName("btnStyle");

        var _this = this;
        gameclass.createbtnpress(this.node, "backBtn", function () {
            _this.game.uimgr.closeui("gameclass.GameRuleView");
        });

        this.btnGroupCtr = new gameclass.buttonGroupControl(this.updateRight.bind(this));

        this.listView.removeAllChildren();
        var btnControlArr = [];

        var len = StaticData.roomSetArr.length;

        //test
        // len = 3;
        //test end

        for (var i = 0; i < len; i++) {
            var btn = this.btnStyle.clone();
            var txtArr = staticFunction.addTabBtn(btn, StaticData.roomSetArr[i].normalImg, StaticData.roomSetArr[i].selectImg);
            var selectTxt = txtArr[1];
            selectTxt.setPositionX(selectTxt.getPositionX() - 4);
            selectTxt.setPositionY(selectTxt.getPositionY() + 7);
            this.listView.addChild(btn);
            btnControlArr.push(new gameclass.baseButtonControl(btn, ["normal"], ["select"]));
        }

        this.btnGroupCtr.initData(btnControlArr);
        this.btnGroupCtr.setSelectIndex(0);

        this.updateRight();
    },
    updateRight: function () {
        // cc.log("--" + this.btnGroupCtr._selectIndex)
        for (var i = 0; i < this.ruleContain.getChildrenCount(); i++) {
            var rule = this.ruleContain.getChildren()[i];
            if (i == this.btnGroupCtr._selectIndex) {
                rule.setVisible(true);
            } else {
                rule.setVisible(false);
            }
        }
    },
    showTypeSet: function (gameType) {
        var typeRight = null;
        for (var i = 0; i < this._rightContain.getChildrenCount(); i++) {
            var tabChild = this._rightContain.getChildren()[i];
            var tabChildName = tabChild.getName();
            var tabType = parseInt(tabChildName.substr(3, tabChildName.length));
            if (tabType == gameType) {
                tabChild.setVisible(true);
                typeRight = tabChild;
            } else {
                tabChild.setVisible(false);
            }
        }
        return typeRight;
    },
    destroy: function () {
        this.btnGroupCtr.destroy();
    },
});