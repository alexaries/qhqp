var StaticData = StaticData || {};

//房间设置本地存储键值
StaticData.ROOM_SET_STORAGE_KEY = "ROOM_SET_STORAGE_KEY";
StaticData.ROOM_SELECT_GAMETYPE = "selectGameType";
StaticData.ROOM_GAMETYPE_PREV = "gameTypeSets";
//大厅缓存
StaticData.HALL_CASH = "hallCash";
//默认游戏type
StaticData.GAME_DEFAUL = "gameDefault";

StaticData.GAME_NAME = "秦皇棋牌";

StaticData.roomSetArr = [
    {
        name: "秦皇岛麻将",
        gameType: gameclass.gamehlgc,
        nameIcon: "res/ui/qhqp/2-hall/qh_txt_mj@2x.png",
        normalImg: "res/ui/qhqp/6-rule/qh_txt_qhdmj2@2x.png",
        selectImg: "res/ui/qhqp/6-rule/qh_txt_qhdmj1@2x.png",
        TxtArr: [
            ["8局x1个房钻", "16局x2房钻"],
            ["4人平摊", "房主支付"],
            ["同IP提示"],
            ["带跑龙"],
            ["七个混"],
            ["扣牌打"],
            ["可碰可杠", "不可碰可杠", "不可碰不可杠"]
        ],
        param1Arr: [[1, 2], [1, 0], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1, 2]],
        default1Arr:[0, 0, 0, 0, 0, 0, 1],
        param2Arr: ["底分"]
    },
    {
        name: "秦皇岛斗地主",
        nameIcon: "res/ui/qhqp/2-hall/qh_txt_ddz@2x.png",
        gameType: gameclass.gameddz,
        normalImg: "res/ui/qhqp/6-rule/qh_txt_qhdddz2@2x.png",
        selectImg: "res/ui/qhqp/6-rule/qh_txt_qhdddz1@2x.png",
        TxtArr: [
            ["6局x1房卡", "12局x2房卡"],
            ["叫分", "不叫分"],
            ["双王可拆"],
            ["可选加倍"],
            ["3炸", "4炸", "5炸"]
        ],
        param1Arr: [[1, 2], [0, 1], [1, 0], [0, 1], [0, 1, 2]],
        default1Arr:[0, 0, 0, 0, 0],
        param2Arr: []
    },
    {
        name: "秦皇岛牌九",
        nameIcon: "res/ui/qhqp/2-hall/wanfaImg1.png",
        gameType: gameclass.gameptj,
        normalImg: "res/ui/qhqp/2-hall/wanfaImg1.png",
        selectImg: "res/ui/qhqp/2-hall/wanfaImg1.png",
        TxtArr: [
            ["6局x1房卡", "12局x2房卡"],
            ["叫分", "不叫分"],
            ["双王可拆"],
            ["可选加倍"],
            ["3炸", "4炸", "5炸"]
        ],
        param1Arr: [[1, 2], [0, 1], [1, 0], [0, 1], [0, 1, 2]],
        default1Arr:[0, 0, 0, 0, 0],
        param2Arr: []
    },
    {
        name: "秦皇岛牛牛",
        nameIcon: "res/ui/qhqp/2-hall/wanfaImg3.png",
        gameType: gameclass.gameniuniu,
        normalImg: "res/ui/qhqp/2-hall/wanfaImg3.png",
        selectImg: "res/ui/qhqp/2-hall/wanfaImg3.png",
        TxtArr: [
            ["6局x1房卡", "12局x2房卡"],
            ["叫分", "不叫分"],
            ["双王可拆"],
            ["可选加倍"],
            ["3炸", "4炸", "5炸"]
        ],
        param1Arr: [[1, 2], [0, 1], [1, 0], [0, 1], [0, 1, 2]],
        default1Arr:[0, 0, 0, 0, 0],
        param2Arr: []
    }
];
//根据游戏类型获取设置数据
StaticData.getRoomSetFromType = function (gameType) {
    var len = StaticData.roomSetArr.length;
    for (var i = 0; i < len; i++) {
        var obj = StaticData.roomSetArr[i];
        if (obj.gameType == gameType) {
            return obj;
        }
    }
    return null;
};
//根据游戏类型获取设置数据
StaticData.getRoomSetIndexFromType = function (gameType) {
    var len = StaticData.roomSetArr.length;
    for (var i = 0; i < len; i++) {
        var obj = StaticData.roomSetArr[i];
        if (obj.gameType == gameType) {
            return i;
        }
    }
    return -1;
};
StaticData.getSetObj = function (gameType) {
    var len = StaticData.roomSetArr.length;
    for (var i = 0; i < len; i++) {
        var obj = StaticData.roomSetArr[i];
        if (obj.gameType == gameType) {
            return obj;
        }
    }
    return {};
}
//根据游戏类型和参数，获取详细描述
StaticData.getRoomSetStrFromParam = function (gameType, param1, param2, cardNum) {
    var result = "";
    var obj = StaticData.getSetObj(gameType);
    var arr = StaticData.roomParamAnalyze(gameType, param1, param2, cardNum, obj.param1Arr);
    for (var j = 0; j < arr.length; j++) {
        var index = arr[j];
        var txtSubArr = obj.TxtArr[j];
        var param1Arr = obj.param1Arr;
        if (txtSubArr.length == param1Arr[j].length) {
            //非单选
            result = result + txtSubArr[index] + " ";
        } else {
            //单选
            if (index == 1) {
                result = result + txtSubArr[0] + " ";
            }
        }
    }
    return result;
};
StaticData.getRoomSetArrFromParam = function (gameType, param1, param2, cardNum) {
    var result = [];
    var obj = StaticData.getSetObj(gameType);
    var arr = StaticData.roomParamAnalyze(gameType, param1, param2, cardNum, obj.param1Arr);
    for (var j = 0; j < arr.length; j++) {
        var index = arr[j];
        if (index >= 0) {
            var txtSubArr = obj.TxtArr[j];
            var param1Arr = obj.param1Arr;
            if (txtSubArr.length == param1Arr[j].length) {
                //非单选
                result.push(obj.TxtArr[j][index]);
            } else {
                //单选
                if (index == 1) {
                    result.push(obj.TxtArr[j][0]);
                }else{
                    result.push("");
                }
            }

        }
    }
    return result;
}
//房间参数解析
StaticData.roomParamAnalyze = function (gameType, param1, param2, cardNum, param1Arr) {
    var result = [];

    if (gameType == gameclass.gamehlgc) {
        result.push(param1Arr[0].indexOf(cardNum));
        result.push(param1Arr[1].indexOf(param1 % 10)); //房主支付
        result.push(param1Arr[2].indexOf(param2)); //房主支付)
        result.push(param1Arr[3].indexOf(parseInt(param1 / 10 % 10)));  //带跑龙
        result.push(param1Arr[4].indexOf(parseInt(param1 / 100 % 10))); //混
        result.push(param1Arr[5].indexOf(parseInt(param1 / 1000 % 10)));    //扣牌打
        result.push(param1Arr[6].indexOf(parseInt(param1 / 10000 % 10)));    //可碰杠
    } else if (gameType == gameclass.gameddz) {
        result.push(param1Arr[0].indexOf(cardNum));
        result.push(param1Arr[1].indexOf(parseInt(param1 / 10 % 10)));  //是否叫分
        result.push(param1Arr[2].indexOf(parseInt(param1 / 100 % 10))); //双王可拆
        result.push(param1Arr[3].indexOf(parseInt(param1 / 1000 % 10)));    //可选加倍
        result.push(param1Arr[4].indexOf(param1 % 10)); //3炸、4炸、5炸
    } else if (gameType == gameclass.gamelzddz) {
        result.push(param1Arr[0].indexOf(cardNum));
        result.push(param1Arr[1].indexOf(parseInt(param1 / 10 % 10)));  //是否叫分
        result.push(param1Arr[2].indexOf(parseInt(param1 / 100 % 10))); //双王可拆
        result.push(param1Arr[3].indexOf(parseInt(param1 / 1000 % 10)));    //可选加倍
        result.push(param1Arr[4].indexOf(param1 % 10)); //炸弹上限
    }
    // cc.log("parseInt(param1 / 10))=="+parseInt(param1 / 10))

    return result;
};
//将牌列表
StaticData.JIANG_ARR = [2, 5, 8, 12, 15, 18, 22, 25, 28];
StaticData.WIND_DONG = 31;
StaticData.WIND_NAN = 32;
StaticData.WIND_XI = 33;
StaticData.WIND_BEI = 34;
StaticData.WIND_GANG = 30;
StaticData.WIND_GANG_ARR = [32, 33, 34, 31];
StaticData.ALL_CARD = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37
];