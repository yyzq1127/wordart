// index.js
// 将字体数据直接定义为常量数组
const fonts = [
  {
    "name": "Aa剑豪体",
    "fontFamily": "AaJianHaoTi",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/Aa%E5%89%91%E8%B1%AA%E4%BD%93.ttf"
  },
  {
    "name": "Aa厚底黑",
    "fontFamily": "AaHouDiHei",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/testfont.ttf"
  },
  {
    "name": "Leefont蒙黑体",
    "fontFamily": "LeefontMengHeiTi",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/Leefont%E8%92%99%E9%BB%91%E4%BD%93.ttf"
  },
  {
    "name": "中文像素字体",
    "fontFamily": "ZhongWenXiangSu",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/%E4%B8%AD%E6%96%87%E5%83%8F%E7%B4%A0%E5%AD%97%E4%BD%93.ttf"
  },
  {
    "name": "今年也要加油鸭",
    "fontFamily": "JianNianJiaYouYa",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/%E4%BB%8A%E5%B9%B4%E4%B9%9F%E8%A6%81%E5%8A%A0%E6%B2%B9%E9%B8%AD.ttf"
  },
  {
    "name": "平方雨桐体",
    "fontFamily": "PingFangYuTongTi",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/%E5%B9%B3%E6%96%B9%E9%9B%A8%E6%A1%90%E4%BD%93.ttf"
  },
  {
    "name": "江西拙楷2.0",
    "fontFamily": "JiangXiZhuoKai",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/%E6%B1%9F%E8%A5%BF%E6%8B%99%E6%A5%B72.0.ttf"
  },
  {
    "name": "美呗嘿嘿体",
    "fontFamily": "MeiBeiHeiHeiTi",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/%E7%BE%8E%E5%91%97%E5%98%BF%E5%98%BF%E4%BD%93.ttf"
  },
  {
    "name": "花园宋体",
    "fontFamily": "HuaYuanSongTi",
    "url": "https://wordart-1301541469.cos.ap-guangzhou.myqcloud.com/%E6%B5%8B%E8%AF%951/%E8%8A%B1%E5%9B%AD%E5%AE%8B%E4%BD%93.ttf"
  }
];

Page({
  data: {
    leftColumnData: [],
    rightColumnData: [],
    loadedFonts: [], // 存储已成功加载的字体信息

  },

  onLoad() {
    this.loadAllFonts();
  },

  // 串行加载字体，一次加载一个，避免并发问题
  loadAllFonts() {
    wx.showLoading({ title: '字体加载中...' });
    this.loadFontSequentially(0); // 从第一个字体开始加载
  },

  loadFontSequentially(index) {
    // 如果所有字体都已处理完毕，则隐藏loading
    if (index >= fonts.length) {
      wx.hideLoading();
      if (this.data.loadedFonts.length > 0 && this.data.loadedFonts.length === fonts.length) {
        wx.showToast({ title: '全部加载完成!', icon: 'success', duration: 1500 });
      }
      return;
    }

    const font = fonts[index];
    wx.loadFontFace({
      family: font.fontFamily,
      source: `url("${font.url}")`,
      success: () => {
        console.log(`字体 ${font.name} 加载成功`);
        const newLoadedFonts = this.data.loadedFonts.concat(font);
        this.setData({
          loadedFonts: newLoadedFonts
        }, () => {
          this.generateWaterfallData();
          // 成功后，继续加载下一个
          this.loadFontSequentially(index + 1);
        });
      },
      fail: (err) => {
        wx.showToast({ title: `字体 ${font.name} 加载失败`, icon: 'none' });
        console.error(`字体 ${font.name} 加载失败`, err);
        // 失败后，同样继续加载下一个
        this.loadFontSequentially(index + 1);
      }
    });
  },

  // 根据加载成功的字体生成瀑布流数据
  generateWaterfallData() {
    const { loadedFonts } = this.data;
    const leftColumnData = [];
    const rightColumnData = [];

    if (loadedFonts.length === 0) {
      // 如果没有字体加载成功，清空界面并可选择性提示
      this.setData({ leftColumnData: [], rightColumnData: [] });
      // wx.showToast({ title: '暂无可用字体', icon: 'none' });
      return;
    }

    loadedFonts.forEach((font, index) => {
      const item = {
        fontFamily: font.fontFamily,
        name: font.name,
        text: font.name // 使用字体自身的名称作为预览文字
      };

      if (index % 2 === 0) {
        leftColumnData.push(item);
      } else {
        rightColumnData.push(item);
      }
    });

    this.setData({ leftColumnData, rightColumnData });
  }
});
