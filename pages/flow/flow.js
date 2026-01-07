// pages/flow/flow.js
var app = getApp()
/**
* params1： url
* params2： 要获取参数
*/
function getQueryString(url, name){
  var reg = new RegExp( name + '=([^&|/?]*)(&|/?|$)', 'i')
  var r = url.match(reg)
  if (r != null) {
      // console.log("r = " + r)
      // console.log("r[2] = " + r[2])
      return r[1]
  }
  return null;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flow_src:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    if(options.scene){
      var url =  decodeURIComponent(options.scene);
      console.log(url)
      var code = getQueryString(url,'code');
      console.log(code)
      this.login(code)
    }else if(options && options.code){
      this.login(options.code)
  }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideHomeButton()
  },
  login(flowCode) {
    // 获取用户信息
    let that = this;
    var requestUrl = app.globalData.requestUrl;
    var appId = wx.getAccountInfoSync().miniProgram.appId;
    wx.showLoading();
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: requestUrl + '/member/manage/flowUserLogin',
            method: "GET",
            header: {
              "Content-Type": "application/json"
            },
            data: {
              code: res.code,
              appId: appId,
              flowCode:flowCode
            },
            success(res) {
              wx.hideLoading()
              console.log("请求用户：", res)
              if (res.data.status == 'success') {
                res.data.retObj
                that.setData({
                  flow_src:res.data.retObj
                })
              } 
            }
          })
        }
      },
      fail(res) {
        wx.hideLoading()
        console.log('请求失败!')
        console.log(res)
      }
    })
  },
})