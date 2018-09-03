//index.js
//获取应用实例
const app = getApp();

function Position(x = 0, y = 0) {
  this.x = x
  this.y = y
}

function Beacon(uuid, posx, posy, rssi = null){
  this.uuid = uuid;
  this.rssi = rssi;
  this.distance = 1;
  this.position = new Position(posx,posy)
}

Beacon.prototype.getDistance = function(){
  if(this.rssi == null){
    this.distance = null
    return;
  }
  var oldDistance = this.distance
  var a = 0.4  //添加系数，减少波动
  var txPower = -69 //hard coded power value. Usually ranges between -59 to -65   
  if (this.rssi == 0) {
    return -1.0;
  }
  var ratio = this.rssi * 1.0 / txPower;
  if (ratio < 1.0) {
    var newDistance = Math.pow(ratio, 10);
  }
  else {
    var newDistance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
  }
  this.distance = oldDistance * (1 - a) + newDistance * a
}
// ,"436401d0-3344-ac5d-1111-cc78ab24d6f2",
var beaconsUUID = ["436401d0-3344-ac5d-1111-cc78ab8e96bb", "436401d0-3344-ac5d-1111-cc78ab1e53d1", "436401d0-3344-ac5d-1111-cc78ab1eec06", "436401d0-3344-ac5d-1111-cc78ab24d6f2", "436401d0-3344-ac5d-1111-cc78ab249de2"];

var mybeacon1 = new Beacon(beaconsUUID[0], 6.38, 3.71)
var mybeacon2 = new Beacon(beaconsUUID[1], 1.70, 3.2)
var mybeacon3 = new Beacon(beaconsUUID[2], 6.38, 0.53)
var mybeacon4 = new Beacon(beaconsUUID[3], 3.88, 1.6)
var mybeacon5 = new Beacon(beaconsUUID[4], 1.70, 0)

var mybeacons = new Array(mybeacon1, mybeacon2, mybeacon3, mybeacon4, mybeacon5)

// 坐标放大系数
var scale = 40
// 坐标偏移量
var offset =  30

var count = 0
var lossSum = 0

// var testBeacons = [
//   { "uuid": "436401d0-3344-ac5d-1111-cc78ab8e96bb", "rssi": -70.3 },
//   { "uuid": "436401d0-3344-ac5d-1111-cc78ab1e53d1", "rssi": -70.3 },
//   { "uuid": "436401d0-3344-ac5d-1111-cc78ab1eec06", "rssi": -71.5 }
// ]

var testBeaconsForComputerPosition = [
  { distance: 2, position: { x: 1, y: 1 } },
  { distance: 2.828, position: { x: 1, y: 5 } },
  { distance: 0, position: { x: 5, y: 5 } }
]

