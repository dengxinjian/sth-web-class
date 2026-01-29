<template>
  <div class="plan-container">
    <!-- 课程类型切换 -->
    <div class="plan-type-list">
      <div
        class="class-type-item"
        :class="{ 'active-title': activeClassType === 'my' }"
        @click="handleClassTypeChange('my')"
      >
        <div
          class="title"
          :class="{ 'active-title': activeClassType === 'my' }"
        >
          我的计划
        </div>
      </div>
      <div
        class="class-type-item"
        :class="{ 'active-title': activeClassType === 'team' }"
        @click="handleClassTypeChange('team')"
        v-if="loginType === '2'"
      >
        <div
          class="title"
          :class="{ 'active-title': activeClassType === 'team' }"
        >
          团队计划
        </div>
      </div>
      <div
        class="class-type-item"
        :class="{ 'active-title': activeClassType === 'official' }"
        @click="handleClassTypeChange('official')"
      >
        <div
          class="title"
          :class="{ 'active-title': activeClassType === 'official' }"
        >
          计划示例
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="class-operation">
      <el-popover
        v-if="activeClassType === 'my' && showAddClassBtn"
        placement="bottom"
        width="160"
        trigger="click"
        popper-class="add-class-btn-popover"
      >
        <el-button type="primary" size="mini" slot="reference">新增</el-button>
        <div
          style="display: flex; flex-direction: column; gap: 6px; width: 100px"
        >
          <span>
            <div class="add-class-btn" @click="$emit('add-plan')">新增计划</div>
          </span>
          <span>
            <div class="add-class-btn" @click="$emit('add-group')">
              新增分组
            </div>
          </span>
        </div>
      </el-popover>

      <el-input
        size="mini"
        v-model="searchInput"
        @input="handleSearch"
        clearable
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        ></el-button>
      </el-input>
    </div>

    <div class="team-operation" v-if="activeClassType === 'team'">
      <ShareTree
        ref="shareTreeRef"
        :search-input="searchInput"
        @add-share-group="handleAddShareGroup"
        @edit-share-group="handleEditShareGroup"
        @delete-share-group="handleDeleteShareGroup"
        @move-share-group="handleMoveShareGroup"
        @view-plan="handleViewPlan"
      />
    </div>

    <!-- 课程列表 -->
    <div class="schedule-plan-container" v-if="activeClassType !== 'team'">
      <el-collapse
        v-model="activeCollapse"
        accordion
        @change="$emit('collapse-change')"
        v-loading="loading"
      >
        <el-collapse-item
          v-for="item in classList"
          :key="item.groupId"
          :name="item.groupId"
        >
          <template slot="title">
            <div class="schedule-class-title">
              <div class="group-name">
                <span class="group-name-text">{{ item.groupName }}</span>
                <span class="group-name-count">({{ item.classesCount }})</span>
              </div>
              <el-popover
                v-if="activeClassType === 'my' && showAddClassBtn"
                popper-class="athletic-btn-popover"
                placement="right"
                width="80"
                trigger="hover"
              >
                <div class="group-operations">
                  <span>
                    <el-button
                      type="text"
                      @click="$emit('add-plan', item.groupId)"
                    >
                      新增计划
                    </el-button>
                  </span>
                  <span>
                    <el-button
                      type="text"
                      :disabled="!item.groupId"
                      @click="$emit('edit-group', item)"
                    >
                      编辑分组
                    </el-button>
                  </span>
                  <!-- <span>
                    <el-button
                      type="text"
                      :disabled="!item.groupId"
                      @click="$emit('move-group', item.groupId)"
                    >
                      移动分组
                    </el-button>
                  </span> -->
                  <span>
                    <el-button
                      type="text"
                      :disabled="!item.groupId"
                      @click="$emit('delete-group', item)"
                    >
                      删除分组
                    </el-button>
                  </span>
                </div>
                <i class="el-icon-more" slot="reference" @click.stop></i>
              </el-popover>
            </div>
          </template>

          <div class="plan-js-class-drag-container" :key="item.timespan">
            <div
              class="plan-item"
              :class="{ active: selectedPlanId === classItem.id }"
              v-for="classItem in item.classesList"
              :key="classItem.id"
              @click.stop="$emit('choose-plan', classItem.id, item.groupId)"
            >
              <el-popover
                placement="right"
                width="320px"
                trigger="hover"
                :disabled="!classItem.planTitle"
                popper-class="hover-plan-detail-popover"
              >
                <!-- <span slot="reference" @click.stop>{{ classItem.planTitle }}</span> -->
                <span slot="reference">
                  <div style="width: 100%; cursor: pointer">
                    {{ classItem.planTitle }}
                  </div>
                  <div
                    style="
                      width: 100%;
                      cursor: pointer;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      gap: 5px;
                    "
                  >
                    <el-rate
                      v-model="classItem.level"
                      :allow-half="true"
                      disabled
                      :colors="['#F92B30', '#F92B30', '#F92B30']"
                      text-color="#999999"
                      disabled-void-color="#E1E4EC"
                    ></el-rate>
                    <span style="font-size: 10px; color: #979fb0">{{
                      classItem.level ? "" : "未评分"
                    }}</span>
                  </div>
                </span>
                <HoverPlanDetail :planInfo="classItem" @move="handleMovePlan"></HoverPlanDetail>
              </el-popover>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import { debounce } from "../../classManagement/uilt";
