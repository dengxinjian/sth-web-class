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
          <!-- <p style="margin-bottom: 300px;">让科学普及训练</p> -->
          <p style="margin-bottom: 300px;font-size: 32px;font-weight: 400;">2025.H2 强者觉醒 敬请期待！</p>
          <!-- <p>敬请期待！</p> -->
          <div class="contact-info">
            <h5 style="font-size: 32px;font-weight: 400;">联系我们</h5>
            <!-- <div class="contact-item">
                        <span class="contact-label">电话：</span>
                        <span class="contact-value">000-0000-0000</span>
                    </div> -->
            <div class="contact-item" style="margin-bottom: 100px;">
              <!-- <span class="contact-label">邮箱：</span> -->
              <span class="contact-value" style="font-size: 24px;text-decoration: underline;">service@strongtri.com</span>
            </div>
          </div>
        </div>
      </div>
      <div class="wx-login-block">
        <!-- <div class="elite-title"> -->
        <!-- <img
            src="./imgs/PREMIUM.svg"
            alt="ELITE"
            width="112px"
            style="margin-top: 12px"
            v-if="loginType === '2'"
          /> -->
        <!-- <span v-else>ELITE</span> -->
        <!-- <img src="./imgs/title.png" alt="ELITE" style="scale: 0.45" v-else /> -->
        <!-- </div> -->
        <div>微信登录</div>
        <div
          id="wx-login-container"
          :class="wx - login - container"
          v-if="isNewUser"
        >
          <!-- 扫码成功状态 -->
          <!-- <div v-if="hasCode" class="login-success">
            <div class="success-icon">✓</div>
            <div class="success-text">扫码成功</div>
            <div class="success-subtitle">正在跳转...</div>
          </div> -->
          <!-- 加载状态 -->
          <!-- <div v-else-if="wxLoginStatus === 'loading'" class="login-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">正在加载二维码...</div>
          </div> -->
          <!-- 错误状态 -->
          <!-- <div v-else-if="wxLoginStatus === 'error'" class="login-error">
            <div class="error-icon">✗</div>
            <div class="error-text">加载失败</div>
            <div class="error-subtitle">请刷新重试</div>
          </div> -->
          <div class="miniprogram-code">
            <div class="miniprogram-title">请使用微信扫码</div>
            <img :src="miniprogramUrl" alt="小程序码" class="miniprogram-img" />
            <div class="miniprogram-subtitle">扫码进入小程序</div>
            <el-button @click="handleMiniprogramCode">我已完成</el-button>
          </div>
        </div>
        <!-- 扫码关注服务号 -->
        <div
          id="wx-login-container"
          class="wx-login-container"
          v-if="!isNewUser"
        >
          <img class="qrcode-img" :src="qrcodeUrl" alt="扫码二维码" />
          <div v-if="!isAgreement" class="wx-login-cover"></div>
          <div class="qrcode-subtitle" v-if="isExpire">
            <div></div>
            <img
              src="./imgs/refresh.png"
              alt="二维码已过期"
              width="50"
              height="50"
              @click.stop="refreshQrCode"
            />
            <div>
              <div>二维码已过期</div>
              <div>请重新获取</div>
            </div>
          </div>
          <div class="qrcode-subtitle-box">
            <div>使用微信扫一扫登录</div>
            <div>“强者之心 STH”</div>
          </div>
        </div>
        <!-- <div v-if="!isAgreement" class="wx-login-cover"></div> -->
        <!-- <div style="margin-bottom: 20px" v-if="!isNewUser">
          <el-radio-group v-model="loginType" @change="handleLoginTypeChange">
            <el-radio label="1">运动员</el-radio>
            <el-radio label="2">教练</el-radio>
          </el-radio-group>
        </div> -->
        <div style="display: flex; align-items: center; font-size: 14px">
          <el-checkbox
            v-model="isAgreement"
            label=""
            style="margin-right: 5px"
          ></el-checkbox>
          <span>我已阅读并同意</span>
          <!-- <router-link to="/agreement" style="color: #f92b30"
            >《课程配置器用户协议》</router-link
          > -->
          <span style="color: #f92b30; cursor: pointer;" @click="openMask">《课程配置器用户协议》</span>
        </div>
      </div>
    </div>

    <footer>
      <div class="footer-content">
        <p style="margin-right: 30px">
          <img
            :src="require('@/views/login-wx/imgs/logo.png')"
            alt=""
            width="30"
          />© 2025 武汉强大之心体育有限公司 版权所有 鄂ICP备2024075413号-2 |
          <router-link to="/privacy">隐私政策</router-link>
        </p>
        <p>
          <el-link
            type="info"
            href="https://dailysync.vyzt.dev/"
            target="_blank"
          >
            友情链接: 用'dailysync'同步你的佳明中国与佳明国际数据</el-link
          >
        </p>
      </div>
    </footer>
    <div class="mask" v-if="isShowAgreement">
      <div class="mask-content">
        <div class="mask-content-header">
          <div class="mask-content-header-title">课程配置器用户协议</div>
          <div class="mask-content-header-close">
            <img src="./imgs/close.png" @click.stop="closeMask" />
          </div>
        </div>
        <div class="mask-content-body">
          <div>
            重要提示：请在使用<text class="blod">【强者之心网页版】</text>（以下简称“本平台”或“我们”）的服务之前，仔细阅读本用户协议（以下简称“本协议”）。您一旦注册、登录、使用或以任何方式使用本服务，即表示您已充分理解并完全同意本协议的全部内容，并承诺遵守本协议及所有适用的法律法规。如果您不同意本协议的任何条款，请立即停止使用本服务。​
          </div>
          <div class="title blod">一、 服务定义</div>
          <div>
            1.1
            本平台仅提供一个在线运动课程配置工具（以下简称“本工具”），允许教练用户创建、编辑、管理和分发运动课程计划（以下简称“课表”）。
          </div>
          <div>1.2 运动员用户可以查看、接收由教练分发的课表。</div>
          <div>
            1.3
            本平台本身不生产、编辑或审核任何具体的课表内容，课表内容完全由教练用户独立创建和负责。
          </div>
          <div class="title">二、 用户身份与责任划分</div>
          <div>2.1 教练用户（以下简称“教练”）​</div>
          <div>
            a.
            您确认并承诺，您是具备相关资质的专业体育教练或健康专业人士，了解运动科学知识，能够为运动员制定安全、科学、合理的训练计划。
          </div>
          <div>
            b.
            您独立承担由您创建、配置、分发的所有课表内容的全部责任。这包括但不限于课表的科学性、安全性、合理性、有效性以及其对特定运动员的适用性。
          </div>
          <div>
            c.
            您有责任在布置课表前，充分了解运动员的身体健康状况、运动能力、伤病史等信息，并据此制定个性化的训练方案。禁止布置超出运动员合理能力范围的、可能导致受伤的高风险课程。​​
          </div>
          <div>
            d.
            您理解并同意，您与运动员之间存在的任何服务关系或纠纷，均由您与运动员自行解决，与本平台无关。
          </div>
          <div>2.2 运动员用户（以下简称“运动员”）</div>
          <div>
            a.
            您明确知悉并同意，您从教练处接收的任何课表，其执行与训练完全基于您个人的自愿选择，并自行承担所有风险。
          </div>
          <div>
            b.
            在开始任何训练计划之前，您有责任自行咨询医生或其他合格的医疗专业人员，确认自身身体状况适合该课表所要求的训练强度。​​
            如果您有已知或疑似的心脏病、高血压、关节伤病、怀孕或其他任何可能因运动而加重的健康状况，必须在执行课表前获得医生的许可。
          </div>
          <div>
            c.
            您有责任在训练过程中聆听身体的信号，如感到疼痛、眩晕、呼吸困难或其他不适，应立即停止训练并及时就医。
          </div>
          <div>
            d.
            您理解，教练提供的课表仅为建议，您需要根据自身的实时身体状况灵活调整训练强度、时长和内容。
          </div>
          <div>2.3 平台方​</div>
          <div>
            a.
            本平台仅作为技术工具提供方，不涉及任何具体的体育训练指导或医疗服务。我们不对任何课表内容的准确性、科学性、安全性、有效性或适用性作出任何明示或暗示的声明或保证。
          </div>
          <div>
            b.
            本平台不对因以下情况导致的任何直接、间接、附带、特殊、惩罚性或后果性的损害或损失（包括但不限于人身伤害、财产损失、利润损失、数据丢失）承担任何责任：​
          </div>
          <div>教练配置的课表内容存在错误、不科学或不安全；</div>
          <div>运动员未咨询医生或忽视自身身体状况而执行课表；</div>
          <div>运动员错误理解或错误执行课表内容；</div>
          <div>训练过程中发生的任何意外事故。</div>
          <div>
            c.
            本平台无法也不会对每一位教练的资质、每一份课表的内容进行实质性审查。
          </div>
          <div class="title">三、 免责声明</div>
          <div>
            您特此同意，使用本工具和任何课表的风险完全由您自己承担。本服务以“现状”和“可用”的基础提供。本平台明确否认所有明示或暗示的保证，包括但不限于对适销性、特定用途适用性和非侵权性的暗示保证。​
          </div>
          <div>
            本平台不保证服务不中断、及时、安全或无错误。您从本平台或通过本服务获得的任何口头或书面建议或信息，均不构成未在本协议中明确规定的任何保证。
          </div>
          <div class="title">四、 知识产权​</div>
          <div>
            4.1
            本工具相关的软件、界面、设计、文案、logo等所有知识产权归本平台所有。
          </div>
          <div>
            4.2
            教练独立创建的课表内容，其知识产权归该教练所有。但教练授予本平台一项全球性、免版税的非独占许可，允许本平台为了提供服务（如存储、分发、展示）而使用、托管、传输其课表内容。
          </div>
          <div class="title">五、 隐私政策</div>
          <div>
            关于我们如何收集、使用和披露您的个人信息，请参阅我们单独的《隐私政策》。该政策构成本协议的一部分。
          </div>
          <div class="title">六、 协议修改与终止</div>
          <div>
            6.1
            本平台有权根据需要不时地修改本协议的任何条款。一旦条款发生变更，我们将在网站上公布修订后的协议。您继续使用服务即表示您接受修订后的协议。
          </div>
          <div>
            6.2
            本平台有权因任何原因，在不事先通知的情况下，终止向您提供全部或部分服务。
          </div>
          <div class="title">七、 适用法律与争议解决​</div>
          <div>
            7.1 本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。
          </div>
          <div>
            7.2
            因本协议引起的或与本协议有关的任何争议，应首先通过友好协商解决；协商不成的，任何一方均有权将争议提交至【本平台运营公司所在地】有管辖权的人民法院诉讼解决。
          </div>
          <div>
            再次重申：运动健身存在固有风险，可能导致受伤。您在使用本工具和任何课表前，已充分了解并自愿承担这些风险。本平台仅为信息传输和技术服务提供者，不承担任何因使用课表内容而产生的责任。
          </div>
          <div>请根据您的身体状况，谨慎训练，量力而行。</div>
          <!-- <div style="text-align: center; margin: 20px 0">
            <el-button type="default" @click="goBack">返回</el-button>
          </div> -->
        </div>
        <div class="mask-content-footer">
          <div class="mask-content-footer-button" @click="closeMask">确认</div>
        </div>
      </div>
    </div>
    <!-- <div class="maintenance-container">
      <div>系统维护中，请稍后访问</div>
    </div> -->
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
      wxLoginStatus: "loading", // 微信登录状态：loading, success, error
      isAgreement: false, // 是否同意用户协议
      loginType: "1", // 登录类型：1-运动员，2-教练
      qrcodeUrl: "",
      sceneId: "",
      pollTimer: null, // 轮询定时器
      POLL_INTERVAL: 2000, // 轮询间隔：2秒
      isNewUser: false, // 是否是新用户
      expireTime: 0, // 二维码过期时间
      expireTimestamp: 0, // 二维码过期时间戳
      expireTimer: null, // 二维码过期定时器
      // 是否过期
      isExpire: false,
      isShowAgreement: false,
      miniprogramUrl:
        process.env.NODE_ENV === "production"
          ? require("@/views/login-wx/imgs/miniprogram.png")
          : require("@/views/login-wx/imgs/miniprogram-test.png"),
    };
  },
  mounted() {
    this.getScanQrCode();
    // this.checkUrlParams();
    this.initSlider();
    // this.loginType = localStorage.getItem("loginType") || "1";
    // localStorage.setItem("loginType", this.loginType);
  },
  beforeDestroy() {
    clearInterval(this.carouselTimer);
    this.clearPollTimer();
    this.clearExpireTimer();
  },
  methods: {
    openMask() {
      this.isShowAgreement = true;
    },
    closeMask() {
      this.isShowAgreement = false;
    },
    refreshQrCode() {
      setTimeout(() => {
        this.isExpire = false;
        this.getScanQrCode();
      }, 300);
    },
    clearExpireTimer() {
      if (this.expireTimer) {
        clearTimeout(this.expireTimer);
        this.expireTimer = null;
      }
    },
    // 300s的倒计时函数
    countDown() {
      if (this.expireTimestamp === 0) return;
      const now = new Date() - this.expireTimestamp;
      this.clearExpireTimer();
      if (Date.now() - this.expireTimestamp < 290000) {
        this.expireTimer = setTimeout(() => {
          this.expireTime--;
          this.countDown();
        }, 1000);
      } else {
        console.log("二维码过期");
        this.isExpire = true;
        this.expireTimestamp = 0;
        this.clearPollTimer();
        this.clearExpireTimer();
      }
    },
    handleMiniprogramCode() {
      if (this.unionid) {
        getData({
          url: "/gateway/wechat/getByUnionid",
          unionid: this.unionid,
        })
          .then((res) => {
            if (res.result.jwt) {
              this.$message.success("登录成功");
              this.$store.commit("user/SET_TOKEN", res.result.jwt);
              this.$store.commit("user/SET_NAME", res.result.nicknameTag);
              const { userInfo } = res.result;
              const loginType = userInfo?.webIdentityType && userInfo?.webIdentityType === "C" ? "2" : "1";
              localStorage.setItem("loginType", loginType);
              localStorage.setItem("webIdentityType", userInfo?.webIdentityType);

              localStorage.setItem("triUserId", res.result.triUserId);
              localStorage.setItem("name", res.result.nicknameTag);
              // console.log("res.result.jwt", res.result.jwt);
              setToken(res.result.jwt);
              this.$router.push("/timeTable/class");
            } else {
              this.$message.error("请完成引导页设置");
            }
          })
          .catch((error) => {
            console.error("获取微信用户信息失败:", error);
            this.$message.error("获取微信用户信息失败，请刷新重试");
          });
      }
    },
    /**
     * 启动扫码结果轮询定时器
     */
    startPolling() {
      this.clearPollTimer();
      if (!this.sceneId) {
        console.warn("sceneId 为空，无法启动轮询");
        return;
      }
      // 使用递归的 setTimeout 实现轮询，避免定时器类型不匹配问题
      const poll = () => {
        this.pollTimer = setTimeout(async () => {
          await this.checkLoginResult();
          // 如果轮询还在进行（未登录成功），继续下一次轮询
          if (this.pollTimer) {
            poll();
          }
        }, this.POLL_INTERVAL);
      };
      poll();
    },
    /**
     * 清除扫码结果轮询定时器
     */
    clearPollTimer() {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer);
        this.pollTimer = null;
      }
    },
    /**
     * 检查扫码登录结果
     */
    async checkLoginResult() {
      if (!this.sceneId) {
        console.warn("sceneId 为空，无法获取登录结果");
        this.clearPollTimer();
        return;
      }

      try {
        const res = await getData({
          url: `/gateway/wechat/wechatScanLogin/${this.sceneId}`,
        });

        if (res.code === "100000" && res.result && res.result) {
          // 扫码成功，停止轮询并处理登录
          this.isExpire = false;
          this.expireTimestamp = 0;
          this.clearPollTimer();
          this.clearExpireTimer();
          this.handleLoginSuccess(res.result);
        } else if (res.result?.message) {
          // 显示状态信息（但不停止轮询，允许继续尝试）
          console.warn("扫码登录状态:", res.result.message);
        }
      } catch (error) {
        console.error("获取扫码登录结果失败:", error);
        // 网络错误时不停止轮询，继续尝试
      }
    },
    /**
     * 处理登录成功
     * @param {Object} result - 登录结果数据
     */
    handleLoginSuccess(result) {
      if (!result?.jwt) {
        // console.warn("登录结果数据不完整，继续轮询");
        this.isNewUser = true;
        this.unionid = result.unionid;
        // this.checkUrlParams();
        // this.startPolling();
        return;
      }
      this.$message.success("登录成功");
      // 保存用户信息到 Vuex
      this.$store.commit("user/SET_TOKEN", result.jwt);
      this.$store.commit("user/SET_NAME", result.nicknameTag);
      const { userInfo } = result;
      const loginType = userInfo?.webIdentityType && userInfo?.webIdentityType === "C" ? "2" : "1";
      localStorage.setItem("loginType", loginType);
      localStorage.setItem("webIdentityType", userInfo?.webIdentityType);
      // 保存用户信息到 localStorage
      localStorage.setItem("triUserId", result.triUserId);
      localStorage.setItem("name", result.nicknameTag);

      // 设置 token
      setToken(result.jwt);

      // 跳转到主页
      this.$router.push("/timeTable/class");
    },
    /**
     * 获取扫码二维码
     */
    getScanQrCode() {
      getData({
        url: "/consumer/api/wechat/wechatScanLoginQrCode",
      })
        .then((res) => {
          if (res.result?.sceneId && res.result?.ticket) {
            // 过期时间
            this.expireTimestamp = res.timestamp;
            // console.log("this.expireTimestamp", this.expireTimestamp);
            this.expireTime = res.result.expireSeconds - 25 || 0;
            this.sceneId = res.result.sceneId;
            this.qrcodeUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${res.result.ticket}`;

            // token 不存在时启动轮询
            if (!this.$store.getters.token) {
              this.startPolling();
              this.countDown();
            }
          } else {
            this.$message.error("获取二维码失败，请刷新重试");
          }
        })
        .catch((error) => {
          console.error("获取扫码二维码失败:", error);
          this.$message.error("获取二维码失败，请检查网络连接后刷新重试");
        });
    },
    // 检查URL参数
    checkUrlParams() {
      // 添加更详细的调试信息
      // console.log("当前完整URL:", window.location.href);
      // console.log("window.location.search:", window.location.search);
      // console.log("window.location.hash:", window.location.hash);

      // 尝试多种方式获取code和state参数
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      // 也检查hash中的参数（有些情况下参数可能在hash中）
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const codeFromHash = hashParams.get("code");
      const stateFromHash = hashParams.get("state");

      // 检查URL中是否包含code字符串
      const urlContainsCode = window.location.href.includes("code=");
      const urlContainsState = window.location.href.includes("state=");

      console.log("URL参数检测详情:", {
        search: window.location.search,
        hash: window.location.hash,
        codeFromSearch: code,
        stateFromSearch: state,
        codeFromHash: codeFromHash,
        stateFromHash: stateFromHash,
        urlContainsCode: urlContainsCode,
        urlContainsState: urlContainsState,
        allSearchParams: Object.fromEntries(urlParams),
        allHashParams: Object.fromEntries(hashParams),
      });

      // 备用方法：使用正则表达式解析URL参数
      const regexCode = this.getUrlParameter("code");
      const regexState = this.getUrlParameter("state");

      // 优先使用search中的参数，如果没有则使用hash中的参数，最后使用正则表达式
      const finalCode = code || codeFromHash || regexCode;
      const finalState = state || stateFromHash || regexState;

      // console.log("最终获取到的参数:", { code: finalCode, state: finalState });

      if (finalCode) {
        this.hasCode = true;
        this.wxLoginStatus = "success";
        // console.log(
        //   "检测到code参数，显示扫码成功状态，code值:",
        //   finalCode,
        //   "state值:",
        //   finalState
        // );

        // 可以在这里处理登录成功后的逻辑
        this.handleUrlLoginSuccess(finalCode, finalState);
      } else {
        // console.log("未检测到code参数，开始初始化微信登录");
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

    // 处理URL参数登录成功
    handleUrlLoginSuccess(code, state) {
      // console.log("处理登录成功，code:", code, "state:", state);

      // 调用微信登录回调接口，同时传递code和state参数
      getData({
        url: "/consumer/api/wechat/callback",
        data: {
          code: code,
          state: state,
        },
      })
        .then((res) => {
          // console.log("微信登录回调成功，res:", res);

          // 根据后端返回结果处理后续逻辑
          if (res.success) {
            // 登录成功，可以跳转到主页或保存用户信息
            // console.log("登录成功，准备跳转");
            // this.$router.push('/dashboard'); // 根据实际路由调整
          } else {
            // 登录失败，显示错误信息
            console.error("登录失败:", res.message);
            this.$message.error(res.message || "登录失败，请重试");
          }
        })
        .catch((error) => {
          console.error("微信登录回调失败:", error);
          this.$message.error("登录失败，请重试");
        });

      // 这里可以添加登录成功后的处理逻辑
      // 比如发送code到后端验证，获取用户信息等

      // 示例：3秒后跳转到主页
      setTimeout(() => {
        // console.log("准备跳转到主页");
        // this.$router.push('/dashboard'); // 根据实际路由调整
      }, 3000);
    },
    initSlider() {
      // 使用 $nextTick 确保 DOM 完全渲染后再初始化轮播
      this.$nextTick(() => {
        const slider = document.querySelector(".slider");
        if (!slider) {
          console.error("轮播容器未找到");
          return;
        }

        let currentImageIndex = 0;
        let loadedImages = 0;

        // console.log("背景图片数组:", this.backgroundImages);
        // console.log("轮播容器:", slider);

        // 清空容器
        slider.innerHTML = "";

        // 初始化轮播图片
        this.backgroundImages.forEach((image, index) => {
          // console.log(`添加图片 ${index}:`, image);
          const img = document.createElement("img");
          img.src = image;
          img.className = index === 0 ? "active" : "";
          img.style.objectFit = "cover";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.position = "absolute";
          img.style.top = "0";
          img.style.left = "0";
          img.style.opacity = index === 0 ? "1" : "0";
          img.style.transition = "opacity 1s ease-in-out";

          img.onload = () => {
            // console.log(`图片 ${index} 加载成功`);
            loadedImages++;
            if (loadedImages === this.backgroundImages.length) {
              // console.log("所有图片加载完成，开始轮播");
            }
          };

          img.onerror = (e) => {
            console.error(`图片 ${index} 加载失败:`, e);
            console.error("图片路径:", image);
          };

          slider.appendChild(img);
        });

        // 切换到下一张图片
        const nextImage = () => {
          const imgs = slider.querySelectorAll("img");
          if (imgs.length === 0) {
            console.warn("没有找到轮播图片");
            return;
          }

          imgs[currentImageIndex].classList.remove("active");
          imgs[currentImageIndex].style.opacity = "0";

          currentImageIndex =
            (currentImageIndex + 1) % this.backgroundImages.length;

          imgs[currentImageIndex].classList.add("active");
          imgs[currentImageIndex].style.opacity = "1";

          console.log(`切换到图片 ${currentImageIndex}`);
        };

        // 设置自动轮播间隔
        this.carouselTimer = setInterval(nextImage, 5000);
        console.log("轮播定时器已启动，间隔5秒");
      });
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
            console.log("微信登录脚本已存在");
            return resolve();
          }

          console.log("开始加载微信登录脚本...");
          const s = document.createElement("script");
          s.src =
            "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
          s.async = true;
          s.onload = () => {
            console.log("微信登录脚本加载成功");
            resolve();
          };
          s.onerror = (e) => {
            console.error("微信登录脚本加载失败:", e);
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

        console.log("开始创建微信登录二维码...");
        console.log("AppId:", appId);
        console.log("RedirectUri:", redirectUri);

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

        console.log("微信登录二维码创建成功");
        this.wxLoginStatus = "success";
      } catch (error) {
        console.error("创建微信登录二维码时出错:", error);
        this.wxLoginStatus = "error";
        this.$message.error("创建微信登录二维码失败，请刷新重试");
      }
    },
    handleLoginTypeChange(value) {
      localStorage.setItem("loginType", value);
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  z-index: 1;
}

.slider img.active {
  opacity: 1;
  z-index: 2;
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
  font-size: 0.9em;
  background: rgba(0, 0, 0, 0.7);
  text-align: center;
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
  width: 400px;
  height: 500px;
  position: absolute;
  top: 50%;
  right: 100px;
  z-index: 1000;
  transform: translateY(-50%);
  background-color: #ffffffeb;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  // padding-top: 80px;
  padding: 32px 0 62px 0;
  box-sizing: border-box;

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
.wx-login-container {
  position: relative;
}
.wx-login-container.noAgreement {
  filter: blur(5px);
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
.login-error {
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

/* 登录状态样式 */
.miniprogram-code {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 60px;
}

.miniprogram-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.miniprogram-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

/* 扫码成功样式 */
.login-success {
  color: #52c41a;
}

.miniprogram-subtitle {
  font-size: 12px;
  color: #666;
  opacity: 0.8;
  margin-bottom: 10px;
}

/* 小程序码样式 */
.miniprogram-code {
  color: #1890ff;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  border: none;
  border-radius: 8px;
  // margin-bottom: 60px;
}

.qrcode-subtitle-box {
  font-size: 14px;
  line-height: 22px;
  color: #666666;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
}

.wx-login-cover {
  width: 200px;
  height: 200px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 8px;
}

.qrcode-subtitle {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  font-size: 14px;
  & > img {
    cursor: pointer;
  }
  & > div {
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 30px;
    color: #fff;
  }
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
.mask {
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}
.mask-content {
  width: 880px;
  height: 640px;
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  .mask-content-header {
    height: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .mask-content-header-title {
      font-size: 16px;
      font-weight: bold;
    }
    .mask-content-header-close {
      width: 24px;
      height: 24px;
      cursor: pointer;
      & > img {
        width: 100%;
        height: 100%;
      }
    }
    .mask-content-header-close:hover {
      opacity: 0.8;
    }
  }
  .mask-content-body {
    margin-top: 20px;
    height: 512px;
    overflow-y: scroll;
    font-size: 14px;
    line-height: 22px;
    letter-spacing: 1px;
    /* 隐藏滚动条但保持滚动功能 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
    .blod{
      font-weight: 600;
    }
    .title{
      margin: 16px 0;
      font-weight: 600;
    }
  }
  .mask-content-footer {
    width: 880px;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0px -1px 0px 0px #00000026;
    background-color: #fff;
    position: absolute;
    left: 0;
    bottom: 0;
    .mask-content-footer-button {
      width: 200px;
      height: 32px;
      background: #f92b30;
      color: #fff;
      font-size: 14px;
      text-align: center;
      line-height: 32px;
      border-radius: 5px;
      cursor: pointer;
    }
    .mask-content-footer-button:hover {
      opacity: 0.8;
    }
  }
}
.maintenance-container{
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  background: rgba(255, 255, 255, 0.95);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}
</style>
