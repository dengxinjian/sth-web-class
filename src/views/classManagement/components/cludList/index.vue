<template>
  <div class="club-member-tree">
    <div style="padding: 10px">
      <div class="club-member-operation-wrapper">
        <el-input
          size="mini"
          v-model="searchInput"
          @input="handleSearch"
          placeholder="搜索分组 / 成员">
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleSearch"></el-button>
        </el-input>
      </div>

      <el-tree
        class="athletic-tree"
        :data="filteredAthleticData"
        node-key="id"
        default-expand-all
        :highlight-current="true"
        @node-click="handleNodeClick">
        <span class="athletic-btn-list" slot-scope="{ node }">
          <el-tooltip
            v-if="node.level === 1"
            :content="node.label"
            placement="top">
            <span class="tree-label-text">
              {{ node.label }}
              <span v-if="node.data.isGroup">
                ({{ node.data.membersCount }})
              </span>
            </span>
          </el-tooltip>
          <span v-else class="tree-label-text">
            {{ node.label }}
          </span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import { getData } from "@/api/common.js"

export default {
  name: "ClubMemberTree",
  props: {
    // 俱乐部 ID，用于查询 /consumer/api/club/query/groups-with-members/{clubId}
    clubId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      // 原始接口返回映射后的分组 + 成员树
      athleticData: [],
      // 搜索關鍵字
      searchInput: "",
    }
  },
  computed: {
    // 根據關鍵字過濾分組 / 成員
    filteredAthleticData() {
      if (!this.searchInput) {
        return this.athleticData
      }
      const keyword = this.searchInput.toLowerCase()
      return this.athleticData
        .map((group) => {
          const groupMatch = (group.label || "").toLowerCase().includes(keyword)
          const children = (group.children || []).filter((member) =>
            (member.label || "").toLowerCase().includes(keyword)
          )
          if (groupMatch || children.length > 0) {
            return {
              ...group,
              children: groupMatch ? group.children : children,
            }
          }
          return null
        })
        .filter((g) => g != null)
    },
  },
  watch: {
    clubId: {
      handler(newVal) {
        if (newVal) {
          this.getAthleticData()
        } else {
          this.athleticData = []
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleSearch() {
      // 搜索依賴 computed，這裡只為觸發響應式
    },
    handleNodeClick(node) {
      // 成员節點帶 triUserId，可向外透出
      console.log(node)
      if (node.triUserId) {
        this.$emit("member-click", node.triUserId)
      }
    },
    // 根據 clubId 調用 /consumer/api/club/query/groups-with-members/{clubId}
    getAthleticData() {
      if (!this.clubId) return
      getData({
        url: `/consumer/api/club/query/groups-with-members/${this.clubId}`,
      })
        .then((res) => {
          const list =
            res && res.success && Array.isArray(res.result) ? res.result : []
          this.athleticData = list.map((g) => ({
            id: g.groupId,
            label: g.groupName || "未分组",
            isGroup: true,
            membersCount: g.groupCount || (g.members ? g.members.length : 0),
            children: (g.members || []).map((m) => ({
              id: m.triUserId,
              label: m.userNickname || "",
              triUserId: m.triUserId,
              userAvatar: m.userAvatar,
            })),
          }))
          console.log(this.athleticData, " this.athleticData=================")
        })
        .catch((err) => {
          console.error("获取俱乐部分组及成员失败:", err)
          this.athleticData = []
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.club-member-tree {
  flex: 0 0 280px;
  margin-top: 20px;
}

// 树形组件样式优化
.el-tree {
  .el-tree-node__content {
    height: 32px;
    line-height: 32px;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.athletic-btn-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding-right: 8px;
}

.athletic-tree {
  margin-top: 10px;
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
.tree-label-text {
  display: inline-block;
  max-width: 158px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.tree-label-text-athletic {
  display: inline-block;
  max-width: 148px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
