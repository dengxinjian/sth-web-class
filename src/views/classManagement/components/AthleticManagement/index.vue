<template>
  <div class="athletic-management">
    <div class="athletic-title">{{ teamName }}</div>
    <div class="athletic-operation">
      <el-input size="mini" v-model="searchInput" @input="handleSearch">
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        ></el-button>
      </el-input>
    </div>
    <div class="athletic-btn">
      <el-button type="primary" size="mini" @click="handleInviteAthletic"
        >邀请运动员</el-button
      >
      <el-button type="primary" size="mini" @click="handleInviteCoach"
        >邀请执教</el-button
      >
    </div>
    <el-tree
      class="athletic-tree"
      v-if="coachingData.length > 0"
      :data="coachingData"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
    >
      <span class="athletic-btn-list" slot-scope="{ node }">
        <span>{{ node.label }}</span>
        <el-popover
          popper-class="athletic-btn-popover"
          placement="right"
          trigger="hover"
        >
          <div class="btn-list-hover">
            <el-button
              v-if="node.data.isGroup"
              type="text"
              size="mini"
              @click="handleAddGroup"
              >新建分组</el-button
            >
            <el-button
              v-if="
                node.data.isGroup &&
                node.data.id !== 'unGrouped' &&
                node.data.id !== 'coach'
              "
              type="text"
              size="mini"
              @click="handleEditGroup(node)"
              >编辑分组</el-button
            >
            <el-button
              v-if="
                node.data.isGroup &&
                node.data.id !== 'unGrouped' &&
                node.data.id !== 'coach'
              "
              type="text"
              size="mini"
              @click="handleDeleteGroup(node)"
              >删除分组</el-button
            >
            <!-- <el-button v-if="node.data.isGroup && node.data.id !== 'unGrouped'" type="text" size="mini" @click="handleMoveGroup(node)">移动分组</el-button> -->
            <el-button
              v-if="!node.data.isGroup && node.parent.data.id !== 'coach'"
              type="text"
              size="mini"
              @click="handleMoveAthletic(node)"
              >移动分组</el-button
            >
            <el-button
              v-if="!node.data.isGroup && node.parent.data.id !== 'coach'"
              type="text"
              size="mini"
              @click="handleMoveOutAthletic(node)"
              >解绑</el-button
            >
            <el-button
              v-if="!node.data.isGroup && node.parent.data.id === 'coach'"
              type="text"
              size="mini"
              @click="handleMoveOutCoach(node)"
              >解绑</el-button
            >
          </div>
          <el-button type="text" size="mini" slot="reference">
            <i class="el-icon-more"></i>
          </el-button>
        </el-popover>
      </span>
    </el-tree>
    <el-tree
      :data="filteredAthleticData"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
    >
      <span class="athletic-btn-list" slot-scope="{ node }">
        <span>{{ node.label }}</span>
        <el-popover
          popper-class="athletic-btn-popover"
          placement="right"
          trigger="hover"
        >
          <div class="btn-list-hover">
            <el-button
              v-if="node.data.isGroup"
              type="text"
              size="mini"
              @click="handleAddGroup"
              >新建分组</el-button
            >
            <el-button
              v-if="
                node.data.isGroup &&
                node.data.id !== 'unGrouped' &&
                node.data.id !== 'coach'
              "
              type="text"
              size="mini"
              @click="handleEditGroup(node)"
              >编辑分组</el-button
            >
            <el-button
              v-if="
                node.data.isGroup &&
                node.data.id !== 'unGrouped' &&
                node.data.id !== 'coach'
              "
              type="text"
              size="mini"
              @click="handleDeleteGroup(node)"
              >删除分组</el-button
            >
            <!-- <el-button v-if="node.data.isGroup && node.data.id !== 'unGrouped'" type="text" size="mini" @click="handleMoveGroup(node)">移动分组</el-button> -->
            <el-button
              v-if="!node.data.isGroup && node.parent.data.id !== 'coach'"
              type="text"
              size="mini"
              @click="handleMoveAthletic(node)"
              >移动分组</el-button
            >
            <el-button
              v-if="!node.data.isGroup && node.parent.data.id !== 'coach'"
              type="text"
              size="mini"
              @click="handleMoveOutAthletic(node)"
              >解绑</el-button
            >
            <el-button
              v-if="!node.data.isGroup && node.parent.data.id === 'coach'"
              type="text"
              size="mini"
              @click="handleMoveOutCoach(node)"
              >解绑</el-button
            >
          </div>
          <el-button type="text" size="mini" slot="reference">
            <i class="el-icon-more"></i>
          </el-button>
        </el-popover>
      </span>
    </el-tree>

    <!-- 新建/编辑分组弹框 -->
    <el-dialog
      :title="groupDialogTitle"
      :visible.sync="showGroupDialog"
      width="400px"
      @close="resetGroupForm"
    >
      <el-form
        :model="groupForm"
        :rules="groupRules"
        ref="groupForm"
        label-width="80px"
      >
        <el-form-item label="分组名称" prop="name">
          <el-input
            v-model="groupForm.name"
            placeholder="请输入分组名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="分组描述" prop="description">
          <el-input
            type="textarea"
            v-model="groupForm.description"
            placeholder="请输入分组描述"
            :rows="3"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showGroupDialog = false">取消</el-button>
        <el-button type="primary" @click="saveGroup">确定</el-button>
      </div>
    </el-dialog>

    <!-- 移动分组弹框 -->
    <el-dialog title="移动分组" :visible.sync="showMoveDialog" width="400px">
      <el-form label-width="80px">
        <el-form-item label="当前分组">
          <el-input :value="currentGroup.groupName" disabled></el-input>
        </el-form-item>
        <el-form-item label="目标分组" required>
          <el-select
            v-model="targetGroupId"
            placeholder="请选择目标分组"
            style="width: 100%"
          >
            <el-option
              v-for="group in availableGroups"
              :key="group.id"
              :label="group.label"
              :value="group.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showMoveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmMoveGroup">确定</el-button>
      </div>
    </el-dialog>

    <!-- 邀请运动员弹框 -->
    <el-dialog
      title="邀请运动员"
      :visible.sync="showInviteDialog"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      custom-class="invite-dialog"
    >
      <div class="invite-content">
        <!-- 插图 -->
        <div class="invite-illustration">
          <div class="athlete-illustration">
            <img src="~@/assets/addClass/athlete-invite.png" alt="" />
          </div>
        </div>

        <!-- 主标题 -->
        <div class="invite-title">运动员邀请码已生成</div>

        <!-- 说明文字 -->
        <div class="invite-description">
          <div>请分享给对应运动员</div>
          <div>运动员可通过邀请码加入团队</div>
        </div>

        <!-- 邀请码显示 -->
        <div class="invite-code-container">
          <div class="invite-code-label">邀请码:</div>
          <div class="invite-code-value">{{ invitationCode }}</div>
        </div>

        <!-- 邀请码说明 -->
        <div class="invite-code-tip">
          此邀请码可邀请多人,重新生成邀请码后该码失效
        </div>
      </div>

      <div slot="footer" class="invite-footer">
        <el-button
          type="primary"
          class="copy-btn"
          @click="copyInvitationCode"
          :loading="copyLoading"
        >
          一键复制邀请码
        </el-button>
        <el-button
          class="regenerate-btn"
          @click="regenerateInvitationCode"
          :loading="regenerateLoading"
        >
          重新生成邀请码
        </el-button>
      </div>
    </el-dialog>

    <!-- 邀请执教弹框 -->
    <el-dialog
      title="邀请执教"
      :visible.sync="showInviteCoachDialog"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      custom-class="invite-dialog"
    >
      <div class="invite-content">
        <!-- 插图 -->
        <div class="invite-illustration">
          <div class="athlete-illustration">
            <img src="~@/assets/addClass/coach-invite.png" alt="" />
          </div>
        </div>

        <!-- 主标题 -->
        <div class="invite-title">执教邀请码已生成</div>

        <!-- 说明文字 -->
        <div class="invite-description">
          <div>请分享给对应执教</div>
          <div>运动员可通过邀请码加入团队</div>
        </div>

        <!-- 邀请码显示 -->
        <div class="invite-code-container">
          <div class="invite-code-label">执教邀请码:</div>
          <div class="invite-code-value">{{ coachInvitationCode }}</div>
        </div>

        <!-- 邀请码说明 -->
        <div class="invite-code-tip">
          此执教邀请码可邀请多人,重新生成执教邀请码后该码失效
        </div>
      </div>

      <div slot="footer" class="invite-footer">
        <el-button
          type="primary"
          class="copy-btn"
          @click="copyCoachInvitationCode"
          :loading="copyLoading"
        >
          一键复制执教邀请码
        </el-button>
        <el-button
          class="regenerate-btn"
          @click="getCoachInvitationCode"
          :loading="regenerateLoading"
        >
          重新生成执教邀请码
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getData, submitData } from "@/api/common.js";
import { MessageBox } from "element-ui";

