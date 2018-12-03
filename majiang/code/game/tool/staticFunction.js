var staticFunction = staticFunction || {};

/**
 * 获取本地缓存，待写入缓存时使用
 */
staticFunction.getStorages = function (storageKey) {
    var localStr = cc.sys.localStorage.getItem(storageKey);
    if (localStr) {
        var obj = JSON.parse(localStr);
        return obj;
    }
    return {};
};
/**
 * 获取本地缓存
 */
staticFunction.getStorage = function (storageKey, key) {
    var localStr = cc.sys.localStorage.getItem(storageKey);
    if (localStr) {
        var obj = JSON.parse(localStr);
        if (obj[key] || obj[key] == 0) {
            return obj[key];
        }
    }
    return null;
};
/**
 * 写入本地缓存
 */
staticFunction.setStorages = function (storageKey, ob) {
    cc.sys.localStorage.setItem(storageKey, JSON.stringify(ob));
};
/**
 * 写入本地缓存
 */
staticFunction.setStorage = function (storageKey, key, value) {
    var obj = staticFunction.getStorages(storageKey);
    obj[key] = value;
    staticFunction.setStorages(storageKey, obj);
};
/**
 * 根据格林威治时间获取标准显示时间
 * @param date
 */
staticFunction.getStandardTime = function (date) {
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
};
/**
 * 填充所有元素为0的数组
 */
staticFunction.initZeroArray = function (len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr[i] = 0;
    }
    return arr;
};
staticFunction.playUserTalk = function (key, sex,isPao) {
    staticFunction.playMp3Check(key,sex,isPao);
},
    staticFunction.playMp3Check = function (key,sex,isPao) {
        var str = g_music[key];
        // cc.log("key=="+key+",str=="+str);
        if(sex == 0)
        {

        }else if(sex == 1)
        {
            var strArr = str.split(",");
            if (strArr.length > 1) {
                var muNum = parseInt(strArr[1]);
                var randomNum = parseInt(Math.random() * muNum);
                var url = strArr[0] + "_" + randomNum + ".mp3";
                mod_sound.playeffect(url);
            } else {
                if(isPao)
                {
                    mod_sound.playeffect(g_music["mjClick"]);
                }
                else
                {
                    mod_sound.playeffect(str);
                }

            }
        }

    };
