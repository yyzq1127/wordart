# 小程序艺术字字体加载优化方案

## 1. 背景与目标

### 1.1. 背景

本项目是一个艺术字生成小程序，需要在首页以瀑布流的形式向用户展示大量的可选字体（预计扩展至100种以上）。当前面临的核心挑战是：

- **性能瓶颈**：若在首页加载所有字体的完整文件（即使是经过3500常用字优化的版本，体积仍在1-5MB），将导致首页加载时间过长，出现长时间白屏，严重影响用户体验。
- **预览效果**：为了达到最佳的展示效果，字体列表中的每个预览项都应使用其自身的字体样式来渲染其名称。

### 1.2. 核心目标

本方案旨在解决上述问题，达成以下核心目标：

1.  **极致的启动性能**：实现小程序首页的快速加载（“秒开”），避免因字体加载导致白屏。
2.  **即时的预览体验**：在首页字体列表中，即时、流畅地展示所有字体的个性化名称预览。
3.  **高效的资源利用**：仅在用户真正需要使用某款字体进行创作时，才下载该字体的完整版文件，最大化节省用户流量和系统资源。
4.  **良好的项目扩展性**：方案应结构清晰，易于维护，方便未来持续增加新字体。

## 2. 总体策略

为实现上述目标，我们采用 **“本地预览字体 + 远程完整字体”** 的混合懒加载策略。

- **本地预览字体 (Preview Font)**
    - **内容**: 每个字体文件仅包含其自身名称所需的几个字符（如“Aa剑豪体”仅包含'A', 'a', '剑', '豪', '体'）。
    - **特点**: 体积极小（KB级别），加载速度快，无网络依赖。
    - **用途**: 打包在小程序本地（通过分包），用于在首页快速渲染字体名称的预览。

- **远程完整字体 (Full Font)**
    - **内容**: 包含国家标准的3500个常用汉字以及英文字母和数字。
    - **特点**: 体积较大（MB级别），需通过网络下载。
    - **用途**: 存放在云端对象存储（如腾讯云COS），在用户选定一款字体后按需下载，用于最终的艺术字生成。

## 3. 详细实施步骤

### 步骤一：生成两种字体文件

使用 [Font-spider (字蛛)](https://github.com/aui/font-spider) 工具，通过不同的HTML配置，为每一种原始字体生成两个优化版本。

#### A. 生成“预览字体”

1.  **创建配置文件**: 在 `font-optimizer/` 目录下创建一个 `index_preview.html` 文件。
2.  **编辑内容**: 在文件中为每种字体添加一个 `<div>`，内容为其自身的名称。
    ```html
    <!-- index_preview.html -->
    <div style="font-family: 'AaJianHaoTi';">Aa剑豪体</div>
    <div style="font-family: 'AaHouDiHei';">Aa厚底黑</div>
    <!-- ... 为所有字体都创建对应的条目 ... -->
    ```
3.  **运行字蛛**: 执行 `font-spider ./index_preview.html`。
4.  **收集产物**: 从生成的 `.font-spider` 目录中，将优化后的字体文件重命名为 `[FontName]_preview.ttf` 并收集起来。

#### B. 生成“完整字体”

1.  **创建配置文件**: 在 `font-optimizer/` 目录下创建 `index_full.html`。
2.  **编辑内容**: 在文件中放置一个包含了3500个常用汉字、大小写字母和数字的文本块，并将其应用到所有字体。
    ```html
    <!-- index_full.html -->
    <div style="font-family: 'AaJianHaoTi'; font-family: 'AaHouDiHei'; ...">
      的愿协砂妥摧疵丫... (此处为3500常用字)
    </div>
    ```
3.  **运行字蛛**: 执行 `font-spider ./index_full.html`。
4.  **收集产物**: 将优化后的字体文件重命名为 `[FontName]_full.ttf` 并收集起来。

### 步骤二：调整项目结构与配置

#### A. 创建分包

为了不增加主包体积，我们将所有“预览字体”存放在一个独立的分包中。

1.  在项目根目录下创建 `font_previews` 文件夹。
2.  将所有 `_preview.ttf` 文件移动到 `font_previews/ttf/` 目录下。
3.  在 `app.json` 中配置分包：
    ```json
    {
      "pages": [
        "pages/index/index"
      ],
      "subpackages": [
        {
          "root": "font_previews",
          "pages": []
        }
      ],
      "preloadRule": {
        "pages/index/index": {
          "network": "all",
          "packages": ["font_previews"]
        }
      }
      // ...
    }
    ```
    *   **说明**: `preloadRule` 会让小程序在进入 `index` 页面时，自动预加载 `font_previews` 分包，提升体验。

### 步骤三：上传“完整字体”到云端

将所有生成的 `_full.ttf` 文件上传到您的腾讯云COS或其它CDN服务中，并记录下每个字体的可访问URL。

### 步骤四：代码逻辑改造

#### A. 更新数据源

修改 `data/fonts.json` 或 `pages/index/index.js` 中的字体数据结构，使其包含两种字体的路径信息。

```javascript
// 示例: pages/index/index.js
const fonts = [
  {
    "name": "Aa剑豪体",
    "fontFamily": "AaJianHaoTi",
    "previewPath": "/font_previews/ttf/AaJianHaoTi_preview.ttf", // 本地预览字体路径
    "fullUrl": "https://your-cos.com/AaJianHaoTi_full.ttf"      // 远程完整字体URL
  },
  // ... 其他字体
];
```

#### B. 首页加载逻辑 (加载预览字体)

在 `pages/index/index.js` 的 `onLoad` 方法中，加载所有本地的“预览字体”。

```javascript
// pages/index/index.js
Page({
  onLoad() {
    this.loadPreviewFonts();
  },

  async loadPreviewFonts() {
    wx.showLoading({ title: '正在准备预览...' });
    const loadPromises = fonts.map(font => {
      return wx.loadFontFace({
        family: font.fontFamily,
        source: `url("${font.previewPath}")`
      });
    });

    try {
      await Promise.all(loadPromises);
      wx.hideLoading();
      // 可以在此更新数据，触发页面渲染
      this.setData({ fontsData: fonts });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '预览加载失败', icon: 'none' });
    }
  }
});
```

#### C. 用户选择逻辑 (懒加载完整字体)

当用户点击某个字体，准备进行创作时，才加载对应的“完整字体”。

```javascript
// pages/index/index.js
Page({
  // ...
  handleFontSelect(e) {
    const { font } = e.currentTarget.dataset;

    wx.showLoading({ title: '正在准备字体...' });

    wx.loadFontFace({
      family: font.fontFamily, // 注意：family 名称需保持一致
      source: `url("${font.fullUrl}")`,
      global: true,
      success: () => {
        wx.hideLoading();
        // 跳转到创作页，并传递 fontFamily
        wx.navigateTo({
          url: `/pages/create/create?fontFamily=${font.fontFamily}`
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '字体资源加载失败', icon: 'none' });
      }
    });
  }
});
```

## 4. 预期成果

- **首页加载速度**: 启动时仅加载KB级别的本地预览字体，白屏时间将从数秒缩短至1秒以内。
- **用户体验**: 用户打开小程序即可看到所有字体的真实效果预览，交互流畅；仅在选择字体后需短暂等待，符合操作预期。
- **资源消耗**: 流量消耗从“启动时加载几十MB”变为“按需加载几MB”，极大节省了用户流量。
- **可维护性**: 整个流程清晰、自动化。未来新增字体时，只需执行脚本生成两种字体文件，并更新配置文件和上传文件即可，无需改动核心代码。
