const app = getApp();
var requestUrl = ""
Page({

  data: {
    requestUrl: '', //服务器路径
    colorList: ['green', 'blue', 'cyan', 'olive', 'orange', 'red', 'brown', 'pink', 'mauve', 'purple','green', 'blue', 'cyan', 'olive', 'orange', 'red', 'brown', 'pink', 'mauve', 'purple','green', 'blue', 'cyan', 'olive', 'orange', 'red', 'brown', 'pink', 'mauve', 'purple','green', 'blue', 'cyan', 'olive', 'orange', 'red', 'brown', 'pink', 'mauve', 'purple'],
    elements: [],
    fontSize:'',
    bgColorUi:'',
    rightId: wx.getStorageSync('rightId') || 0,
    openId:'',
  },


  onShow:function(){
    let that = this;
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(option) {
    var that = this;
    requestUrl = app.globalData.requestUrl; //服务器路径
    var openId = option.openid;
    var fontSize = wx.getStorageSync('fontSize');
    var bgColorUi = wx.getStorageSync('bgColorUi');
    that.setData({
      requestUrl: requestUrl,
      fontSize:fontSize,
      bgColorUi:bgColorUi,
      openId:openId
    })
    that.getProjectList(openId);
  },


  getProjectList: function(openId) {
    var that = this;
    var requestUrl = that.data.requestUrl; //服务器路径
    var colorList = that.data.colorList;
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + '/public/fieldTask/getPublicProjectListByOpenId',
      {
        userOpenId: openId
      },
      app.seesionId,
      (res) =>{
        var arr = [];
        if (res.data.status == 'success' && res.data.retObj) {
          var projectList = res.data.retObj;
          for (var i = 0; i < projectList.length; i++) {
            var color = colorList[i];
            arr.push({
              color: color,
              id: projectList[i].id,
              code: projectList[i].code,
              name: projectList[i].name,
            })
          }
          that.setData({
            elements: arr,
            tableTitle:'项目列表'
          })
        } else {
          wx.showToast({
            title: '暂无符合条件的结果',
            icon: 'none',
            duration: 1000,
            mask: true
          })
          that.setData({
            tableTitle:'暂无符合条件的结果'
          })
        }

      },
      (err) =>{

      }
    )
  },
  navigate:function(e){
    var projectId = e.currentTarget.dataset.projectid
    wx.navigateTo({
      url: '../jubao/jubao?projectId='+projectId,
    })
    // app.wxRequest(
    //   'GET',
    //   requestUrl + '/mobile/fieldTask/getGovProByWX',
    //   {
    //     projectId: projectId
    //   },
    //   app.seesionId,
    //   (res) =>{
    //     console.log(res)
    //     var govPro = res.data.retObj.govPro
    //     //是否为牵头配合模式
    //     var isDepartType = govPro.isDepartType
    //     wx.navigateTo({
    //       url: '../check_new_index/check_new_index?projectId='+projectId+'&isDepartType='+isDepartType,
    //     })
    //   },
    //   (err) =>{

    //   }
    // )
  },
  changeData: function() {

    this.onLoad(); //最好是只写需要刷新的区域的代码，onload也可，效率低，有点low

  },
})