import HoverPlanDetail from "./HoverPlanDetail/index.vue";
import ShareTree from "./ShareTree.vue";
export default {
  name: "PlanList",
  components: {
    HoverPlanDetail,
    ShareTree,
  },
  props: {
    classList: {
      type: Array,
      default: () => [],
    },
    activeClassType: {
      type: String,
      default: "my",
    },
    showAddClassBtn: {
      type: Boolean,
      default: true,
    },
    selectedPlanId: {
      type: [String, Number],
      default: null,
    },
    currentPlanGroupId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      searchInput: "",
      activeCollapse: null,
      loading: false,
      loginType: localStorage.getItem("loginType") || "1",
    };
  },
  watch: {
    currentPlanGroupId: {
      handler(newVal) {
        // 如果有值，尝试展开
        if (newVal) {
          // 延迟执行，确保 classList 已更新
          this.$nextTick(() => {
            this.tryExpandGroup();
          });
        }
      },
      immediate: true,
    },
    classList: {
      handler(newList) {
        // 当列表更新时隐藏 loading
        this.loading = false;
        // 当列表更新时，如果 currentPlanGroupId 有值且对应的分组存在，则展开
        if (
          this.currentPlanGroupId != null &&
          Array.isArray(newList) &&
          newList.length > 0
        ) {
          this.$nextTick(() => {
            this.tryExpandGroup();
          });
        }
      },
      immediate: true,
      deep: true,
    },
    // 监听 activeClassType 变化
    activeClassType: {
      handler(newVal, oldVal) {
        // 清空搜索输入
        this.searchInput = "";
        // 当 activeClassType 改变时显示 loading 并折叠所有项
        if (oldVal !== undefined && newVal !== oldVal) {
          this.loading = true;
          this.activeCollapse = null;
        }
        this.handleClassTypeChange(newVal);
      },
      immediate: true,
    },
  },
  mounted() {
    // 组件挂载后，延迟检查以确保数据已加载
    // 使用 setTimeout 确保在异步数据加载完成后也能展开
    setTimeout(() => {
      this.tryExpandGroup();
    }, 100);
  },
  created() {
    this.emitSearch = debounce(() => {
      this.$emit("search", this.searchInput);
    }, 500);
  },
  methods: {
    handleClassTypeChange(type) {
      // 清空搜索输入
      this.searchInput = "";
      this.$emit("update:activeClassType", type);
      // 触发 class-type-change 事件，让父组件处理类型切换
      this.$emit("class-type-change", type);
      // 切换到 team 类型时，触发重新加载团队列表并强制重新渲染 el-tree
      if (type === "team") {
        this.$emit("reload-team-list");
        // 重置 el-tree 的当前选中节点
        this.$nextTick(() => {
          if (this.$refs.shareTreeRef) {
            this.$refs.shareTreeRef.resetCurrentKey();
          }
        });
      }
    },
    handleSearch() {
      if (this.emitSearch) {
        this.emitSearch();
      }
    },
    /**
     * 检查指定的 groupId 是否存在于 classList 中
     * @param {String|Number} groupId - 分组ID
     * @returns {Boolean} 是否存在
     */
    isGroupExists(groupId) {
      // 检查 groupId 是否有效（不为空字符串、null、undefined，但允许0）
      if (
        groupId == null ||
        groupId === "" ||
        !Array.isArray(this.classList) ||
        this.classList.length === 0
      ) {
        return false;
      }
      // 转换为字符串进行比较，支持数字和字符串类型
      const targetId = String(groupId);
      return this.classList.some((item) => {
        if (!item || item.groupId == null) return false;
        return String(item.groupId) === targetId;
      });
    },
    /**
     * 尝试展开指定的分组
     */
    tryExpandGroup() {
      if (
        this.currentPlanGroupId != null &&
        this.isGroupExists(this.currentPlanGroupId)
      ) {
        this.$nextTick(() => {
          this.activeCollapse = this.currentPlanGroupId;
        });
      }
    },
    handleAddShareGroup(node) {
      this.$emit("add-share-group", node);
    },
    handleEditShareGroup(node) {
      this.$emit("edit-share-group", node);
    },
    handleDeleteShareGroup(node) {
      this.$emit("delete-share-group", node);
    },
    handleMoveShareGroup(node) {
      this.$emit("move-share-group", node);
    },
    handleViewPlan(sourcePlanId, data) {
      this.$emit("view-plan", sourcePlanId, data);
    },
    /**
     * 处理添加分组
     */
    handleAddGroup() {
      this.$emit("add-group");
    },
    /**
     * 处理编辑分组
     */
    handleEditGroup(node) {
      if (node && node.data) {
        this.$emit("edit-group", {
          groupId: node.data.id,
          groupName: node.data.label || node.data.groupName,
        });
      }
    },
    /**
     * 处理删除分组
     */
    handleDeleteGroup(node) {
      if (node && node.data) {
        this.$emit("delete-group", {
          groupId: node.data.id,
          groupName: node.data.label || node.data.groupName,
        });
      }
    },
    /**
     * 刷新团队树数据
     */
    refreshTeamTree() {
      if (this.$refs.shareTreeRef && this.$refs.shareTreeRef.refreshTeamTree) {
        this.$refs.shareTreeRef.refreshTeamTree();
      }
    },
    handleMovePlan(planDetail) {
      this.$emit("move-plan", planDetail);
    },
  },
};
</script>

