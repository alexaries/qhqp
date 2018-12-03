/**
 * Created by Administrator on 2018/5/29.
 */
/**
 * Created by Administrator on 2018/5/9.
 */
/**
 * Created by yang on 2016/11/16.
 */

gameclass.zhuanpanList = gameclass.baseui.extend({
    node:null,
    selectType:null,
    houseTableView:null,
    houseListArray:[],
    _requestFrontUrl:null,

    ctor: function () {
        this._super();
        this.selectType=0;
        //this._requestFrontUrl = "http://192.168.100.54:9080";
        this._requestFrontUrl = "http://47.105.36.150:9080";
    },
    show:function(){
        this.node = this.game.uimgr.createnode(res.zhuanpanList,true);
        this.addChild(this.node);

        var listPanel=ccui.helper.seekWidgetByName(this.node,"ListView_1");
        var listPanelArr=listPanel.getChildren();
        listPanelArr[0].setVisible(false);

        var url = this._requestFrontUrl + "/getusergift?uid=" + this.game.modmgr.mod_login.logindata.uid;
        var _this = this;
        RequestURL(url, function (obj) {

            _this.houseListArray = JSON.parse(obj);
            _this.refashRoomList(_this.houseListArray);

        })

        gameclass.createbtnpress(this.node, "closeBtn", function () {
            _this.game.uimgr.closeui("gameclass.zhuanpanList");
        });
        gameclass.createbtnpress(this.node, "Panel_1", function () {
            _this.game.uimgr.closeui("gameclass.zhuanpanList");
        });
    },
    getDate:function(date){
        var d = new Date(date * 1000);    //根据时间戳生成的时间对象

        var date =(d.getFullYear())+
            (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            (d.getHours()) + ":" +
            (d.getMinutes())
        return date;
    },
    refashRoomList:function(data){
        var _this=this;
        var listPanel=ccui.helper.seekWidgetByName(this.node,"ListView_1");
        var listPanelArr=listPanel.getChildren();

        listPanelArr[0].setVisible(false);
        for(var i=listPanelArr.length-1;i>=1;i--){
            listPanel.removeItem(i);
        }
        var _isfristItem=true;
        var _itemIndex=0;
        for(var i=0;i<data.length;i++) {
            var roomItem = null;
            if (_isfristItem) {
                _isfristItem = false;
                roomItem = listPanelArr[0];
                roomItem.setVisible(true);
            } else {
                roomItem = listPanelArr[0].clone();
                listPanel.insertCustomItem(roomItem, _itemIndex);
            }
            _itemIndex++;

            ccui.helper.seekWidgetByName(roomItem, "Text_kind").setString(data[i].giftname);
            var times = data[i].time;
            var str = _this.FormatTime("yy-MM-dd HH:mm:ss",times);
            ccui.helper.seekWidgetByName(roomItem, "Text_time").setString(str);
            var stateText = ccui.helper.seekWidgetByName(roomItem,"Text_state");
            if(data[i].state == 1)
            {
                stateText.setString("未兑换");
            }
            else if(data[i].state == 2)
            {
                stateText.setString("已兑换");
            }
        }
    },
    FormatTime : function (fmt,times) {

        var data = new Date(times * 1000);
        var timeString = "";
        var sYear = new Date(times * 1000).getFullYear();
        var sMon = new Date(times * 1000).getMonth() + 1;
        var sDay = new Date(times * 1000).getDate();
        var sHour = new Date(times * 1000).getHours();
        var sMin = new Date(times * 1000).getMinutes();
        var sMsc = new Date(times * 1000).getSeconds();

        var _func = function(str){
            var newStr = "";
            if(parseInt(str) <=9)
            {
                newStr = "0" + str;
                return newStr;
            }
            else
            {
                return str;
            }
        };
        sHour = _func(sHour);
        sMin = _func(sMin);
        sMsc = _func(sMsc);


        timeString += sYear + "-" +sMon + "-" + sDay;
        timeString += "  " + sHour + ":" + sMin + ":" +sMsc;
        return timeString;

    }
});