var gameclass = gameclass || {};
var mahjong;
(function (mahjong) {
    /**
     * 麻将牌的数据模型
     */
    var Card = /** @class */ (function () {
        /**
         * @param {mahjong.Type} type 花色，见mahjong.Type枚举
         * @param {mahjong.Point} point 点数，见mahjong.Point枚举
         */
        function Card(type, point) {
            this.type = type;
            this.point = point;
            this.id = mahjong.Card.counter++;
            this.cardID = this.type * 9 + point;
        }
        Card.init = function () {
            mahjong.helpCard0 = mahjong.helpCard0 || new Card(0, 0);
            mahjong.helpCard1 = mahjong.helpCard1 || new Card(0, 0);
            mahjong.helpCard2 = mahjong.helpCard2 || new Card(0, 0);
            mahjong.helpCard3 = mahjong.helpCard3 || new Card(0, 0);
        };
        /**
         * 通过CardID构建牌
         */
        Card.createFromCardID = function (cardID) {
            var card = new Card(0, 0);
            card.buildByCardID(cardID);
            return card;
        };
        /**
         * 通过如下字符串构建牌
         * 五条
         */
        Card.createFromStr = function (cardName) {
            switch (cardName) {
                case '幺鸡':
                case '一条':
                    return new Card(mahjong.Type.BAMBOO, 0);
                case '东风':
                case '东':
                    return new Card(mahjong.Type.WIND, mahjong.Point.EAST_WIND);
                case '南风':
                case '南':
                    return new Card(mahjong.Type.WIND, mahjong.Point.SOUTH_WIND);
                case '西风':
                case '西':
                    return new Card(mahjong.Type.WIND, mahjong.Point.WEST_WIND);
                case '北风':
                case '北':
                    return new Card(mahjong.Type.WIND, mahjong.Point.NORTH_WIND);
                case '发财':
                case '發财':
                case '发':
                case '發':
                    return new Card(mahjong.Type.WIND, mahjong.Point.GREEN_DRAGON);
                case '红中':
                case '中':
                    return new Card(mahjong.Type.WIND, mahjong.Point.RED_DRAGON);
                case '白板':
                case '电视':
                    return new Card(mahjong.Type.WIND, mahjong.Point.WHITE_DRAGON);
                default:
                    var end = '';
                    var type = -1;
                    if (cardName.indexOf('万') != -1) {
                        end = '万';
                        type = mahjong.Type.CHARACTER;
                    }
                    else if (cardName.indexOf('条') != -1) {
                        end = '条';
                        type = mahjong.Type.BAMBOO;
                    }
                    else if (cardName.indexOf('筒') != -1) {
                        end = '筒';
                        type = mahjong.Type.DOT;
                    }
                    if (type == -1) {
                        return null;
                    }
                    cardName = cardName.replace(end, '');
                    return new Card(type, Card.numbers.indexOf(cardName));
            }
        };
        Card.prototype.reNew = function (type, point) {
            this.type = type;
            this.point = point;
            this.id = mahjong.Card.counter++;
            this.cardID = this.type * 9 + point;
            return this;
        };
        Card.prototype.buildByCardID = function (cardID) {
            this.cardID = cardID;
            this.type = parseInt('' + (cardID / 9));
            this.point = cardID % 9;
            return this;
        };
        Card.prototype.clone = function () {
            return new mahjong.Card(this.type, this.point);
        };
        Card.prototype.toString = function () {
            var value = '';
            switch (this.type) {
                case mahjong.Type.BAMBOO:
                    if (this.point == 0) {
                        value = '幺鸡';
                    }
                    else {
                        value = mahjong.Card.numbers[this.point] + '条';
                    }
                    break;
                case mahjong.Type.CHARACTER:
                    value = mahjong.Card.numbers[this.point] + '万';
                    break;
                case mahjong.Type.DOT:
                    value = mahjong.Card.numbers[this.point] + '筒';
                    break;
                case mahjong.Type.WIND:
                    switch (this.point) {
                        case mahjong.Point.EAST_WIND:
                            value = '东风';
                            break;
                        case mahjong.Point.SOUTH_WIND:
                            value = '南风';
                            break;
                        case mahjong.Point.WEST_WIND:
                            value = '西风';
                            break;
                        case mahjong.Point.NORTH_WIND:
                            value = '北风';
                            break;
                        case mahjong.Point.GREEN_DRAGON:
                            value = '发财';
                            break;
                        case mahjong.Point.RED_DRAGON:
                            value = '红中';
                            break;
                        case mahjong.Point.WHITE_DRAGON:
                            value = '白板';
                    }
                    break;
                case mahjong.Type.DRAGON:
                    // switch (this.point) {
                    // 		break;
                    // }
                    break;
                default:
                    value = '未知的牌';
            }
            return value;
        };
        Card.counter = 0;
        Card.numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
        return Card;
    }());
    mahjong.Card = Card;
})(mahjong || (mahjong = {}));
var mahjong;
(function (mahjong) {
    /**
     * 麻将基础算法
     * 胡牌使用查表法
     * http://www.xqbase.com/other/mahjongg_english.htm
     */
    var MahjongTool = /** @class */ (function () {
        function MahjongTool() {
        }
        /**
         * 初始化
         * @param {Card[]} jokers 癞子枚举
         * @param {TableSource} tableSource 用于查表匹配的胡牌表
         * @param {boolean} allow_7dui 是否允许7对胡
         */
        MahjongTool.init = function (jokers, tableSource, allow_7dui) {
            if (allow_7dui === void 0) { allow_7dui = false; }
            this.tmpJoker = jokers;
            this.tmpTableSource = tableSource;
            this.tmpJokerByCardis = [];
            this.allow_7dui = allow_7dui;
            for (var i = 0, len = jokers.length; i < len; i++) {
                var el = jokers[i];
                this.tmpJokerByCardis[i] = el.cardID;
            }
        };
        /**
         * 记牌器，记住打出去的牌
         * @param {Card} card 打出去的牌
         */
        MahjongTool.recordDisCard = function (card) {
            this.discardCounter = this.discardCounter || {};
            if (!this.discardCounter[card.cardID]) {
                this.discardCounter[card.cardID] = 0;
            }
            this.discardCounter[card.cardID]++;
        };
        /**
         * 覆盖更新整个记牌器
         */
        MahjongTool.updateDiscard = function (cardIds) {
            this.discardCounter = {};
            for (var i = 0, len = cardIds.length; i < len; i++) {
                var el = cardIds[i];
                if (!this.discardCounter[el]) {
                    this.discardCounter[el] = 0;
                }
                this.discardCounter[el]++;
            }
        };
        /**
         * 显示记牌器
         */
        MahjongTool.testDiscard = function () {
            trace(this.discardCounter);
        };
        /**
         * 获取当前的记牌器数据
         */
        MahjongTool.getDiscardCounter = function () {
            return this.getDiscardCounter;
        };
        /**
         * 打完一局后，清理记牌器
         */
        MahjongTool.clearRecord = function () {
            this.discardCounter = null;
        };
        /**
         * 清理内存
         */
        MahjongTool.dispose = function () {
            this.tmpJoker = null;
            this.tmpTableSource = null;
        };
        /**
         * 是否能胡7对
         */
        MahjongTool.canWin_7dui = function (cards) {
            if (cards.length != 14) {
                return false;
            }
            var dic = {};
            var jokerCount = 0;
            for (var i = 0, len = cards.length; i < len; i++) {
                var el = cards[i];
                if (this.tmpJokerByCardis.indexOf(el.cardID) != -1) {
                    jokerCount++;
                }
                else {
                    if (!dic[el.cardID]) {
                        dic[el.cardID] = 0;
                    }
                    dic[el.cardID]++;
                }
            }
            for (var key in dic) {
                var value = dic[key];
                //不是偶数
                if (value % 2 != 0) {
                    if (jokerCount > 0) {
                        //拿一个癞子去适配 
                        jokerCount--;
                    }
                    else {
                        //没有癞子了
                        return false;
                    }
                }
            }
            return true;
        };
        /**
         * 当摸到一张牌后
         * 计算可以胡什么牌，该牌还剩余多少张
         * 红中癞子麻将的胡法，不传癞子则为普通麻将胡法,返回null视为怎么打都胡不了，没有可胡的牌
         * 如果已经使用 MahjongTool.recordDisCard进行了记牌操作，则会从中剔除对应牌的数量
         * @param {Card[]} cards 所有的手牌,包括癞子，但是不包括新摸到的牌
         * @param {Card} drawCard 当前摸到的新牌
         * @param {Card[]} fullCardsWithoutJoker 不包括癞子的所有牌各一张。如红中癞子麻将，则包含：[1-9万各一张，1-9筒各一张，1-9条各一张，东南西北发白各一张]。如血流成河，则包含：[除开缺一门的牌各一张]
         * @param {Card[]} jokers 癞子枚举,如已使用 MahjongTool.init进行初始化，则可省略
         * @param {TableSource} tableSource 用于查表匹配的胡牌表,如已使用 MahjongTool.init进行初始化，则可省略
         */
        MahjongTool.findWinCardsWhenDraw = function (cards, drawCard, fullCardsWithoutJoker, jokers, tableSource) {
            var checkedDiscardIds = {};
            var tmpCard;
            var rs = [];
            var hasWin = false;
            //打drawCard胡什么牌，也要算进去
            for (var i = 0, len = cards.length + 1; i < len; i++) {
                tmpCard = cards[i] || drawCard;
                //是否已经检查过了
                if (checkedDiscardIds[tmpCard.cardID]) {
                    if (checkedDiscardIds[tmpCard.cardID] == 110) {
                        rs[i] = null;
                    }
                    else {
                        rs[i] = checkedDiscardIds[tmpCard.cardID];
                    }
                }
                else {
                    //最后一张是临时抓的牌，也算算胡牌情况
                    if (i < len - 1) {
                        tmpCard = cards[i];
                        cards[i] = drawCard;
                    }
                    var win = this.findWinCards(cards, fullCardsWithoutJoker, jokers, tableSource);
                    if (win) {
                        hasWin = true;
                        var check = new mahjong.CheckResult();
                        check.discard = tmpCard;
                        check.winCards = win.cards;
                        check.winCount = win.count;
                        checkedDiscardIds[tmpCard.cardID] = check;
                        rs[i] = check;
                    }
                    else {
                        //某个牌检查过了，没有结果，用110代替
                        checkedDiscardIds[tmpCard.cardID] = 110;
                    }
                }
                if (i < len - 1) {
                    cards[i] = tmpCard;
                }
            }
            if (!hasWin) {
                return null;
            }
            return rs;
        };
        /**
         * 计算可以胡什么牌，该牌还剩余多少张
         * 红中癞子麻将的胡法，不传癞子则为普通麻将胡法,返回null视为没有可胡的牌
         * 如果已经使用 MahjongTool.recordDisCard进行了记牌操作，则会从中剔除对应牌的数量
         * @param {Card[]} cards 所有的手牌,包括癞子
         * @param {Card[]} fullCardsWithoutJoker 不包括癞子的所有牌各一张。如红中癞子麻将，则包含：[1-9万各一张，1-9筒各一张，1-9条各一张，东南西北发白各一张]。如血流成河，则包含：[除开缺一门的牌各一张]
         * @param {Card[]} jokers 癞子枚举,如已使用 MahjongTool.init进行初始化，则可省略
         * @param {TableSource} tableSource 用于查表匹配的胡牌表,如已使用 MahjongTool.init进行初始化，则可省略
         */
        MahjongTool.findWinCards = function (cards, fullCardsWithoutJoker, jokers, tableSource) {
            //先判断牌组是否已经听牌
            var isReadyHand = this.canReadyHand(cards, jokers, tableSource, false);
            if (!isReadyHand) {
                return null;
            }
            //复制牌组
            cards = cards.concat();
            jokers = jokers || this.tmpJoker;
            tableSource = tableSource || this.tmpTableSource;
            var rs = [];
            //第一张牌用于占位
            cards.splice(0, 0, new mahjong.Card(0, 0));
            //在完整牌组中，一一匹配是否能胡
            for (var i = 0, len = fullCardsWithoutJoker.length; i < len; i++) {
                var el = fullCardsWithoutJoker[i];
                cards[0] = el;
                var isWin = this.canWin(cards, jokers, tableSource, false, true);
                if (isWin) {
                    rs.push(el);
                }
            }
            //没有找到可胡的牌
            if (rs.length <= 0) {
                return null;
            }
            //手牌计数器
            var handCardDic = {};
            //牌组中第一张是加进去的匹配牌，不计数
            for (var i = 1, len = cards.length; i < len; i++) {
                var el = cards[i];
                var cid = el.cardID;
                if (!handCardDic[cid]) {
                    handCardDic[cid] = 0;
                }
                handCardDic[cid]++;
            }
            //计算对应的可胡牌的数量，从记牌器和自己手牌中分别过滤
            var finalRs = [];
            var countArr = [];
            for (var i = 0, len = rs.length; i < len; i++) {
                var el = rs[i];
                var cid = el.cardID;
                var count = 4;
                //先从记牌器中删
                if (this.discardCounter && this.discardCounter[cid]) {
                    count -= this.discardCounter[cid];
                }
                //再从手牌中删
                if (handCardDic && handCardDic[cid]) {
                    count -= handCardDic[cid];
                }
                //可胡牌剩余数有效，才算作可胡牌
                if (count > 0) {
                    finalRs.push(el);
                    countArr.push(count);
                }
            }
            //经过过滤，没有可胡的牌
            if (finalRs.length <= 0) {
                return null;
            }
            return { cards: finalRs, count: countArr };
        };
        /**
         * 是否能听牌，红中癞子麻将的听法，不传癞子则为普通麻将听法
         * @param {Card[]} cards 所有的手牌,包括癞子
         * @param {Card[]} jokers 癞子枚举,如已使用 MahjongTool.init进行初始化，则可省略
         * @param {TableSource} tableSource 用于查表匹配的胡牌表,如已使用 MahjongTool.init进行初始化，则可省略
         * @param {boolean} sorted 是否已经使用MahjongTool.sortHandleCard排过序了,true可减去不必要的排序，以提升性能
         */
        MahjongTool.canReadyHand = function (cards, jokers, tableSource, sorted) {
            if (sorted === void 0) { sorted = false; }
            //复制数据源
            cards = cards.concat();
            jokers = jokers || this.tmpJoker;
            tableSource = tableSource || this.tmpTableSource;
            var joker = jokers[0] || new mahjong.Card(mahjong.Type.WIND, mahjong.Point.RED_DRAGON);
            //先丢一张癞子进去，如能胡，则视为听牌
            cards.splice(0, 0, joker);
            return this.canWin(cards, jokers, tableSource, sorted, false);
        };
        /**
         * 是否能胡牌，红中癞子麻将的胡法，不传癞子则为普通麻将胡法
         * @param {Card[]} cards 所有的手牌,包括癞子
         * @param {Card[]} jokers 癞子枚举,如已使用 MahjongTool.init进行初始化，则可省略
         * @param {TableSource} tableSource 用于查表匹配的胡牌表,如已使用 MahjongTool.init进行初始化，则可省略
         * @param {boolean} sorted 是否已经使用MahjongTool.sortHandleCard排过序了,true可减去不必要的排序，以提升性能,默认false
         * @param {boolean} copyCardData 是否复制参数cards数据源。不复制的话，经过排序，会对原有牌组产生变化，但性能较高；如复制，则不会影响原有牌组，但性能稍低。默认true
         *
         */
        MahjongTool.canWin = function (cards, jokers, tableSource, sorted, copyCardData) {
            if (sorted === void 0) { sorted = false; }
            if (copyCardData === void 0) { copyCardData = true; }
            //是否允许胡7对
            if (this.allow_7dui) {
                if (this.canWin_7dui(cards)) {
                    return true;
                }
            }
            //复制数组，避免影响原数据
            cards = cards.concat();
            jokers = jokers || this.tmpJoker;
            tableSource = tableSource || this.tmpTableSource;
            var cardLen = cards.length % 3;
            if (cardLen != 0 && cardLen != 2) {
                //既不满足N*3，也不满足N*3+2,则一定无法胡牌
                return false;
            }
            if (!sorted) {
                cards = this.sortHandleCard(cards, jokers);
            }
            //				0     1    2    3     4     5
            //从N张牌中分出 癞子，花牌，风牌, 筒牌，条牌, 万牌
            var groups = this.split(cards, jokers, sorted);
            var myJokers = groups[0];
            //可用癞子总数
            var jokerCount = myJokers.length;
            var tableDics;
            var eyeTableDics;
            //3N*2带将的匹配次数
            var n3_2_count = 0;
            for (var i = 1, len = groups.length; i < len; i++) {
                var el = groups[i];
                var key = this.makeKey(el);
                // trace(el.join(','), key);
                if (key == '') {
                    continue;
                }
                if (i == 1) {
                    //花牌（春夏秋冬 梅兰竹菊）的胡牌规则暂时没有
                    continue;
                }
                else if (i == 2) {
                    //风牌,中、发、白、东、南、西、北
                    tableDics = tableSource.fengTableDics;
                    eyeTableDics = tableSource.fengEyeTableDics;
                }
                else {
                    tableDics = tableSource.tableDics;
                    eyeTableDics = tableSource.eyeTableDics;
                }
                var dic;
                var matched = false;
                for (var j = 0, lenj = jokerCount; !matched && j <= lenj; j++) {
                    var modValue = (el.length + j) % 3;
                    dic = null;
                    if (modValue == 0) {
                        //牌数量是否满足N*3
                        dic = tableDics[j] || {};
                    }
                    else if (modValue == 2 && n3_2_count < 1) {
                        //牌数量是否满足N*3+2
                        dic = eyeTableDics[j] || {};
                    }
                    // trace(modValue, j, el.length + j);
                    //在表中找到了牌组的key，把用于匹配的癞子数减掉
                    if (dic && dic[key]) {
                        jokerCount = jokerCount - j;
                        matched = true;
                        //将牌只能出现一次
                        if (modValue == 2) {
                            n3_2_count++;
                        }
                    }
                }
                // trace(matched);
                //如果某个牌组在用完所有的癞子后，依旧不能在胡牌表中查到，则视为无法胡牌
                if (!matched || jokerCount < 0 || n3_2_count > 1) {
                    return false;
                }
            }
            //所有匹配都通过过了，则能胡牌
            return true;
        };
        /**
         * 直接根据1-9有几张牌就填几（赖子不算），如1-9万各一张，则key为111111111。如1万3张，9万2张，则key为300000002
         * cards 支持 [Card, ...]和[number, ...]
         */
        MahjongTool.makeKey = function (cards) {
            if (!cards || cards.length <= 0) {
                return '';
            }
            var cardType = cards[0].type;
            if (cardType == mahjong.Type.DRAGON) {
                trace('暂不支持花牌（春夏秋冬 梅兰竹菊）生成key');
                return '';
            }
            var rs = '';
            var arr = cardType == mahjong.Type.WIND ? [0, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, 0, 0, 0];
            var len = cardType == mahjong.Type.WIND ? 7 : 9;
            for (var i = 0; i < len; i++) {
                for (var j = 0, lenj = cards.length; j < lenj; j++) {
                    var el = cards[j];
                    if (el.point == i) {
                        arr[i]++;
                    }
                }
            }
            //剃掉前面的N个0
            var foundZero = false;
            for (var i = 0, len = arr.length; i < len; i++) {
                var num = arr[i];
                if (foundZero || num > 0) {
                    foundZero = true;
                    rs = rs + num;
                }
            }
            return rs;
        };
        /**
         * 从N张牌中分出 癞子，花牌，风牌, (筒牌、条牌、万牌按数量从小到大)
         * @param {Card[]} jokers 癞子枚举,如已使用 MahjongTool.init进行初始化，则可省略
         */
        MahjongTool.split = function (cards, jokers, sorted) {
            if (sorted === void 0) { sorted = false; }
            jokers = jokers || this.tmpJoker;
            var rs = [
                [],
                [],
                [],
                [],
                [],
                [] //万牌
            ];
            //按 花牌...， 风牌...,  (筒牌、条牌、万牌按数量从小到大)   的顺序排序
            if (!sorted) {
                cards = this.sortHandleCard(cards, jokers);
            }
            //是否是癞子
            var isJoker = function (card) {
                for (var i = 0, len = jokers.length; i < len; i++) {
                    var el = jokers[i];
                    if (el.type == card.type && el.point == card.point) {
                        return true;
                    }
                }
                return false;
            };
            var arr3 = [[], [], []];
            for (var i = 0, len = cards.length; i < len; i++) {
                var el = cards[i];
                if (isJoker(el)) {
                    //癞子
                    rs[0].push(el);
                }
                else {
                    if (el.type == mahjong.Type.DRAGON) {
                        //花牌
                        rs[1].push(el);
                    }
                    else if (el.type == mahjong.Type.WIND) {
                        //风牌
                        rs[2].push(el);
                    }
                    else if (el.type == mahjong.Type.DOT) {
                        //筒牌 
                        arr3[0].push(el);
                    }
                    else if (el.type == mahjong.Type.BAMBOO) {
                        //条牌
                        arr3[1].push(el);
                    }
                    else if (el.type == mahjong.Type.CHARACTER) {
                        //万牌
                        arr3[2].push(el);
                    }
                }
            }
            //将数量少的牌放前面，可提升胡牌算法效率
            arr3.sort(function (a, b) {
                if (a.length < b.length) {
                    return -1;
                }
                else if (a.length > b.length) {
                    return 1;
                }
                return 0;
            });
            rs[3] = arr3[0];
            rs[4] = arr3[1];
            rs[5] = arr3[2];
            return rs;
        };
        /**
         * 创建完整的一副麻将，
         * 包括 筒牌（1-9）、条牌（1-9）、万牌（1-9）、东、南、西、北、中、发、白
         */
        MahjongTool.makeFullTiles = function () {
            var models = MahjongTool.makeBasics();
            models = models.concat(MahjongTool.makeAllWinds());
            models = models.concat(MahjongTool.makeAllDragons());
            return models;
        };
        /**
         * 创建一副麻将，
         * 包括 筒牌（1-9）、条牌（1-9）、万牌（1-9)、红中
         */
        MahjongTool.makeOnlyRedDragonTiles = function () {
            var models = MahjongTool.makeBasics();
            models = models.concat(MahjongTool.makeAllRedDragons());
            return models;
        };
        /**
         * 麻将洗牌，随机乱序
         * @param {mahjong.Card[]} models 需要洗的牌
         */
        MahjongTool.shuffle = function (models) {
            for (var i = 0, len = models.length; i < len; i++) {
                var el = models[i];
                var idx = this.randomInt_XY(0, len - 1);
                var tmp = el;
                models[i] = models[idx];
                models[idx] = tmp;
            }
            return models;
        };
        /**
         * 创建一套只有万、筒、条的牌
         */
        MahjongTool.makeBasics = function () {
            var types = [
                mahjong.Type.BAMBOO,
                mahjong.Type.CHARACTER,
                mahjong.Type.DOT
            ];
            var models = [];
            for (var i = 0; i <= 8; i++) {
                for (var j = 0, len = types.length; j < len; j++) {
                    var el = types[j];
                    var model = new mahjong.Card(el, i);
                    models.push(model);
                    models.push(model.clone());
                    models.push(model.clone());
                    models.push(model.clone());
                }
            }
            return models;
        };
        /**
         * 创建全部的风牌
         * 东、南、西、北 各4张
         */
        MahjongTool.makeAllWinds = function () {
            var models = [];
            var points = [
                mahjong.Point.EAST_WIND,
                mahjong.Point.NORTH_WIND,
                mahjong.Point.SOUTH_WIND,
                mahjong.Point.WEST_WIND
            ];
            for (var j = 0, len = points.length; j < len; j++) {
                var el = points[j];
                var model = new mahjong.Card(mahjong.Type.WIND, el);
                models.push(model);
                models.push(model.clone());
                models.push(model.clone());
                models.push(model.clone());
            }
            return models;
        };
        /**
         * 创建全部的箭牌
         * 中、发、白 各4张
         */
        MahjongTool.makeAllDragons = function () {
            var models = [];
            var points = [
                mahjong.Point.GREEN_DRAGON,
                mahjong.Point.RED_DRAGON,
                mahjong.Point.WHITE_DRAGON
            ];
            for (var j = 0, len = points.length; j < len; j++) {
                var el = points[j];
                var model = new mahjong.Card(mahjong.Type.WIND, el);
                models.push(model);
                models.push(model.clone());
                models.push(model.clone());
                models.push(model.clone());
            }
            return models;
        };
        /**
         * 创建4张红中
         */
        MahjongTool.makeAllRedDragons = function () {
            var models = [];
            var model = new mahjong.Card(mahjong.Type.WIND, mahjong.Point.RED_DRAGON);
            models.push(model);
            models.push(model.clone());
            models.push(model.clone());
            models.push(model.clone());
            return models;
        };
        /**
         * 通过类似如下字符串构建牌组
         * 五条,五条,三筒,五筒,六筒,六筒,七筒,八筒,一万,一万,六万,八万,八万,九万
         */
        MahjongTool.buildCardsByStr = function (str) {
            var cards = [];
            var arr = str.split(',');
            for (var i = 0, len = arr.length; i < len; i++) {
                var el = arr[i];
                var card = mahjong.Card.createFromStr(el);
                cards[i] = card;
            }
            return cards;
        };
        MahjongTool.sortTypePoint = function (arr) {
            return arr.sort(this.compare);
        };
        /**
         * 测试使用，随机得到一组手牌，13张
         */
        MahjongTool.testHandlePai = function () {
            var modelArr = this.makeOnlyRedDragonTiles();
            return this.randomUniqueFromArray_XY(modelArr, 13);
        };
        /**
         * 整理玩家的手牌 赖子及赖子皮放前面(赖子就是混牌 Joker)
         * jokerArr  数组是赖子及赖子皮
         */
        MahjongTool.sortHandleCard = function (cards, jokerArr) {
            jokerArr = jokerArr || MahjongTool.tmpJoker;
            MahjongTool.tmpJoker = jokerArr || [];
            cards.sort(MahjongTool.compareWithJoker);
            return cards;
        };
        /**
         * 整理玩家的手牌 赖子及赖子皮放前面(赖子就是混牌 Joker)
         * jokerArr  数组是赖子及赖子皮
         */
        MahjongTool.sortHandleCardByCardI = function (cards, jokerArr) {
            if (jokerArr) {
                MahjongTool.tmpJokerByCardis = jokerArr;
            }
            cards.sort(MahjongTool.compareWithJokerByCardId);
            return cards;
        };
        /**
         *  查找指定的牌
         */
        MahjongTool.getTargetModel = function (a, arr) {
            var model;
            for (var i = 0; i < arr.length; i++) {
                model = arr[i];
                if (model.type == a.type && model.point == a.point) {
                    return model;
                }
            }
            return null;
        };
        /**
         * 是否存在指定的牌
         */
        MahjongTool.exitsTargetCard = function (a, arr) {
            var card;
            for (var i = 0; i < arr.length; i++) {
                card = arr[i];
                if (card.type == a.type && card.point == a.point) {
                    return true;
                }
            }
            return false;
        };
        MahjongTool.compare = function (a, b) {
            if (a.type < b.type)
                return -1;
            else if (a.type > b.type)
                return 1;
            else if (a.type == b.type) {
                if (a.point < b.point)
                    return -1;
                else
                    return 1;
            }
        };
        MahjongTool.compareWithJoker = function (a, b) {
            var aIsJoker = mahjong.MahjongTool.exitsTargetCard(a, mahjong.MahjongTool.tmpJoker);
            var bIsJoker = mahjong.MahjongTool.exitsTargetCard(b, mahjong.MahjongTool.tmpJoker);
            if (aIsJoker && !bIsJoker) {
                return -1;
            }
            else if (!aIsJoker && bIsJoker) {
                return 1;
            }
            else {
                if (a.type < b.type)
                    return -1;
                else if (a.type > b.type)
                    return 1;
                else if (a.type == b.type) {
                    if (a.point < b.point)
                        return -1;
                    else
                        return 1;
                }
            }
            return 0;
        };
        MahjongTool.compareWithJokerByCardId = function (a, b) {
            var aIsJoker = mahjong.MahjongTool.tmpJokerByCardis.indexOf(a) != -1;
            var bIsJoker = mahjong.MahjongTool.tmpJokerByCardis.indexOf(b) != -1;
            if (aIsJoker && !bIsJoker) {
                return -1;
            }
            else if (!aIsJoker && bIsJoker) {
                return 1;
            }
            else {
                if (a < b) {
                    return -1;
                }
                else if (a == b) {
                    return 0;
                }
                return 1;
            }
        };
        /**
         * 是否能碰这张牌
         */
        MahjongTool.canPongByCardId = function (a, arr) {
            var count = 0;
            for (var i = 0; i < arr.length; i++) {
                var model = arr[i];
                if (model == a) {
                    count++;
                }
            }
            if (count >= 2) {
                return true;
            }
            return false;
        };
        /**
         * 是否能碰这张牌
         */
        MahjongTool.canPong = function (a, arr) {
            var count = 0;
            for (var i = 0; i < arr.length; i++) {
                var model = arr[i];
                if (model.type == a.type && model.point == a.point) {
                    count++;
                }
            }
            if (count >= 2) {
                return true;
            }
            return false;
        };
        /**
         * 是否能杠这张牌
         */
        MahjongTool.canKongByCardId = function (a, arr) {
            var count = 0;
            for (var i = 0; i < arr.length; i++) {
                var model = arr[i];
                if (a == model) {
                    count++;
                }
            }
            if (count >= 3) {
                return true;
            }
            return false;
        };
        /**
         * 是否能杠这张牌
         */
        MahjongTool.canKong = function (a, arr) {
            var count = 0;
            for (var i = 0; i < arr.length; i++) {
                var model = arr[i];
                if (model.type == a.type && model.point == a.point) {
                    count++;
                }
            }
            if (count >= 3) {
                return true;
            }
            return false;
        };
        /**
         * 是否能吃这张牌
         */
        MahjongTool.canChowByCardId = function (a, arr) {
            mahjong.helpCard0.buildByCardID(a);
            if (mahjong.helpCard0.type >= mahjong.Type.WIND)
                return false;
            var sameTypeArr = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                var el = arr[i];
                mahjong.helpCard1.buildByCardID(el);
                if (mahjong.helpCard0.type == mahjong.helpCard1.type) {
                    sameTypeArr.push(el);
                }
            }
            var pre2Exist = sameTypeArr.indexOf(a - 2) != -1;
            var pre1Exist = sameTypeArr.indexOf(a - 1) != -1;
            var next1Exist = sameTypeArr.indexOf(a + 1) != -1;
            var next2Exist = sameTypeArr.indexOf(a + 2) != -1;
            return ((pre2Exist && pre1Exist) || //AB*
                (pre1Exist && next1Exist) || //A*B
                (next1Exist && next2Exist) //*AB
            );
        };
        /**
         * 找出可以吃的所有组合
         */
        MahjongTool.findAllChow = function (keyCard, cards) {
            mahjong.helpCard0.buildByCardID(keyCard);
            if (mahjong.helpCard0.type >= mahjong.Type.WIND)
                return null;
            var rs = [];
            var sameTypeArr = [];
            for (var i = 0, len = cards.length; i < len; i++) {
                var el = cards[i];
                mahjong.helpCard1.buildByCardID(el);
                if (mahjong.helpCard0.type == mahjong.helpCard1.type) {
                    sameTypeArr.push(el);
                }
            }
            var pre2Exist = sameTypeArr.indexOf(keyCard - 2) != -1;
            var pre1Exist = sameTypeArr.indexOf(keyCard - 1) != -1;
            var next1Exist = sameTypeArr.indexOf(keyCard + 1) != -1;
            var next2Exist = sameTypeArr.indexOf(keyCard + 2) != -1;
            if (pre2Exist && pre1Exist) {
                rs.push([keyCard - 2, keyCard - 1, keyCard]);
            }
            if (pre1Exist && next1Exist) {
                rs.push([keyCard - 1, keyCard, keyCard + 1]);
            }
            if (next1Exist && next2Exist) {
                rs.push([keyCard, keyCard + 1, keyCard + 2]);
            }
            return rs;
        };
        /**
         * 是否能吃这张牌
         */
        MahjongTool.canChow = function (a, arr) {
            if (a.type >= mahjong.Type.WIND)
                return false;
            var pre2 = new mahjong.Card(a.type, a.point - 2);
            var pre1 = new mahjong.Card(a.type, a.point - 1);
            var next1 = new mahjong.Card(a.type, a.point + 1);
            var next2 = new mahjong.Card(a.type, a.point + 2);
            var pre2Exist = this.exitsTargetCard(pre2, arr);
            var pre1Exist = this.exitsTargetCard(pre1, arr);
            var next1Exist = this.exitsTargetCard(next1, arr);
            var next2Exist = this.exitsTargetCard(next2, arr);
            return ((pre2Exist && pre1Exist) || //AB*
                (pre1Exist && next1Exist) || //A*B
                (next1Exist && next2Exist) //*AB
            );
        };
        MahjongTool.Win = function () {
            return false;
        };
        MahjongTool.randomInt_XY = function (start, end) {
            return Math.floor(start + (end - start + 1) * Math.random());
        };
        MahjongTool.randomFromArray_XY = function (arr) {
            return arr[this.randomInt_XY(0, arr.length - 1)];
        };
        MahjongTool.verifyRange_XY = function (value, min, max) {
            return Math.max(Math.min(value, max), min);
        };
        MahjongTool.randomUniqueFromArray_XY = function (arr, count) {
            count = this.verifyRange_XY(count, 0, arr.length);
            var rs = [];
            var max = 1000;
            while (count > 0 && max > 0) {
                var r = this.randomFromArray_XY(arr);
                if (rs.indexOf(r) == -1) {
                    rs.push(r);
                    count--;
                }
                max--;
            }
            return rs;
        };
        return MahjongTool;
    }());
    mahjong.MahjongTool = MahjongTool;
})(mahjong || (mahjong = {}));
var mahjong;
(function (mahjong) {
    /**
     * 一组牌
     * 一个顺子、刻子或杠子
     */
    var Meld = /** @class */ (function () {
        function Meld() {
        }
        /**
         * 明杠
         */
        Meld.EXPOSED = 0;
        /**
         * 暗杠
         */
        Meld.CONCEALED = 1;
        /**
         * 刻子
         */
        Meld.TRIPLET = 2;
        /**
         * 顺子
         */
        Meld.SEQUENCE = 3;
        return Meld;
    }());
    mahjong.Meld = Meld;
})(mahjong || (mahjong = {}));
/**
 * 麻将的点数，
 * 1-9
 * 中发白，4个风
 */
