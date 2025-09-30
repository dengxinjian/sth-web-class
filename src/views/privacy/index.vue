<template>
    <div>
        <header>
            <div class="logo-container">
                <div class="logo">
                    <img src="~@/views/login-wx/imgs/logo-move.png" alt="强者之心">
                </div>
                <div class="brand-description">
                    <span>让科学普及训练</span>
                </div>
            </div>
        </header>

        <div class="privacy-container">
            <h1 class="privacy-title">强者之心运动分析平台隐私政策</h1>
            <h3 class="privacy-section">最后更新时间：2025 年 3 月 31 日</h3>

            <h4>导言</h4>
            
            <div class="privacy-intro">
                <p>强者之心运动分析平台（以下简称"我们"或"强者之心"）致力于为铁人三项及路跑运动员
                尽提供专业的训练后数据分析与竞技状态评估服务。我们深知个人信息的重要性，将严格按照法律法规保护您的隐私安全。
                本政策适用于您通过强者之心官网、移动应用（以下简称"平台"）使用我们的服务。</p>
            </div>

            <div class="privacy-section">
                <h2>一、我们收集哪些信息？</h2>
                
                <h3>1. 基础注册信息</h3>
                <ul>
                    <li><b>必填项：</b>手机号/邮箱，用户名，密码（用于账号注册）</li>
                    <li><b>选填项：</b>年龄、性别、体重、身高、运动等级（用于个性化分析）</li>
                </ul>

                <h3>2. 运动数据</h3>
                <ul>
                    <li><b>实时采集数据（需要设备支持）：</b>
                        <ul>
                            <li>GPS 轨迹，海拔变化，配速，心率，功率（如果设备支持）</li>
                            <li>血氧饱和度，乳酸阈值（若使用兼容传感器）</li>
                            <li>运动时长，距离，能量消耗</li>
                        </ul>
                    </li>
                    <li><b>手动录入数据：</b>
                        <ul>
                            <li>主观疲劳度评分（RPE）、训练计划执行情况</li>
                            <li>赛事成绩，阶段性目标设定</li>
                        </ul>
                    </li>
                </ul>

                <h3>3. 生理指标</h3>
                <ul>
                    <li>最大摄氧量（VO₂max）估算值</li>
                    <li>训练负荷指数（TL）、恢复程度评分</li>
                    <li>肌肉群疲劳热图（基于运动生物力学模型）</li>
                </ul>

                <h3>4. 设备与权限</h3>
                <ul>
                    <li>手机蓝牙、位置权限（用于轨迹记录与分析）</li>
                    <li>相机权限（用于上传运动照片/视频）</li>
                    <li>存储权限（用于缓存本地数据）</li>
                </ul>
            </div>

            <div class="privacy-section">
                <h2>二、数据使用场景</h2>
                <h3>1. 核心服务功能</h3>
                <ul>
                    <li><b>个性化分析报告：</b>生成包含配速曲线、心率区间分布、功率输出效率的训练总结</li>
                    <li><b>状态评估模型：</b>通过机器学习预测疲劳恢复周期、伤病风险预警</li>
                    <li><b>训练计划推荐：</b>基于历史数据生成定制化周/月训练方案</li>
                </ul>

                <h3>2. 社交与社区功能</h3>
                <ul>
                    <li><b>俱乐部管理（需授权）：</b>
                        <ul>
                            <li>俱乐部教练可查看团队成员训练数据</li>
                            <li>成员间可分享训练成果（需双方同意）</li>
                        </ul>
                    </li>
                    <li><b>排行榜与成就系统：</b>展示个人/团队最佳成绩</li>
                </ul>

                <h3>3. 安全与风控</h3>
                <ul>
                    <li>异常行为检测（如短时间内多次尝试修改数据）</li>
                    <li>反作弊机制（比如多维度传感器数据）</li>
                </ul>
            </div>

            <div class="privacy-section">
                <h2>三、数据共享与披露</h2>
                
                <h3>1. 第三方合作</h3>
                <ul>
                    <li><b>运动装备厂商：</b>经您授权后同步设备数据</li>
                    <li><b>数据分析平台：</b>脱敏汇总数据用于行业研究（不包含可识别个人信息）</li>
                    <li><b>医疗健康机构：</b>仅在获得您的书面同意后共享诊断级生理数据</li>
                </ul>

                <h3>2. 法律合规</h3>
                <ul>
                    <li>配合公安/司法调查时依法提供必要信息</li>
                    <li>应对网络安全事件时与监管部门协作</li>
                </ul>
            </div>

            <div class="privacy-section">
                <h2>四、数据保护措施</h2>
                
                <h3>1. 技术保障</h3>
                <ul>
                    <li>数据传输层：HTTPS 加密+AES-256 存储加密</li>
                    <li>访问控制：最小权限原则，员工仅能在授权范围内操作</li>
                    <li>数据备份：每日增量备份，异地容灾</li>
                </ul>

                <h3>2. 用户控制</h3>
                <ul>
                    <li>权限管理：可随时关闭 GPS/心率等传感授权</li>
                    <li>数据导出：支持 JSON/XML 格式下载全部历史数据</li>
                    <li>账号注销：账户注销后 48 小时内永久清除数据</li>
                </ul>
            </div>

            <div class="privacy-section">
                <h2>五、数据存储与保留</h2>
                <ul>
                    <li><b>存储区域：</b>中国大陆境内服务器（默认）/经您同意后可迁移至 AWS 等国际许可节点</li>
                    <li><b>保留期限：</b>
                        <ul>
                            <li>活跃账户：持续存储至最新训练记录后 180 天</li>
                            <li>注销账户：保留 60 天用于审计，之后匿名化处理</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="privacy-section">
                <h2>六、未成年人保护</h2>
                <ul>
                    <li>若发现未成年人未经监护人同意注册，将立即停用账户并删除数据</li>
                    <li>未成年人需在家长监护下进行注册及使用我们产品</li>
                </ul>
            </div>

            <div class="privacy-section">
                <h2>七、政策更新</h2>
                <ul>
                    <li>重大变更时通过 APP 弹窗+官网公告通知</li>
                    <li>您可通过邮箱联系：<a href="mailto:service@strongtri.com">service@strongtri.com</a> 提出您的意见</li>
                </ul>
            </div>

            <div class="privacy-section">
                <h2>联系我们</h2>
                <ul>
                    <li>地址：湖北省武汉市硚口区古田路 68 号</li>
                    <li>邮箱：<a href="mailto:service@strongtri.com">service@strongtri.com</a></li>
                    <li>工作时间：9:00-18:00（北京时间）</li>
                </ul>
            </div>

            <div class="back-to-home">
                <a href="/">返回首页</a>
            </div>
        </div>

        <!-- <footer>
            <div class="footer-content">
                <p><img src="~@/views/login-wx/imgs/logo.png" alt="" width="30">© 2025 武汉强大之心体育有限公司 版权所有 鄂ICP备2024075413号-2</p>
            </div>
        </footer> -->
    </div>