export default {
  name: "AthleticManagement",
  props: {
    teamId: {
      type: String,
      default: "",
    },
    teamName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      inviteText: "邀请运动员",
      athleticData: [],
      searchInput: "",
      // 分组管理相关
      showGroupDialog: false,
      showMoveDialog: false,
      groupDialogTitle: "新建分组",
      currentGroup: {},
      targetGroupId: "",
      groupForm: {
        id: "",
        name: "",
        description: "",
      },
      groupRules: {
        name: [
          { required: true, message: "请输入分组名称", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 2 到 20 个字符",
            trigger: "blur",
          },
        ],
        description: [
          { max: 100, message: "描述不能超过100个字符", trigger: "blur" },
        ],
      },
      // 邀请运动员相关
      showInviteDialog: false,
      showInviteCoachDialog: false,
      invitationCode: "",
      coachInvitationCode: "",
      copyLoading: false,
      regenerateLoading: false,
      moveType: "",
      coachingData: [],
    };
  },
  computed: {
    // 过滤后的数据（用于搜索）
    filteredAthleticData() {
      if (!this.searchInput) {
        return this.athleticData;
      }
      return this.athleticData.filter((group) => {
        return (
          group.label.toLowerCase().includes(this.searchInput.toLowerCase()) ||
          (group.children &&
            group.children.some((member) =>
              member.label
                .toLowerCase()
                .includes(this.searchInput.toLowerCase())
            ))
        );
      });
    },
    // 可用的目标分组（排除当前分组）
    availableGroups() {
      return this.athleticData.filter(
        (group) => group.id !== this.currentGroup.id
      );
    },
  },
  watch: {
    teamId: {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.getAthleticData();
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 获取运动员数据
    getAthleticData() {
      if (!this.teamId) return;

      getData({
        url: `/api/team/group/list/${this.teamId}`,
        // url: '/api/team/coach/all-teams',
        teamId: this.teamId,
      })
        .then((res) => {
          if (res.success) {
            const processedData = res.result.map((item) => {
              return {
                id: item.id,
                label: item.groupName,
                description: item.description || "",
                isGroup: true,
                groupName: item.groupName,
                triUserId: item.triUserId,
                children: (item.members || []).map((member) => {
                  return {
                    id: member.id,
                    label: member.userNickname,
                    triUserId: member.triUserId,
                    userType: member.userType,
                  };
                }),
              };
            });

            // 处理unGrouped团队的members，将userType为1或2的members移动到新建的coach团队下
            const unGroupIndex = processedData.findIndex(
              (item) => item.id === "unGrouped"
            );
            if (unGroupIndex !== -1) {
              const unGroupData = processedData[unGroupIndex];
              const allMembers = unGroupData.children || [];

              // 筛选出userType为1或2的members
              const coachMembers = allMembers.filter(
                (member) => member.userType === 1 || member.userType === 2
              );

              // 筛选出其他userType的members，保留在unGrouped团队中
              const remainingMembers = allMembers.filter(
                (member) => member.userType !== 1 && member.userType !== 2
              );

              // 更新unGrouped团队，只保留非coach类型的members
              processedData[unGroupIndex] = {
                ...unGroupData,
                children: remainingMembers,
              };

              // 只有当存在coach类型的members时才创建coach团队
              if (coachMembers.length > 0) {
                // 创建新的coach团队
                const coachTeam = {
                  id: "coach",
                  label: "我的执教",
                  description: "执教团队",
                  isGroup: true,
                  groupName: "我的执教",
                  triUserId: null,
                  children: coachMembers,
                };
                // 将coach团队添加到数据中
                // processedData.unshift(coachTeam)
                this.coachingData = [coachTeam];
                console.log(this.coachingData,"this.coachingData");
              }
            }

            this.athleticData = processedData;
          }
        })
        .catch((error) => {
          console.error("获取运动员数据失败:", error);
          this.$message.error("获取数据失败");
        });
    },

    // 搜索功能
    handleSearch() {
      // 搜索逻辑在 computed 中处理
    },
    // 邀请运动员
    handleInviteAthletic() {
      this.showInviteDialog = true;
      this.getInvitationCode();
    },

    // 邀请执教
    handleInviteCoach() {
      this.showInviteCoachDialog = true;
      this.getCoachInvitationCode();
    },

    // 获取邀请码
    getInvitationCode() {
      // TODO: 替换为实际的API地址
      getData({
        url: "/api/team/invite/current/3", // 请替换为实际API
        userType: 3,
      })
        .then((res) => {
          if (res.success) {
            this.invitationCode = res.result.inviteCode;
          } else {
            this.$message.error(res.message || "获取邀请码失败");
            this.createInvitationCode();
          }
        })
        .catch((error) => {
          console.error("获取邀请码失败:", error);
          this.createInvitationCode();
          this.$message.error("获取邀请码失败");
        });
    },
    // 获取执教邀请码
    getCoachInvitationCode() {
      submitData({
        url: "/api/team/invite/generate", // 请替换为实际API
        userType: 2,
      }).then((res) => {
        if (res.success) {
          this.coachInvitationCode = res.result.inviteCode;
        }
      });
    },
    // 创建邀请码
    createInvitationCode() {
      submitData({
        url: "/api/team/invite/generate", // 请替换为实际API
        userType: 3,
      })
        .then((res) => {
          if (res.success) {
            this.invitationCode = res.result.inviteCode;
          } else {
            this.$message.error(res.message || "创建邀请码失败");
          }
        })
        .catch((error) => {
          console.error("创建邀请码失败:", error);
          this.$message.error("创建邀请码失败");
        });
    },

    // 复制邀请码
    copyInvitationCode() {
      if (!this.invitationCode) {
        this.$message.warning("邀请码为空");
        return;
      }

      this.copyLoading = true;

      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(this.invitationCode)
          .then(() => {
            this.$message.success("邀请码已复制到剪贴板");
            this.copyLoading = false;
          })
          .catch(() => {
            this.fallbackCopyTextToClipboard(this.invitationCode);
          });
      } else {
        // 降级方案
        this.fallbackCopyTextToClipboard(this.invitationCode);
      }
    },

    // 复制执教邀请码
    copyCoachInvitationCode() {
      if (!this.coachInvitationCode) {
        this.$message.warning("执教邀请码为空");
        return;
      }

      this.copyLoading = true;

      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(this.coachInvitationCode)
          .then(() => {
            this.$message.success("执教邀请码已复制到剪贴板");
            this.copyLoading = false;
          })
          .catch(() => {
            this.fallbackCopyTextToClipboard(this.coachInvitationCode);
          });
      } else {
        // 降级方案
        this.fallbackCopyTextToClipboard(this.coachInvitationCode);
      }
    },

    // 降级复制方案
    fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          this.$message.success("邀请码已复制到剪贴板");
        } else {
          this.$message.error("复制失败，请手动复制");
        }
      } catch (err) {
        this.$message.error("复制失败，请手动复制");
      }

      document.body.removeChild(textArea);
      this.copyLoading = false;
    },

    // 重新生成邀请码
    regenerateInvitationCode() {
      this.createInvitationCode();
    },

    // 新建分组
    handleAddGroup() {
      this.groupDialogTitle = "新建分组";
      this.resetGroupForm();
      this.showGroupDialog = true;
    },

    // 编辑分组
    handleEditGroup(node) {
      this.groupDialogTitle = "编辑分组";
      this.groupForm = {
        id: node.data.id,
        name: node.label,
        description: node.data.description || "",
      };
      this.showGroupDialog = true;
    },

    // 删除分组
    handleDeleteGroup(node) {
      MessageBox.confirm(
        `确定要删除分组"${node.label}"吗？删除后该分组下的所有运动员将移至我的运动员分组。`,
        "删除确认",
        {
          confirmButtonText: "确定删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.deleteGroup(node.data.id);
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },

    // 移动分组
    handleMoveGroup(node) {
      this.currentGroup = node.data;
      this.targetGroupId = "";
      this.showMoveDialog = true;
      this.moveType = "group";
    },

    // 运动员移动分组
    handleMoveAthletic(node) {
      this.currentGroup = node.parent.data;
      this.currentAthletic = node.data;
      this.targetGroupId = "";
      this.showMoveDialog = true;
      this.moveType = "athletic";
    },

    // 运动员解绑分组
    handleMoveOutAthletic(node) {
      this.$confirm("确定解绑该运动员吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        submitData({
          url: `/api/team/kick/${this.teamId}/${node.data.triUserId}/${node.data.userType}`,
          method: "delete",
        })
          .then((res) => {
            if (res.success) {
              this.$message.success("解绑成功");
              this.getAthleticData();
            } else {
              this.$message.error(res.message || "解绑失败");
            }
          })
          .catch((error) => {
            console.error("解绑失败:", error);
            this.$message.error("解绑失败");
          });
      });
    },

    // 教练解绑分组
    handleMoveOutCoach(node) {
      if (node.data.userType === 1) {
        this.$message.error("不能解绑主教练");
        return;
      }
      this.$confirm("确定解绑该执教吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        submitData({
          url: `/api/team/kick/${this.teamId}/${node.data.triUserId}/${node.data.userType}`,
          method: "delete",
        })
          .then((res) => {
            if (res.success) {
              this.$message.success("解绑成功");
              this.getAthleticData();
            } else {
              this.$message.error(res.message || "解绑失败");
            }
          })
          .catch((error) => {
            console.error("解绑失败:", error);
            this.$message.error("解绑失败");
          });
      });
    },

    // 保存分组（新建/编辑）
    saveGroup() {
      this.$refs.groupForm.validate((valid) => {
        if (valid) {
          if (this.groupForm.id) {
            // 编辑分组
            this.updateGroup();
          } else {
            // 新建分组
            this.createGroup();
          }
        }
      });
    },

    // 创建分组
    createGroup() {
      const params = {
        teamId: this.teamId,
        groupName: this.groupForm.name,
        description: this.groupForm.description,
      };

      // TODO: 替换为实际的API地址
      submitData({
        url: "/api/team/group", // 请替换为实际API
        requestData: params,
      })
        .then((res) => {
          if (res.success) {
            this.$message.success("分组创建成功");
            this.showGroupDialog = false;
            this.getAthleticData();
          } else {
            this.$message.error(res.message || "创建失败");
          }
        })
        .catch((error) => {
          console.error("创建分组失败:", error);
          this.$message.error("创建失败");
        });
    },

    // 更新分组
    updateGroup() {
      const params = {
        groupId: this.groupForm.id,
        groupName: this.groupForm.name,
        description: this.groupForm.description,
      };

      // TODO: 替换为实际的API地址
      submitData({
        url: `/api/team/group/${this.groupForm.id}`, // 请替换为实际API
        method: "put",
        requestData: params,
      })
        .then((res) => {
          if (res.success) {
            this.$message.success("分组更新成功");
            this.showGroupDialog = false;
            this.getAthleticData();
          } else {
            this.$message.error(res.message || "更新失败");
          }
        })
        .catch((error) => {
          console.error("更新分组失败:", error);
          this.$message.error("更新失败");
        });
    },

    // 删除分组
    deleteGroup(groupId) {
      // TODO: 替换为实际的API地址
      submitData({
        url: `/api/team/group/${groupId}`, // 请替换为实际API
        groupId: groupId,
        method: "delete",
      })
        .then((res) => {
          if (res.success) {
            this.$message.success("分组删除成功");
            this.getAthleticData();
          } else {
            this.$message.error(res.message || "删除失败");
          }
        })
        .catch((error) => {
          console.error("删除分组失败:", error);
          this.$message.error("删除失败");
        });
    },

    // 确认移动分组
    confirmMoveGroup() {
      if (!this.targetGroupId) {
        this.$message.warning("请选择目标分组");
        return;
      }

      let params = {};
      if (this.moveType === "group") {
        params = {
          groupId: this.targetGroupId,
          teamId: this.teamId,
          memberIds: this.currentGroup.children.map(
            (member) => member.triUserId
          ),
        };
      } else {
        params = {
          groupId: this.targetGroupId,
          teamId: this.teamId,
          memberIds: [this.currentAthletic.triUserId],
        };
      }

      submitData({
        url: "/api/team/group/member/batch-set",
        requestData: params,
      })
        .then((res) => {
          if (res.success) {
            this.$message.success("分组移动成功");
            this.showMoveDialog = false;
            this.getAthleticData();
          } else {
            this.$message.error(res.message || "移动失败");
          }
        })
        .catch((error) => {
          console.error("移动分组失败:", error);
          this.$message.error("移动失败");
        });
    },

    // 重置分组表单
    resetGroupForm() {
      this.groupForm = {
        id: "",
        name: "",
        description: "",
      };
      if (this.$refs.groupForm) {
        this.$refs.groupForm.resetFields();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.athletic-management {
  flex: 0 0 280px;
  padding: 10px;
  .athletic-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
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
.btn-list-hover {
  width: 80px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  .el-button {
    margin-left: 0;
    padding: 4px 8px;
    font-size: 12px;
    text-align: left;
    &:hover {
      background-color: #f5f7fa;
    }
  }
}
.athletic-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.athletic-operation {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

// 弹框样式优化
.dialog-footer {
  text-align: right;
  .el-button {
    margin-left: 10px;
  }
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
.athletic-tree {
  border-bottom: 2px solid #f0f0f0;
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
    margin-bottom: 20px;

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
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
  }

  .invite-description {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 25px;

    div {
      margin-bottom: 5px;
    }
  }

  .invite-code-container {
    background: #fff5f5;
    border: 2px solid #ff4757;
    border-radius: 8px;
    padding: 15px 15px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .invite-code-label {
      color: #333;
      font-weight: 500;
    }

    .invite-code-value {
      color: #ff4757;
      font-weight: bold;
      font-size: 16px;
      font-family: "Courier New", monospace;
      letter-spacing: 1px;
    }
  }

  .invite-code-tip {
    color: #999;
    font-size: 12px;
    line-height: 1.4;
  }
}

.invite-footer {
  display: flex;
  justify-content: center;
  gap: 15px;

  .copy-btn {
    background: #ff4757;
    border-color: #ff4757;
    padding: 12px 30px;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      background: #ff3742;
      border-color: #ff3742;
    }
  }

  .regenerate-btn {
    background: #333;
    border-color: #333;
    color: #fff;
    padding: 12px 30px;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      background: #555;
      border-color: #555;
    }
  }
}
</style>
