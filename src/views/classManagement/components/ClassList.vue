<template>
  <div class="class-container">
    <!-- 课程类型切换 -->
    <div class="plan-type-list">
      <div class="class-type-item" :class="{ 'active-title': activeClassType === 'my' }"
        @click="handleClassTypeChange('my')">
        <div class="title" :class="{ 'active-title': activeClassType === 'my' }">
          我的课程
        </div>
      </div>
      <div class="class-type-item" :class="{ 'active-title': activeClassType === 'team' }"
        @click="handleClassTypeChange('team')">
        <div class="title" :class="{ 'active-title': activeClassType === 'team' }">
          团队课程
        </div>
      </div>
      <div class="class-type-item" :class="{ 'active-title': activeClassType === 'official' }"
        @click="handleClassTypeChange('official')">
        <div class="title" :class="{ 'active-title': activeClassType === 'official' }">
          课程示例
        </div>
      </div>
    </div>
    <!-- <ul class="class-type-list">
      <li
        :class="{ active: activeClassType === 'my' }"
        @click="handleClassTypeChange('my')"
      >
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
        <div
          class="title"
          :class="{ 'active-title': activeClassType === 'official' }"
        >
          课程示例
        </div>
      </li>
    </ul> -->

    <!-- 操作栏 -->
    <div class="class-operation">
      <el-popover v-if="activeClassType === 'my' && showAddClassBtn" placement="bottom" width="100" trigger="click"
        popper-class="add-class-btn-popover">
        <el-button type="primary" size="mini" slot="reference">新增</el-button>
        <div style="display: flex; flex-direction: column; gap: 5px">
          <div class="add-class-btn" @click="$emit('add-class')">新增课程</div>
          <div class="add-class-btn" @click="$emit('add-group')">新增分组</div>
        </div>
      </el-popover>

      <el-input size="mini" v-model="searchInput" clearable prefix-icon="el-icon-search" @input="handleSearch">
        <!-- <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        ></el-button> -->
        <!-- <i class="el-icon-search" slot="prepend" @click="handleSearch"></i> -->
      </el-input>
    </div>

    <!-- 课程列表 -->
    <div class="schedule-class-container" v-if="activeClassType !== 'team'">
      <el-collapse accordion v-model="activeCollapseItem" @change="$emit('collapse-change')" v-loading="loading">
        <el-collapse-item v-for="item in classList" :key="item.groupId" :name="item.groupId">
          <template slot="title">
            <div class="schedule-class-title">
              <div class="group-name">
                <span class="group-name-text">{{ item.groupName }}</span>
                <span class="group-name-count">({{ item.classesCount }})</span>
              </div>
              <el-popover v-if="activeClassType === 'my' && showAddClassBtn" popper-class="athletic-btn-popover"
                placement="right" width="80" trigger="hover">
                <div class="group-operations">
                  <span>
                    <el-button type="text" @click="$emit('add-class', item.groupId)">
                      新增课程
                    </el-button>
                  </span>
                  <span>
                    <el-button type="text" :disabled="!item.groupId" @click="$emit('edit-group', item)">
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
                    <el-button type="text" :disabled="!item.groupId" @click="$emit('delete-group', item)">
                      删除分组
                    </el-button>
                  </span>
                </div>
                <i class="el-icon-more" slot="reference" @click.stop></i>
              </el-popover>
            </div>
          </template>

          <draggable class="js-class-drag-container" :list="item.classesList"
            :group="{ name: groupName, put: false, pull: 'clone' }" :animation="0" :sort="false" :force-fallback="true"
            :fallback-on-body="true" :fallback-tolerance="5" :scroll="true" :scroll-sensitivity="40" :scroll-speed="10"
            ghost-class="is-plan-drag-ghost" :key="item.timespan" @end="handleClassDragEnd">
            <ClassCard v-for="classItem in item.classesList" :key="classItem.id" :class-data="classItem"
              :active-class-type="activeClassType" :group-id="item.groupId"
              @click="$emit('class-detail', classItem.id, classItem.sportType)"
              @move="$emit('move-class', classItem.id, item.groupId)" @delete="$emit('delete-class', classItem)" @copy="
                $emit('copy-class', classItem, item.groupId, classItem.title)
                " @view="$emit('view-class', classItem.id)" />
          </draggable>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 团队课程操作栏 -->
    <div class="team-operation" v-if="activeClassType === 'team'">
      <div class="team-operation-container" v-for="shareItem in teamTreeList" :key="shareItem.id">
        <div class="team-operation-item" :class="{ 'is-active': currentShareTeamId === shareItem.id }"
          @click="$emit('share-team-click', shareItem.id)">
          <span class="team-operation-item-title-text">{{ shareItem.name }}</span>
          <i class="el-icon-arrow-right team-operation-arrow"></i>
        </div>
        <div class="team-operation-content" v-show="currentShareTeamId === shareItem.id">
          <el-collapse accordion v-model="activeCollapseItem" @change="handleShareTeamGroupClick" v-loading="loading">
            <el-collapse-item v-for="item in currentShareGroupList" :key="item.groupId" :name="item.id">
              <template slot="title">
                <div class="schedule-class-title">
                  <div class="group-name">
                    <span class="group-name-text">{{ item.groupName }}</span>
                    <span class="group-name-count">({{ item.groupCount }})</span>
                  </div>
                  <el-popover popper-class="athletic-btn-popover"
                    placement="right" width="80" trigger="hover" v-if="activeClassType === 'team' && showAddClassBtn">
                    <div class="group-operations">
                      <span>
                        <el-button type="text" @click="$emit('add-share-group', item)">
                          新增分组
                        </el-button>
                      </span>
                      <span>
                        <el-button type="text" :disabled="!item.id" @click="$emit('edit-share-group', item)">
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
                        <el-button type="text" :disabled="!item.id" @click="$emit('delete-share-group', item)">
                          删除分组
                        </el-button>
                      </span>
                    </div>
                    <i class="el-icon-more" slot="reference" @click.stop></i>
                  </el-popover>
                </div>
              </template>

              <draggable class="js-class-drag-container" :list="item.classesList"
                :group="{ name: groupName, put: false, pull: 'clone' }" :animation="0" :sort="false"
                :force-fallback="true" :fallback-on-body="true" :fallback-tolerance="5" :scroll="true"
                :scroll-sensitivity="40" :scroll-speed="10" ghost-class="is-plan-drag-ghost" :key="item.timespan"
                @end="handleClassDragEnd">
                <ClassCard v-for="classItem in item.classesList" :key="classItem.id" :class-data="classItem"
                  :active-class-type="activeClassType" :group-id="item.groupId"
                  @view="$emit('view-share-class', classItem)" />
              </draggable>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ClassCard from "./ClassCard.vue";