Page({
  data: {
    userPosition: { "x": 3, "y": 1.4 },
    test:0,
    realPosition: { "x": 2, "y": 2 },
    loss:1
  },

  onReady:function(){
    // this.drawCanvas()
  },

  onLoad: function () {
    // main
    this.scanBeacon()
    // console.log(this.computePosition(testBeaconsForComputerPosition))


  //  this.setData({
  //    test: Object.keys(this.data.beaconsData).length
  //  }) 
    // test --distance
    // this.setData({
    //   test: this.calculateDistance(-71.5)
    // })

    // test --show
    // var b = this.initDistance(testBeacons)
    // var page = this
    // this.setData({
    //   userPosition: page.computePosition(b)
    // })
    // this.drawCanvas()
  },

  onHide: function () {
      wx.stopBeaconDiscovery({
          uuids: [beaconsUUID],
      })
  },
  onUnload: function () {
      wx.stopBeaconDiscovery({
          uuids: [beaconsUUID],
      })
  },
 
  //利用前台输入数据，修改模拟真实坐标
  xInput: function (e) {
    var position = new Position(e.detail.value / 100, this.data.realPosition.y)
    this.setData({
      realPosition: position
    })
    count = 0
    lossSum = 0
    this.updateLoss()
  },

  yInput: function (e) {
    var position = new Position(this.data.realPosition.x, e.detail.value / 100)
    this.setData({
      realPosition: position
    })
    count = 0
    lossSum = 0
    this.updateLoss()
  },

  scanBeacon: function() {
    var page = this
    wx.startBeaconDiscovery({
      uuids: beaconsUUID,
      success(res) {
        page.setData({
          console:"实时定位开启"
        })

        wx.onBeaconUpdate((res) => {
          page.updateBeaconsData(res)
          page.drawCanvas()
          console.log("pos:",page.data.userPosition)
        })
      },
      fail(res){
        page.setData({
          console: "请检测蓝牙是否开启并重启小程序"
        })
      }
    })
  },

  

  updateBeaconsData:function(res){
    var page = this

    //利用res信息给 mybeacons 数组赋值， 并利用自带方法求距离distance
    res.beacons.forEach(function(value){
      var v = value
      mybeacons.forEach(function(value){
        // 此处注意名字是否相同
        if(v.uuid == value.uuid && v.rssi != null){
          value.rssi = v.rssi
          value.getDistance()
        }
      })
    })
    // mybeacons赋值完毕


    // 利用a系数减缓变量 减少波动，同时求得新坐标，和与真实位置误差值，（
    // var ax = 1
    // var ay = 1
    // var oldPosition = page.data.userPosition
    // var currentPosition = page.setPosition()
    // var newPosition = new Position(0,0)
    // newPosition.x = oldPosition.x * (1 - ax) + currentPosition.x * ax
    // newPosition.y = oldPosition.y * (1 - ay) + currentPosition.y * ay
    // page.setData({
    //   userPosition: newPosition
    // })

    var position = page.setPosition()
    page.setData({
      userPosition: position
    })
    page.updateLoss()
  },

  // 利用beaconslist 进行数组选择
  setPosition:function(){
    var page = this
    var beaconsList = this.selectBeaconsByEnum(this.selectBeaconsByDistance(4))
    console.log("sbbd::",this.selectBeaconsByDistance(4))
    console.log("blist",beaconsList)
    var xSum = 0
    var ySum = 0

    beaconsList.forEach(function(value){
      var fpos = page.computePosition(value)
      xSum += fpos.x
      ySum += fpos.y
    })

    var xpos = xSum / beaconsList.length
    var ypos = ySum / beaconsList.length
    var position = new Position(xpos, ypos)
    return position
  },

  // based on the formula from http://cdn.intechweb.org/pdfs/13525.pdf
  computePosition: function(beacons){
    var d1 = beacons[0].distance
    var d2 = beacons[1].distance
    var d3 = beacons[2].distance
    var x1 = beacons[0].position.x
    var x2 = beacons[1].position.x
    var x3 = beacons[2].position.x
    var y1 = beacons[0].position.y
    var y2 = beacons[1].position.y
    var y3 = beacons[2].position.y

    var A = (x1 * x1) + (y1 * y1) - (d1 * d1);
    var B = (x2 * x2) + (y2 * y2) - (d2 * d2);
    var C = (x3 * x3) + (y3 * y3) - (d3 * d3);

    var X32 = x3 - x2;
    var X13 = x1 - x3;
    var X21 = x2 - x1;
    var Y32 = y3 - y2;
    var Y13 = y1 - y3;
    var Y21 = y2 - y1;

    var x = ((A * Y32) + (B * Y13) + (C * Y21)) / (2 * ((x1 * Y32) + (x2 * Y13) + (x3 * Y21)));
    var y = ((A * X32) + (B * X13) + (C * X21)) / (2 * ((y1 * X32) + (y2 * X13) + (y3 * X21)));

    var position = new Position(x, y)
    return position
  },

  //画图背景板和节点位置，如何将节点定位位置变成自定义颜色。
  //canvas插入图片，办公室背景
  drawCanvas: function () {
    var context = wx.createCanvasContext('canvas')
    mybeacons.forEach(function (value, index) {
      var xpos = value.position.x * scale + offset
      var ypos = value.position.y * scale + offset
      context.beginPath()
      context.arc(xpos, ypos, 10, 0, 2 * Math.PI)
      context.setFillStyle('grey')
      context.fill()
      context.fillText("beacon " + (index + 1), xpos + 13, ypos + 4);
    })
    var userPosX = this.data.userPosition.x * scale + offset
    var userPosY = this.data.userPosition.y * scale + offset
    context.beginPath()
    context.arc(userPosX, userPosY, 10, 0, 2 * Math.PI, true)
    context.setFillStyle('red')
    context.fill()
    context.fillText("userPosition", userPosX + 13, userPosY + 4);

    context.draw()
  },

  //从主界面上可以设定位置，然后再求距离差loss 
  updateLoss: function () {
    var page = this
    count += 1
    lossSum += Math.sqrt(Math.pow(page.data.realPosition.x - page.data.userPosition.x, 2) + Math.pow(page.data.realPosition.y - page.data.userPosition.y, 2))
    this.setData({
      loss: lossSum/count
    })
    if (count % 100 == 0) {
      count = 0
      lossSum = 0
    }
  },
  // 从当前beacons数组中选择三个，以列表方式返回所有结果
  selectBeaconsByEnum: function (arr) {
    // var arr = mybeacons
    var arr2 = new Array();
    for (var i = 0; i < arr.length; i++) {
      for (var j = i + 1; j < arr.length; j++) {
        for (var k = j + 1; k < arr.length; k++) {
          var item = [arr[i], arr[j], arr[k]];
          arr2.push(item);
        }
      }
    }
    return arr2
  },

  //选择beacons数组距离最近的 n 个节点，距离越近精度越高
  selectBeaconsByDistance: function (n = 3) {
    // var n = 3 // n 为选择最小距离节点数目
    var arr = mybeacons
    // var arr2 = new Array();
    var compare = function (x, y) {//比较函数
      if (x.distance < y.distance) {
        return -1;
      } else if (x.distance > y.distance) {
        return 1;
      } else {
        return 0;
      }
    }
    // arr2.push(arr.sort(compare).slice(0, n));
    return arr.sort(compare).slice(0, n)
  } 

})
