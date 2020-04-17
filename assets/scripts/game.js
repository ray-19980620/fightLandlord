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

        pokerCacheData: {
            default: null,
            type: Object
        },

        handPoker: {
            default: null,
            type: Object
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var _this = this;
        _this.watting.enabled = false;
        _this.handPoker = {};
        
        _this.pokerCache();
        setTimeout(function () {
            //_this.displayPoker();
            _this.dealt({'data':[1,2,3,4,5]});
        }, 2000)
        
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
    },

    pokerCache() {
        var _this = this;
        cc.loader.loadResDir('poker', cc.SpriteFrame, function(err, assets) {
            assets.sort(function(x,y){
                return x.name - y.name;
            });
            _this.pokerCacheData = assets;
        });
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
        cc.log(data);
        this.displayPoker(data.data);
        let handPoker = this.handPoker;
        setTimeout(function() {
            for (let key in handPoker) {
                console.log(handPoker[key]);
                handPoker[key].destroy();
            }
        }, 1000)
    },

    displayPoker(data) {
        var _this = this;
        var scene = cc.director.getScene();
        //var a = [1,2,3,4,5,6,7,8,9,10];
        var a = data;
        var windowSize = cc.view.getVisibleSize();
        var interval = windowSize.width / 22;
        
        a.forEach(function(e, index) {
            //console.log(_this.pokerCacheData[e - 1]);
            var name = "node" + e;
            window[name] = new cc.Node(name);
            var sprite = window[name].addComponent(cc.Sprite);
            sprite.spriteFrame = _this.pokerCacheData[e - 1];
            window[name].parent = _this.node;

            var startX = 0 - (a.length / 2) * interval;
            var thisStartX = startX + index * interval;
            var startY = 0 - windowSize.height / 4;
            window[name].setPosition(thisStartX, startY);
            
            //加入手牌
             _this.handPoker[e] = window[name];
        });
        //console.log(_this.handPoker);
    },

    pockerWeight(poker)
    {
        var _this = this;
        var pokerList = new Array();
        poker.forEach(function(e) {
            let weight = _this.pokerMap(e);
        });
        return pokerList;
    },

    pockerMap(poker)
    {
        var map = {
            1 : 14,
            2 : 15,

            3 : 1,
            4 : 2,
            5 : 3,
            6 : 4,
            7 : 5,
            8 : 6,
            9 : 7,
            10 : 8,
            11 : 9,
            12 : 10,
            13 : 11,
            14 : 12,
            15 : 13,

            16 : 1,
            17 : 2,
            18 : 3,
            19 : 4,
            20 : 5,
            21 : 6,
            22 : 7,
            23 : 8,
            24 : 9,
            25 : 10,
            26 : 11,
            27 : 12,
            28 : 13,

            29 : 1,
            30 : 2,
            31 : 3,
            32 : 4,
            33 : 5,
            34 : 6,
            35 : 7,
            36 : 8,
            37 : 9,
            38 : 10,
            39 : 11,
            40 : 12,
            41 : 13,

            42 : 1,
            43 : 2,
            44 : 3,
            45 : 4,
            46 : 5,
            47 : 6,
            48 : 7,
            49 : 8,
            50 : 9,
            51 : 10,
            52 : 11,
            53 : 12,
            54 : 13,
        };
        return map[poker];
    }

    // update (dt) {},
});