</template>
<script>
export default {
  name: 'Privacy',
}
</script>
<style scoped>
.privacy-container {
    max-width: 800px;
    margin: 70px auto;
    padding: 20px 40px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-top: 30px; /* 调整内容区域的上边距 */
}

.privacy-title {
    text-align: left;
    color: #333;
    margin-bottom: 20px;
    font-size: 1.8em;
}

.update-time {
    color: #666;
    margin-bottom: 30px;
    font-size: 0.9em;
}

.privacy-section {
    margin-bottom: 25px;
    border-bottom: 1px solid #333;
    font-size: 14px;
}

.privacy-intro {
    margin-bottom: 30px;
    line-height: 1.8;
    color: #333;
}

.privacy-section h2 {
    color: #333;
    margin: 25px 0 15px 0;
    font-size: 1.2em;
}

.privacy-section h3 {
    color: #333;
    margin: 15px 0 10px 0;
    font-size: 1.1em;
}

.privacy-section ul {
    list-style-type: disc;
    margin-left: 20px;
    color: #333;
}

.privacy-section ul ul {
    list-style-type: circle;
    margin-left: 20px;
    margin-top: 5px;
}

.privacy-section li {
    margin-bottom: 5px;
    line-height: 1.6;
}

.back-to-home {
    text-align: center;
    margin-top: 30px;
}

.back-to-home a {
    color: #007bff;
    text-decoration: none;
    font-weight: bold;
}

.back-to-home a:hover {
    text-decoration: underline;
}

header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 1);
    transition: background-color 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    height: 50px; /* 设置header高度 */
    display: flex;
    align-items: center;
}

.header-transparent {
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

.logo-container {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 20px;
}

.logo {
    height: 40px;
    display: flex;
    align-items: center;
}

.logo img {
    height: 40px;
    width: auto;
    margin-top: -10px;
}

.brand-description {
    margin-left: 15px;
    font-size: 14px;
}
</style>
