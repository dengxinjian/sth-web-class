<template>
  <div class="vip-dialog-mask" v-if="innerVisible">
    <div class="mask-container">
      <div class="container-top-box">
        <div class="container-top-box-title">订阅</div>
        <img src="~@/assets/plan/close.png" alt=""
          class="close-icon" @click="onCancel" />
      </div>
      <div class="container-content">
        <div class="container-content-title-box">
          <div class="container-content-title">
            <img src="~@/assets/vip/per_title1.png" alt=""
              class="container-content-title-img" />
            <img src="~@/assets/vip/jiao.png" alt=""
              class="container-content-title-bg" />
          </div>
        </div>
        <div class="content-box">
          <div class="content-box-title">权益说明</div>
          <div class="content-box-list">
            <div class="list-item" v-for="item in vipInfoList"
              :key="item.label">
              <img :src="item.img" alt="" />
              <div class="list-item-content">
                <!-- <div class="list-item-title">{{ item.title }}</div> -->
                <div class="list-item-sub-title">{{ item.subTitle }}
                </div>
                <div class="list-item-content-item"
                  v-for="child in item.children" :key="child.idx">
                  <div class="list-item-content-icon-box">
                    <span class="list-item-content-icon"></span>
                  </div>
                  <span class="list-item-content-text">{{
                    child.label
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="content-box-btn" @click="handleSubscribeVip">
            立即预约，免费试用
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { submitData } from "@/api/common"

export default {
  name: "Vip1",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: false },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      vipInfoList: [
        {
          title: "会员标识",
          subTitle: "会员专属图标",
          img: require("@/assets/vip/vip1.png"),
          children: [{ idx: 1, label: "精英版专属头像框" }],
        },
        {
          title: "运动分析",
          subTitle: "运动数据分析",
          img: require("@/assets/vip/vip2.png"),
          children: [
            { idx: 1, label: "任意时段刷选" },
            { idx: 2, label: "所选时段指标分析" },
          ],
        },
        {
          title: "运动表现",
          subTitle: "运动峰值表现",
          img: require("@/assets/vip/vip3.png"),
          children: [
            { idx: 1, label: "多维度峰值统计" },
            { idx: 2, label: "历史峰值对；" },
            { idx: 3, label: "数十种指标峰值统计" },
          ],
        },
        {
          title: "训练计划",
          subTitle: "示例计划可用",
          img: require("@/assets/vip/vip5.png"),
          children: [
            { idx: 1, label: "定期更新高效示例计划库可用" },
          ],
        },
      ],
    }
  },
  computed: {

  },
  watch: {
    visible(val) {
      this.innerVisible = val
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val
    },
    innerVisible(val) {
      this.$emit("update:visible", val)
    },
  },
  methods: {
    onCancel() {
      this.$emit("update:visible", false)
    },
    async handleSubscribeVip() {
      const _this = this
      submitData({
        url: "/consumer/api/vipSubscribe/subscribe",
        requestData: {
          identityType: "R",
          subscribeType: 1,
        },
      }).then((res) => {
        if (res.success) {
          _this.$message.success("订阅成功")
          _this.onCancel()
        } else {
          _this.$message.error(res.message)
        }
      })
    },
  },
}
</script>

<style scoped lang="scss">
.add-class-title-modal ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}

.add-class-title-modal ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.statistics-divider-wrapper {
  margin: 8px 0;
}

.statistics-divider-wrapper ::v-deep(.el-divider__text) {
  font-size: 12px;
}

/* 僅針對下方團隊列使用 flex，避免影響上方多選刪除時的排版 */
.add-class-title-modal .share-team-item ::v-deep(.el-form-item__content) {
  margin-left: 0;
  display: flex;
  align-items: center;
  margin-top: 4px;
}

/* 分享團隊名稱不換行，過長以省略號顯示 */
.add-class-title-modal .share-team-item ::v-deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 團隊選擇下拉框內標籤不換行 */
.add-class-title-modal .share-team-select ::v-deep(.el-select__tags .el-tag) {
  max-width: 100%;
}

.add-class-title-modal .share-team-select ::v-deep(.el-select__tags .el-tag .el-select__tags-text) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

::v-deep(.el-select .el-tag__close.el-icon-close) {
  top: -5px;
}

.vip-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  .mask-container {
    width: 880px;
    min-height: 500px;
    background: #fff;
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    // 背景图 从顶部，不变形，高度不变，宽度自适应
    background-image: url("~@/assets/Rectangle3031.png");
    background-repeat: no-repeat;
    background-position: top center;
    background-size: 100% auto;

    .container-top-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;

      .container-top-box-title {
        font-size: 16px;
        font-weight: bold;
        color: #101010;
      }

      .close-icon {
        width: 24px;
        height: 24px;
        cursor: pointer;
      }
    }

    .container-content {
      width: 100%;
      height: 520px;
      background: #fff;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      padding: 16px;
      box-sizing: border-box;
      position: relative;

      .container-content-title-box {
        width: 750px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 50px;
        top: -38px;

        .container-content-title {
          width: 120px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          position: relative;

          .container-content-title-img {
            width: 57px;
            height: 16px;
          }

          .container-content-title-bg {
            width: 144px;
            height: 12px;
            position: absolute;
            left: -12px;
            bottom: 0;
          }
        }
      }

      .content-box {
        width: 100%;
        height: 100%;
        border: 1px solid #f8e7e5;
        background: linear-gradient(180deg, #D9EDE8 0%, #FFFFFF 30%);
        border-radius: 8px;
        padding: 20px 40px 40px 16px;
        box-sizing: border-box;
        position: relative;

        .content-box-title {
          text-align: center;
          color: #101010;
          font-size: 14px;
          font-weight: 600;
        }

        .content-box-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          margin-top: 26px;
          // 每行3等分，可以换行，行距为10px
          column-gap: 16px;
          row-gap: 10px;
          margin-top: 16px;

          .list-item {
            // width: 33.33%;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            // gap: 10px;
            // 每行3个，减去2个gap（16px * 2 = 32px）
            width: calc((100% - 32px) / 3);
            box-sizing: border-box;
            margin-bottom: 16px;

            img {
              width: 30px;
              height: 30px;
              margin-right: 13px;
              flex-shrink: 0;
            }

            .list-item-title {
              font-size: 13px;
              color: #101010;
            }

            .list-item-content {
              .list-item-sub-title {
                height: 30px;
                line-height: 30px;
                font-size: 15px;
                font-weight: 600;
              }

              .list-item-content-item {
                display: flex;
                align-items: flex-start;
                margin-top: 8px;

                .list-item-content-icon-box {
                  height: 16px;
                  width: 6px !important;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 6px;
                }

                .list-item-content-icon {
                  width: 4px;
                  height: 4px;
                  border-radius: 4px;
                  background: #999;
                }

                .list-item-content-text {
                  flex: 1;
                  font-size: 12px;
                  line-height: 16px;
                  font-weight: 400;
                  color: #999;
                }
              }
            }
          }
        }

        .content-box-btn {
          width: 352px;
          height: 32px;
          border-radius: 6px;
          background: linear-gradient(90.94deg, #2A2A2A 10%, #008867 50%, #2A2A2A 90%);
          text-align: center;
          line-height: 32px;
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          position: fixed;
          left: 264px;
          bottom: 32px;
        }
      }
    }
  }
}
</style>
