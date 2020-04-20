## 动态生成变量
```js
let i = 'chicken' + 5;
window[i] = aaa;
console.log(chicken5);
```

## 查找已存在的node
```js
nnn = this.node.getChildByName('nnn');
```

## 数据初始化
- 若想要Object初始化为{},需要在onLoad里
```js
this.obj = {};
```

## prefab使用
- 从层级管理器拖入资源管理器生成prefab
- 删除层级管理器的原节点
```js
var prefab = cc.instantiate(_this.prefabName);
this.node.addChild(prefab);
prefab.setPosition(0, 0);
```

## cc.loader.loadResDir 注意事项
- cc.loader.loadResDir 一次性加载/resources文件夹下指定文件夹下的全部文件。
- 效率不高，需提前加载。
- 异步，顺序会乱。