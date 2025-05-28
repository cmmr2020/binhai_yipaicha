// pages/flow/flow.js
var app = getApp()
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
    this.login(options.code)
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
        console.log('请求失败!')
        console.log(res)
      }
    })
  },
})