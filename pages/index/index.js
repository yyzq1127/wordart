// index.js
const fontBase64Data = require('../../data/font_base64_data.js');

// 字体数据现在只包含核心信息
const fonts = [
  {
    "name": "Aa剑豪体",
    "fontFamily": "AaJianHaoTi",

  },
  {
    "name": "Aa厚底黑",
    "fontFamily": "AaHouDiHei",

  },
  {
    "name": "Leefont蒙黑体",
    "fontFamily": "LeefontMengHeiTi",

  },
  {
    "name": "中文像素字体",
    "fontFamily": "ZhongWenXiangSuZiTi", // 修正 fontFamily

  },
  {
    "name": "今年也要加油鸭",
    "fontFamily": "JinNianYeYaoJiaYouYa", // 修正 fontFamily

  },
  {
    "name": "平方雨桐体",
    "fontFamily": "PingFangYuTongTi",

  },
  {
    "name": "江西拙楷2.0",
    "fontFamily": "JiangXiZhuoKai",

  },
  {
    "name": "美呗嘿嘿体",
    "fontFamily": "MeiBeiHeiHeiTi",

  },
  {
    "name": "花园宋体",
    "fontFamily": "HuaYuanSongTi",

  },
  {
    "name": "香萃刻宋", // 补全字体
    "fontFamily": "XiangCuiKeSong",

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

  // 纯串行加载，保证在部分真机环境下的稳定性
  async loadAllFonts() {
    wx.showLoading({ title: '字体加载中...' });

    for (const font of fonts) {
      await new Promise((resolve) => {
        wx.loadFontFace({
          family: font.fontFamily,
          source: `data:font/truetype;base64,${fontBase64Data[font.fontFamily]}`,
          success: () => {
            console.log(`字体 ${font.name} 加载成功`);
            const newLoadedFonts = this.data.loadedFonts.concat(font);
            this.setData({
              loadedFonts: newLoadedFonts
            }, () => {
              // 每加载成功一个就刷新一次瀑布流
              this.generateWaterfallData();
              resolve(true);
            });
          },
          fail: (err) => {
            const errorMsg = `字体 ${font.name} 加载失败, 错误: ${JSON.stringify(err)}`;
            console.error(errorMsg);
            wx.showToast({ title: `字体 ${font.name} 加载失败`, icon: 'none' });
            resolve(false); // 失败也 resolve，继续加载下一个
          }
        });
      });
    }

    wx.hideLoading();
    if (this.data.loadedFonts.length > 0) {
      const toastTitle = this.data.loadedFonts.length === fonts.length ? '全部加载完成!' : '部分字体加载完成';
      wx.showToast({ title: toastTitle, icon: 'success', duration: 1500 });
    }
  },

  // 根据加载成功的字体生成瀑布流数据
  generateWaterfallData() {
    const { loadedFonts } = this.data;
    const leftColumnData = [];
    const rightColumnData = [];

    if (loadedFonts.length === 0) {
      // 如果没有字体加载成功，清空界面并可选择性提示
      this.setData({ leftColumnData: [], rightColumnData: [] });
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