// index.js
Page({
  data: {
    fontFamily: 'PFYTT', // 定义字体家族名称
    fontLoaded: false,   // 新增：字体加载状态标志
    leftColumnData: [],
    rightColumnData: [],
    previewTexts: [
      '艺术字', '设计感', '创意无限', '平方雨桐', '瀑布流',
      '灵感', '代码之美', '小程序', '用户体验', '简约'
    ]
  },

  onLoad() {
    this.loadCustomFont();
    this.generateWaterfallData();
  },

  // 动态加载字体文件
  loadCustomFont() {
    wx.loadFontFace({
      family: this.data.fontFamily, // 必须与 WXSS 中应用的 font-family 一致
      // 使用重命名后的ASCII文件名
      source: 'url("https://raw.githubusercontent.com/yyzq1127/wordart/main/ttf/%E5%B9%B3%E6%96%B9%E9%9B%A8%E6%A1%90%E4%BD%93.ttf")',
      success: () => {
        console.log('字体加载成功');
        // 字体加载成功后，更新标志位
        this.setData({ fontLoaded: true });
      },
      fail: (err) => {
        console.error('字体加载失败，请检查文件路径、名称和大小。', err);
        wx.showToast({
          title: '字体加载失败，请检查网络',
          icon: 'none', // 不显示图标
          duration: 2000 // 提示持续2秒
        });
      }
    });
  },

  // 生成瀑布流数据
  generateWaterfallData() {
    const { previewTexts } = this.data;
    const leftColumn = [];
    const rightColumn = [];

    previewTexts.forEach((text, index) => {
      // 移除随机高度，所有卡片将使用CSS中定义的统一高度
      const item = { text: text }; 
      if (index % 2 === 0) {
        leftColumn.push(item);
      } else {
        rightColumn.push(item);
      }
    });

    this.setData({
      leftColumnData: leftColumn,
      rightColumnData: rightColumn
    });
  }
});
