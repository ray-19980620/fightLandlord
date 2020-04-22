// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

/* To-do
* 1.注册触摸事件
* 2.不出、出牌按钮及点击出牌获取牌并在后台校验合法情况下destroy
* 3.拿出地主牌
* 4.查清先手顺序
* 5.解决玩家操作顺序问题
* 6.玩家每轮操作倒计时
* 7.抢地主逻辑
* 8.
*/

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
        },

        readyPoker: {
            default: null,
            type: Array
        },

        playButton: {
            default: null,
            type: cc.Prefab
        },

        noPlayButton: {
            default: null,
            type: cc.Prefab
        },

        noticeLable: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var _this = this;
        _this.watting.enabled = false;
        _this.handPoker = {};
        _this.readyPoker = [];
        
        _this.pokerCache();
        // setTimeout(function () {
        //     _this.displayPoker([7,6,5,4,3,2,1]);
        //     _this.dealt({'data':[7,6,5,4,3,2,1]});
        // }, 2000)
        //_this.isItYourTurn();
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
        var ws = new WebSocket("ws://119.23.223.46:5200");
        ws.onopen = function (event) {
            console.log("Send Text WS was opened.");
        };
        ws.onmessage = function (event) {
            console.log(event.data);
            var data = eval('(' + event.data + ')');
            //console.log(data.data);
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

    isItYourTurn(data) {
        //data.countdown
        var _this = this;

        var playButton = cc.instantiate(_this.playButton);
        _this.node.addChild(playButton);
        playButton.setPosition(150, -50);

        //出牌
        playButton.on('mousedown', function(event) {
            console.log(_this.readyPoker);
            var readySend = new Array();
            _this.readyPoker.forEach(function(e, index) {
                readySend.push(index);
            });
            let sendData = {
                method: 'fuck',
                data: {
                    poker: readySend
                }
            };
            let sendDataStr = JSON.stringify(sendData);
            var a = _this.ws.send(sendDataStr);
        });

        var noPlayButton = cc.instantiate(_this.noPlayButton);
        _this.node.addChild(noPlayButton);
        noPlayButton.setPosition(-150, -50);
        //不出
        noPlayButton.on('mousedown', function(event) {
            console.log('不出');
            let sendData = {
                method: 'pass',
                data: {}
            };
            let sendDataStr = JSON.stringify(sendData);
            var a = _this.ws.send(sendDataStr);
        });
    },

    dealt(data) {
        var _this = this;
        cc.log(data);

        //渲染
        this.displayPoker(data.data);
        //销毁
        let handPoker = this.handPoker;
        setTimeout(function() {
            for (let key in handPoker) {
                //console.log(handPoker[key]);
                handPoker[key].destroy();
            }
            _this.handPoker = [];

            var newOrder = _this.orderPoker(data.data);
            _this.displayPoker(newOrder);
        }, 1000);

    },

    displayPoker(data, type) {
        var _this = this;
        console.log(data);
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
            window[name].poker = e;
            window[name].parent = _this.node;

            var startX = 0 - (a.length / 2) * interval + interval / 2;
            var thisStartX = startX + index * interval;
            if (type == 'fuck') {
                var startY = 80;
            } else {
                var startY = 0 - windowSize.height / 3;
            }
            
            window[name].setPosition(thisStartX, startY);

            //注册点击事件
            if (type != 'fuck') {
                window[name].on('mousedown', function(event) {
                    event.stopPropagation();
                    //console.log(event.target.poker);
                    let thisSprite = _this.handPoker[event.target.poker];
                    let poker = event.target.poker;

                    if (!_this.readyPoker[poker]) {
                        _this.readyPoker[poker] = new Array();
                        var newY = thisSprite.y + 35;
                    } else if (_this.readyPoker[poker]) {
                        delete _this.readyPoker[poker];
                        var newY = thisSprite.y - 35;
                    }
                    thisSprite.setPosition(thisSprite.x, newY);
                })
            }

            //注册触摸事件
            
            
            //加入手牌
             _this.handPoker[e] = window[name];
        });
        //console.log(_this.handPoker);
    },

    orderPoker(poker) {
        var _this = this;
        //洗牌按照权重排序
        var poker = poker;
        console.log(poker);
        let weightArr = new Array();
        let fWeightArr = new Array();
        //权重map
        poker.forEach(function(e, index) {
            //console.log(e);
            let weight = _this.pockerMap(e);
            weightArr[e] = weight;
        });
        //生成与权重arr
        //console.log(weightArr);
        poker.forEach(function(e, index) {
            fWeightArr[e] = new Array();
            fWeightArr[e]['weight'] = weightArr[e];
            fWeightArr[e]['index'] = e;
        });
        //排序
        fWeightArr.sort(function(x, y) {
            return y['weight'] - x['weight'];
        });
        
        //生成新牌序
        let newPokerOrder = new Array();
        fWeightArr.forEach(function(e, index) {
            newPokerOrder[index] = e.index;
        });
        //console.log(newPokerOrder);
        //渲染
        return newPokerOrder;
    },

    gameNotice(data) {
        var _this = this;
        var msg = data.data.msg;
        var noticeLable = cc.instantiate(_this.noticeLable);
        noticeLable.getComponent(cc.Label).string = msg;
        _this.node.addChild(noticeLable);
        noticeLable.setPosition(0, 0);
        setTimeout(function() {
            noticeLable.destroy();
        }, 2000);
    },

    hidePlayButton(data) {
        var _this = this;
        var poker = data.data;

        var playButton = this.node.getChildByName('playButton');
        console.log(playButton);
        playButton.destroy();

        var noPlayButton = this.node.getChildByName('noPlayButton');
        console.log(noPlayButton);
        noPlayButton.destroy();

        if (poker.length <= 0) {
            return false;
        }

        let handPoker = _this.handPoker;
        for (let key in handPoker) {
            handPoker[key].destroy();
        }

        //重新渲染
        var newOrder = this.orderPoker(data.data);
        _this.displayPoker(newOrder);
    },

    anotherNumberChange(data) {
        var _this = this;
        console.log(data);
        var remainPokerLen = data.data.remainPokerLen;
        var thisRoundPoker = data.data.thisRoundPoker;

        var newOrder = this.orderPoker(thisRoundPoker);
        _this.displayPoker(newOrder, 'fuck');
    },

    pockerWeight(poker) {
        var _this = this;
        var pokerList = new Array();
        poker.forEach(function(e) {
            let weight = _this.pokerMap(e);
        });
        return pokerList;
    },


    pockerMap(poker) {
        var map = {
            1 : 15,
            2 : 14,

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
    },


    // update (dt) {},
});
