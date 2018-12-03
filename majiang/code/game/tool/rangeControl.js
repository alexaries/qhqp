gameclass.rangeControl = cc.Class.extend({
    _delBtn: null,
    _addBtn: null,
    _rangeTxt: null,
    _min: 0,
    _max: 0,
    _curValue: 0,
    //跳跃值或者跳跃数组
    _offset: 0,
    //跳跃数组
    _offsetArr: [],
    ctor: function (node, min, max, offset) {
        this._node = node;
        this._min = min;
        this._max = max;
        this._offset = offset;

        cc.log(offset instanceof Number);

        this.init();
        this.initView();
        this.initListen();
        this.initialize();
    },
    init: function () {
        this._offsetArr = [];
        this._curValue = this._min;
        if (this._offset.length == 1) {
            this._offset = this._offset[0];
            var next = this._min;
            while (next <= this._max) {
                this._offsetArr.push(next);
                next += this._offset;
            }
        } else {
            this._offsetArr = this._offset;
        }

        this._delBtn = this._node.getChildByName("delBtn");
        this._addBtn = this._node.getChildByName("addBtn");
        this._rangeTxt = this._node.getChildByName("rangeTxt");
    },
    initView: function () {

    },
    initListen: function () {
        this._delBtn.addTouchEventListener(this.clickDelHandle, this);
        this._addBtn.addTouchEventListener(this.clickAddHandle, this);
    },
    initialize: function () {
        this.updateValue();
    },
    clickDelHandle: function (sender, type) {
        if (type != ccui.Widget.TOUCH_ENDED) return;

        var index = this._offsetArr.indexOf(this._curValue);
        if (index < 0) return;

        if (index - 1 >= 0) {
            this._curValue = this._offsetArr[index - 1];
            this.updateValue();
        }
    },
    clickAddHandle: function (sender, type) {
        if (type != ccui.Widget.TOUCH_ENDED) return;

        var index = this._offsetArr.indexOf(this._curValue);
        if (index < 0) return;

        if (index + 1 <= this._offsetArr.length - 1) {
            this._curValue = this._offsetArr[index + 1];
            this.updateValue();
        }
    },
    updateValue: function () {
        this._rangeTxt.setString(this._curValue.toString());
    },
    destroy: function () {
        this._node = null;
    }
});