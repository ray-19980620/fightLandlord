// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

        startButton: {
            default: null,
            type: cc.Button,
        },

        watting: {
            default: null,
            type: cc.Label,
        },

        wattingBaseMessage: '等待其他玩家加入',

        ws: {
            default: null
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.watting.enabled = false;

    },

    start () {
        var _this = this;
        var CanvasNode = cc.find('Canvas');
        _this.connect();
        this.startButton.target.on('touchend', function(event) {
            _this.startPlay();
            let startObj = {
                method: 'match',
                data: {}
            };
            let startStr = JSON.stringify(startObj);
            _this.ws.send(startStr);
        })

        
        _this.displayPoker();
    },

    connect() {
        var _this = this;
        var ws = new WebSocket("ws://45.76.210.201:5200");
        ws.onopen = function (event) {
            console.log("Send Text WS was opened.");
        };
        ws.onmessage = function (event) {
            console.log(event.data);
            var data = eval('(' + event.data + ')');
            console.log(data.data);
            eval("_this." + data.method + "(data)");
        };
        ws.onerror = function (event) {
            console.log("Send Text fired an error");
        };
        ws.onclose = function (event) {
            console.log("WebSocket instance closed.");
        };
        setTimeout(function () {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send("Hello WebSocket, I'm a text message.");
            }
            else {
                console.log("WebSocket instance wasn't ready...");
            }
        }, 3);

        _this.ws = ws;
    },

    startPlay() {
        this.startButton.target.active = false;
        this.wattingShow();
    },

    wattingShow(data) {
        this.watting.enabled = true;
    },

    wattingPeopleAdd(data) {
        cc.log(data);
        let newStr = this.wattingBaseMessage + data.data + '/3';
        this.watting.string = newStr;
    },

    wattingHidden() {
        this.watting.enabled = false;
    },

    dealt(data) {
        cc.log(data)
    },

    displayPoker(data) {
        var _this = this;
        var scene = cc.director.getScene();
        var a = [1,2,3,4,5,6,7,8,9,10];
        var jiange = 50;
        cc.loader.loadResDir("poker", cc.SpriteFrame, function (err, assets) {
            // assets 是一个 SpriteFrame 数组，已经包含了图集中的所有 SpriteFrame。
            // 而 loadRes('test assets/sheep', cc.SpriteAtlas, function (err, atlas) {...}) 获得的则是整个 SpriteAtlas 对象。
            var nowList = [];
            a.forEach(function(e) {
                cc.log(e);
                nowList.push(assets[e - 1]);
            });
            //cc.log(assets);return false;
            nowList.forEach(function(e, index) {
                //cc.log(e);
                var aaa = new cc.Node('Sprite');
                var sp = aaa.addComponent(cc.Sprite);
                sp.spriteFrame = e;
                aaa.parent = _this.node;

                let windowSize=cc.view.getVisibleSize();
                let startX = 0 - (windowSize.width * 0.8 / 2);
                let p = startX + index * jiange;

                aaa.setPosition(p, 0);
            })
        });
    }

    // update (dt) {},
});
