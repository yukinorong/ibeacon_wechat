一个利用小程序的库 和 利用 ibeacon 节点进行室内定位的程序。
现在可视化界面还在施工中，并不打算及时完成。
定位精度在2米左右。目前正在加紧优化，之后会添加滤波优化代码。已经码好。

ibeacon定位原理：

 1. 利用uuid获取ibeacon节点信息
 2. 利用rssi测距离。
 3. 利用三点定位算法进行二维定位。
 4. 利用canvas进行平面图绘制。

```flow
st=>start: 利用uuid获取ibeacon节点信息
op=>second: 利用rssi测距离。
th=>third: 利用三点定位算法进行二维定位。
e=>end: 利用canvas进行平面图绘制。

st->op->e
```