<template>
  <div class="container">
    <el-card>
      <!-- <el-form :inline="true" :model="searchForm" ref="searchForm2">
        <el-row :gutter="12">
          <el-col :md="6">
            <el-form-item label="角色名称" prop="roleName">
              <el-input
                v-model="searchForm.roleName"
                style="width: 100%"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>

          <el-col :md="4">
            <el-form-item label="">
              <el-button type="primary" @click="onSubmit" round>查询</el-button>
              <el-button type="default" @click="reset" round>重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form> -->
      <el-row>
        <el-button
          type="primary"
          v-permission="['sys-manage-role-insert-role']"
          @click="addRole"
          round
        >
          新建角色</el-button
        >
      </el-row>
      <Table :data="tableData" :columns="columns" :getList="getList">
        <template v-slot:action="{ row }">
          <el-button
            type="text"
            @click="clickAcion('edit', row)"
            :disabled="row.roleId === 1"
            v-permission="['sys-manage-role-update']"
            >编辑</el-button
          >
          <el-button
            type="text"
            @click="clickAcion('delete', row)"
            :disabled="row.roleId === 1"
            v-permission="['sys-manage-role-remove']"
            >删除</el-button
          >
          <el-button
            type="text"
            @click="clickAcion('role', row)"
            :disabled="row.roleId === 1"
            v-permission="['sys-manage-role-auth']"
            >权限</el-button
          >
        </template>
      </Table>
    </el-card>
    <el-dialog
      :title="isEdit ? '编辑角色' : '新建角色'"
      :visible.sync="userFormVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="userForm"
        label-width="90px"
        ref="userForm2"
        :rules="rules"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="userForm.roleName"
            autocomplete="off"
            placeholder="请输入"
            :maxLength="50"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色说明" prop="roleDesc">
          <el-input
            v-model="userForm.roleDesc"
            type="textarea"
            autocomplete="off"
            :maxLength="500"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <div class="user-btn">
          <el-button
            @click="coloseUserForm"
            class="user-btn-cancel"
            type="default"
            round
            >取消</el-button
          >
          <el-button
            @click="saveUser"
            class="user-btn-save"
            type="primary"
            :loading="saveLoading"
            round
            >保存</el-button
          >
        </div>
      </div>
    </el-dialog>
    <el-dialog
      title="分配权限"
      :visible.sync="roleVisible"
      width="600px"
      top="10px"
      :close-on-click-modal="false"
    >
      <el-form :model="roleForm" ref="roleForm2">
        <el-form-item prop="role">
          <el-tree
            v-model="roleForm.role"
            :data="roleData"
            show-checkbox
            node-key="menuId"
            :props="defaultProps"
            ref="tree"
            default-expand-all
          >
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="coloseRoleForm">取 消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Table from "@/components/customTable/index.vue";
import Button from "@/components/customBtn";
import { isEmpty } from "lodash";
import { getData, submitData } from "@/api/common";
const column = [
  {
    label: "序号",
    type: "index",
  },
  {
    label: "角色名称",
    prop: "roleName",
  },
  {
    label: "描述",
    prop: "roleDesc",
  },
  {
    label: "操作",
    slot: "action",
    props: "indeex",
    width: "400",
  },
];
export default {
  components: {
    Table,
    Button,
  },
  data() {
    return {
      searchForm: {
        roleName: "",
      },
      userForm: {
        roleName: "",
        roleDesc: "",
      },
      userRule: {
        roleName: [
          {
            required: true,
            message: "请输入角色名称",
          },
        ],
        roleCode: [
          {
            required: true,
            message: "请输入角色code",
          },
        ],
      },
      saveLoading: false,
      roleForm: {
        role: [],
      },
      tableData: [],
      total: 1,
      pagination: {
        page: 1,
        limit: 10,
      },
      columns: [...column],
      userFormVisible: false, // 新增用户
      roleVisible: false, // 角色
      roleData: [],
      defaultProps: {
        children: "childMenu",
        label: "menuName",
      },
      defaultCheckedKeys: [],
      isEdit: false,
      rules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名称",
          },
        ],
        roleDesc: [
          {
            required: false,
            message: "请输入角色说明",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },

  methods: {
    addRole() {
      this.userFormVisible = true;
      this.$nextTick(() => {
        this.$refs.userForm2.resetFields();
      });
      this.isEdit = false;
    },
    onSubmit() {
      this.$refs.searchForm2.validate((valid) => {
        if (valid) {
          this.getList(this.searchForm);
        }
      });
    },
    reset() {
      this.$refs.searchForm2.resetFields();
      this.getList();
    },
    handleClick() {},
    getList(payload) {
      // const { page, limit } = this.pagination;
      let obj = {
        url: "/sys/role/getRoleList",
        // pageNum: page,
        // limit,
      };
      if (payload) {
        obj = {
          ...obj,
          ...payload,
        };
      }
      getData(obj).then((res) => {
        // const { records } = res.result;
        // const { total, current, size } = pageInfo;
        // this.total = total;
        // this.pagination.page = current;
        // this.pagination.limit = size;
        this.tableData = res.result;
      });
    },
    clickAcion(type, row) {
      switch (type) {
        case "edit":
          this.userFormVisible = true;
          this.editUser(row);
          break;
        case "delete":
          this.delete(row);
          break;
        case "role":
          // this.roleVisible = true;
          // this.role(row);
          this.$router.push({
            path: "/systemManage/authConfig",
            query: { id: row.roleId },
          });
          break;

        default:
      }
    },
    coloseUserForm() {
      this.userFormVisible = false;
      this.$refs.userForm2.resetFields();
    },
    saveUser() {
      if (this.saveLoading) return;
      this.$refs.userForm2.validate((valid) => {
        if (valid) {
          const obj = {
            ...this.userForm,
            roleId: this.isEdit ? this.currentRole.roleId : "",
            url: "/sys/role/saveOrUpdate",
          };
          this.saveLoading = true;
          submitData(obj)
            .then((res) => {
              this.$refs.userForm2.resetFields();
              this.userFormVisible = false;
              this.saveLoading = false;
              this.$message.success("保存成功");
              this.isEdit = false;
              this.getList();
            })
            .catch(() => {
              this.saveLoading = false;
            });
        }
      });
    },
    editUser(row) {
      this.currentRole = row;
      this.userFormVisible = true;
      this.isEdit = true;
      this.userForm = {
        roleName: row.roleName,
        roleDesc: row.roleDesc,
      };
    },
    delete(row) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: (action) => {
          if (action !== "confirm") return;

          submitData({
            url: `/sys/role/delete/${row.roleId}`,
            method: "delete",
          }).then((res) => {
            this.$message.success("删除成功");
            this.getList();
          });
        },
      });
    },
    async role(row) {
      this.currentRole = row;
      this.roleVisible = true;
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys([]);
      });
      const res = await getData({ url: `/sys/role/getAllMenuOperationTree` });
      this.roleData = res.result ?? [];
      const res2 = await getData({
        url: "/sys/role/getRoleAuthorInfo",
        roleId: row.roleId,
      });
      const role = this.getRole(res2.result.menuOperationDtoList);
      const arr = [];
      function fn(list) {
        list.forEach((item) => {
          let isCheckAll = true;
          if (!isEmpty(item.childMenu)) {
            item.childMenu.forEach((val) => {
              if (!role.includes(val.menuId)) {
                isCheckAll = false;
              }
              if (role.includes(val.menuId)) arr.push(val.menuId);
            });
            if (isCheckAll) arr.push(item.menuId);
          } else {
            if (role.includes(item.menuId)) arr.push(item.menuId);
          }
        });
      }
      fn(res.result);
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(arr);
      });
    },
    getRole(list) {
      const arr = [];
      function fn(pay) {
        pay.forEach((item) => {
          arr.push(item.menuId);
          if (item.childMenu) {
            fn(item.childMenu);
          }
        });
      }
      fn(list);
      return arr;
    },
    updatePwd(row) {},
    resetPwd(row) {},
    coloseRoleForm() {
      this.$refs.roleForm2.resetFields();
      this.$refs.tree.setCheckedKeys([]);
      this.roleVisible = false;
    },
    saveRole() {
      this.$refs.roleForm2.validate((valid) => {
        if (valid) {
          const data = this.$refs.tree
            .getCheckedKeys()
            .concat(this.$refs.tree.getHalfCheckedKeys());
          const obj = {
            url: "/sys/role/updateRoleAuthor",
            menuIds: data,
            operationIds: [],
            roleId: this.currentRole.roleId,
          };
          submitData(obj).then((res) => {
            this.coloseRoleForm();
            this.$message.success("保存成功");
            this.getList();
          });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.user-btn {
  display: flex;
  justify-content: flex-end;
  .user-btn-cancel {
    margin-right: 10px;
    padding: 10px 20px;
    width: 100px;
  }
  .user-btn-save {
    padding: 10px 20px;
    width: 100px;
  }
}
</style>
