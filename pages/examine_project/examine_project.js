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
    console.log('项目列表')
    var that = this;
    requestUrl = app.globalData.requestUrl; //服务器路径
    var fontSize = wx.getStorageSync('fontSize');
    var bgColorUi = wx.getStorageSync('bgColorUi');
    that.setData({
      requestUrl: requestUrl,
      fontSize:fontSize,
      bgColorUi:bgColorUi
    })
    
    var terminalUserId = app.terminalUserId;
    // console.log(terminalUserId)
    that.getProjectList(terminalUserId);
  },


  getProjectList: function(terminalUserId) {
    var that = this;
    var requestUrl = that.data.requestUrl; //服务器路径
    var colorList = that.data.colorList;
    
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + '/public/fieldTask/getPublicProjectList',
      {
        userId: terminalUserId
      },
      app.seesionId,
      (res) =>{
        var arr = [];
        if (res.data.status == 'success') {
          var projectList = res.data.retObj;
          for (var i = 0; i < projectList.length; i++) {
            var color = colorList[i];
            arr.push({
              color: color,
              id: projectList[i].id,
              code: projectList[i].code,
              // createBy: projectList[i].createBy,
              // createTime: projectList[i].createTime,
              // isCheck: projectList[i].isCheck,
              // isConsistent: projectList[i].isConsistent,
              // isGrade: projectList[i].isGrade,
              // latitude: projectList[i].latitude,
              // longitude: projectList[i].longitude,
              name: projectList[i].name,
              // status: projectList[i].status,
              // updateBy: projectList[i].updateBy,
              // updateTime: projectList[i].updateTime,
              // version: projectList[i].version
            })
          }

          that.setData({
            elements: arr
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000,
            mask: true
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
      url: '../check_new_index/check_new_index?projectId='+projectId,
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