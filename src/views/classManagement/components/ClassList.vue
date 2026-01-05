<template>
  <div class="class-container">
    <!-- 课程类型切换 -->
    <ul class="class-type-list">
      <li
        :class="{ active: activeClassType === 'my' }"
        @click="handleClassTypeChange('my')"
      >
        <!-- <img src="~@/assets/addClass/title-mine.png" alt="" /> -->
        <div
          class="title"
          :class="{ 'active-title': activeClassType === 'my' }"
        >
          我的课程
        </div>
      </li>
      <li
        :class="{ active: activeClassType === 'official' }"
        @click="handleClassTypeChange('official')"
      >
        <!-- <img src="~@/assets/addClass/title-official.png" alt="" /> -->
        <div
          class="title"
          :class="{ 'active-title': activeClassType === 'official' }"
        >
          官方课程
        </div>
      </li>
    </ul>

    <!-- 操作栏 -->
    <div class="class-operation">
      <el-popover
        v-if="activeClassType === 'my' && showAddClassBtn"
        placement="bottom"
        width="100"
        trigger="click"
        popper-class="add-class-btn-popover"
      >
        <el-button type="primary" size="mini" slot="reference">新增</el-button>
        <div style="display: flex; flex-direction: column; gap: 5px">
          <div class="add-class-btn" @click="$emit('add-class')">新增课程</div>
          <div class="add-class-btn" @click="$emit('add-group')">新增分组</div>
        </div>
      </el-popover>

      <el-input
        size="mini"
        v-model="searchInput"
        clearable
        prefix-icon="el-icon-search"
        @input="handleSearch"
      >
        <!-- <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        ></el-button> -->
        <!-- <i class="el-icon-search" slot="prepend" @click="handleSearch"></i> -->
      </el-input>
    </div>

    <!-- 课程列表 -->
    <div class="schedule-class-container">
      <el-collapse
        accordion
        v-model="activeCollapseItem"
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
                      @click="$emit('add-class', item.groupId)"
                    >
                      新增课程
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

          <draggable
            class="js-class-drag-container"
            :list="item.classesList"
            :group="{ name: groupName, put: false, pull: 'clone' }"
            :animation="0"
            :sort="false"
            :force-fallback="true"
            :fallback-on-body="true"
            :fallback-tolerance="5"
            :scroll="true"
            :scroll-sensitivity="40"
            :scroll-speed="10"
            ghost-class="is-plan-drag-ghost"
            :key="item.timespan"
            @end="handleClassDragEnd"
          >
            <ClassCard
              v-for="classItem in item.classesList"
              :key="classItem.id"
              :class-data="classItem"
              :active-class-type="activeClassType"
              :group-id="item.groupId"
              @click="$emit('class-detail', classItem.id, classItem.sportType)"
              @move="$emit('move-class', classItem.id, item.groupId)"
              @delete="$emit('delete-class', classItem)"
              @copy="
                $emit('copy-class', classItem, item.groupId, classItem.title)
              "
              @view="$emit('view-class', classItem.id)"
            />
          </draggable>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import ClassCard from "./ClassCard.vue";
import draggable from "vuedraggable";
import { debounce } from "../uilt";

export default {
  name: "ClassList",
  components: {
    ClassCard,
    draggable,
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
    groupName: {
      type: String,
      default: "classDrag",
    },
  },
  data() {
    return {
      searchInput: "",
      emitSearch: null,
      loading: false,
      activeCollapseItem: "",
    };
  },
  watch: {
    activeClassType: {
      handler(newVal, oldVal) {
        // 当 activeClassType 改变时显示 loading 并折叠所有项
        if (oldVal !== undefined && newVal !== oldVal) {
          this.loading = true;
          this.activeCollapseItem = "";
        }
      },
      immediate: false,
    },
    classList: {
      handler() {
        // 当 classList 更新时隐藏 loading
        this.loading = false;
      },
      deep: true,
    },
  },
  created() {
    this.emitSearch = debounce(() => {
      this.$emit("search", this.searchInput);
    }, 500);
  },
  methods: {
    handleClassTypeChange(type) {
      this.$emit("update:activeClassType", type);
      this.$emit("class-type-change", type);
      this.searchInput = "";
      this.emitSearch();
    },
    handleSearch() {
      if (this.emitSearch) {
        this.emitSearch();
      }
    },
    handleClassDragEnd(e) {
      console.log(e, "handleClassDragEnd===================");
      this.$emit("class-drag-end", e);
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
      .title {
        font-family: PingFang SC;
        font-weight: 400;
        font-style: Regular;
        font-size: 15px;
        color: #939393;
      }
      .active-title {
        font-family: PingFang SC;
        font-weight: 500;
        font-style: Medium;
        font-size: 15px;
        color: #101010;
      }
    }

    li.active::after {
      content: "";
      position: absolute;
      bottom: -10px;
      left: 26%;
      // margin-left: -10px;
      width: 60px;
      height: 4px;
      border-radius: 2px;
      background-color: #f92b30;
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
.add-class-btn {
  width: 88px;
  height: 32px;
  border-radius: 5px;
  font-family: PingFang SC;
  font-weight: 400;
  font-style: Regular;
  font-size: 14px;
  text-align: center;
  line-height: 32px;
  color: #101010;
  cursor: pointer;
  &:hover {
    background-color: #c3c9d740;
    font-family: PingFang SC;
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
  }
}
</style>
