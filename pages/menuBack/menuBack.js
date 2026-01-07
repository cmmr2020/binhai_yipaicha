const util = require('../../utils/util.js')
var app = getApp()
/**
 * params1： url
 * params2： 要获取参数
 */
function getQueryString(url, name) {
  var reg = new RegExp(name + '=([^&|/?]*)(&|/?|$)', 'i')
  var r = url.match(reg)
  if (r != null) {
    // console.log("r = " + r)
    // console.log("r[2] = " + r[2])
    return r[1]
  }
  return null;
}
//外部跳转小程序中转页面-接收code
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadShow: 'true',
    menuType:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.loadModal(); //加载动画
    // var code = options.code;
    var govCode = app.gov_code
    // if(options.scene){
    //   var url =  decodeURIComponent(options.scene);
    //      var code = getQueryString(url,'c1');
    //      var project_code = getQueryString(url,'c2');
    //      wx.setStorageSync('code', code)
    //      wx.setStorageSync('project_code', project_code)
    // }else if(options && options.c1){
    //     wx.setStorageSync('code', options.c1)
    //     wx.setStorageSync('project_code', options.c2)
    // }
    that.login(govCode);
  },
  loadModal: function () {
    this.setData({
      loadModal: true
    })
  },
  closeModal: function () {
    this.setData({
      loadModal: false
    })
  },
  login(govCode) {
    // 获取用户信息
    let that = this;
    var requestUrl = app.globalData.requestUrl;
    var appId = wx.getAccountInfoSync().miniProgram.appId;
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: requestUrl + '/member/manage/userLogin',
            method: "GET",
            header: {
              "Content-Type": "application/json"
            },
            data: {
              govCode: govCode,
              code: res.code,
              appId: appId
            },
            success(res) {
              console.log("请求用户：", res)
              if (res.data.status == 'success') {
                // if(res.data.retObj.govDelFlag=='0'){
                //   wx.redirectTo({
                //     url: '../error_tip/error_tip?msgCode=m_10005'
                //   })
                //   return;
                // }
                var app = getApp();
                app.openid = res.data.retObj.openid;
                app.projectId = res.data.retObj.projectId;
                app.projectName = res.data.retObj.projectName;
                app.sessionKey = res.data.retObj.sessionKey;
                app.nickname = res.data.retObj.nickname;
                app.headUrl = res.data.retObj.headUrl;
                app.projectLat = res.data.retObj.projectLat;
                app.projectLog = res.data.retObj.projectLog;
                app.govName = res.data.retObj.govName;
                app.projectExeCity = res.data.retObj.projectExeCity == "0" ? [] : res.data.retObj.projectExeCity;
                app.seesionId = res.header["Set-Cookie"];
                // app.judge = res.data.retObj.openid;
                wx.setStorageSync('projectId', app.projectId)
                wx.setStorageSync('nickname', app.nickname)
                wx.setStorageSync('projectLat', app.projectLat)
                wx.setStorageSync('projectLog', app.projectLog)
                wx.setStorageSync('fontSize', 34);
                wx.setStorageSync('bgColor', 'purple');
                //默认用户未登录,跳转到个人中心,要求先登录
                let menuType = 3;
                if (res.data.retObj2) {
                  var list = res.data.retObj2.qxRole;
                  console.log(list)
                  //var terminalUserName = res.data.retObj2.sysUserName;
                  var departmentName = res.data.retObj2.departmentName
                  app.terminalUserId = res.data.retObj2.sysUserId;
                  app.terminalName = res.data.retObj2.sysUserName.split('#')[1];
                  app.departmentName = departmentName;
                  //此角色只可设置一个  tab-bar最多可配置五个  最少两个
                  for (let i = 0; i < list.length; i++) {
                    let menu = list[i]
                    if (menu.name == '责任单位-P' || menu.name == '责任单位-T') { //整改上报
                      app.deptRoleName = menu.name
                      menuType = 1
                      break;
                    } else if (menu.name == '创文办-T') { //整改审核
                      app.deptRoleName = menu.name
                      menuType = 2
                      break;
                    } else if (menu.name == '调查员-P') { //实地调查
                      app.deptRoleName = menu.name
                      menuType = 0
                      break;
                    } else { //无效有角色
                      menuType = -1
                    }
                  }
                }
                if (menuType < 0) {
                  wx.reLaunch({
                    url: '../error_tip/error_tip?msgCode=m_10008'
                  })
                }
                that.data.menuType = menuType
                that.closeModal(); //关闭加载动画
              } else {
                that.closeModal();
              }
            }
          })
        }
      },
      fail(res) {
        console.log('请求失败!')
        console.log(res)
      }
    })
  },
  jump(){
    let that = this;
    if(that.data.loadModal){//未加载完成 不允许触发
      return
    }
    let menuType = that.data.menuType
    wx.setStorageSync('rightId',menuType)
    that.changeRole(menuType)
    if (menuType == 3) { //公众
      // wx.switchTab({
      //   url: '../public_jubao/public_jubao'
      // })
      wx.switchTab({
        url: '../user/user'
      })
    } else if (menuType == 2) { //创文办
      wx.switchTab({
        url: '../examine_project/examine_project'
      })
    } else if (menuType == 1) { //责任单位
      wx.switchTab({
        url: '../dept_type_task_index/dept_type_task_index'
      })
    } else { //调查员
      wx.switchTab({
        url: '../check_project/check_project'
      })
    }
  },
  //改变tabbar
  changeRole(roleType) {
    wx.setStorageSync('rightId', roleType)
    app.changeUserRight()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})