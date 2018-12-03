/**
 * Created by lish on 2017/12/5.
 */

gameclass.createroomui = gameclass.baseui.extend({
    node: null,
    _clubId: 0,
    _clubRoomIndex: 0,
    _rightContain: null,
    _rangeCtrArr: [],
    _gameType:null,
    ctor: function () {
        this._super();
        this._clubId = 0;
        this._clubRoomIndex = 0;
        this._gameType = 0;
    },
    setclubid: function (clubId, roomIndex) {
        this._clubId = clubId;
        this._clubRoomIndex = roomIndex;
    },
    show: function () {
        this.node = this.game.uimgr.createnode(res.createroomjson, true);
        this.addChild(this.node);

        this._rightContain = ccui.helper.seekWidgetByName(this.node, "rightContain");

        this._okBtn = ccui.helper.seekWidgetByName(this.node, "okBtn");
        this._okDefaultX = this._okBtn.getPositionX();

        this._rangeCtrArr = [];

        var gameType = staticFunction.getStorage(StaticData.HALL_CASH, StaticData.GAME_DEFAUL);
        this._setObj = StaticData.getRoomSetFromType(gameType);

        this.changeTab();
        this.updateRight();

        var _this = this;
        gameclass.createbtnpress(this.node, "backBtn", function () {
            _this.game.uimgr.closeui("gameclass.createroomui");
        });
        gameclass.createbtnpress(this.node, "okBtn", function () {
            _this.createHandle(0);
        });
        gameclass.createbtnpress(this.node, "daikaiBtn", function () {
            _this.createHandle(1);
        });
    },
    createHandle: function (type) {
        var obj = this._setObj;
        var agent=false;
        if(type == 1)agent=true;
        var setObj = this.saveStorage();
        var comboboxArr = setObj.comboboxArr;
        var rangeArr = setObj.rangeArr;
        var card = obj.param1Arr[0][comboboxArr[0]];
        var param1 = this.getGameParam(obj.gameType, obj.param1Arr, comboboxArr, rangeArr);
        var param2 = this.getGameParam2(obj.gameType, obj.param1Arr, comboboxArr, rangeArr);

        if (this._clubId > 0) {
            this.game.uimgr.closeui("gameclass.createroomui");
            this.game.uimgr.uis["gameclass.clubmanger"].setClubRoom(obj.gameType, param1, 0, card, this._clubRoomIndex);
        } else {
            cc.log("comboboxArr=" + comboboxArr + ",card==" + card + ",para m1=" + param1 + ",param2=" + param2);
            if( obj.gameType == gameclass.gamehlgc && param1 % 10 == 1 && agent)
            {
                this.game.uimgr.showui("gameclass.msgboxui");
                this.game.uimgr.uis["gameclass.msgboxui"].setString("AA支付不能代开房间");
                return;
            }
            this.game.modmgr.mod_login.createroom(obj.gameType, card, param1, param2, agent);
        }
    },
    getGameParam: function (gameType, param1Arr, comboboxArr, rangeArr) {
        var result = 0;
        if (gameType == gameclass.gamehlgc) {
            result =
                rangeArr[0] * 100000 +
                param1Arr[6][comboboxArr[6] + 1] * 10000 +
                param1Arr[5][comboboxArr[5]] * 1000 +
                param1Arr[4][comboboxArr[4]] * 100 +
                param1Arr[3][comboboxArr[3]] * 10 +
                param1Arr[1][comboboxArr[1]];
        } else if (gameType == gameclass.gameddz) {
            result = param1Arr[3][comboboxArr[3]] * 1000 + param1Arr[2][comboboxArr[2]] * 100 + param1Arr[1][comboboxArr[1]] * 10 + param1Arr[4][comboboxArr[4]];
        } else if (gameType == gameclass.gamelzddz) {
            result = param1Arr[3][comboboxArr[3]] * 1000 + param1Arr[2][comboboxArr[2]] * 100 + param1Arr[1][comboboxArr[1]] * 10 + param1Arr[4][comboboxArr[4]];
        } else if (gameType == gameclass.gamesaolei) {
            result = param1Arr[1][comboboxArr[1]] * 10;
        } else if (gameType == gameclass.gamewolong) {
            result = param1Arr[8][comboboxArr[8]] * 1000 + param1Arr[7][comboboxArr[7]] * 100 + param1Arr[2][comboboxArr[2]] * 10 + param1Arr[1][comboboxArr[1]];
        }
        return result;
    },
    getGameParam2: function (gameType, param1Arr, comboboxArr, rangeArr) {
        var result = 0;
        if (gameType == gameclass.gamewolong) {
            result = param1Arr[6][comboboxArr[6]] * 1000 + param1Arr[5][comboboxArr[5]] * 100 + param1Arr[4][comboboxArr[4]] * 10 + param1Arr[3][comboboxArr[3]];
        } else if (gameType == gameclass.gamesaolei) {
            result = rangeArr[0]
        }else if(gameType == gameclass.gamehlgc){
            result = param1Arr[2][comboboxArr[2]];
        }
        return result;
    },
    //本地存储玩法设置
    saveStorage: function () {
        var obj = this._setObj;
        var setObj = {comboboxArr: [], rangeArr: []};

        var comcoboxArr = [];
        var contain = ccui.helper.seekWidgetByName(this.node, "tab" + obj.gameType);
        var len = obj.param1Arr.length;
        for (var i = 0; i < len; i++) {
            var typeContain = contain.getChildByName("type" + i);
            var cbContain = typeContain.getChildByName("cbContain");
            if (cbContain != null) {
                comcoboxArr.push(this.getCbGroupIndex(cbContain));
            }
            var cbNoneContain = typeContain.getChildByName("cbNoneContain");
            if (cbNoneContain != null) {
                comcoboxArr.push(this.getCbGroupIndex(cbNoneContain));
            }
        }
        setObj.comboboxArr = comcoboxArr;
        setObj.rangeArr = this.getRangeArray(obj.gameType);

        staticFunction.setStorage(StaticData.ROOM_SET_STORAGE_KEY, StaticData.ROOM_GAMETYPE_PREV + obj.gameType, setObj);
        return setObj;
    },
    //改变标签按钮
    changeTab: function () {
        var obj = this._setObj;
        for (var i = 0; i < this._rightContain.getChildrenCount(); i++) {
            var tabChild = this._rightContain.getChildren()[i];
            var tabChildName = tabChild.getName();
            var tabType = parseInt(tabChildName.substr(3, tabChildName.length));
            if (tabType == obj.gameType) {
                tabChild.setVisible(true);
            } else {
                tabChild.setVisible(false);
            }
        }
    },
    //更新右侧视图
    updateRight: function () {
        var obj = this._setObj;
        var setObj = staticFunction.getStorage(StaticData.ROOM_SET_STORAGE_KEY, StaticData.ROOM_GAMETYPE_PREV + obj.gameType);
        // cc.log("setObj="+setObj);
        if (setObj == null) {
            setObj = {};
            // var comboboxArr = staticFunction.initZeroArray(obj.param1Arr.length);
            var comboboxArr = obj.default1Arr;
            setObj.comboboxArr = comboboxArr;
            setObj.rangeArr = [];

            // cc.log("setObj.comboboxArr="+setObj.comboboxArr);

            staticFunction.setStorage(StaticData.ROOM_SET_STORAGE_KEY, StaticData.ROOM_GAMETYPE_PREV + obj.gameType, setObj);
        }
        this._gameType = obj.gameType;
        this.updateCbView(obj.gameType, setObj.comboboxArr);
        this.updateInfoView(obj.gameType);
        this.updateRangeView(obj.gameType);
    },
    //根据游戏类型、设置，更新显示
    updateCbView: function (gameType, setArr) {
        var contain = ccui.helper.seekWidgetByName(this.node, "tab" + gameType);
        var isControl = false;
        for (var i = 0; i < setArr.length; i++) {
            var selectIndex = setArr[i];
            var typeContain = contain.getChildByName("type" + i);
            var cbContain = typeContain.getChildByName("cbContain");
            this.updateCbContain(cbContain, selectIndex);
            var cbNoneContain = typeContain.getChildByName("cbNoneContain");
            this.updateCbNoneContain(cbNoneContain, selectIndex);

            if(i == 5)
            {
                var checkContain = cbNoneContain.getChildByName("cb0");
                if(checkContain.isSelected())
                {
                    isControl = true;
                }
                else
                {
                    isControl = false;
                }
                var checkGang = contain.getChildByName("type6");
                var gangChild = checkGang.getChildByName("cbNoneContain");
                var childContain = gangChild.getChildByName("cb1");
                if(isControl)
                {
                    childContain.setSelected(true);
                }
            }
        }


        if(gameType == gameclass.gamehlgc){
            var tabContain = ccui.helper.seekWidgetByName(this.node, "tab" + gameclass.gamehlgc);
            var feeTypeContain = ccui.helper.seekWidgetByName(tabContain, "type1");
            var cb0 = ccui.helper.seekWidgetByName(feeTypeContain, "cb0");
            if(cb0.isSelected()){
                this.gameHlgcCbSpecial(0);
            }else{
                this.gameHlgcCbSpecial(1);
            }
        }
    },
    updateInfoView: function (gameType) {
        var contain = ccui.helper.seekWidgetByName(this.node, "tab" + gameType);
        var infoContain = contain.getChildByName("infoContain");
        if (infoContain == null) return;

        for (var i = 0; i < infoContain.getChildrenCount(); i++) {
            var infoChild = infoContain.getChildren()[i];
            var info = infoChild.getChildByName("info");
            info.setVisible(false);
            var btn = infoChild.getChildByName("btn");
            btn.info = info;
            btn.addTouchEventListener(function (sender, type) {
                switch (type) {
                    case ccui.Widget.TOUCH_BEGAN:
                        sender.info.setVisible(true);
                        break;
                    default:
                        sender.info.setVisible(false);
                        break;
                }
            });
        }
    },
    updateRangeView: function (gameType) {
        this._rangeCtrArr = [];
        var contain = ccui.helper.seekWidgetByName(this.node, "tab" + gameType);
        var rangeContain = contain.getChildByName("rangeContain");
        if (rangeContain == null) return;

        var rangeCtrTypeArr = [];
        for (var i = 0; i < rangeContain.getChildrenCount(); i++) {
            var rangeChild = rangeContain.getChildren()[i];
            var rangeControl = new gameclass.rangeControl(rangeChild, 1, 4, [1, 2, 3, 4]);
            rangeCtrTypeArr.push(rangeControl);
        }
        this._rangeCtrArr.push({gameType: gameType, rangeArr: rangeCtrTypeArr});
    },
    //根据游戏类型获取范围数值列表
    getRangeArray: function (gameType) {
        var result = [];
        for (var i = 0; i < this._rangeCtrArr.length; i++) {
            var obj = this._rangeCtrArr[i];
            var rangeControlArr = obj.rangeArr;
            if (obj.gameType == gameType) {
                for (var j = 0; j < rangeControlArr.length; j++) {
                    result.push(rangeControlArr[j]._curValue);
                }
            }
        }
        return result;
    },
    //更新一组复选框
    updateCbContain: function (cbContain, selectIndex) {
        if (cbContain == null) return;
        var len = cbContain.getChildrenCount();
        for (var i = 0; i < len; i++) {
            var cb = cbContain.getChildren()[i];
            cb.allowNone = true;
            var childCbContain = cb.getChildByName("cbContain");
            if (childCbContain != null) {
                //cb.addEventListener(this.checkBoxParentClick, this);
                var childSelectIndex = selectIndex - 1;
                if (childSelectIndex < 0) {
                    childSelectIndex = 0;
                }
                this.updateCbContain(childCbContain, childSelectIndex);
                if (selectIndex == 0) {
                    cb.setSelected(false);
                } else {
                    cb.setSelected(true);
                }
                childCbContain.setVisible(cb.isSelected());
            } else {

                if (len > 1) {

                    if (i == selectIndex) {
                        cb.setSelected(true);
                    } else {
                        cb.setSelected(false);
                    }
                   cb.addEventListener(this.checkBoxClick, this);
                } else {
                    if (selectIndex == 0) {
                        cb.setSelected(false);
                    } else {
                        cb.setSelected(true);
                    }
                    if(cb.getTag() == 129)
                    {
                        return;
                    }else
                    {
                        cb.addEventListener(this.checkBoxClick, this);
                    }
                }

            }

        }

    },
    updateCbNoneContain: function (cbContain, selectIndex) {
        if (cbContain == null) return;
        var len = cbContain.getChildrenCount();
        for (var i = 0; i < len; i++) {
            var cb = cbContain.getChildren()[i];
            cb.allowNone = true;
            cb.addEventListener(this.checkBoxClick, this);
            if(len >1)
            {
                if (i == selectIndex) {
                    cb.setSelected(true);
                } else {
                    cb.setSelected(false);
                }
            }
            else
            {
                if (selectIndex == 0) {
                    cb.setSelected(false);
                } else {
                    cb.setSelected(true);
                }
            }

            cb.isSelect = cb.isSelected();
        }
    },
    //获取一组复选框当前选中索引
    getCbGroupIndex: function (cbContain) {
        var len = cbContain.getChildrenCount();
        for (var i = 0; i < len; i++) {
            var cb = cbContain.getChildren()[i];
            var cbSelect = cb.isSelected();
            var childCbContain = cb.getChildByName("cbContain");
            if (childCbContain != null) {
                if (cbSelect) {
                    return this.getCbGroupIndex(childCbContain) + 1;
                } else {
                    return 0;
                }
            } else {
                if (len <= 1) {
                    if (cb.isSelected()) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (cbSelect) {
                        return i;
                    } else {
                        continue;
                    }
                }
            }
        }
        return -1;
    },
    checkBoxParentClick: function (sender, type) {
        var childCbContain = sender.getChildByName("cbContain");

        if (type == ccui.CheckBox.EVENT_SELECTED) {
            childCbContain.setVisible(true);
        } else {
            childCbContain.setVisible(false);
        }
    },

    //checkGangClick:function(sender,type){
    //    var cbContain = sender.getParent();
    //    if (cbContain == null) return;
    //
    //    if(cbContain.getTag() == 103)
    //    {
    //        var totalNode = cbContain.getParent().getParent();
    //        var checkGang = totalNode.getChildByName("type6");
    //        var gangChild = checkGang.getChildByName("cbNoneContain");
    //        var childContain = gangChild.getChildByName("cb1");
    //        childContain.setSelected(true);
    //
    //    }
    //
    //
    //},
    //一组复选框的选中或者未选中事件处理
    checkBoxClick: function (sender, type) {
        var cbContain = sender.getParent();

        if(this._gameType == gameclass.gamehlgc)
        {
            var NodeContain = cbContain.getParent();
            var totalNode = NodeContain.getParent();
            var checkGang2 = totalNode.getChildByName("type5");
            var checkGang1 = totalNode.getChildByName("type6");
            var gangChild = checkGang1.getChildByName("cbNoneContain");
            var childContain0 = gangChild.getChildByName("cb0");
            var childContain1 = gangChild.getChildByName("cb1");

            if(cbContain.getTag() == 145 || cbContain.getTag() == 150)
            {
                return;
            }
        }


        if (cbContain == null) return;
        var leng = cbContain.getChildrenCount();
        for (var i = 0; i < leng; i++) {
            var cb = cbContain.getChildren()[i];
            if(leng >1)
            {
                if (cb == sender) {
                    if (cb.allowNone && cb.isSelect) {
                        cb.setSelected(false);
                    } else {
                        cb.setSelected(true);
                    }
                } else {
                    cb.setSelected(false);
                }
                cb.isSelect = cb.isSelected();
            }
           else
            {
                if (cb == sender) {
                    var ss = cb.isSelect;
                    if (cb.allowNone && cb.isSelect) {
                        cb.setSelected(false);
                        cb.allowNone = false;
                    } else {
                        cb.setSelected(true);
                        cb.allowNone = true;
                    }
                }
                cb.isSelect = cb.isSelected();
            }
        }

        if(this._gameType == gameclass.gamehlgc)
        {
            var type5Contain = checkGang2.getChildByName("cbNoneContain");
            if(type5Contain.getChildren()[0].isSelected())
            {
                childContain0.setSelected(false);
                childContain0.setTouchEnabled(false);
                childContain1.setSelected(true);
                //childContain1.allowNone = false;
                childContain1.setTouchEnabled(false);
            }
            if(cbContain.getTag() == 155)
            {
                var childContain3 = cbContain.getChildren()[0];
                if(childContain3.isSelected())
                {
                    childContain0.setSelected(false);
                    childContain0.setTouchEnabled(false);
                    childContain1.setSelected(true);
                    //childContain1.allowNone = false;
                    childContain1.setTouchEnabled(false);
                }
                else
                {
                    childContain0.setTouchEnabled(true);
                    childContain1.setTouchEnabled(true);
                }



            }
        }

        var type = cbContain.getParent();
        if (type == null) return;

        if (this._setObj == null) return;
        //4人平摊、房主支付点击时，需要修正消耗房钻的数量
        if (this._setObj.gameType == gameclass.gamehlgc && type.getName() == "type1") {
            if (sender.getName() == "cb0") {
                this.gameHlgcCbSpecial(0);
            } else if (sender.getName() == "cb1") {
                this.gameHlgcCbSpecial(1);
            }
        }
    },
    gameHlgcCbSpecial: function (feeType) {
        var tabContain = ccui.helper.seekWidgetByName(this.node, "tab" + gameclass.gamehlgc);
        var modifyTypeContain = ccui.helper.seekWidgetByName(tabContain, "type0");
        var modifyCb0 = ccui.helper.seekWidgetByName(modifyTypeContain, "cb0");
        var modifyCb1 = ccui.helper.seekWidgetByName(modifyTypeContain, "cb1");
        var detail0 = ccui.helper.seekWidgetByName(modifyCb0, "detail");
        var detail1 = ccui.helper.seekWidgetByName(modifyCb1, "detail");
        if (feeType == 0) {
            detail0.setString("8局（1个房钻）");
            detail1.setString("16局（2个房钻）");
        } else {
            detail0.setString("8局（4个房钻）");
            detail1.setString("16局（8个房钻）")
        }
    },
    destroy: function () {

    }
});