<style lang="scss" scoped>
.plan-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  .plan-type-list {
    height: 46px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 16px;
    gap: 16px;
    border-bottom: 1px solid #01010126;
    box-sizing: border-box;
    .class-type-item {
      height: 46px;
      line-height: 46px;
      text-align: center;
      cursor: pointer;
      position: relative;
      .title {
        height: 46px;
        line-height: 46px;
        font-family: PingFang SC;
        font-weight: 400;
        font-style: Regular;
        font-size: 15px;
        color: #939393;
        border-bottom: 4px solid transparent;
      }
      .active-title {
        font-family: PingFang SC;
        font-weight: 500;
        font-style: Medium;
        font-size: 15px;
        color: #101010;
        border-bottom: 4px solid #f92b30;
      }
    }
  }

  .class-operation {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 12px 10px;
  }

  .team-operation {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .schedule-plan-container {
    padding: 5px 5px;
    background-color: #fff;
    flex: 1;
    overflow-y: auto;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 2.5px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 2.5px;

      &:hover {
        background: #a8a8a8;
      }
    }

    .schedule-class-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 200px;
      padding: 0 10px;

      .group-name {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 5px;
        width: 80%;

        .group-name-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.group-operations {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.plan-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid#c3c9d72e;
  // background-color: #f9f9f9;
}
.plan-item:first-child {
  border-top: 1px solid #c3c9d72e;
}
.plan-item:last-child {
  border-bottom: none;
}
.plan-item:hover {
  background-color: #f1f1f1;
  cursor: pointer;
}
.plan-item:active {
  background-color: #c3c9d72e;
  cursor: pointer;
}
.plan-item.active {
  // color: #cc2323;
  // background-color: rgba(204, 35, 35, 0.15);
  background: #c3c9d72e;
}
.plan-item.active:first-child {
  border-bottom: 1px solid#01010126;
  border-top: 1px solid #c3c9d72e;
}
.plan-item.active:last-child {
  border-bottom: 1px solid #c3c9d72e;
  border-bottom: none;
}
.plan-item ::v-deep(.el-rate__icon) {
  font-size: 16px;
}
.add-class-btn {
  width: 84px;
  height: 32px;
  text-align: center;
  line-height: 32px;
  border-radius: 5px;
  font-size: 14px;
  color: #101010;
  &:hover {
    cursor: pointer;
    background-color: #c3c9d740;
    font-weight: 600;
  }
}

// 弹框样式优化
.dialog-footer {
  text-align: right;
  .el-button {
    margin-left: 10px;
  }
}

// 搜索框样式
// .el-input {
//     .el-input-group__append {
//         background-color: #409eff;
//         border-color: #409eff;
//         .el-button {
//             color: #fff;
//             &:hover {
//                 background-color: #66b1ff;
//             }
//         }
//     }
// }

// 邀请弹框样式
.invite-dialog {
  .el-dialog__header {
    text-align: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid #f0f0f0;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 20px;
    text-align: center;
  }
}

.invite-content {
  padding: 30px 40px;
  text-align: center;

  .invite-illustration {
    // margin-bottom: 20px;

    .athlete-illustration {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      .athlete-figure {
        width: 40px;
        height: 40px;
        background: #ff4757;
        border-radius: 50%;
        position: relative;

        &::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
        }

        &::after {
          content: "";
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: linear-gradient(45deg, #ff4757, #ff6b7a);
          border-radius: 50%;
          z-index: -1;
        }
      }
    }
  }

  .invite-title {
    font-size: 20px;
    color: #101010;
    font-family: PingFang SC;
    font-weight: 600;
    font-style: Semibold;
    font-size: 16px;
  }

  .invite-description {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 25px;
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
    margin-top: 10px;

    div {
      margin-bottom: 5px;
    }
  }

  .invite-code-container {
    background: #f92b300d;
    border: 1px solid #f92b30;
    border-radius: 8px;
    padding: 15px 15px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .invite-code-label {
      color: #101010;
      font-family: PingFang SC;
      font-weight: 400;
      font-style: Regular;
      font-size: 14px;
    }

    .invite-code-value {
      font-family: PingFang SC;
      font-weight: 600;
      font-style: Semibold;
      font-size: 14px;
      color: #f92b30;
    }
  }

  .invite-code-tip {
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
    font-size: 12px;
    color: #939393;
  }
}

.invite-footer {
  display: flex;
  justify-content: center;
  gap: 15px;

  .copy-btn {
    background: #f92b30;
    border: 1px solid #f92b30;
    padding: 12px 30px;
    font-size: 14px;
    font-weight: 500;
    font-family: PingFang SC;
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
    line-height: 8px;

    &:hover {
      background: #ff3742;
      border-color: #ff3742;
    }
  }

  .regenerate-btn {
    border-color: #101010;
    background: #101010;
    color: #fff;
    padding: 12px 30px;
    font-size: 14px;
    font-weight: 500;
    font-family: PingFang SC;
    font-weight: 500;
    font-style: Medium;
    line-height: 8px;
    &:hover {
      background: #555;
      border-color: #555;
    }
  }
}
</style>