var mahjong;
(function (mahjong) {
    var Point;
    (function (Point) {
        /**
         * 东风
         */
        Point[Point["EAST_WIND"] = 0] = "EAST_WIND";
        /**
         * 南风
         */
        Point[Point["SOUTH_WIND"] = 1] = "SOUTH_WIND";
        /**
         * 西风
         */
        Point[Point["WEST_WIND"] = 2] = "WEST_WIND";
        /**
         * 北风
         */
        Point[Point["NORTH_WIND"] = 3] = "NORTH_WIND";
        /**
         * 红中
         */
        Point[Point["RED_DRAGON"] = 4] = "RED_DRAGON";
        /**
         * 发财
         */
        Point[Point["GREEN_DRAGON"] = 5] = "GREEN_DRAGON";
        /**
         * 白板
         */
        Point[Point["WHITE_DRAGON"] = 6] = "WHITE_DRAGON";
    })(Point = mahjong.Point || (mahjong.Point = {}));
})(mahjong || (mahjong = {}));
var mahjong;
(function (mahjong) {
    /**
     * var arr = [1,2,3,4,5,6,7,8,9,0];
     * console.log(mahjong.RandomAll.GetPermutation2(arr, 3));//求排列
     * console.log(mahjong.RandomAll.GetCombination(arr, 3));//求组合
     */
    var RandomAll = /** @class */ (function () {
        function RandomAll() {
        }
        /// <summary>
        /// 递归算法求数组的组合(私有成员)
        /// </summary>
        /// <param name="list">返回的范型</param>
        /// <param name="t">所求数组</param>
        /// <param name="n">辅助变量</param>
        /// <param name="m">辅助变量</param>
        /// <param name="b">辅助数组</param>
        /// <param name="M">辅助变量M</param>
        RandomAll.GetCombination6 = function (list, t, n, m, b, M) {
            for (var i = n; i >= m; i--) {
                b[m - 1] = i - 1;
                if (m > 1) {
                    this.GetCombination6(list, t, i - 1, m - 1, b, M);
                }
                else {
                    if (list == null) {
                        list = [];
                    }
                    var temp = [];
                    for (var j = 0; j < b.length; j++) {
                        temp[j] = t[b[j]];
                    }
                    if (RandomAll.sortFun) {
                        temp.sort(RandomAll.sortFun);
                    }
                    else {
                        temp.sort(function (a, b) {
                            if (a < b) {
                                return -1;
                            }
                            return 1;
                        });
                    }
                    if (!this.arrHas(list, temp)) {
                        list.push(temp);
                    }
                }
            }
        };
        RandomAll.arrHas = function (list, value) {
            for (var i = 0, len = list.length; i < len; i++) {
                var el = list[i];
                var isSame = true;
                for (var j = 0, lenj = value.length; j < lenj && isSame; j++) {
                    var ell = value[j];
                    if (RandomAll.compareFun) {
                        if (RandomAll.compareFun(el[j], ell)) {
                        }
                        else {
                            isSame = false;
                        }
                    }
                    else {
                        if (el[j] == ell) {
                        }
                        else {
                            isSame = false;
                        }
                    }
                }
                if (isSame) {
                    return true;
                }
            }
            return false;
        };
        /// <summary>
        /// 递归算法求排列(私有成员)
        /// </summary>
        /// <param name="list">返回的列表</param>
        /// <param name="t">所求数组</param>
        /// <param name="startIndex">起始标号</param>
        /// <param name="endIndex">结束标号</param>
        RandomAll.GetPermutation4Void = function (list, t, startIndex, endIndex) {
            if (startIndex == endIndex) {
                if (list == null) {
                    list = [];
                }
                var temp = [];
                // t.CopyTo(temp, 0);
                for (var i = 0, len = t.length; i < len; i++) {
                    temp[i] = t[i];
                }
                list.push(temp);
            }
            else {
                for (var i = startIndex; i <= endIndex; i++) {
                    var tmp = t[startIndex];
                    t[startIndex] = t[i];
                    t[i] = tmp;
                    this.GetPermutation4Void(list, t, startIndex + 1, endIndex);
                    var tmp = t[startIndex];
                    t[startIndex] = t[i];
                    t[i] = tmp;
                }
            }
        };
        /// <summary>
        /// 求从起始标号到结束标号的排列，其余元素不变
        /// </summary>
        /// <param name="t">所求数组</param>
        /// <param name="startIndex">起始标号</param>
        /// <param name="endIndex">结束标号</param>
        /// <returns>从起始标号到结束标号排列的范型</returns>
        RandomAll.GetPermutation3Re = function (t, startIndex, endIndex) {
            if (startIndex < 0 || endIndex > t.length - 1) {
                return null;
            }
            var list = [];
            this.GetPermutation4Void(list, t, startIndex, endIndex);
            return list;
        };
        /// <summary>
        /// 返回数组所有元素的全排列
        /// </summary>
        /// <param name="t">所求数组</param>
        /// <returns>全排列的范型</returns>
        RandomAll.GetPermutation1 = function (t) {
            return this.GetPermutation3Re(t, 0, t.length - 1);
        };
        /// <summary>
        /// 求数组中n个元素的排列
        /// </summary>
        /// <param name="t">所求数组</param>
        /// <param name="n">元素个数</param>
        /// <returns>数组中n个元素的排列</returns>
        RandomAll.GetPermutation2 = function (t, n) {
            if (n > t.length) {
                return null;
            }
            var list = [];
            var c = this.GetCombination(t, n);
            for (var i = 0; i < c.length; i++) {
                var l = [];
                this.GetPermutation4Void(l, c[i], 0, n - 1);
                list.push(l);
            }
            return list;
        };
        /// <summary>
        /// 求数组中n个元素的组合
        /// </summary>
        /// <param name="t">所求数组</param>
        /// <param name="n">元素个数</param>
        /// <returns>数组中n个元素的组合的范型</returns>
        RandomAll.GetCombination = function (t, n) {
            if (t.length < n) {
                return null;
            }
            var temp = [];
            var list = [];
            this.GetCombination6(list, t, t.length, n, temp, n);
            return list;
        };
        return RandomAll;
    }());
    mahjong.RandomAll = RandomAll;
})(mahjong || (mahjong = {}));
var mahjong;
(function (mahjong) {
    /**
     * 基础玩法麻将的比对表
     * 1.任意一对可为将
     * 2.无 春夏秋冬、梅兰竹菊 牌
     * 3.风牌（中、发、白、东、南、西、北）只有三种一样时，方可成一句牌
     * 4.无法识别7对、13幺、将一色、风一色等特殊胡法
     *
     * 根据癞子个数，分别生成如下36张表
     * 赖子个数     带将表        不带将的表         字牌带将表             字牌不带将表
        0        eye_table_0     table_0       feng_eye_table_0        feng_table_0
        1        eye_table_1     table_1       feng_eye_table_0        feng_table_1
        2        eye_table_2     table_2       feng_eye_table_0        feng_table_2
        3        eye_table_3     table_3       feng_eye_table_0        feng_table_3
        4        eye_table_4     table_4       feng_eye_table_0        feng_table_4
        5        eye_table_5     table_5       feng_eye_table_0        feng_table_5
        6        eye_table_6     table_6       feng_eye_table_0        feng_table_6
        7        eye_table_7     table_7       feng_eye_table_0        feng_table_7
        8        eye_table_8     table_8       feng_eye_table_0        feng_table_8
     */
    var TableBasic = /** @class */ (function () {
        function TableBasic() {
        }
        TableBasic.createAndTestTable = function (testJokerCount) {
            var hasFile = fs.existsSync('./' + this.fileName + '/');
            if (!hasFile) {
                fs.mkdirSync('./' + this.fileName + '/');
            }
            var myFilePathPre = [
                './' + this.fileName + '/table_',
                './' + this.fileName + '/feng_table_',
                './' + this.fileName + '/eye_table_',
                './' + mahjong.TableBasic.fileName + '/feng_eye_table_'
            ];
            var compareFilePathPre = [
                './' + this.fileName + '/tbl/table_',
                './' + this.fileName + '/tbl/feng_table_',
                './' + this.fileName + '/tbl/eye_table_',
                './' + this.fileName + '/tbl/feng_eye_table_'
            ];
            for (var j = 0, lenj = 4; j < lenj; j++) {
                this.createTableN(testJokerCount, j);
                for (var i = 0, len = testJokerCount + 1; i < len; i++) {
                    trace('\nTest joker count:' + i);
                    var rs = this.readFile(myFilePathPre[j] + i + '.txt');
                    var rs1 = this.readFile(compareFilePathPre[j] + i + '.tbl');
                    this.compairTwoTable(rs, rs1);
                }
            }
        };
        /**
         * 构建查表法的表
         * @param {number} joker 癞子数量
         * @param {number} type 0-不带将的表 1-字牌不带将表 2-带将表 3字牌带将表
         * @param {boolean} help 默认false即可
         *
         */
        TableBasic.createTableN = function (joker, type, help) {
            if (help === void 0) { help = false; }
            var funs = [
                'createTable',
                'createFengTable',
                'createEyeTable',
                'createFengEyeTable'
            ];
            var filePathPre = [
                './' + TableBasic.fileName + '/table_',
                './' + TableBasic.fileName + '/feng_table_',
                './' + TableBasic.fileName + '/eye_table_',
                './' + TableBasic.fileName + '/feng_eye_table_'
            ];
            if (joker <= 0) {
                var fun = funs[type];
                trace('\n' + fun);
                return this[fun](help);
            }
            var file = filePathPre[type] + joker + '.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var prevTables = this.createTableN(joker - 1, type, true);
            var reduceValue = [
                0x100000000,
                0x010000000,
                0x001000000,
                0x000100000,
                0x000010000,
                0x000001000,
                0x000000100,
                0x000000010,
                0x000000001
            ];
            var all = [];
            for (var i = 0, len = prevTables.length; i < len; i++) {
                var el = prevTables[i];
                var oldHex = this.strToHex(el);
                for (var j = 0, lenj = reduceValue.length; j < lenj; j++) {
                    var elj = reduceValue[j];
                    if (this.canReduce(oldHex, elj)) {
                        var newHex = oldHex - elj;
                        if (newHex > 0) {
                            all.push(newHex);
                        }
                    }
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 风/字牌带将表
         * 最多14张，且必须是3*n+2: 2,5,8,11,14
         * 在已经生成的不带将表中一一匹配
         */
        TableBasic.createFengEyeTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableBasic.fileName + '/feng_eye_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var table = this.createFengTable(true);
            var eyes = [
                0x2000000,
                0x0200000,
                0x0020000,
                0x0002000,
                0x0000200,
                0x0000020,
                0x0000002
            ];
            var all = [];
            for (var i = 0, len = table.length; i < len; i++) {
                var el = table[i];
                var hex = this.strToHex(el);
                for (var j = 0, lenj = eyes.length; j < lenj; j++) {
                    var elj = eyes[j];
                    var newHex = hex + elj;
                    all.push(newHex);
                }
            }
            for (var i = 0, len = eyes.length; i < len; i++) {
                var elEye = eyes[i];
                all.push(elEye);
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 风/字牌不带将表
         * 最多12张，且必须是3*n:3,6,9,12
         * 只有AAA结构
         */
        TableBasic.createFengTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableBasic.fileName + '/feng_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var ABC_AAA = [];
            //所有的ABC结构
            //所有的AAA结构
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            //所有3,6,9,12张能胡的
            var keys = [3, 6, 9, 12];
            // keys = [9];
            var all = [];
            for (var i = 0, len = keys.length; i < len; i++) {
                var el = keys[i];
                var huN3 = mahjong.RandomAll.GetCombination(ABC_AAA, el / 3);
                //扁平化处理，将二维数组变一维，同时去掉牌组中4张牌以上的异常组合
                for (var j = 0, lenj = huN3.length; j < lenj; j++) {
                    var ell = huN3[j];
                    var tmpArr = 0x0;
                    for (var k = 0; k < ell.length; k++) {
                        var elK = ell[k];
                        tmpArr += elK;
                    }
                    all.push(tmpArr);
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 带将表
         * 构建万、筒、条的 带将表
         * 最多14张，且必须是3*n+2: 2,5,8,11,14
         * 在已经生成的不带将表中一一匹配
         */
        TableBasic.createEyeTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableBasic.fileName + '/eye_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var table = this.createTable(true);
            var eyes = [
                0x200000000,
                0x020000000,
                0x002000000,
                0x000200000,
                0x000020000,
                0x000002000,
                0x000000200,
                0x000000020,
                0x000000002
            ];
            var all = [];
            for (var i = 0, len = table.length; i < len; i++) {
                var el = table[i];
                var hex = this.strToHex(el);
                for (var j = 0, lenj = eyes.length; j < lenj; j++) {
                    var elj = eyes[j];
                    var newHex = hex + elj;
                    all.push(newHex);
                }
            }
            for (var i = 0, len = eyes.length; i < len; i++) {
                var elEye = eyes[i];
                all.push(elEye);
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex, 4);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 不带将表
         * 构建万、筒、条的 不带将表
         * 最多12张，且必须是3*n:3,6,9,12
         * 方法二：用9位数字的key，匹配
         */
        TableBasic.createTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableBasic.fileName + '/table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var x = 0x111000000;
            var ABC_AAA = [];
            //所有的ABC结构
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            //所有的AAA结构
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            //所有3,6,9,12张能胡的
            var keys = [3, 6, 9, 12];
            // keys = [9];
            var all = [];
            for (var i = 0, len = keys.length; i < len; i++) {
                var el = keys[i];
                var huN3 = mahjong.RandomAll.GetCombination(ABC_AAA, el / 3);
                //扁平化处理，将二维数组变一维，同时去掉牌组中4张牌以上的异常组合
                for (var j = 0, lenj = huN3.length; j < lenj; j++) {
                    var ell = huN3[j];
                    var tmpArr = 0x0;
                    for (var k = 0; k < ell.length; k++) {
                        var elK = ell[k];
                        tmpArr += elK;
                    }
                    all.push(tmpArr);
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex, 4);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 创建count张牌，在3 * 1-9的数字里面随机组合，无重复
         */
        TableBasic.createSimpleTypeThreeCards = function (count) {
            var file = './' + TableBasic.fileName + '/createSimpleTypeThreeCards_' + count + '.txt';
            var hasFile = fs.existsSync(file);
            if (hasFile) {
                var rs = fs.readFileSync(file);
                return JSON.parse(rs);
            }
            var rs = [];
            var cards = [];
            for (var i = 1; i <= 9; i++) {
                cards.push(i);
                cards.push(i);
                cards.push(i);
                cards.push(i);
            }
            var randoms = mahjong.RandomAll.GetCombination(cards, count);
            for (var i = 0, len = randoms.length; i < len; i++) {
                var el = randoms[i];
                el.sort(function (a, b) {
                    if (a < b) {
                        return -1;
                    }
                    return 1;
                });
            }
            fs.writeFile('./' + TableBasic.fileName + '/createSimpleTypeThreeCards_' + count + '.txt', JSON.stringify(randoms), function (err, data) {
                if (err) {
                    throw err;
                }
            });
            return randoms;
        };
        TableBasic.hexToString = function (hex, full) {
            if (full === void 0) { full = false; }
            var rs = hex.toString(16);
            if (!full) {
                return rs;
            }
            for (var i = 0, len = 9 - rs.length; i < len; i++) {
                rs = '0' + rs;
            }
            return rs;
        };
        TableBasic.strToHex = function (str) {
            var rs = parseInt(str, 16);
            return rs;
        };
        TableBasic.arrUnique = function (arr) {
            var newArr = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                var el = arr[i];
                if (newArr.indexOf(el) == -1 && el != '' && el != ' ') {
                    newArr.push(el);
                }
            }
            return newArr;
        };
        TableBasic.readFile = function (file) {
            var hasFile = fs.existsSync(file);
            if (hasFile) {
                var rs = fs.readFileSync(file, 'utf-8');
                var arr = rs.split('\n');
                for (var i = 0, len = arr.length; i < len; i++) {
                    arr[i] = arr[i].replace('\r', '') + '';
                }
                return arr;
            }
        };
        TableBasic.writeFile = function (file, data) {
            // fs.writeFile(file, data.join('\n'), function (err, data) {
            // 	if (err) {
            // 		throw err;
            // 	}
            // 	trace(file + ' 缓存成功');
            // });
            fs.writeFileSync(file, data.join('\n'));
            trace(file + ' 缓存成功');
        };
        TableBasic.compairTwoTable = function (table1, table2) {
            trace(table1.length);
            trace(table2.length);
            var allSame = true;
            for (var i = 0, len = table1.length; i < len; i++) {
                var el = table1[i];
                var table = table2[i];
                if (table2.indexOf(el) == -1) {
                    trace('table2 中少了：', el);
                    allSame = false;
                }
                if (table && table1.indexOf(table) == -1) {
                    trace('table1 中少了：', table2[i]);
                    allSame = false;
                }
                var hex = this.strToHex(el);
                table1[i] = hex.toString(16);
            }
            if (allSame) {
                if (table1.length == 0 || table2.length == 0) {
                    trace('有组为空，无法比对');
                }
                else {
                    trace('2组一样');
                }
            }
        };
        /**
         * 是否超过了12张
         */
        TableBasic.hexHeapOut = function (hex, limit) {
            if (limit === void 0) { limit = 4; }
            var str = this.hexToString(hex);
            var strArr = str.split('');
            var checkKey = [];
            for (var i = 0, len = 16; i < len; i++) {
                if (i > limit) {
                    checkKey.push(this.hexToString(i));
                }
            }
            var bigThen4 = false;
            for (var q = 0; q < checkKey.length; q++) {
                if (strArr.indexOf(checkKey[q]) != -1) {
                    bigThen4 = true;
                    break;
                }
            }
            return bigThen4;
        };
        /**
         * 一个16进制的数是否能进行减法
         */
        TableBasic.canReduce = function (oldHex, reduceValue) {
            var oldStr = this.hexToString(oldHex, true);
            var reduceStr = this.hexToString(reduceValue, true);
            var oldArr = oldStr.split('');
            var reduceArr = reduceStr.split('');
            for (var i = 0, len = oldArr.length; i < len; i++) {
                if (this.strToHex(oldArr[i]) < this.strToHex(reduceArr[i])) {
                    return false;
                }
            }
            return true;
        };
        TableBasic.fileName = 'data';
        return TableBasic;
    }());
    mahjong.TableBasic = TableBasic;
})(mahjong || (mahjong = {}));
var mahjong;
(function (mahjong) {
    /**
     * 查表法的表源
     *
     * 赖子个数     带将表        不带将的表         字牌带将表             字牌不带将表
        0        eye_table_0     table_0       feng_eye_table_0        feng_table_0
        1        eye_table_1     table_1       feng_eye_table_0        feng_table_1
        2        eye_table_2     table_2       feng_eye_table_0        feng_table_2
        3        eye_table_3     table_3       feng_eye_table_0        feng_table_3
        4        eye_table_4     table_4       feng_eye_table_0        feng_table_4
        5        eye_table_5     table_5       feng_eye_table_0        feng_table_5
        6        eye_table_6     table_6       feng_eye_table_0        feng_table_6
        7        eye_table_7     table_7       feng_eye_table_0        feng_table_7
        8        eye_table_8     table_8       feng_eye_table_0        feng_table_8
     */
    var TableSource = /** @class */ (function () {
        function TableSource() {
        }
        TableSource.prototype.buildFromZipFile = function (zipBinFile) {
            var zip = new JSZip(zipBinFile);
            var files = zip['files'];
            var tables = [];
            var feng_tables = [];
            var eye_tables = [];
            var feng_eye_tables = [];
            for (var key in files) {
                var file = files[key];
                var str = file.asText();
                var arr = str.split('\n');
                if (key.indexOf('feng_eye_table_') != -1) {
                    feng_eye_tables.push(arr);
                }
                else if (key.indexOf('feng_table_') != -1) {
                    feng_tables.push(arr);
                }
                else if (key.indexOf('eye_table_') != -1) {
                    eye_tables.push(arr);
                }
                else if (key.indexOf('table_') != -1) {
                    tables.push(arr);
                }
            }
            this.build(tables, feng_tables, eye_tables, feng_eye_tables);
        };
        TableSource.prototype.build = function (tables, fengTables, eyeTables, fengEyeTables) {
            this.eyeTableDics = [];
            for (var i = 0, len = eyeTables.length; i < len; i++) {
                var el = eyeTables[i];
                var obj = {};
                for (var j = 0, lenj = el.length; j < lenj; j++) {
                    var elj = el[j];
                    obj[elj] = true;
                }
                this.eyeTableDics[i] = obj;
            }
            this.tableDics = [];
            for (var i = 0, len = tables.length; i < len; i++) {
                var el = tables[i];
                var obj = {};
                for (var j = 0, lenj = el.length; j < lenj; j++) {
                    var elj = el[j];
                    obj[elj] = true;
                }
                this.tableDics[i] = obj;
            }
            this.fengEyeTableDics = [];
            for (var i = 0, len = fengEyeTables.length; i < len; i++) {
                var el = fengEyeTables[i];
                var obj = {};
                for (var j = 0, lenj = el.length; j < lenj; j++) {
                    var elj = el[j];
                    obj[elj] = true;
                }
                this.fengEyeTableDics[i] = obj;
            }
            this.fengTableDics = [];
            for (var i = 0, len = fengTables.length; i < len; i++) {
                var el = fengTables[i];
                var obj = {};
                for (var j = 0, lenj = el.length; j < lenj; j++) {
                    var elj = el[j];
                    obj[elj] = true;
                }
                this.fengTableDics[i] = obj;
            }
        };
        return TableSource;
    }());
    mahjong.TableSource = TableSource;
})(mahjong || (mahjong = {}));
var mahjong;
(function (mahjong) {
    /**
     * 基础玩法麻将的比对表
     * 1.任意一对可为将
     * 2.无 春夏秋冬、梅兰竹菊 牌
     * 3.风牌（中、发、白、东、南、西、北）只有三种一样时，方可成一句牌
     *
     * 根据癞子个数，分别生成如下36张表
     * 赖子个数     带将表        不带将的表         字牌带将表             字牌不带将表
        0        eye_table_0     table_0       feng_eye_table_0        feng_table_0
        1        eye_table_1     table_1       feng_eye_table_0        feng_table_1
        2        eye_table_2     table_2       feng_eye_table_0        feng_table_2
        3        eye_table_3     table_3       feng_eye_table_0        feng_table_3
        4        eye_table_4     table_4       feng_eye_table_0        feng_table_4
        5        eye_table_5     table_5       feng_eye_table_0        feng_table_5
        6        eye_table_6     table_6       feng_eye_table_0        feng_table_6
        7        eye_table_7     table_7       feng_eye_table_0        feng_table_7
        8        eye_table_8     table_8       feng_eye_table_0        feng_table_8
     */
    var TableNanChang = /** @class */ (function () {
        function TableNanChang() {
        }
        TableNanChang.createAndTestTable = function (testJokerCount) {
            var hasFile = fs.existsSync('./' + this.fileName + '/');
            if (!hasFile) {
                fs.mkdirSync('./' + this.fileName + '/');
            }
            var myFilePathPre = [
                './' + this.fileName + '/table_',
                './' + this.fileName + '/feng_table_',
                './' + this.fileName + '/eye_table_',
                './' + mahjong.TableBasic.fileName + '/feng_eye_table_'
            ];
            var compareFilePathPre = [
                './' + this.fileName + '/tbl/table_',
                './' + this.fileName + '/tbl/feng_table_',
                './' + this.fileName + '/tbl/eye_table_',
                './' + this.fileName + '/tbl/feng_eye_table_'
            ];
            for (var j = 0, lenj = 4; j < lenj; j++) {
                this.createTableN(testJokerCount, j);
                for (var i = 0, len = testJokerCount + 1; i < len; i++) {
                    trace('\nTest joker count:' + i);
                    var rs = this.readFile(myFilePathPre[j] + i + '.txt');
                    var rs1 = this.readFile(compareFilePathPre[j] + i + '.tbl');
                    this.compairTwoTable(rs, rs1);
                }
            }
        };
        /**
         * 构建查表法的表
         * @param {number} joker 癞子数量
         * @param {number} type 0-不带将的表 1-字牌不带将表 2-带将表 3字牌带将表
         * @param {boolean} help 默认false即可
         *
         */
        TableNanChang.createTableN = function (joker, type, help) {
            if (help === void 0) { help = false; }
            var funs = [
                'createTable',
                'createFengTable',
                'createEyeTable',
                'createFengEyeTable'
            ];
            var filePathPre = [
                './' + TableNanChang.fileName + '/table_',
                './' + TableNanChang.fileName + '/feng_table_',
                './' + TableNanChang.fileName + '/eye_table_',
                './' + TableNanChang.fileName + '/feng_eye_table_'
            ];
            if (joker <= 0) {
                var fun = funs[type];
                trace('\n' + fun);
                return this[fun](help);
            }
            var file = filePathPre[type] + joker + '.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var prevTables = this.createTableN(joker - 1, type, true);
            var reduceValue = [
                0x100000000,
                0x010000000,
                0x001000000,
                0x000100000,
                0x000010000,
                0x000001000,
                0x000000100,
                0x000000010,
                0x000000001
            ];
            var all = [];
            for (var i = 0, len = prevTables.length; i < len; i++) {
                var el = prevTables[i];
                var oldHex = this.strToHex(el);
                for (var j = 0, lenj = reduceValue.length; j < lenj; j++) {
                    var elj = reduceValue[j];
                    if (this.canReduce(oldHex, elj)) {
                        var newHex = oldHex - elj;
                        if (newHex > 0) {
                            all.push(newHex);
                        }
                    }
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 风/字牌带将表
         * 最多14张，且必须是3*n+2: 2,5,8,11,14
         * 在已经生成的不带将表中一一匹配
         */
        TableNanChang.createFengEyeTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableNanChang.fileName + '/feng_eye_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var table = this.createFengTable(true);
            var eyes = [
                0x2000000,
                0x0200000,
                0x0020000,
                0x0002000,
                0x0000200,
                0x0000020,
                0x0000002
            ];
            var all = [];
            for (var i = 0, len = table.length; i < len; i++) {
                var el = table[i];
                var hex = this.strToHex(el);
                for (var j = 0, lenj = eyes.length; j < lenj; j++) {
                    var elj = eyes[j];
                    var newHex = hex + elj;
                    all.push(newHex);
                }
            }
            for (var i = 0, len = eyes.length; i < len; i++) {
                var elEye = eyes[i];
                all.push(elEye);
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 风/字牌不带将表
         * 最多12张，且必须是3*n:3,6,9,12
         * 只有AAA结构
         */
        TableNanChang.createFengTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableNanChang.fileName + '/feng_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var ABC_AAA = [];
            //东南西北中发财
            //所有的ABC结构
            ABC_AAA.push(0x0000111);
            ABC_AAA.push(0x1110000);
            ABC_AAA.push(0x1101000);
            ABC_AAA.push(0x1011000);
            ABC_AAA.push(0x0111000);
            ABC_AAA.push(0x0000111);
            ABC_AAA.push(0x1110000);
            ABC_AAA.push(0x1101000);
            ABC_AAA.push(0x1011000);
            ABC_AAA.push(0x0111000);
            ABC_AAA.push(0x0000111);
            ABC_AAA.push(0x1110000);
            ABC_AAA.push(0x1101000);
            ABC_AAA.push(0x1011000);
            ABC_AAA.push(0x0111000);
            ABC_AAA.push(0x0000111);
            ABC_AAA.push(0x1110000);
            ABC_AAA.push(0x1101000);
            ABC_AAA.push(0x1011000);
            ABC_AAA.push(0x0111000);
            //所有的AAA结构
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            //所有3,6,9,12张能胡的
            var keys = [3, 6, 9, 12];
            // keys = [9];
            var all = [];
            for (var i = 0, len = keys.length; i < len; i++) {
                var el = keys[i];
                var huN3 = mahjong.RandomAll.GetCombination(ABC_AAA, el / 3);
                //扁平化处理，将二维数组变一维，同时去掉牌组中4张牌以上的异常组合
                for (var j = 0, lenj = huN3.length; j < lenj; j++) {
                    var ell = huN3[j];
                    var tmpArr = 0x0;
                    for (var k = 0; k < ell.length; k++) {
                        var elK = ell[k];
                        tmpArr += elK;
                    }
                    all.push(tmpArr);
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 带将表
         * 构建万、筒、条的 带将表
         * 最多14张，且必须是3*n+2: 2,5,8,11,14
         * 在已经生成的不带将表中一一匹配
         */
        TableNanChang.createEyeTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableNanChang.fileName + '/eye_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var table = this.createTable(true);
            var eyes = [
                0x200000000,
                0x020000000,
                0x002000000,
                0x000200000,
                0x000020000,
                0x000002000,
                0x000000200,
                0x000000020,
                0x000000002
            ];
            var all = [];
            for (var i = 0, len = table.length; i < len; i++) {
                var el = table[i];
                var hex = this.strToHex(el);
                for (var j = 0, lenj = eyes.length; j < lenj; j++) {
                    var elj = eyes[j];
                    var newHex = hex + elj;
                    all.push(newHex);
                }
            }
            for (var i = 0, len = eyes.length; i < len; i++) {
                var elEye = eyes[i];
                all.push(elEye);
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex, 4);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 不带将表
         * 构建万、筒、条的 不带将表
         * 最多12张，且必须是3*n:3,6,9,12
         * 方法二：用9位数字的key，匹配
         */
        TableNanChang.createTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableNanChang.fileName + '/table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var x = 0x111000000;
            var ABC_AAA = [];
            //所有的ABC结构
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            //所有的AAA结构
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            //所有3,6,9,12张能胡的
            var keys = [3, 6, 9, 12];
            // keys = [9];
            var all = [];
            for (var i = 0, len = keys.length; i < len; i++) {
                var el = keys[i];
                var huN3 = mahjong.RandomAll.GetCombination(ABC_AAA, el / 3);
                //扁平化处理，将二维数组变一维，同时去掉牌组中4张牌以上的异常组合
                for (var j = 0, lenj = huN3.length; j < lenj; j++) {
                    var ell = huN3[j];
                    var tmpArr = 0x0;
                    for (var k = 0; k < ell.length; k++) {
                        var elK = ell[k];
                        tmpArr += elK;
                    }
                    all.push(tmpArr);
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex, 4);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 创建count张牌，在3 * 1-9的数字里面随机组合，无重复
         */
        TableNanChang.createSimpleTypeThreeCards = function (count) {
            var file = './' + TableNanChang.fileName + '/createSimpleTypeThreeCards_' + count + '.txt';
            var hasFile = fs.existsSync(file);
            if (hasFile) {
                var rs = fs.readFileSync(file);
                return JSON.parse(rs);
            }
            var rs = [];
            var cards = [];
            for (var i = 1; i <= 9; i++) {
                cards.push(i);
                cards.push(i);
                cards.push(i);
                cards.push(i);
            }
            var randoms = mahjong.RandomAll.GetCombination(cards, count);
            for (var i = 0, len = randoms.length; i < len; i++) {
                var el = randoms[i];
                el.sort(function (a, b) {
                    if (a < b) {
                        return -1;
                    }
                    return 1;
                });
            }
            fs.writeFile('./' + TableNanChang.fileName + '/createSimpleTypeThreeCards_' + count + '.txt', JSON.stringify(randoms), function (err, data) {
                if (err) {
                    throw err;
                }
            });
            return randoms;
        };
        TableNanChang.hexToString = function (hex, full) {
            if (full === void 0) { full = false; }
            var rs = hex.toString(16);
            if (!full) {
                return rs;
            }
            for (var i = 0, len = 9 - rs.length; i < len; i++) {
                rs = '0' + rs;
            }
            return rs;
        };
        TableNanChang.strToHex = function (str) {
            var rs = parseInt(str, 16);
            return rs;
        };
        TableNanChang.arrUnique = function (arr) {
            var newArr = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                var el = arr[i];
                if (newArr.indexOf(el) == -1 && el != '' && el != ' ') {
                    newArr.push(el);
                }
            }
            return newArr;
        };
        TableNanChang.readFile = function (file) {
            var hasFile = fs.existsSync(file);
            if (hasFile) {
                var rs = fs.readFileSync(file, 'utf-8');
                var arr = rs.split('\n');
                for (var i = 0, len = arr.length; i < len; i++) {
                    arr[i] = arr[i].replace('\r', '') + '';
                }
                return arr;
            }
        };
        TableNanChang.writeFile = function (file, data) {
            // fs.writeFile(file, data.join('\n'), function (err, data) {
            // 	if (err) {
            // 		throw err;
            // 	}
            // 	trace(file + ' 缓存成功');
            // });
            fs.writeFileSync(file, data.join('\n'));
            trace(file + ' 缓存成功');
        };
        TableNanChang.compairTwoTable = function (table1, table2) {
            trace(table1.length);
            trace(table2.length);
            var allSame = true;
            for (var i = 0, len = table1.length; i < len; i++) {
                var el = table1[i];
                var table = table2[i];
                if (table2.indexOf(el) == -1) {
                    trace('table2 中少了：', el);
                    allSame = false;
                }
                if (table && table1.indexOf(table) == -1) {
                    trace('table1 中少了：', table2[i]);
                    allSame = false;
                }
                var hex = this.strToHex(el);
                table1[i] = hex.toString(16);
            }
            if (allSame) {
                if (table1.length == 0 || table2.length == 0) {
                    trace('有组为空，无法比对');
                }
                else {
                    trace('2组一样');
                }
            }
        };
        /**
         * 是否超过了12张
         */
        TableNanChang.hexHeapOut = function (hex, limit) {
            if (limit === void 0) { limit = 4; }
            var str = this.hexToString(hex);
            var strArr = str.split('');
            var checkKey = [];
            for (var i = 0, len = 16; i < len; i++) {
                if (i > limit) {
                    checkKey.push(this.hexToString(i));
                }
            }
            var bigThen4 = false;
            for (var q = 0; q < checkKey.length; q++) {
                if (strArr.indexOf(checkKey[q]) != -1) {
                    bigThen4 = true;
                    break;
                }
            }
            return bigThen4;
        };
        /**
         * 一个16进制的数是否能进行减法
         */
        TableNanChang.canReduce = function (oldHex, reduceValue) {
            var oldStr = this.hexToString(oldHex, true);
            var reduceStr = this.hexToString(reduceValue, true);
            var oldArr = oldStr.split('');
            var reduceArr = reduceStr.split('');
            for (var i = 0, len = oldArr.length; i < len; i++) {
                if (this.strToHex(oldArr[i]) < this.strToHex(reduceArr[i])) {
                    return false;
                }
            }
            return true;
        };
        TableNanChang.fileName = 'data_nanchang';
        return TableNanChang;
    }());
    mahjong.TableNanChang = TableNanChang;
})(mahjong || (mahjong = {}));
/**
 * 麻将的花色
 */
var mahjong;
(function (mahjong) {
    var Type;
    (function (Type) {
        /**
         * 万牌, 一万~九万
         */
        Type[Type["CHARACTER"] = 0] = "CHARACTER";
        /**
         * 筒牌, 一筒~九筒
         */
        Type[Type["DOT"] = 1] = "DOT";
        /**
         * 条牌, 一条~九条
         */
        Type[Type["BAMBOO"] = 2] = "BAMBOO";
        /**
         * 风牌,中、发、白、东、南、西、北
         */
        Type[Type["WIND"] = 3] = "WIND";
        /**
         * 花牌(春夏秋冬 梅兰竹菊)
         */
        Type[Type["DRAGON"] = 4] = "DRAGON";
    })(Type = mahjong.Type || (mahjong.Type = {}));
})(mahjong || (mahjong = {}));
var mahjong;
(function (mahjong) {
    /**
     * 胡牌检查结果
     */
    var CheckResult = /** @class */ (function () {
        function CheckResult() {
        }
        CheckResult.prototype.toString = function () {
            if (!this.discard) {
                return '胡不了';
            }
            return '当打出' + this.discard.toString() + '时，可胡' + this.winCards.join(',') + ',剩余张数分别为:' + this.winCount.join(',');
        };
        return CheckResult;
    }());
    mahjong.CheckResult = CheckResult;
})(mahjong || (mahjong = {}));
var mahjong;
(function (mahjong) {
    /**
     * 秦皇麻将的比对表
     * 1.任意一对可为将
     * 2.无 春夏秋冬、梅兰竹菊 牌
     * 3.风牌（中、发、白、东、南、西、北）只有三种一样时，方可成一句牌， 中发白可组成顺子
     * 4.无法识别7对、13幺、将一色、风一色等特殊胡法
     *
     * 根据癞子个数，分别生成如下36张表
     * 赖子个数     带将表        不带将的表         字牌带将表             字牌不带将表
        0        eye_table_0     table_0       feng_eye_table_0        feng_table_0
        1        eye_table_1     table_1       feng_eye_table_0        feng_table_1
        2        eye_table_2     table_2       feng_eye_table_0        feng_table_2
        3        eye_table_3     table_3       feng_eye_table_0        feng_table_3
        4        eye_table_4     table_4       feng_eye_table_0        feng_table_4
        5        eye_table_5     table_5       feng_eye_table_0        feng_table_5
        6        eye_table_6     table_6       feng_eye_table_0        feng_table_6
        7        eye_table_7     table_7       feng_eye_table_0        feng_table_7
        8        eye_table_8     table_8       feng_eye_table_0        feng_table_8
     */
    var TableQinHuang = /** @class */ (function () {
        function TableQinHuang() {
        }
        TableQinHuang.createAndTestTable = function (testJokerCount) {
            var hasFile = fs.existsSync('./' + this.fileName + '/');
            if (!hasFile) {
                fs.mkdirSync('./' + this.fileName + '/');
            }
            var myFilePathPre = [
                './' + this.fileName + '/table_',
                './' + this.fileName + '/feng_table_',
                './' + this.fileName + '/eye_table_',
                './' + mahjong.TableQinHuang.fileName + '/feng_eye_table_'
            ];
            var compareFilePathPre = [
                './' + this.fileName + '/tbl/table_',
                './' + this.fileName + '/tbl/feng_table_',
                './' + this.fileName + '/tbl/eye_table_',
                './' + this.fileName + '/tbl/feng_eye_table_'
            ];
            for (var j = 0, lenj = 4; j < lenj; j++) {
                this.createTableN(testJokerCount, j);
                for (var i = 0, len = testJokerCount + 1; i < len; i++) {
                    trace('\nTest joker count:' + i);
                    var rs = this.readFile(myFilePathPre[j] + i + '.txt');
                    var rs1 = this.readFile(compareFilePathPre[j] + i + '.tbl');
                    this.compairTwoTable(rs, rs1);
                }
            }
        };
        /**
         * 构建查表法的表
         * @param {number} joker 癞子数量
         * @param {number} type 0-不带将的表 1-字牌不带将表 2-带将表 3字牌带将表
         * @param {boolean} help 默认false即可
         *
         */
        TableQinHuang.createTableN = function (joker, type, help) {
            if (help === void 0) { help = false; }
            var funs = [
                'createTable',
                'createFengTable',
                'createEyeTable',
                'createFengEyeTable'
            ];
            var filePathPre = [
                './' + TableQinHuang.fileName + '/table_',
                './' + TableQinHuang.fileName + '/feng_table_',
                './' + TableQinHuang.fileName + '/eye_table_',
                './' + TableQinHuang.fileName + '/feng_eye_table_'
            ];
            if (joker <= 0) {
                var fun = funs[type];
                trace('\n' + fun);
                return this[fun](help);
            }
            var file = filePathPre[type] + joker + '.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var prevTables = this.createTableN(joker - 1, type, true);
            var reduceValue = [
                0x100000000,
                0x010000000,
                0x001000000,
                0x000100000,
                0x000010000,
                0x000001000,
                0x000000100,
                0x000000010,
                0x000000001
            ];
            var all = [];
            for (var i = 0, len = prevTables.length; i < len; i++) {
                var el = prevTables[i];
                var oldHex = this.strToHex(el);
                for (var j = 0, lenj = reduceValue.length; j < lenj; j++) {
                    var elj = reduceValue[j];
                    if (this.canReduce(oldHex, elj)) {
                        var newHex = oldHex - elj;
                        if (newHex > 0) {
                            all.push(newHex);
                        }
                    }
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 风/字牌带将表
         * 最多14张，且必须是3*n+2: 2,5,8,11,14
         * 在已经生成的不带将表中一一匹配
         */
        TableQinHuang.createFengEyeTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableQinHuang.fileName + '/feng_eye_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var table = this.createFengTable(true);
            var eyes = [
                0x2000000,
                0x0200000,
                0x0020000,
                0x0002000,
                0x0000200,
                0x0000020,
                0x0000002
            ];
            var all = [];
            for (var i = 0, len = table.length; i < len; i++) {
                var el = table[i];
                var hex = this.strToHex(el);
                for (var j = 0, lenj = eyes.length; j < lenj; j++) {
                    var elj = eyes[j];
                    var newHex = hex + elj;
                    all.push(newHex);
                }
            }
            for (var i = 0, len = eyes.length; i < len; i++) {
                var elEye = eyes[i];
                all.push(elEye);
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 风/字牌不带将表
         * 最多12张，且必须是3*n:3,6,9,12
         * 只有AAA结构
         */
        TableQinHuang.createFengTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableQinHuang.fileName + '/feng_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var ABC_AAA = [];
            //所有的ABC结构
            ABC_AAA.push(0x0000111);
            ABC_AAA.push(0x0000111);
            ABC_AAA.push(0x0000111);
            ABC_AAA.push(0x0000111);
            //所有的AAA结构
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            ABC_AAA.push(0x3000000);
            ABC_AAA.push(0x0300000);
            ABC_AAA.push(0x0030000);
            ABC_AAA.push(0x0003000);
            ABC_AAA.push(0x0000300);
            ABC_AAA.push(0x0000030);
            ABC_AAA.push(0x0000003);
            //所有3,6,9,12张能胡的
            var keys = [3, 6, 9, 12];
            // keys = [9];
            var all = [];
            for (var i = 0, len = keys.length; i < len; i++) {
                var el = keys[i];
                var huN3 = mahjong.RandomAll.GetCombination(ABC_AAA, el / 3);
                //扁平化处理，将二维数组变一维，同时去掉牌组中4张牌以上的异常组合
                for (var j = 0, lenj = huN3.length; j < lenj; j++) {
                    var ell = huN3[j];
                    var tmpArr = 0x0;
                    for (var k = 0; k < ell.length; k++) {
                        var elK = ell[k];
                        tmpArr += elK;
                    }
                    all.push(tmpArr);
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 带将表
         * 构建万、筒、条的 带将表
         * 最多14张，且必须是3*n+2: 2,5,8,11,14
         * 在已经生成的不带将表中一一匹配
         */
        TableQinHuang.createEyeTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableQinHuang.fileName + '/eye_table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var table = this.createTable(true);
            var eyes = [
                0x200000000,
                0x020000000,
                0x002000000,
                0x000200000,
                0x000020000,
                0x000002000,
                0x000000200,
                0x000000020,
                0x000000002
            ];
            var all = [];
            for (var i = 0, len = table.length; i < len; i++) {
                var el = table[i];
                var hex = this.strToHex(el);
                for (var j = 0, lenj = eyes.length; j < lenj; j++) {
                    var elj = eyes[j];
                    var newHex = hex + elj;
                    all.push(newHex);
                }
            }
            for (var i = 0, len = eyes.length; i < len; i++) {
                var elEye = eyes[i];
                all.push(elEye);
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex, 4);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 不带将表
         * 构建万、筒、条的 不带将表
         * 最多12张，且必须是3*n:3,6,9,12
         * 方法二：用9位数字的key，匹配
         */
        TableQinHuang.createTable = function (help) {
            if (help === void 0) { help = false; }
            var file = './' + TableQinHuang.fileName + '/table_0.txt';
            var hasFile = fs.existsSync(file + (help ? '.help' : ''));
            if (hasFile) {
                return this.readFile(file + (help ? '.help' : ''));
            }
            var x = 0x111000000;
            var ABC_AAA = [];
            //所有的ABC结构
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            ABC_AAA.push(0x111000000);
            ABC_AAA.push(0x011100000);
            ABC_AAA.push(0x001110000);
            ABC_AAA.push(0x000111000);
            ABC_AAA.push(0x000011100);
            ABC_AAA.push(0x000001110);
            ABC_AAA.push(0x000000111);
            //所有的AAA结构
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            ABC_AAA.push(0x300000000);
            ABC_AAA.push(0x030000000);
            ABC_AAA.push(0x003000000);
            ABC_AAA.push(0x000300000);
            ABC_AAA.push(0x000030000);
            ABC_AAA.push(0x000003000);
            ABC_AAA.push(0x000000300);
            ABC_AAA.push(0x000000030);
            ABC_AAA.push(0x000000003);
            //所有3,6,9,12张能胡的
            var keys = [3, 6, 9, 12];
            // keys = [9];
            var all = [];
            for (var i = 0, len = keys.length; i < len; i++) {
                var el = keys[i];
                var huN3 = mahjong.RandomAll.GetCombination(ABC_AAA, el / 3);
                //扁平化处理，将二维数组变一维，同时去掉牌组中4张牌以上的异常组合
                for (var j = 0, lenj = huN3.length; j < lenj; j++) {
                    var ell = huN3[j];
                    var tmpArr = 0x0;
                    for (var k = 0; k < ell.length; k++) {
                        var elK = ell[k];
                        tmpArr += elK;
                    }
                    all.push(tmpArr);
                }
            }
            all = this.arrUnique(all);
            var rs = [];
            var helpRs = [];
            for (var i = 0, len = all.length; i < len; i++) {
                var elHex = all[i];
                var bigThen4 = this.hexHeapOut(elHex, 4);
                var rsStr = this.hexToString(elHex);
                helpRs.push(rsStr);
                if (!bigThen4) {
                    rs.push(rsStr);
                }
            }
            this.writeFile(file + '.help', helpRs);
            this.writeFile(file, rs);
            if (help) {
                return helpRs;
            }
            return rs;
        };
        /**
         * 创建count张牌，在3 * 1-9的数字里面随机组合，无重复
         */
        TableQinHuang.createSimpleTypeThreeCards = function (count) {
            var file = './' + TableQinHuang.fileName + '/createSimpleTypeThreeCards_' + count + '.txt';
            var hasFile = fs.existsSync(file);
            if (hasFile) {
                var rs = fs.readFileSync(file);
                return JSON.parse(rs);
            }
            var rs = [];
            var cards = [];
            for (var i = 1; i <= 9; i++) {
                cards.push(i);
                cards.push(i);
                cards.push(i);
                cards.push(i);
            }
            var randoms = mahjong.RandomAll.GetCombination(cards, count);
            for (var i = 0, len = randoms.length; i < len; i++) {
                var el = randoms[i];
                el.sort(function (a, b) {
                    if (a < b) {
                        return -1;
                    }
                    return 1;
                });
            }
            fs.writeFile('./' + TableQinHuang.fileName + '/createSimpleTypeThreeCards_' + count + '.txt', JSON.stringify(randoms), function (err, data) {
                if (err) {
                    throw err;
                }
            });
            return randoms;
        };
        TableQinHuang.hexToString = function (hex, full) {
            if (full === void 0) { full = false; }
            var rs = hex.toString(16);
            if (!full) {
                return rs;
            }
            for (var i = 0, len = 9 - rs.length; i < len; i++) {
                rs = '0' + rs;
            }
            return rs;
        };
        TableQinHuang.strToHex = function (str) {
            var rs = parseInt(str, 16);
            return rs;
        };
        TableQinHuang.arrUnique = function (arr) {
            var newArr = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                var el = arr[i];
                if (newArr.indexOf(el) == -1 && el != '' && el != ' ') {
                    newArr.push(el);
                }
            }
            return newArr;
        };
        TableQinHuang.readFile = function (file) {
            var hasFile = fs.existsSync(file);
            if (hasFile) {
                var rs = fs.readFileSync(file, 'utf-8');
                var arr = rs.split('\n');
                for (var i = 0, len = arr.length; i < len; i++) {
                    arr[i] = arr[i].replace('\r', '') + '';
                }
                return arr;
            }
        };
        TableQinHuang.writeFile = function (file, data) {
            // fs.writeFile(file, data.join('\n'), function (err, data) {
            // 	if (err) {
            // 		throw err;
            // 	}
            // 	trace(file + ' 缓存成功');
            // });
            fs.writeFileSync(file, data.join('\n'));
            trace(file + ' 缓存成功');
        };
        TableQinHuang.compairTwoTable = function (table1, table2) {
            trace(table1.length);
            trace(table2.length);
            var allSame = true;
            for (var i = 0, len = table1.length; i < len; i++) {
                var el = table1[i];
                var table = table2[i];
                if (table2.indexOf(el) == -1) {
                    trace('table2 中少了：', el);
                    allSame = false;
                }
                if (table && table1.indexOf(table) == -1) {
                    trace('table1 中少了：', table2[i]);
                    allSame = false;
                }
                var hex = this.strToHex(el);
                table1[i] = hex.toString(16);
            }
            if (allSame) {
                if (table1.length == 0 || table2.length == 0) {
                    trace('有组为空，无法比对');
                }
                else {
                    trace('2组一样');
                }
            }
        };
        /**
         * 是否超过了12张
         */
        TableQinHuang.hexHeapOut = function (hex, limit) {
            if (limit === void 0) { limit = 4; }
            var str = this.hexToString(hex);
            var strArr = str.split('');
            var checkKey = [];
            for (var i = 0, len = 16; i < len; i++) {
                if (i > limit) {
                    checkKey.push(this.hexToString(i));
                }
            }
            var bigThen4 = false;
            for (var q = 0; q < checkKey.length; q++) {
                if (strArr.indexOf(checkKey[q]) != -1) {
                    bigThen4 = true;
                    break;
                }
            }
            return bigThen4;
        };
        /**
         * 一个16进制的数是否能进行减法
         */
        TableQinHuang.canReduce = function (oldHex, reduceValue) {
            var oldStr = this.hexToString(oldHex, true);
            var reduceStr = this.hexToString(reduceValue, true);
            var oldArr = oldStr.split('');
            var reduceArr = reduceStr.split('');
            for (var i = 0, len = oldArr.length; i < len; i++) {
                if (this.strToHex(oldArr[i]) < this.strToHex(reduceArr[i])) {
                    return false;
                }
            }
            return true;
        };
        TableQinHuang.fileName = 'data_qinhuang';
        return TableQinHuang;
    }());
    mahjong.TableQinHuang = TableQinHuang;
})(mahjong || (mahjong = {}));
gameclass.mahjong=mahjong;