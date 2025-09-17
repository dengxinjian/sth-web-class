# 微信登录页面 - 轮播图背景使用说明

## 功能特性

- ✅ 轮播图背景自动切换（每5秒）
- ✅ 手动切换轮播图（点击指示器）
- ✅ 响应式设计，支持移动端
- ✅ 保持原有微信二维码登录功能
- ✅ 符合图示设计的布局和样式

## 如何替换背景图片

### 方法一：直接修改图片URL数组

在 `src/views/login-wx/index.vue` 文件中找到 `backgroundImages` 数组：

```javascript
backgroundImages: [
  // 替换为您的实际图片URL
  '/assets/images/background1.jpg',
  '/assets/images/background2.jpg',
  '/assets/images/background3.jpg',
  '/assets/images/background4.jpg'
]
```

### 方法二：使用本地图片资源

1. 将图片文件放入 `src/assets/` 目录下
2. 修改 `backgroundImages` 数组：

```javascript
backgroundImages: [
  require('@/assets/background1.jpg'),
  require('@/assets/background2.jpg'),
  require('@/assets/background3.jpg'),
  require('@/assets/background4.jpg')
]
```

### 方法三：使用网络图片

```javascript
backgroundImages: [
  'https://your-domain.com/images/background1.jpg',
  'https://your-domain.com/images/background2.jpg',
  'https://your-domain.com/images/background3.jpg',
  'https://your-domain.com/images/background4.jpg'
]
```

## 自定义配置

### 修改轮播间隔时间

在 `startCarousel()` 方法中修改 `setInterval` 的时间（毫秒）：

```javascript
this.carouselTimer = setInterval(() => {
  this.currentSlide = (this.currentSlide + 1) % this.backgroundImages.length;
}, 5000); // 改为您想要的间隔时间，如 3000 表示3秒
```

### 添加更多背景图片

只需在 `backgroundImages` 数组中添加更多图片URL即可，轮播图会自动适应。

### 禁用自动轮播

如果不想自动轮播，可以注释掉 `mounted()` 中的 `this.startCarousel();` 这行代码。

## 样式自定义

### 修改品牌颜色

在样式部分找到以下颜色值进行修改：

- 主品牌色：`#e74c3c`（红色）
- 二维码容器渐变色：`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 文字阴影：`rgba(0, 0, 0, 0.5)`

### 调整布局

- 左侧内容区域：`.left-content`
- 右侧二维码区域：`.right-content`
- 轮播图容器：`.carousel-container`

## 注意事项

1. 建议图片尺寸为 1920x1080 或更高分辨率，以确保在不同设备上的显示效果
2. 图片格式推荐使用 JPG 或 PNG
3. 如果使用网络图片，请确保图片可以正常访问
4. 轮播图切换有平滑过渡动画，建议图片风格保持一致

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 移动端适配

页面已包含响应式设计，在移动设备上会自动调整为垂直布局，确保良好的用户体验。
