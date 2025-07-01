// components/control-panel/control-panel.js
Component({
  properties: {},
  data: {
    currentTab: 0,
    tabs: [
      { name: '文本' },
      { name: '字体' },
      { name: '颜色' },
      { name: '效果' }
    ]
  },
  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      if (this.data.currentTab !== index) {
        this.setData({
          currentTab: index
        });
      }
    }
  }
})
