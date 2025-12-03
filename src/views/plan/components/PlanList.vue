<template>
  <div class="class-container">
    <!-- 课程类型切换 -->
    <ul class="class-type-list">
      <li
        :class="{ active: activeClassType === 'my' }"
        @click="handleClassTypeChange('my')"
      >
        <img src="~@/assets/plan/plan-title.png" alt="" />
      </li>
      <li
        :class="{ active: activeClassType === 'official' }"
        @click="handleClassTypeChange('official')"
      >
        <img src="~@/assets/plan/plan-demo.png" alt="" />
      </li>
    </ul>

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
        <div style="display: flex; flex-direction: column; gap: 10px">
          <span>
            <el-button type="primary" size="mini" @click="$emit('add-plan')">
              新增计划
            </el-button>
          </span>
          <span>
            <el-button type="primary" size="mini" @click="$emit('add-group')">
              新增分组
            </el-button>
          </span>
        </div>
      </el-popover>

      <el-input size="mini" v-model="searchInput" @input="handleSearch" clearable>
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        ></el-button>
      </el-input>
    </div>

    <!-- 课程列表 -->
    <div class="schedule-class-container">
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

          <div class="js-class-drag-container" :key="item.timespan">
            <div
              class="plan-item"
              :class="{ active: selectedPlanId === classItem.id }"
              v-for="classItem in item.classesList"
              :key="classItem.id"
              @click="$emit('choose-plan', classItem.id, item.groupId)"
            >
              <el-popover
                placement="right"
                width="320px"
                trigger="hover"
                :disabled="!classItem.planTitle"
                popper-class="hover-plan-detail-popover"
              >
                <span slot="reference" @click.stop>{{ classItem.planTitle }}</span>
                <HoverPlanDetail :planInfo="classItem"></HoverPlanDetail>
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
export default {
  name: "PlanList",
  components: {
    HoverPlanDetail,
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
      this.$emit("class-type-change", type);
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
  },
};
</script>

<style lang="scss" scoped>
.class-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .class-type-list {
    list-style: none;
    padding: 10px 0 20px;
    margin: 0;
    display: flex;
    flex-direction: row;

    li {
      flex: 1;
      text-align: center;
      cursor: pointer;
      position: relative;

      img {
        width: 64px;
        margin-bottom: 4px;
      }
    }

    li.active::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      margin-left: -10px;
      width: 20px;
      height: 4px;
      border-radius: 2px;
      background-color: #cc2323;
    }
  }

  .class-operation {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding: 0 10px;
  }

  .schedule-class-container {
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
  border-bottom: 1px solid #f1f1f1;
  background-color: #f9f9f9;
}
.plan-item:first-child {
  border-top: 1px solid #f1f1f1;
}
.plan-item:last-child {
  border-bottom: none;
}
.plan-item:hover {
  background-color: #f1f1f1;
  cursor: pointer;
}
.plan-item:active {
  background-color: #f1f1f1;
  cursor: pointer;
}
.plan-item.active {
  color: #cc2323;
  background-color: rgba(204, 35, 35, 0.15);
}
</style>
