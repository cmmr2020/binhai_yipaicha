//个人中心页面
import router from '../../utils/router.js';
const util = require('../../utils/util_time.js')
var app = getApp()
//各tab参数 
var request_dataParam_map = new Map();
Page({
  data: {
    requestUrl: '', //服务器路径
    tab: [{
      id: 4,
      name: '待审核'
    },{
      id: 1,
      name: '有效信息'
    },{
      id: 0,
      name: '无效信息'
    }],
    TabCur: 4,
    //任务列表初始页（默认1）
    pagenum: 1,
    //赋值任务列表总页数（默认1）
    maxPageNum: 1,
    //问题集合
    quesList: [],
    //空内容提示标识
    isNull: '',
    //openid
    openid: '',
    fontSize: '',
    fontSize35: '',
    fontSize28: '',
    fontSize20: '',
    bgColor: '',
    isNull: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    var that = this;
    var requestUrl = app.globalData.requestUrl;
    var openId = options.openid
    var projectId = options.projectId;
    var fontSize = wx.getStorageSync('fontSize');
    var bgColor = wx.getStorageSync('bgColor');
    this.setData({
      openid: options.openid,
      projectid: projectId,
      requestUrl: requestUrl,
      fontSize: fontSize,
      bgColor: bgColor,
      fontSize35: parseInt(fontSize) + 2,
      fontSize28: parseInt(fontSize) - 2,
      fontSize20: parseInt(fontSize) - 10,
    })
    this.getQuesList();
  },
  tabSelect(e) {
    console.log(e)
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      //每次切换问题，给pagenum重新赋值为1
      pagenum: 1,
      //每次切换问题，清空问题列表
      quesList: [],
      pageCount: 0, //总任务数
      maxPageNum: 0, //总页数
    })
    this.getQuesList()
  },
  // TabCur 4待审核  1有效答案  0 无效答案
  getQuesList: function (pageSize,pageScrollto_id) {
    var that = this;
    var requestUrl = that.data.requestUrl; //服务器路径
    var pageNum = that.data.pagenum; //当前页
    var TabCur = that.data.TabCur//当前tab
    var openId = that.data.openid
    var projectId = that.data.projectid
    if (request_dataParam_map.has(that.data.TabCur)) {
      that.setData({
        task_request_dataParam: request_dataParam_map.get(that.data.TabCur),
      })
    } else {
      that.setData({
        task_request_dataParam: {},
      })
    }
    //当前tab
    if (TabCur >= 0) {
      that.data.task_request_dataParam.projectId = projectId;
      that.data.task_request_dataParam.page = pageNum;
      if (!pageSize) {
        that.data.task_request_dataParam.pageSize = 5;
      } else {
        that.data.task_request_dataParam.pageSize = pageSize;
      }
      that.data.task_request_dataParam.openId = openId;
      that.data.task_request_dataParam.status = TabCur
    }
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/home/manage/selectAnswerExamineList2ByWX", 
      that.data.task_request_dataParam,
      app.seesionId,
      (res) => {
        //console.log("问题列表：", res);
        if (res.data.status === "success" && res.data.retObj) {
          var res = res.data.retObj
          console.log("问题列表：", res.list);
          if(res.list && res.list.length > 0){
            that.setData({
              quesList: that.data.quesList.concat(res.list),
              pageCount: res.count, //总任务数
              maxPageNum: res.pageCount, //总页数
              isNull: '',
              modalName:''
            })
          }else{
            that.setData({
              isNull: true,
              modalName:''
            })
          }
        } else {
          that.setData({
            isNull: true,
            modalName:''
          })
        }

      },
      (err) => {

      }
    )
  },
  //上拉函数
  onReachBottom: function () { //触底开始下一页
    var that = this;
    var openid = that.data.openid;
    var pagenum = that.data.pagenum + 1; //获取当前页数并+1
    that.setData({
      pagenum: pagenum, //更新当前页数
    })

    if (that.data.maxPageNum >= pagenum) {

      var tab = that.data.TabCur;
      if (tab === 0) {
        this.finish(3, openid);
      }
      if (tab === 1) {
        this.back(1, openid);
      }
      if (tab === 2) {
        this.back(4, openid);
      }
      if (tab === 3) {
        this.back(0, openid);
      }

      if (tab === 4) {
        this.finish(2, openid);
      }

      // 显示加载图标
      wx.showLoading({
        title: '玩命加载中',
      })

    } else {
      // 显示加载图标
      wx.showLoading({
        title: '没有更多了',
      })

    }
    // 隐藏加载框
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)


  },
    //--------上拉函数-----------
    loadMore: function () { //触底开始下一页
      var that = this;
      var pagenum = that.data.pagenum + 1; //获取当前页数并+1
      var TabCur = that.data.TabCur;
      that.setData({
        pagenum: pagenum, //更新当前页数
      })
      if (that.data.maxPageNum >= pagenum) {
        if (TabCur != null) {
          that.getQuesList()
        }
        // 显示加载图标
        wx.showLoading({
          title: '玩命加载中',
        })
  
      } else {
        // 显示加载图标
        wx.showLoading({
          title: '没有更多了',
        })
  
      }
      // 隐藏加载框
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
    },
  showSearchModal(e) {
    var that = this;
    if (request_dataParam_map.has(that.data.TabCur)) {
      that.setData({
        task_request_dataParam: request_dataParam_map.get(that.data.TabCur),
        modalName: e.currentTarget.dataset.target
      })
    } else {
      that.setData({
        task_request_dataParam: {},
        modalName: e.currentTarget.dataset.target
      })
    }
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  clean_date(){
    var that = this;
    var data_param;
    if (request_dataParam_map.has(that.data.TabCur)) {
      data_param = request_dataParam_map.get(that.data.TabCur)
    } else {
      data_param = {};
    }
    data_param.startTime = ''
    data_param.endTime = ''
    request_dataParam_map.set(that.data.TabCur, data_param)
    that.setData({
      task_request_dataParam: data_param
    })
  },
    //日期选项
    DateChange(e) {
      console.log(e)
      var that = this
      var data_param;
      if (request_dataParam_map.has(that.data.TabCur)) {
        data_param = request_dataParam_map.get(that.data.TabCur)
      } else {
        data_param = {};
      }
      var type = e.target.dataset.type
      if(type == '0'){//开始时间
        data_param.startTime = e.detail.value + " 00:00:00"
      }else{//结束时间
        data_param.endTime = e.detail.value + " 23:59:59"
      }
      var startTime = new Date(data_param.startTime)
      var endTime = new Date(data_param.endTime)
      if(startTime && endTime){
        if (startTime > endTime) {
          app.msg('开始时间不能大于结束时间！')
          return
        }else if (endTime < startTime) {
          app.msg('结束时间不能小于开始时间！')
          return
        }
      }
      request_dataParam_map.set(that.data.TabCur, data_param)
      that.setData({
        task_request_dataParam: data_param
      })
    },
  task_code_input(e) {
    var that = this;
    var type = e.currentTarget.dataset.type
    var data_param;
    if (request_dataParam_map.has(that.data.TabCur)) {
      data_param = request_dataParam_map.get(that.data.TabCur)
    } else {
      data_param = {};
    }
    if (type == 'sort') {
      data_param.qsort = e.detail.value
    } else if (type == 'remarks') {
      data_param.remarks = e.detail.value
    } else if (type == 'location') {
      data_param.locationName = e.detail.value
    } else if (type == 'address') {
      data_param.address = e.detail.value
    } else if (type == 'departmentName') {
      data_param.deptNames = e.detail.value
    } else if (type == 'addRemark') {
      data_param.addRemark = e.detail.value
    }
    request_dataParam_map.set(that.data.TabCur, data_param)
  },
    //查询触发方法
    search_fun() {
      this.setData({
        //每次切换问题，清空问题列表
        quesList: [],
        //每次切换问题，给pagenum重新赋值为1
        pagenum: 1
      })
      this.getQuesList();
    },
      //跳转详情页
  goDetailPage: function (e) {
    var that = this;
    var TabCur = that.data.TabCur;
    var quesId = e.currentTarget.dataset.taskid; //任务id
    var projectId = e.currentTarget.dataset.projectid; //项目id
    var pageScrollto_id = e.currentTarget.id;
    //当前页数
    var pagenum = that.data.pagenum
    //最大页数
    var maxPageNum = that.data.maxPageNum
    var search_param = request_dataParam_map.get(that.data.TabCur)//undefined
    var search_param_str = ''
    //console.log(search_param)
    if(search_param){
      search_param_str = JSON.stringify(search_param)
    }
    var url = '../user_record_detail/user_record_detail?projectId=' + projectId + "&id=" + quesId + "&tabCur=" + TabCur+'&pageScrollto_id='+pageScrollto_id+'&search_param_str='+search_param_str+'&pagenum='+pagenum+'&maxPageNum='+maxPageNum
    router.navigateTo({
      url: url,
      events:{
        acceptDataFromOpenedPage: function(data) {
          that.setData({
            children_page_data:data
          })
        },
      }
    })
  },
})