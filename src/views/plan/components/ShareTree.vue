<template>
  <div class="share-tree-container">
    <el-tree
      ref="teamTree"
      :key="treeKey"
      :data="filteredTeamList"
      node-key="id"
      :props="props"
      :highlight-current="true"
      :load="loadNodeTeamPlanList"
      :lazy="true"
      @node-click="handleNodeClick"
      v-loading="loadingTeamTree"
    >
      <span class="athletic-btn-list" slot-scope="{ node }">
        <el-tooltip
          v-if="node.label.length * 14 > 148"
          :content="node.label"
          placement="top"
        >
          <span class="tree-label-text"
            >{{ node.label }}
            <span v-if="node.isGroup">({{ node.membersCount }})</span></span
          >
        </el-tooltip>
        <span v-else class="tree-label-text"
          >{{ node.label }}
          <span v-if="node.isGroup">({{ node.membersCount }})</span></span
        >

        <el-popover
          popper-class="athletic-btn-popover"
          placement="right"
          trigger="hover"
          v-if="node.level > 1"
        >
          <div class="btn-list-hover">
            <div
              class="btn-list-hover-item"
              v-if="node.level === 2"
              @click="handleAddShareGroup(node)"
            >
              新增
            </div>
            <div
              class="btn-list-hover-item"
              v-if="node.level === 2 && node.data.id !== 0"
              @click="handleEditShareGroup(node)"
            >
              编辑
            </div>
            <div
              class="btn-list-hover-item"
              v-if="node.level === 2 && node.data.id !== 0"
              @click="handleDeleteShareGroup(node)"
            >
              删除
            </div>
            <div
              class="btn-list-hover-item"
              v-if="node.level === 3"
              @click="handleMoveShareGroup(node)"
            >
              移动
            </div>
          </div>
          <div class="btn-list-hover-item" slot="reference" v-if="node.level">
            <i class="el-icon-more"></i>
          </div>
        </el-popover>
      </span>
    </el-tree>
  </div>
</template>

<script>
import { getData } from "@/api/common";

export default {
  name: "ShareTree",
  props: {
    // 搜索关键词，用于过滤团队列表
    searchInput: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      props: {
        label: "label",
        children: "zones",
        isLeaf: "leaf",
      },
      treeKey: 0, // 用于强制重新渲染 el-tree
      teamList: [],
      loadingTeamTree: false,
    };
  },
  computed: {
    // 过滤后的团队列表数据（用于搜索和懒加载）
    filteredTeamList() {
      // 确保 teamList 是数组
      if (!Array.isArray(this.teamList) || this.teamList.length === 0) {
        return [];
      }

      let list = this.teamList;

      // 如果有搜索输入，进行过滤
      if (this.searchInput) {
        list = this.teamList.filter((group) => {
          // 确保 group 有 label 属性
          if (!group || !group.label) {
            return false;
          }
          return group.label
            .toLowerCase()
            .includes(this.searchInput.toLowerCase());
        });
      }

      // 在懒加载模式下，根节点不应该有 children 属性
      // 同时需要明确设置 leaf: false，让 el-tree 知道这些节点可以展开
      const newList = list
        .filter((item) => item && item.id && item.label) // 确保数据格式正确
        .map((item) => {
          const { children, ...rest } = item;
          return {
            ...rest,
            // 不设置 children 属性，让 el-tree 通过懒加载来加载子节点
            // 明确设置 leaf: false，表示这些节点可以展开（不是叶子节点）
            leaf: false,
          };
        });

      return newList;
    },
  },
  methods: {
    async loadNodeTeamPlanList(node, resolve) {
      this.loadingTeamTree = true;
      // 如果是团队节点（isGroup: true），加载该团队的计划列表
      if (node.level === 0) {
        const resDefault = await getData({ url: "/gateway/team/my-team" });
        const resTeam = await getData({
          url: "/consumer/api/team/coach/all-teams",
        });
        if (resDefault.success && resTeam.success) {
          const list = [resDefault.result, ...resTeam.result].reduce(
            (acc, team) => {
              if (team && team.id && !acc.find((t) => t.id === team.id)) {
                acc.push(team);
              }
              return acc;
            },
            []
          );
          const teamList = list.map((item) => {
            return {
              id: item.id,
              label: item.teamName,
              description: item.description || "",
              isGroup: true,
              groupName: item.teamName,
              membersCount: item.members?.length || 0,
              triUserId: item.triUserId,
            };
          });
          this.teamList = teamList;
          resolve(teamList);
          this.loadingTeamTree = false;
        } else {
          resolve([]);
          this.loadingTeamTree = false;
        }
      }
      if (node.level === 1) {
        // 查询该分享团队下的所有分组
        getData({
          url: `/training/api/shareTeamGroup/list?teamId=${node.data.id}&shareDataType=2`,
        }).then((res) => {
          if (res.success && res.result) {
            const groupList = res.result.map((item) => {
              return {
                id: item.id,
                label: item.groupName || item.title || "未命名计划",
                isGroup: true,
                leaf: false,
                ...item,
              };
            });
            resolve(groupList);
            this.loadingTeamTree = false;
          } else {
            this.loadingTeamTree = false;
            resolve([]);
          }
        });
      }
      if (node.level === 2) {
        // 根据分享分组获取分组下的所有分享计划
        getData({
          url: `/training/api/teamShare/pageByGroupId`,
          groupId: node.data.id,
          teamId: node.data.teamId,
          shareDataType: 2,
          current: 1,
          size: 20,
        })
          .then((res) => {
            if (res.success && res.result) {
              // 将计划列表转换为树节点格式
              const planNodes = res.result.records.map((plan) => ({
                id: plan.id,
                label: plan.planTitle || plan.title || "未命名计划",
                isGroup: false,
                // 计划节点是叶子节点，不能再展开
                leaf: true,
                ...plan,
              }));
              resolve(planNodes);
              this.loadingTeamTree = false;
            } else {
              this.loadingTeamTree = false;
              resolve([]);
            }
          })
          .catch(() => {
            this.loadingTeamTree = false;
            resolve([]);
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
    /**
     * 处理节点点击事件
     */
    handleNodeClick(data, node) {
      // 如果点击的是计划节点（不是团队节点），触发选择计划事件
      if (!node.data.isGroup && node.data.id) {
        this.$emit("view-plan", data.sourcePlanId, data);
      }
    },
    /**
     * 刷新团队树数据
     */
    refreshTeamTree() {
      // 清空团队列表数据
      this.teamList = [];
      // 强制重新渲染 el-tree（通过改变 key 值）
      this.treeKey = Date.now();
      // 重置 el-tree 的当前选中节点
      this.$nextTick(() => {
        if (this.$refs.teamTree) {
          this.$refs.teamTree.setCurrentKey(null);
        }
      });
    },
    /**
     * 重置树选中状态（用于类型切换时）
     */
    resetCurrentKey() {
      if (this.$refs.teamTree) {
        this.$refs.teamTree.setCurrentKey(null);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.share-tree-container {
  flex: 1;
  padding: 12px 10px;
  overflow-y: auto;
  background-color: #fff;

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
}

// 树形样式
.athletic-btn-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding-right: 8px;
}

.btn-list-hover-item {
  width: 60px;
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

.tree-label-text {
  display: inline-block;
  max-width: 158px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

// 树形组件样式优化
::v-deep(.el-tree) {
  .el-tree-node__content {
    height: 32px;
    line-height: 32px;
    &:hover {
      background-color: #f5f7fa;
    }
  }
  .el-tree-node.is-current > .el-tree-node__content {
    background-color: #C3C9D726 !important;
  }
}
</style>

