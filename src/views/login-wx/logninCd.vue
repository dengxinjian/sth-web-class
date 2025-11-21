<template>
  <div class="wx-login-page">
    <header>
      <div class="logo-container">
        <div class="logo">
          <img
            :src="require('@/views/login-wx/imgs/logo-move.png')"
            alt="强者之心"
          />
        </div>
        <div class="brand-description">
          <span>TRI强者，恒心不止。 Try Tri, Timeless Strength.</span>
        </div>
      </div>
    </header>

    <div class="slider-container">
      <div class="slider"></div>
      <div class="content-overlay">
        <div class="text-content">
          <h1>强者之心</h1>
          <p>让科学普及训练</p>
          <div class="contact-info">
            <h2>联系我们</h2>
            <!-- <div class="contact-item">
                        <span class="contact-label">电话：</span>
                        <span class="contact-value">000-0000-0000</span>
                    </div> -->
            <div class="contact-item">
              <span class="contact-label">邮箱：</span>
              <span class="contact-value">service@strongtri.com</span>
            </div>
          </div>
        </div>
      </div>
      <div class="wx-login-block">
        <div class="elite-title">ELITE</div>
        <div id="wx-login-container" class="wx-login-container">
          <!-- 扫码成功状态 -->
          <div v-if="hasCode && !wxLoginStatus" class="login-success">
            <div class="success-icon">✓</div>
            <div class="success-text">扫码成功</div>
            <div class="success-subtitle">正在跳转...</div>
          </div>
          <!-- 小程序码状态 -->
          <div
            v-else-if="wxLoginStatus === 'miniprogram'"
            class="miniprogram-code"
          >
            <div class="miniprogram-title">请使用微信扫码</div>
            <img
              src="./imgs/miniprogram.png"
              alt="小程序码"
              class="miniprogram-img"
            />
            <div class="miniprogram-subtitle">扫码进入小程序</div>
            <el-button @click="handleMiniprogramCode">已完成扫码</el-button>
          </div>
          <!-- 加载状态 -->
          <div v-else-if="wxLoginStatus === 'loading'" class="login-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">正在加载二维码...</div>
          </div>
          <!-- 错误状态 -->
          <div v-else-if="wxLoginStatus === 'error'" class="login-error">
            <div class="error-icon">✗</div>
            <div class="error-text">加载失败</div>
            <div class="error-subtitle">请刷新重试</div>
          </div>
        </div>
      </div>
    </div>

    <footer>
      <div class="footer-content">
        <p>
          <img
            :src="require('@/views/login-wx/imgs/logo.png')"
            alt=""
            width="30"
          />© 2025 武汉强大之心体育有限公司 版权所有 鄂ICP备2024075413号-2
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { setToken } from "@/utils/auth";
import { getData, submitData } from "@/api/common";
export default {
  name: "LoginWx",
  data() {
    return {
      currentSlide: 0,
      backgroundImages: [
        // 图片路径 - 使用绝对路径
        require("@/views/login-wx/imgs/banner1.jpg"),
        require("@/views/login-wx/imgs/banner2.jpg"),
        require("@/views/login-wx/imgs/banner3.webp"),
        require("@/views/login-wx/imgs/banner4.jpg"),
      ],
      carouselTimer: null,
      hasCode: false, // 是否包含code参数
      wxLoginStatus: "", // 微信登录状态：loading, success, error, miniprogram
      showMiniprogramCode: false, // 是否显示小程序码
      unionid: "", // 微信unionid
    };
  },
  mounted() {
    this.checkUrlParams();
    this.initSlider();
  },
  beforeDestroy() {
    clearInterval(this.carouselTimer);
  },
  methods: {
    // 检查URL参数
    checkUrlParams() {
      // 添加更详细的调试信息

      // 尝试多种方式获取code和state参数
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const unionid = urlParams.get("unionid");

      // 也检查hash中的参数（有些情况下参数可能在hash中）
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const codeFromHash = hashParams.get("code");
      const stateFromHash = hashParams.get("state");
      const unionidFromHash = hashParams.get("unionid");

      // 检查URL中是否包含code字符串
      const urlContainsCode = window.location.href.includes("code=");
      const urlContainsState = window.location.href.includes("state=");
      const unionidFromUrl = window.location.href.includes("unionid=");
      // 备用方法：使用正则表达式解析URL参数
      const regexCode = this.getUrlParameter("code");
      const regexState = this.getUrlParameter("state");
      const regexUnionid = this.getUrlParameter("unionid");

      // 优先使用search中的参数，如果没有则使用hash中的参数，最后使用正则表达式
      const finalCode = code || codeFromHash || regexCode;
      const finalState = state || stateFromHash || regexState;
      this.unionid = unionid || unionidFromHash || regexUnionid;
      if (finalCode) {
        this.hasCode = true;
        this.wxLoginStatus = "success";

        // 可以在这里处理登录成功后的逻辑
        this.handleLoginSuccess(finalCode, finalState);
      } else {
        this.initWxLogin();
      }
    },

    // 备用URL参数解析方法
    getUrlParameter(name) {
      const url = window.location.href;
      const regex = new RegExp("[?&]" + name + "=([^&#]*)", "i");
      const results = regex.exec(url);
      return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    // 处理登录成功
    handleLoginSuccess(code, state) {
      // 调用微信登录回调接口，同时传递code和state参数

      this.showMiniprogramCode = true;
      this.wxLoginStatus = "miniprogram";
    },
    initSlider() {
      const slider = document.querySelector(".slider");
      let currentImageIndex = 0;

      // 初始化轮播图片
      this.backgroundImages.forEach((image, index) => {
        const img = document.createElement("img");
        img.src = image;
        img.className = index === 0 ? "active" : "";
        slider.appendChild(img);
      });

      // 切换到下一张图片
      const nextImage = () => {
        const imgs = slider.querySelectorAll("img");
        imgs[currentImageIndex].classList.remove("active");
        currentImageIndex =
          (currentImageIndex + 1) % this.backgroundImages.length;
        imgs[currentImageIndex].classList.add("active");
      };

      // 设置自动轮播间隔
      this.carouselTimer = setInterval(nextImage, 5000);
    },
    initWxLogin() {
      this.wxLoginStatus = "loading";
      // 延迟初始化，确保DOM完全加载
      this.$nextTick(() => {
        this.loadWxLoginScript();
      });
    },
    loadWxLoginScript() {
      const ensureScript = () =>
        new Promise((resolve, reject) => {
          if (window.WxLogin) {
            return resolve();
          }

          const s = document.createElement("script");
          s.src =
            "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
          s.async = true;
          s.onload = () => {
            resolve();
          };
          s.onerror = (e) => {
            reject(e);
          };
          document.head.appendChild(s);
        });

      ensureScript()
        .then(() => {
          this.createWxLogin();
        })
        .catch((error) => {
          console.error("微信登录初始化失败:", error);
          this.wxLoginStatus = "error";
          this.$message.error("微信登录初始化失败，请检查网络连接后刷新重试");
        });
    },
    createWxLogin() {
      try {
        const appId =
          process.env.NODE_ENV === "production"
            ? "wxe34b400e55bd075b"
            : "wx4064cabd6845def1";
        const state = (
          Math.random().toString(36).slice(2) + Date.now()
        ).toString();
        const redirectUri = encodeURIComponent(
          process.env.NODE_ENV === "production"
            ? "https://web.strongtri.com/#/login-scan"
            : "https://webtest.strongtri.com/#/login-scan"
        );

        // 清空容器
        const container = document.getElementById("wx-login-container");
        if (container) {
          container.innerHTML = "";
        }

        // 创建微信登录二维码
        new window.WxLogin({
          id: "wx-login-container",
          appid: appId,
          scope: "snsapi_login",
          redirect_uri: redirectUri,
          state,
          style: "black",
          href: "",
        });

        this.wxLoginStatus = "success";
      } catch (error) {
        console.error("创建微信登录二维码时出错:", error);
        this.wxLoginStatus = "error";
        this.$message.error("创建微信登录二维码失败，请刷新重试");
      }
    },
    handleMiniprogramCode() {
      if (this.unionid) {
        getData({
          url: "/api/wechat/getByUnionid",
          unionid: this.unionid,
        })
          .then((res) => {
            if (res.result.jwt) {
              this.$store.commit("user/SET_TOKEN", res.result.jwt);
              this.$store.commit("user/SET_NAME", res.result.nicknameTag);
              localStorage.setItem("triUserId", res.result.triUserId);
              localStorage.setItem("name", res.result.nicknameTag);
              console.log("res.result.jwt", res.result.jwt);
              setToken(res.result.jwt);
              this.$router.push("/timeTable/athletic");
            } else {
              this.$message.error("请重新扫码");
            }
          })
          .catch((error) => {
            console.error("获取微信用户信息失败:", error);
            this.$message.error("获取微信用户信息失败，请刷新重试");
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* 头部样式 */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 20px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  width: 200px;
  margin-top: -6px;
}

.logo img {
  width: 100%;
  height: auto;
}

.brand-description {
  color: white;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-style: italic;
}

/* 轮播容器样式 */
.slider-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.slider {
  position: absolute;
  width: 100%;
  height: 100%;
}

.slider img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.slider img.active {
  opacity: 1;
}

/* 内容覆盖层样式 */
.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  padding: 0 10%;
}

.text-content {
  color: white;
  max-width: 800px;
  text-align: left;
  animation: fadeIn 1.5s ease-out;
}

.text-content h1 {
  font-size: 4em;
  margin-bottom: 30px;
  font-weight: 800;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transform: translateX(-20px);
  opacity: 0;
  animation: slideIn 1s ease-out forwards;
}

.text-content p {
  font-size: 1.8em;
  margin-bottom: 20px;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.8s ease-out forwards;
  animation-delay: 0.5s;
}

.text-content p:last-child {
  font-size: 1.4em;
  font-weight: 300;
  opacity: 0.9;
  animation-delay: 1s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 页脚样式 */
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px 30px;
  color: white;
  text-align: center;
  font-size: 0.9em;
  background: rgba(0, 0, 0, 0.7);
}

.footer-content p {
  margin: 2px 0;
}

.footer-content p img {
  width: 28px;
  height: 28px;
  vertical-align: middle;
  margin: -3px 6px 0 0;
}

.footer-content .icp {
  font-size: 0.85em;
  opacity: 0.9;
}
.wx-login-block {
  position: absolute;
  top: 50%;
  right: 10%;
  z-index: 1000;
  transform: translateY(-50%);
  width: 340px;
  height: 480px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 40px;

  .elite-title {
    font-size: 24px;
    position: absolute;
    top: 10px;
    left: 0;
    width: 100%;
    height: 40px;
    color: #0924f5;
    text-align: center;
    line-height: 40px;
    font-weight: bold;
  }
}

.wx-login-container iframe {
  width: 200px;
  height: 200px;
  border: none;
  border-radius: 8px;
}

/* 微信登录二维码样式优化 */
.wx-login-container .wx-login-iframe {
  width: 200px !important;
  height: 200px !important;
  border: none !important;
}

/* 登录状态样式 */
.login-success,
.login-loading,
.login-error,
.miniprogram-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  text-align: center;
}

/* 扫码成功样式 */
.login-success {
  color: #52c41a;
}

.success-icon {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
  animation: successPulse 1.5s ease-in-out infinite;
}

.success-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.success-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

/* 加载状态样式 */
.login-loading {
  color: #1890ff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 14px;
  opacity: 0.8;
}

/* 错误状态样式 */
.login-error {
  color: #ff4d4f;
}

.error-icon {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
}

.error-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.error-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

/* 小程序码样式 */
.miniprogram-code {
  color: #1890ff;
}

.miniprogram-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.miniprogram-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.miniprogram-subtitle {
  font-size: 12px;
  color: #666;
  opacity: 0.8;
  margin-bottom: 10px;
}

/* 动画效果 */
@keyframes successPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
