<template>
  <div class="class-container">
    <!-- 课程类型切换 -->
    <ul class="class-type-list">
      <li
        :class="{ active: activeClassType === 'my' }"
        @click="handleClassTypeChange('my')"
      >
        <img src="~@/assets/addClass/title-mine.png" alt="" />
      </li>
      <li
        :class="{ active: activeClassType === 'official' }"
        @click="handleClassTypeChange('official')"
      >
        <img src="~@/assets/addClass/title-official.png" alt="" />
      </li>
    </ul>

    <!-- 操作栏 -->
    <div class="class-operation">
      <el-popover
        v-if="activeClassType === 'my'"
        placement="bottom"
        width="100"
        trigger="click"
        popper-class="add-class-btn-popover"
      >
        <el-button type="primary" size="mini" slot="reference">新增</el-button>
        <div style="display: flex; flex-direction: column; gap: 10px">
          <span>
            <el-button type="primary" size="mini" @click="$emit('add-class')">
              新增课程
            </el-button>
          </span>
          <span>
            <el-button type="primary" size="mini" @click="$emit('add-group')">
              新增分组
            </el-button>
          </span>
        </div>
      </el-popover>

      <el-input size="mini" v-model="searchInput" @input="handleSearch">
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        ></el-button>
      </el-input>
    </div>

    <!-- 课程列表 -->
    <div class="schedule-class-container">
      <el-collapse accordion @change="$emit('collapse-change')">
        <el-collapse-item v-for="item in classList" :key="item.groupId">
          <template slot="title">
            <div class="schedule-class-title">
              <div class="group-name">
                <span class="group-name-text">{{ item.groupName }}</span>
                <span class="group-name-count">({{ item.classesCount }})</span>
              </div>
              <el-popover
                v-if="activeClassType === 'my'"
                popper-class="athletic-btn-popover"
                placement="right"
                width="80"
                trigger="hover"
              >
                <div class="group-operations">
                  <span>
                    <el-button type="text" @click="$emit('add-class', item.groupId)">
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
                      @click="$emit('delete-group', item.groupId)"
                    >
                      删除分组
                    </el-button>
                  </span>
                </div>
                <i
                  class="el-icon-more"
                  slot="reference"
                  @click.stop
                ></i>
              </el-popover>
            </div>
          </template>

          <div class="js-class-drag-container" :key="item.timespan">
            <ClassCard
              v-for="classItem in item.classesList"
              :key="classItem.id"
              :class-data="classItem"
              :active-class-type="activeClassType"
              :group-id="item.groupId"
              @click="$emit('class-detail', classItem.id, classItem.sportType)"
              @move="$emit('move-class', classItem.id, item.groupId)"
              @delete="$emit('delete-class', classItem.id)"
              @copy="$emit('copy-class', classItem, item.groupId, classItem.title)"
              @view="$emit('view-class', classItem.id)"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import ClassCard from './ClassCard.vue'

export default {
  name: 'ClassList',
  components: {
    ClassCard
  },
  props: {
    classList: {
      type: Array,
      default: () => []
    },
    activeClassType: {
      type: String,
      default: 'my'
    }
  },
  data() {
    return {
      searchInput: ''
    }
  },
  methods: {
    handleClassTypeChange(type) {
      this.$emit('update:activeClassType', type)
      this.$emit('class-type-change', type)
    },
    handleSearch() {
      this.$emit('search', this.searchInput)
    }
  }
}
</script>

<style lang="scss" scoped>
.class-container {
  border-left: 1px solid #e5e5e5;
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
      content: '';
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
</style>

