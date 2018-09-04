##利用小程序的ibeacon库，进行室内定位

一个利用小程序的库 和 利用 ibeacon 节点进行室内定位的程序。

现在可视化界面还在施工中，并不打算及时完成。 :)

定位精度在2米左右。目前正在加紧优化。

滤波代码已经添加，用的是卡尔曼滤波算法。

单个节点定位精度达到了1米左右，二维定位的精度还在改进

##程序算法流程图演示：
```flow
op=>operation: 利用uuid获取ibeacon节点信息
op1=>operation: 利用rssi测距离。
op2=>operation: 利用三点定位算法进行二维定位。
op3=>operation: 利用canvas进行平面图绘制。

op->op1->op2->op3->op1
```