import draggable from "vuedraggable";
import { debounce } from "../uilt";
import { getData } from "@/api/common.js";
import { parseClassesJson } from '../utils/helpers';

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
    shareGroupList: {
      type: Array,
      default: () => [],
    },
    currentShareTeamId: {
      type: String,
      default: "",
    },
    teamTreeList: {
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
      activeTeamItemId: "",
      currentTeamClassList: [],
      currentShareGroupList: [],
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
    shareGroupList: {
      handler(newVal, oldVal) {
        console.log(this.shareGroupList, "shareGroupList--分享组");
        if (newVal) {
          this.currentShareGroupList = newVal;
        }
      },
      deep: true,
    },
    currentShareTeamId: {
      handler() {
        console.log(this.currentShareTeamId, "currentShareTeamId--分享团队");
      },
      immediate: false,
    },
  },
  created() {
    this.emitSearch = debounce(() => {
      this.$emit("search", this.searchInput);
    }, 500);
  },
  methods: {
    handleShareTeamGroupClick(activeNames) {
      console.log('选中的分组', activeNames)
      this.$emit('share-team-group-click', activeNames)
    },
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

    // 分享课程相关
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
    handleViewClass(sourceClassId, data) {
      this.$emit("view-class", sourceClassId, data);
    },
    /**
     * 刷新团队树数据
     */
    refreshTeamTree() {
      if (this.$refs.shareTreeRef && this.$refs.shareTreeRef.refreshTeamTree) {
        this.$refs.shareTreeRef.refreshTeamTree();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-collapse-item__header) {
  background: #c3c9d726;
}

.class-container {
  height: 100%;
  display: flex;
  flex-direction: column;

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
    padding: 12px 10px;
  }

  .schedule-class-container {
    padding: 5px 0px;
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

.team-operation-container {
  .team-operation-item {
    height: 44px;
    font-size: 14px;
    color: #101010;
    line-height: 44px;
    text-align: center;
    cursor: pointer;
    border-bottom: 1px solid #e6ebf5;
    background-color: #f6f7f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    box-sizing: border-box;

    .team-operation-arrow {
      transition: transform 0.2s ease;
    }

    &.is-active .team-operation-arrow {
      transform: rotate(90deg);
    }
  }

  .team-operation-content {
    padding: 0 1px;
    box-sizing: border-box;
    .schedule-class-title{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 198px;
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
</style>
