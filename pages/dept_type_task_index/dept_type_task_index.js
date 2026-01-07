// 引入跳转js
// import router from '../../../../utils/router.js';
var app = getApp()
var rectifyFlag = false;
//各tab参数 
var request_dataParam_map = new Map();
var finishTimeSortType = -1; 
var deptResult = '';
var deptSubStatusOrder = 0;
Page({
  data: {
    rightId:wx.getStorageSync('rightId') || 0,
    requestUrl: '', //请求路径
    projectId: '', //项目id
    terminalUserId: '', //调查员id
    swiperIndex: 0, //初始化swiper索引
    swiperHeight: 350,
    children_page_data: '',//子页面返回的任务列表参数
    // 问题栏默认值
    // TabCur: null,
    TabCur: '',// 0待整改（未整改/整改不达标继续整改）  1 已整改 2 长期整改 3 整改合格 4 待审核
    // 轮播图数据
    swiperList: [],
    // 问题类型数据
    problemType: [],
    //任务列表数据
    taskList: [],
    //任务列表初始页（默认1）
    pagenum: 1,
    //赋值任务列表总页数（默认1）
    maxPageNum: 1,
    //空内容提示标识
    isNull: '',
    date: '',
    //滑动菜单
    problemType_user: [],
    //任务列表清楚参数实体
    task_request_dataParam: {

    },
    taskDelayNum: 0,//逾期任务数
    fontSize: '',
    bgColor: '',
    fontSize28: '',
    fontSize26: '',
    fontSize30: '',
    //批量审核任务id集合
    batch_process_taskIdArr: [],
    processType: '',//批量审核类型
    process_auditContent: ''//批量审批意见
   ,projectList:[],//项目列表
   zgOticeList:[],//整改单列表
   zgListTitle:'',//整改单列表页面标题
   selectzgOticeId:'',//正常查看的整改单id
   outType:0,// 0其他  返回式刷新页面  1 查看整改单  返回不刷新
    //是否可以提交
    isTijiao:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    var requestUrl = app.globalData.requestUrl; //请求路径
    //var projectId = app.projectId;
    var terminalUserId = app.terminalUserId; //调查员id
    var fontSize = wx.getStorageSync('fontSize');
    var bgColor = wx.getStorageSync('bgColor');    
    wx.setNavigationBarTitle({
      title: app.projectName,
    })
    that.setData({
      requestUrl: requestUrl,
      //projectId: projectId,
      terminalUserId: terminalUserId,
      fontSize: fontSize,
      bgColor: bgColor,
      fontSize30: parseInt(fontSize),
      fontSize26: parseInt(fontSize) - 12,
      fontSize28: parseInt(fontSize) - 7,
      isTijiao:(app.deptRoleName=='责任单位-T'?true:false),
      problemType_user: app.deptRoleName=='责任单位-T'?[{
        id: 0,
        name: '常规未整改'
      }, {
        id: 1,
        name: '整改单未整改'
      },  {
        id: 2,
        name: '待审核'
      }, 
      {
        id: 3,
        name: '整改通过'
      }]:[{
        id: 0,
        name: '常规未整改'
      }, {
        id: 1,
        name: '整改单未整改'
      }],
    })
    that.getZgOticeList();
    //加载项目列表
    //that.getProjectList();
    //加载轮播图
    //that.getSwiperList();
    //that.getProjectFieldTaskTips();
  },
  //刷新页面
  onShow: function () {
    //console.log('页面显示')
    var that = this;
    if(that.data.outType == 1){
      that.data.outType = 0
      return 
    }
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    //console.log(that.data.children_page_data)
    if (that.data.children_page_data) {
      var task_list_param = that.data.children_page_data
      var pageScrollto_id = task_list_param.pageScrollto_id
      var search_param_str = task_list_param.search_param_str
      var TabCur = task_list_param.tabCur
      var pageNum = task_list_param.pagenum
      //var maxPageNum = task_list_param.maxPageNum
      //console.log(search_param_str)   
      if (search_param_str) {
        var search_param = JSON.parse(search_param_str)
        request_dataParam_map.set(TabCur, search_param)
      }
      that.setData({
        taskList: [],
        pagenum: 1,
        maxPageNum: 0, //总页数
        isNull: '',
        TabCur: TabCur
      })
      //加载任务列表
      that.getTaskList(pageNum * 5, pageScrollto_id);
    } else {
      that.setData({
        taskList: [],
        maxPageNum: 0, //总页数
        isNull: '',
        TabCur: 0,
      })
      //加载任务列表
      that.getTaskList();
    }

  },
  getZgOticeList(){
    let that = this;
    var requestUrl = that.data.requestUrl;
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/public/fieldTask/getZgOticeListForDept",
      {
        "userId": that.data.terminalUserId
      },
      app.seesionId,
      (res) =>{
        if (res.data.status === "success") {
          //console.log(res)
          var result = res.data
          let  oticeList = []
          let showTb = 0//是否显示图标
          if(result.retObj && result.retObj.length > 0) {
            oticeList = result.retObj
            showTb = 1
          }
          that.setData({
            zgOticeList: oticeList,
            zgListTitle : '已下发整改单列表',
            isShow:showTb
          })
        }
      },
      (err) =>{
        app.msg('系统错误')
      }
    )
  },
    //展示整改单 pdf
    showZgOtice(e){
      let that =this;
      wx.showLoading();
      wx.downloadFile({
        url: e.currentTarget.dataset.url,
        filePath: wx.env.USER_DATA_PATH + '/'+e.currentTarget.dataset.name+'.pdf',
        success: (res) => {
          that.data.outType = 1
          wx.hideLoading()
          wx.openDocument({
            filePath: res.filePath,
            showMenu: true  // 开启右上角菜单以支持分享/保存
          });
        }
      });
      that.setData({
        selectzgOticeId:e.currentTarget.dataset.id,
      })
    },
  bindchange(e) {
    this.setData({
      swiperIndex: e.detail.current
    })
  },

  // 跳转轮播图详情
  toswiper: function () {
    var swiperIndex = this.data.swiperIndex;
    // router.navigateTo({
    //   url: "../dept_swiper/dept_swiper?id=" + swiperIndex
    // })
  },

  /**
   * 查询项目任务列表
   */
  showProjectTask(e){
    let that =this;
    wx.setNavigationBarTitle({
      title: e.currentTarget.dataset.name,
    })
    that.setData({
      taskList: [],
      maxPageNum: 0, //总页数
      isNull: '',
      TabCur: 0,
      projectId:e.currentTarget.dataset.id,
    })
    //加载任务列表
    that.getTaskList();
  },

  /**
   * 获取当前政府项目列表
   */
  getProjectList(){
    //console.log('政府code',wx.getStorageSync('code'))
    let govCode = wx.getStorageSync('code');
    let that = this;
    var requestUrl = that.data.requestUrl;
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/home/manage/getPublicProjectList",
      {
        "govCode": govCode
      },
      app.seesionId,
      (res) =>{
        if (res.data.status === "success") {
          console.log(res)
          that.setData({
            projectList: res.data.retObj
          })
        }
      },
      (err) =>{
        app.msg('系统错误')
      }
    )
  },
   /**
   * 获取轮播图数据
   */
  getSwiperList() {
    var projectId = wx.getStorageSync('projectId')
    // console.log("项目idsdaddafsfadfsads",projectId)
    // console.log(projectId)
    let that = this;
    var requestUrl = that.data.requestUrl;
    
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/home/manage/searchViewPages",
      {
        "projectId": projectId
      },
      app.seesionId,
      (res) =>{
        if (res.data.status === "success") {
          that.setData({
            swiperList: res.data.retObj
          })
        }
      },
      (err) =>{

      }
    )
  },
  /**
   * 动态改变问题类型的ID，传参加载ID下的任务列表
   */
  tabSelect: function (e) {
    var that = this;
    //  给TabCurf赋值
    if (e.currentTarget.dataset.id != null) {
      that.setData({
        TabCur: e.currentTarget.dataset.id,
        //每次切换问题，清空问题列表
        taskList: [],
        //每次切换问题，给pagenum重新赋值为1
        pagenum: 1
      })
      //传参问题Id获取任务列表
      that.getTaskList();
    }
  },
  /**
   * 获取任务列表数据
   * 第一次默认加载全部，这里只加载一次，后面根据当前问题的ID发送请求
   */
  getTaskList: function (pageSize, pageScrollto_id) {
    var that = this;
    var requestUrl = that.data.requestUrl; //请求路径
    var projectId = ''//that.data.projectId; //项目id
    var TabCur = that.data.TabCur; //整改状态
    //var pagenum = that.data.pagenum;
    var terminalUserId = app.terminalUserId;
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
      that.data.task_request_dataParam.page = that.data.pagenum;
      if (!pageSize) {
        that.data.task_request_dataParam.pageSize = 5;
      } else {
        that.data.task_request_dataParam.pageSize = pageSize;
      }
      that.data.task_request_dataParam.terminalUserId = terminalUserId;
      if (TabCur == 0) {//常规未整改
        that.data.task_request_dataParam.result = 9
        that.data.task_request_dataParam.taskType = 0
        that.data.task_request_dataParam.deptResult = deptResult
        that.data.task_request_dataParam.deptSubStatusOrder = deptSubStatusOrder
      } else if (TabCur == 1) {//整改单未整改
        that.data.task_request_dataParam.result = 9
        that.data.task_request_dataParam.taskType = 1
        that.data.task_request_dataParam.deptResult = deptResult
        that.data.task_request_dataParam.deptSubStatusOrder = deptSubStatusOrder
      } else if (TabCur == 2) {//待审核
        that.data.task_request_dataParam.result = 3
        that.data.task_request_dataParam.taskType = ''
      } else if (TabCur == 3) {//整改合格
        that.data.task_request_dataParam.result = 0
        that.data.task_request_dataParam.taskType = ''
      }
    }
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/public/fieldTask/getPublicFieldTaskRectifyAllListByWx",
      that.data.task_request_dataParam,
      app.seesionId,
      (res) => {
        console.log(res.data)
        var list = res.data.retObj.list;
        if (list && list.length > 0) {
          that.setData({
            //1、that.data.taskList  获取当前页面存的taskList数组
            //2、res.data.retObj   获取当前请求得到的taskList数组
            //3、xxx.concat  把新加载的数组追加到当前页面之后
            taskList: that.data.taskList.concat(res.data.retObj.list),
            maxPageNum: res.data.retObj.pageCount, //总页数
            taskCount:res.data.retObj.count,
            isNull: '',
            cardId:pageScrollto_id==null?"":pageScrollto_id//如果id不为空 则为测评页面返回 定位到跳转之前的位置
          })

           //因为 <scroll-view> 中 scroll-into-view 二次设置重复值时 失效引发bug 所以在执行后定时在500毫秒后设置为空字符串
           setTimeout(() => {
            that.setData({
              cardId:''
            })
        }, 500)
          //console.log("看看这个任务列表：", that.data.taskList)
        } else {
          app.msg('暂无数据')
          that.setData({
            //isNull: 'true',
            maxPageNum: 1,
            taskCount:0
          })
        }
        that.hideModal();
      },
      (err) => {

      }
    )
  },
  search_radio(e){
    var that = this
    var detail = e.detail
    if(detail.value == '2'){//显示全部任务
      deptResult = ''
    }else{//分别显示已上传或未上传的任务  
      deptResult = detail.value
    }
    that.search_fun();
  },
  search_checkbox(e){
    var that = this;
    var detail = e.detail.value
    if(detail.length > 0){//优先显示 上报不合格任务
      deptSubStatusOrder = 1
    }else{//优先显示正常任务
      deptSubStatusOrder = 0
    }
    that.search_fun();
  },
  search_finishSort(){
    var that = this;
    var data_param;
    if(finishTimeSortType == -1 || finishTimeSortType == 0){
      finishTimeSortType = 1
    }else{
      finishTimeSortType == 0
    }
    if (request_dataParam_map.has(that.data.TabCur)) {
      data_param = request_dataParam_map.get(that.data.TabCur)
    } else {
      data_param = {};
    }
    data_param.finishTimeSort = finishTimeSortType
    request_dataParam_map.set(that.data.TabCur, data_param)
    that.search_fun();
  },
  //查询触发方法
  search_fun() {
    this.setData({
      //每次切换问题，清空问题列表
      taskList: [],
      //每次切换问题，给pagenum重新赋值为1
      pagenum: 1
    })
    this.getTaskList()
  },
  //上拉函数
  // onReachBottom: function () { //触底开始下一页
  //   var that = this;
  //   var pagenum = that.data.pagenum + 1; //获取当前页数并+1
  //   that.setData({
  //     pagenum: pagenum, //更新当前页数
  //   })
  //   if (that.data.maxPageNum >= pagenum) {
  //     if (that.data.TabCur != null) {
  //       that.getTaskList(); //重新调用请求获取下一页数据
  //     }
  //     // 显示加载图标
  //     wx.showLoading({
  //       title: '玩命加载中',
  //     })

  //   } else {
  //     // 显示加载图标
  //     wx.showLoading({
  //       title: '没有更多了',
  //     })

  //   }
  //   // 隐藏加载框
  //   setTimeout(function () {
  //     wx.hideLoading()
  //   }, 1000)
  // },
    //上拉函数
    loadMore: function () { //触底开始下一页
      var that = this;
      var pagenum = that.data.pagenum + 1; //获取当前页数并+1
      console.log('当前页:'+pagenum)
      that.setData({
        pagenum: pagenum, //更新当前页数
      })
      if (that.data.maxPageNum >= pagenum) {
        if (that.data.TabCur != null) {
          that.getTaskList(); //重新调用请求获取下一页数据
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
  showListModel(e){
    var that = this;
    that.setData({
      modalName: e.currentTarget.dataset.target
    })
    console.log(that.data.modalName)
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  //日期选项
  DateChange(e) {
    var that = this
    var data_param;
    if (request_dataParam_map.has(that.data.TabCur)) {
      data_param = request_dataParam_map.get(that.data.TabCur)
    } else {
      data_param = {};
    }
    data_param.date = e.detail.value
    request_dataParam_map = request_dataParam_map.set(that.data.TabCur, data_param)
    that.setData({
      task_request_dataParam: request_dataParam_map.get(that.data.TabCur)
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
      data_param.sortName = e.detail.value
    } else if (type == 'remarks') {
      data_param.remarks = e.detail.value
    } else if (type == 'location') {
      data_param.locationName = e.detail.value
    } else if (type == 'address') {
      data_param.address = e.detail.value
    } else if (type == 'addremark') {
      data_param.addRemark = e.detail.value
    }
    request_dataParam_map.set(that.data.TabCur, data_param)
  },
  //长按复制任务编号
  copyCode: function (e) {
    var code = e.currentTarget.dataset.key;
    wx.setClipboardData({
      data: code
    })
  },
  //跳转到整改页面
  goTaskRectify(e) {
    var that = this
    var taskId = e.currentTarget.dataset.taskid;
    var projectId = e.currentTarget.dataset.projectid;
    var pageScrollto_id = e.currentTarget.id;
    //当前页数
    var pagenum = that.data.pagenum
    //最大页数
    var maxPageNum = that.data.maxPageNum
    // 0待整改（未整改/整改不达标继续整改）  1 已整改 2 长期整改 3 整改合格 4 待审核
    var tabCur = that.data.TabCur
    var search_param = request_dataParam_map.get(that.data.TabCur)//undefined
    var search_param_str = ''
    //console.log(search_param)
    if (search_param) {
      search_param_str = JSON.stringify(search_param)
    }
    //当前为未整改时
    if (tabCur == 0 ) {
      // if (rectifyFlag) {
      //   return;
      // }
      rectifyFlag = true;
    } else {
      rectifyFlag = false;
    }

    wx.navigateTo({
      url: '../dept_task_detail/dept_task_detail?id=' + taskId + '&projectId=' + projectId + '&tabCur=' + tabCur + '&pageScrollto_id=' + pageScrollto_id + '&search_param_str=' + search_param_str + '&pagenum=' + pagenum + '&maxPageNum=' + maxPageNum,
      events: {
        acceptDataFromOpenedPage: function (data) {
          that.setData({
            children_page_data: data
          })
        },
      }
    })
  },

  //多选框监听方法
  save_taskIds: function (e) {
    this.setData({
      batch_process_taskIdArr: e.detail.value
    })
    console.log(this.data.batch_process_taskIdArr)
  },
  //选中任务点击批量审批按钮 弹窗显示审批意见输入框
  show_auditContent_modal(e) {
    var that = this;
    var taskArr = that.data.batch_process_taskIdArr
    if (!taskArr || taskArr.length < 1) {
      app.msg('请先选择任务~')
      return
    } else {
      this.setData({
        processType: e.currentTarget.dataset.type,
        modalName: 'auditContent_modal'
      })
    }
  },
  set_auditContent: function (e) {
    this.setData({
      process_auditContent: e.detail.value,
    })
  },
  //批量审核方法
  batch_process: function (e) {
    var that = this;
    var terminalUserId = that.data.terminalUserId;
    var resulttype = e.currentTarget.dataset.resulttype
    let msg = resulttype == 0?'提交':'不合格'
    // 0提交  1不合格
    var result_type = e.currentTarget.dataset.resulttype
    var taskIds = that.data.batch_process_taskIdArr + ''
    if(!taskIds){
        app.msg('请选择要审核的任务')
        return
    }
    wx.showModal({
      content: '确定要批量'+msg+'这些任务吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          var param = {
            terminalUserId:terminalUserId,
            taskIds:taskIds,
            type:result_type
          };
          //调用全局 请求方法
          app.wxRequest(
            'POST',
            that.data.requestUrl + "/public/fieldTask/batchSubmitTaskByTaskIds",
            param,
            app.seesionId,
            (res) => {
              console.log(res)
              var data = res.data
              if (data.status = "success") {
                app.alert("操作成功")
                //刷新列表
                that.search_fun()
              } else {
                app.alert("请求失败")
              }
            },
            (err) => {
              app.alert("网络错误")
            }
          )
        }
      }
    })
  }
})