staticFunction.addTabBtn = function (btn, $normalImg, $selectImg, offX, offY) {
    btn.setTouchEnabled(true);

    var normalContain = btn.getChildByName("normal");
    var normalTxt = staticFunction.addSpriteToSprite(normalContain, $normalImg);
    normalTxt.setName("normalTxt");

    var selectContain = btn.getChildByName("select");
    var selectTxt = staticFunction.addSpriteToSprite(selectContain, $selectImg);
    selectTxt.setName("selectTxt");

    return [normalTxt, selectTxt];
};
staticFunction.addSpriteToSprite = function (parent, childUrl) {
    var child = new cc.Sprite(childUrl);
    parent.addChild(child);
    child.setPosition(cc.p(parent.getContentSize().width / 2, parent.getContentSize().height / 2));
    return child;
};
staticFunction.numCheck = function (cards, card) {
    var result = 0;
    for (var i = 0; i < cards.length; i++) {
        if (cards[i] == card) {
            result++;
        }
    }
    return result
}
//根据列表获取数量集对象
staticFunction.getArrayNumObj = function (numArr) {
    var cardNumObj = {};
    var len = numArr.length;
    for (var i = 0; i < len; i++) {
        var card = numArr[i];
        if (!cardNumObj[card]) {
            cardNumObj[card] = 0;
        }
        cardNumObj[card]++;
    }
    return cardNumObj;
};
//从数组中移除指定数量的元素
staticFunction.delElementFromArr = function (numArr, element, num) {
    for (var i = 0; i < num; i++) {
        var index = numArr.indexOf(element);
        if (index >= 0) {
            numArr.splice(index, 1);
        }
    }
    return numArr;
}
staticFunction.getCardNumFromObj = function (cardNumObj, card) {
    for (var key in cardNumObj) {
        if (key == card) return cardNumObj[key];
    }
    return 0;
};
//检查是否将牌
staticFunction.checkIsJiang = function (card) {
    var index = StaticData.JIANG_ARR.indexOf(card);
    if (index >= 0) return 1;
    return 0;
};
//胡牌递归检测
staticFunction.checkHuRecursion = function (cards, cardNumObj, isNeedJiang, isGetJiang) {
    var len = cards.length;
    if (len == 0) return 1;
    for (var i = 0; i < len; i++) {
        var card = cards[i];
        if (card < gameclass.HLGC_MAX_TxtCARD_NUM) {
            if (cards[i + 1] != null && cards[i + 2] != null && cards[i] + 1 == cards[i + 1] && cards[i + 1] + 1 == cards[i + 2]) {
                var secondCard = cards[i + 1];
                var threeCard = cards[i + 2];
                cardNumObj[card]--;
                cardNumObj[secondCard]--;
                cardNumObj[threeCard]--;
                cards = staticFunction.delElementFromArr(cards, card, 1);
                cards = staticFunction.delElementFromArr(cards, secondCard, 1);
                cards = staticFunction.delElementFromArr(cards, threeCard, 1);

                return staticFunction.checkHuRecursion(cards, cardNumObj, isNeedJiang, isGetJiang);
            }
        }
        if (cardNumObj[card] == 2 && !isGetJiang) {
            if (isNeedJiang) {
                var isJiang = staticFunction.checkIsJiang(card);
                if (isJiang) {
                    isGetJiang = true;
                    cardNumObj[card] = 0;
                    cards = staticFunction.delElementFromArr(cards, card, 2);
                    return staticFunction.checkHuRecursion(cards, cardNumObj, isNeedJiang, isGetJiang);
                }
            } else {
                isGetJiang = true;
                cardNumObj[card] = 0;
                cards = staticFunction.delElementFromArr(cards, card, 2);
                return staticFunction.checkHuRecursion(cards, cardNumObj, isNeedJiang, isGetJiang);
            }
        } else if (cardNumObj[card] == 3) {
            cardNumObj[card] = 0;
            cards = staticFunction.delElementFromArr(cards, card, 3);
            return staticFunction.checkHuRecursion(cards, cardNumObj, isNeedJiang, isGetJiang);
        }
    }
    return 0;
};
staticFunction.getScaleSize = function () {
    var result = new cc.size(0, 0);
    var fw = cc.winSize.width / 1136;
    var fh = cc.winSize.height / 640;

    var w = cc.winSize.width;
    var h = cc.winSize.height;

    cc.log("fw=" + fw + ",fh=" + fh);

    if (fw >= fh) {
        // result.width = fw;
        // result.height = fh
    } else {

    }
};
staticFunction.loadNetIcon = function (parent, url, loadCallback) {
    var sprite = new cc.Sprite();
    sprite.retain();
    cc.loader.loadImg(url, {isCrossOrigin: true}, function (res, tex) {
        // cc.log("url=" + url + ",res=" + res);
        if (typeof(tex) != "undefined" && tex != null) {
            var texture = tex;
            if (!cc.sys.isNative) {
                var texture2d = new cc.Texture2D();
                texture2d.initWithElement(tex);
                texture2d.handleLoadedTexture();
                texture = texture2d;
            }
            var size = texture.getContentSize();
            sprite.initWithTexture(texture);
            sprite.setPosition(cc.p(parent.getContentSize().width / 2, parent.getContentSize().height / 2));
            parent.addChild(sprite);
            if (loadCallback) {
                loadCallback();
            }
            sprite.release();
        } else if (typeof(res) != "undefined") {
            //cc.log("res:" + res);
        }
    });
};

