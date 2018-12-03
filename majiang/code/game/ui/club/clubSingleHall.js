/**
 * Created by Administrator on 2017/7/18.
 */
gameclass.clubSingleHall = gameclass.baseui.extend({
    _clubData: null,
    node: null,
    clubid: 0,
    tabview: null,
    game: null,
    ctor: function ($node, game) {
        this.node = $node;
        this.game = game;
        this._super();

    },
    setclubid: function (cid) {
        this.clubid = cid;
    },
    getclubid: function () {
        return this.clubid;
    },
    updateView: function (clubData) {
        this._clubData = clubData;
        this.setclubid(this._clubData.id);
    },
    show: function () {

    },
    addHallTableview: function (infos) {
        var cluballinfos = [];
        if (infos) {
            for (var i = 0; i < infos.length; i++) {
                var obj = {
                    "gameType": infos[i].gametype,
                    "name": StaticData.getRoomSetFromType(infos[i].gametype).name,
                    "roomid": infos[i].roomid,
                    "wanfa": "玩法:" + StaticData.getRoomSetStrFromParam(infos[i].gametype, infos[i].param1, infos[i].param2, infos[i].num) + " 一共" + infos[i].maxstep + "局",
                    "time": this.getDate(infos[i].time),
                    "state": parseInt(infos[i].state)
                }
                cluballinfos.push(obj);
            }
            this.node.removeAllChildren();
            this.tabview = new clubTableview(this.game, cluballinfos, 2);
            this.node.addChild(this.tabview);
        }
    },
    //根据游戏类型得到游戏名称
    getgameNamebytype: function (gametype) {
        var gamename = "";
        var choosegames = this.game.modmgr.mod_center.mod_club.choosegames;
        var choosegametype = this.game.modmgr.mod_center.mod_club.choosegametype;
        for (var i = 0; i < choosegametype.length; i++) {
            for (var j = 0; j < choosegametype[i].length; j++) {
                if (choosegametype[i][j] == gametype) {
                    gamename = choosegames[i];
                    return gamename;
                }
            }
        }
    },

    getDate: function (date) {
        var d = new Date(date * 1000);
        var hour = d.getHours();
        if (hour < 10) hour = "0" + hour;
        var min = d.getMinutes();
        if (min < 10) min = "0" + min;
        var sec = d.getSeconds();
        if (sec < 10) sec = "0" + sec;
        var date = (d.getFullYear()) + "-" +
            (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            hour + ":" +
            min + ":" +
            sec;
        return date;
    },
    //玩法说明文字
    allshare: function (info, bool) {
        var str = "";
        if (info.gametype == gameclass.gamenys) {
            str = this.nysshare(info, bool);
        } else if (info.gametype == gameclass.gameszp_fk) {
            str = this.pszfkshare(info, bool);
        } else if (info.gametype == gameclass.gameszp) {
            str = this.pszshare(info, bool);
        } else if (info.gametype == gameclass.gameniuniu) {
            str = this.niuniushare(info, bool);
        } else if (info.gametype == gameclass.gamejxnn) {
            str = this.jxnnshare(info, bool);
        } else if (info.gametype == gameclass.gameddz || info.gametype == gameclass.gamelzddz) {
            str = this.ddzshare(info, bool);
        } else if (info.gametype == gameclass.gameptj) {
            str = this.ptjshare(info, bool);
        } else if (info.gametype == gameclass.gamettz) {
            str = this.ttzshare(info, bool);
        } else if (info.gametype == gameclass.gamenxs) {
            str = this.saoleishare(info, bool);
        } else if (info.gametype == gameclass.gamesdb) {
            str = this.sdbshare(info, bool);
        } else if (info.gametype == gameclass.gamekwx || info.gametype == gameclass.gamekwx1 || info.gametype == gameclass.gamekwx2
            || info.gametype == gameclass.gamekwx3 || info.gametype == gameclass.gamekwx4 || info.gametype == gameclass.gamekwx5) {
            str = this.kwxshare(info, bool);
        }
        str += "一共" + info.maxstep + "局";
        //cc.log(str);
        return str;
    },
    nysshare: function (info, bool) {
        var str = "牛气冲天,";
        var strlen = 1;
        //if(info.param1 %10 == 0) str += "可搓牌,";
        if (info.param1 % 10 == 1) {
            str += "禁止搓牌,";
            strlen += 1;
        }

        if (parseInt(info.param1 / 10) % 10 == 1) {
            str += "闲家推注,";
            strlen += 1;
        }

        if (parseInt(info.param1 / 100) % 10 == 1) {
            str += "五小牛8倍,";
            strlen += 1;
        }
        if (bool && strlen == 4) str += "\n      ";

        if (parseInt(info.param1 / 1000) % 10 == 1) {
            str += "炸弹牛6倍,";
            strlen += 1;
        }
        if (bool && strlen == 4) str += "\n      ";

        if (parseInt(info.param1 / 10000) % 10 == 1) {
            str += "五花牛5倍,";
            strlen += 1;
        }
        if (bool && strlen == 4) str += "\n      ";

        str += "最大抢庄：" + parseInt(info.param1 / 100000) % 10 + "倍,";
        strlen += 1;
        if (bool && strlen >= 4) str += "\n      ";
        //else if (bool && strlen == 8) str += "\n      ";

        if (!bool && strlen >= 5) str += "\n     ";

        if (parseInt(info.param1 / 1000000) % 10 == 0) str += "翻倍规则：牛牛x3 牛九x2 牛八x2,";
        else if (parseInt(info.param1 / 1000000) % 10 == 1) str += "翻倍规则：牛牛x4 牛九x3 牛八x2 牛七x2,";
        if (bool) str += "\n      ";

        if (parseInt(info.param1 / 10000000) % 10 == 0) str += "底分：2/4,";
        else if (parseInt(info.param1 / 10000000) % 10 == 1) str += "底分：4/8,";
        else if (parseInt(info.param1 / 10000000) % 10 == 2) str += "底分：8/16,";

        return str;
    },
    pszshare: function (info, bool) {
        var str = "经典三张,";
        if (info.param1 % 10 == 0) str += "50分封顶,";
        else if (info.param1 % 10 == 1) str += "100分封顶,";

        if (parseInt(info.param1 / 10) % 10 == 0) str += "豹子无奖励,";
        else if (parseInt(info.param1 / 10) % 10 == 1) str += "豹子5分奖励,";
        else if (parseInt(info.param1 / 10) % 10 == 2) str += "豹子10分奖励,";
        if (bool) str += "\n      ";

        if (parseInt(info.param1 / 100) % 10 == 0) str += "轮庄模式,";
        else if (parseInt(info.param1 / 100) % 10 == 1) str += "赢家庄模式,";
        return str;
    },
    pszfkshare: function (info, bool) {
        var str = "疯狂三张,";
        var strlen = 1;
        str += (parseInt(info.param1 / 10) % 10) * 5 + "轮封顶,";
        strlen += 1;
        if (info.param1 % 10 == 1) str += "比大小,";
        else if (info.param1 % 10 == 2) str += "比花色,";
        else if (info.param1 % 10 == 3) str += "全比,";
        strlen += 1;

        if (info.param2 % 10 == 1) {
            str += "豹子额外奖励,";
            strlen += 1;
        }
        if (bool && strlen == 4) str += "\n      ";

        if (parseInt(info.param2 / 10) % 10 == 1) {
            str += "比牌双倍开,";
            strlen += 1;
        }
        if (bool && strlen == 4) str += "\n      ";

        if (parseInt(info.param2 / 100) % 10 == 1) {
            str += "解散局算分,";
            strlen += 1;
        }
        if (bool && strlen == 4) str += "\n      ";

        str += parseInt(info.param1 / 100) % 10 + "轮比牌,";
        strlen += 1;
        if (bool && strlen == 4) str += "\n      ";
        if (parseInt(info.param1 / 1000) % 10 == 0) str += "不闷牌,";
        else if (parseInt(info.param1 / 1000) % 10 == 1) str += "2轮闷牌,";
        else if (parseInt(info.param1 / 1000) % 10 == 2) str += "3轮闷牌,";
        else if (parseInt(info.param1 / 1000) % 10 == 3) str += "5轮闷牌,";
        if (bool && strlen >= 7) str += "\n      ";
        return str;
    },
    kwxshare: function (info, bool) {
        var txt = "";
        var strlen = 1;
        switch (info.gametype) {
            case 2:
                txt = "孝感玩法,";
                if (parseInt(info.param1 / 1000) % 10 == 1) {
                    txt += "数坎,";
                    strlen += 1;
                }
                if (parseInt(info.param2 / 10) % 10 == 1) {
                    txt += "对亮对番, ";
                    strlen += 1;
                }
                break;
            case 3:
                txt = "襄阳玩法,";
                if (parseInt(info.param1) % 10 == 1) {
                    txt += "全频道,";
                    if (parseInt(info.param1 / 10) % 10 == 1) {
                        txt += "查大叫,";
                        strlen += 1;
                    }
                }
                else txt += "半频道,";
                strlen += 1;
                break;
            case 4:
                txt = "十堰玩法,";
                if (parseInt(info.param2 / 100) % 10 == 1) {
                    txt += "上楼,";
                    strlen += 1;
                }
                if (parseInt(info.param1) % 10 == 1) {
                    txt += "全频道,";
                    if (parseInt(info.param1 / 10) % 10 == 1) {
                        txt += "查大叫,";
                        strlen += 1;
                    }
                }
                else txt += "半频道,";
                strlen += 1;
                break;
            case 5:
                txt = "随州玩法,";
                break;
            case 13:
                txt = "宜城玩法,";
                if (parseInt(info.param2) % 10 == 1) {
                    txt += "跑恰摸八,";
                    strlen += 1;
                }
                break;
            case 14:
                txt = "应城玩法,";
                break;
        }
        if (parseInt(info.param1 / 10000 % 10) == 0) txt += "不漂,"; else txt += "选漂,";
        strlen += 1;
        if (bool && strlen == 5) txt += "\n      ";

        if (parseInt(info.param1 / 100000) % 10 == 0) txt += "8番封顶,"; else txt += "16番封顶,";
        strlen += 1;
        if (bool && strlen == 5) txt += "\n      ";

        if (parseInt(info.param1 / 100000000) % 10 == 1) {
            txt += "卡五4番,";
            strlen += 1;
            if (bool && strlen == 5) txt += "\n      ";
        }

        if (parseInt(info.param1 / 10000000) % 10 == 1) {
            txt += "碰胡/杠开4番, ";
            strlen += 1;
            if (bool && strlen == 5) txt += "\n      ";
        }

        if (!bool && strlen == 8) txt += "\n     ";

        if (parseInt(info.param1 / 100 % 10) == 0) {
            txt += "不买马,";
            strlen += 1;
            if (!bool && strlen == 8) txt += "\n     ";
            if (bool && strlen == 9) txt += "\n      ";
        }
        else {
            if (parseInt(info.param1 / 1000000 % 10) == 0) txt += "亮倒自摸买马,"; else txt += "自摸买马,"
            strlen += 1;
            if (!bool && strlen == 8) txt += "\n     ";
            if (bool && strlen == 9) txt += "\n      ";
            if (parseInt(info.param1 / 100) % 10 == 1) txt += "独马,"; else txt += "六马,";
            strlen += 1;
            if (!bool && strlen == 8) txt += "\n     ";
            if (bool && strlen == 9) txt += "\n      ";
        }
        strlen += 1;
        if (!bool && strlen == 8) txt += "\n     ";
        if (bool && strlen == 9) txt += "\n      ";

        return txt;
    },
    ddzshare: function (info, bool) {
        var str = "经典玩法,";
        if (info.gametype == gameclass.gamelzddz) {
            str = "癞子玩法,"
            if (info.param1 % 10 == 0) str += "5炸封顶,";
            else str += "炸不封顶,";
        } else {
            if (info.param1 % 10 == 0) str += "3炸封顶,";
            else if (info.param1 % 10 == 1) str += "4炸封顶,";
            else if (info.param1 % 10 == 2) str += "5炸封顶,";
        }
        if (parseInt(info.param1 / 10) % 10 == 0) str += "叫分模式,";
        else if (parseInt(info.param1 / 10) % 10 == 1) str += "不叫分模式,";

        if (parseInt(info.param1 / 100) % 10 == 0) str += "双王可拆,";
        else if (parseInt(info.param1 / 100) % 10 == 1) str += "双王不可拆,";
        if (bool) str += "\n      ";

        if (parseInt(info.param1 / 100) % 10 == 0) str += "不可加倍,";
        else if (parseInt(info.param1 / 100) % 10 == 1) str += "可加倍,";

        return str;
    },
    ptjshare: function (info, bool) {
        var str = "大天九,";
        if (parseInt(info.param1 / 100) % 10 == 1) str += "上道,";

        if (parseInt(info.param1 / 10) % 10 == 0) str += "抢庄,";
        else if (parseInt(info.param1 / 10) % 10 == 1) str += "轮庄,";
        else if (parseInt(info.param1 / 10) % 10 == 2) str += "霸王庄,";

        if (parseInt(info.param1 / 1000) % 10 == 0) str += "每次选分,";
        else if (parseInt(info.param1 / 1000) % 10 == 1) str += "固定选1分,";
        else if (parseInt(info.param1 / 1000) % 10 == 2) str += "固定选2分,";
        else if (parseInt(info.param1 / 1000) % 10 == 3) str += "固定选5分,";
        else if (parseInt(info.param1 / 1000) % 10 == 4) str += "固定选8分,";
        else if (parseInt(info.param1 / 1000) % 10 == 5) str += "固定选10分,";
        if (bool) str += "\n      ";

        return str;
    },
    ttzshare: function (info, bool) {
        var str = "推筒子,";
        if (parseInt(info.param1 / 10) % 10 == 0) str += "轮庄,";
        else if (parseInt(info.param1 / 10) % 10 == 1) str += "连庄,";
        else if (parseInt(info.param1 / 10) % 10 == 2) str += "霸王庄,";

        if (info.param1 % 10 == 0) str += "每次选分,";
        else if (info.param1 % 10 == 1) str += "固定选3分,";
        else if (info.param1 % 10 == 2) str += "固定选5分,";
        else if (info.param1 % 10 == 3) str += "固定选7分,";
        if (bool) str += "\n      ";
        return str;
    },
    niuniushare: function (info, bool) {
        var str = "自由抢庄,";
        if (parseInt(info.param1 / 10) % 10 == 0) str += "扣一张,";
        else if (parseInt(info.param1 / 10) % 10 == 1) str += "全扣,";
        else if (parseInt(info.param1 / 10) % 10 == 2) str += "扣两张,";

        if (info.param1 % 10 == 0) str += "轮庄模式,";
        else if (info.param1 % 10 == 1) str += "抢庄模式,";
        else if (info.param1 % 10 == 2) str += "连庄模式,";
        else if (info.param1 % 10 == 3) str += "赢家庄,";
        if (bool) str += "\n      ";
        return str;
    },
    jxnnshare: function (info, bool) {
        var str = "";

        var _type = info.param1 % 10;

        if (_type == 0) str = "看牌抢庄,";
        else if (_type == 1) str = "通比牛牛,";
        else if (_type == 2) str = "房主当庄,";
        else if (_type == 3) str = "轮流当庄,";

        str += info.param2 + "人玩,";

        if (_type == 0) {
            if (parseInt(info.param1 / 10) % 10 == 0) str += "扣一张,";
            else if (parseInt(info.param1 / 10) % 10 == 1) str += "扣两张,";
        }
        else {
            if (parseInt(info.param1 / 10) % 10 == 0) str += "1倍,";
            else if (parseInt(info.param1 / 10) % 10 == 1) str += "3倍,";
            else if (parseInt(info.param1 / 10) % 10 == 2) str += "5倍,";
            else if (parseInt(info.param1 / 10) % 10 == 3) str += "自选加倍,";
        }
        if (parseInt(info.param1 / 100) % 10 == 0) str += "有王,";
        else if (parseInt(info.param1 / 100) % 10 == 1) str += "无王,";
        if (bool) str += "\n      ";

        return str;
    },
    saoleishare: function (info, bool) {
        var str = "扫雷,";
        if (parseInt(info.param1 / 10) % 10 == 0) str += "房主埋雷,";
        else if (parseInt(info.param1 / 10) % 10 == 1) str += "自由埋雷,";

        str += "地雷分值" + info.param2 + ","
        if (bool) str += "\n      ";
        return str;
    },
    sdbshare: function (info, bool) {
        var str = "十点半,";
        if (parseInt(info.param1 / 10) % 10 == 0) str += "房主庄,";
        else if (parseInt(info.param1 / 10) % 10 == 1) str += "赢家庄,";
        return str;
    },
});
