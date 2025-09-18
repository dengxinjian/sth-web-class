<template>
  <div class="top-layout-example">
    <h2>顶部导航布局使用示例</h2>
    <p>这个文件展示了如何使用新创建的 TopLayout.vue 布局文件。</p>

    <h3>使用方法：</h3>
    <ol>
      <li>在路由配置中引入 TopLayout 组件</li>
      <li>将需要顶部导航的页面路由的 layout 设置为 'TopLayout'</li>
      <li>确保相关组件文件已正确创建</li>
    </ol>

    <h3>文件结构：</h3>
    <ul>
      <li><code>src/layout/TopLayout.vue</code> - 主布局文件</li>
      <li><code>src/layout/components/TopNavbar.vue</code> - 顶部导航栏</li>
      <li><code>src/layout/components/TopMenu.vue</code> - 顶部菜单</li>
      <li><code>src/layout/components/TopMenuItem.vue</code> - 菜单项组件</li>
    </ul>

    <h3>路由配置示例：</h3>
    <pre><code>
// 在 router/index.js 中添加
{
  path: '/top-layout-demo',
  component: () => import('@/layout/TopLayout'),
  children: [
    {
      path: 'index',
      name: 'TopLayoutDemo',
      component: () => import('@/views/TopLayoutDemo'),
      meta: { title: '顶部布局示例' }
    }
  ]
}
    </code></pre>

    <h3>特点：</h3>
    <ul>
      <li>导航菜单位于页面顶部</li>
      <li>支持水平菜单布局</li>
      <li>支持多级菜单下拉</li>
      <li>响应式设计，移动端友好</li>
      <li>保持与原有布局相同的功能（面包屑、用户信息等）</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TopLayoutExample'
}
</script>

<style scoped>
.top-layout-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2, h3 {
  color: #303133;
  margin-top: 20px;
}

h2 {
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

ol, ul {
  line-height: 1.6;
}

li {
  margin: 8px 0;
}

code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  border-left: 4px solid #409eff;
}

pre code {
  background: none;
  padding: 0;
}
</style>
