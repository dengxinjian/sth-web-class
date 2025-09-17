<template>
  <div class="container">
    <el-card>
      <!-- <el-form
        :inline="true"
        :model="searchForm"
        class="demo-form-inline"
        ref="searchForm2"
      >
        <el-row :gutter="12">
          <el-col :md="6">
            <el-form-item label="用户名" prop="userName">
              <el-input
                v-model="searchForm.userName"
                style="width: 100%"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :md="6">
            <el-form-item label="所属经销商" prop="distributorId">
              <el-select
                v-model="searchForm.distributorId"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in disOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="4">
            <el-form-item>
              <el-button type="primary" @click="onSubmit" round>查询</el-button>
              <el-button type="default" @click="reset" round>重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form> -->
      <el-row>
        <el-button
          type="primary"
          v-permission="['sys-manage-user-insert-user']"
          @click="addUser"
          round
        >
          新建用户</el-button
        >
      </el-row>
      <Table
        :data="tableData"
        :columns="columns"
        :getList="getList"
        :total="total"
        :pagination="pagination"
      >
        <template v-slot:action="{ row }">
          <el-button
            type="text"
            @click="clickAcion('edit', row)"
            :disabled="row.userId === 1"
            v-permission="['sys-manage-user-update']"
            >编辑</el-button
          >
          <el-button
            type="text"
            @click="clickAcion('delete', row)"
            :disabled="row.userId === 1"
            v-permission="['sys-manage-user-remove']"
            >删除</el-button
          >
          <!-- <el-button type="text" @click="clickAcion('role', row)"
            >角色</el-button
          > -->

          <el-button
            type="text"
            @click="clickAcion('resetPwd', row)"
            :disabled="row.userId === 1"
            v-permission="['sys-manage-user-reset-psw']"
            >重置密码</el-button
          >
        </template>
        <template v-slot:distributorId="{ row }"
          ><span>{{ tranLabel(row.distributorId) }}</span></template
        >
      </Table>
    </el-card>
    <el-dialog
      :title="isEditUser ? '编辑用户' : '新建用户'"
      :visible.sync="userFormVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="userForm"
        label-width="80px"
        ref="userForm2"
        :rules="rules"
      >
        <el-form-item label="用户名" prop="name">
          <el-input
            v-model="userForm.name"
            autocomplete="off"
            :maxLength="50"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="登录账号" prop="userName">
          <el-input
            v-model="userForm.userName"
            autocomplete="off"
            placeholder="请输入"
            :disabled="isEditUser"
            :maxLength="30"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            show-password
            autocomplete="off"
            placeholder="请输入"
            :disabled="isEditUser"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="userForm.phone"
            autocomplete="off"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="userForm.roleId">
            <el-option
              v-for="item in roleOptioins"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
            type="primary"
            :loading="saveLoading"
            class="user-btn-save"
            round
            >保存</el-button
          >
        </div>
      </div>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="roleVisible" width="600px">
      <el-form
        :model="roleForm"
        label-width="80px"
        ref="roleForm2"
        :rules="rules2"
      >
        <el-form-item label="角色列表" prop="role">
          <el-checkbox-group v-model="roleForm.role">
            <el-checkbox
              v-for="item in roleOptioins"
              :label="item.label"
              :key="item.label"
            ></el-checkbox> </el-checkbox-group
        ></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <div class="user-btn">
          <el-button
            @click="coloseRoleForm"
            class="user-btn-cancel"
            type="round"
            >取消</el-button
          >
          <el-button @click="saveRole" class="user-btn-save" type="round"
            >保存</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Table from "@/components/customTable/index.vue";
import Button from "@/components/customBtn";
import { mapState } from "vuex";
import { getData, submitData } from "@/api/common";
import JSEncrypt from "jsencrypt";
import { publicKey } from "@/config/setting";

const column = [
  {
    label: "序号",
    type: "index",
  },
  {
    label: "用户名",
    prop: "userName",
  },
  {
    label: "登录账号",
    prop: "loginAccount",
  },
  {
    label: "联系电话",
    prop: "phoneNumber",
  },
  {
    label: "创建时间",
    prop: "createTime",
  },
  {
    label: "操作",
    slot: "action",
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
        userName: "",
        distributorId: "",
      },
      userForm: {
        userName: "",
        name: "",
        phone: "",
        password: "Server@2023",
        roleId: "",
      },
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
      saveLoading: false,
      userFormVisible: false, // 新增用户
      roleVisible: false, // 角色
      rules: {
        name: [
          {
            required: true,
            message: "请输入",
          },
        ],
        userName: [
          {
            required: true,
            message: "请输入",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入",
          },
          {
            min: 8,
            message: "密码格式不正确",
            trigger: "blur",
            pattern:
              /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[!#@*&.])[a-zA-Z\d!#@*&.]{8,50}$/,
          },
        ],
        phone: [
          {
            required: false,
            message: "请输入",
          },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
          },
        ],
        roleId: [
          {
            required: true,
            message: "请选择",
          },
        ],
      },
      rules2: {
        role: [
          {
            required: true,
            message: "请选择",
            type: "array",
          },
        ],
      },
      currentUser: {},
      roleOptioins: [],
      isEditUser: false, // 是否编辑用户
      disOptions: [],
      disOptions2: [],
    };
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo,
    }),
  },

  created() {
    this.getList();
    // this.getDealer();
  },
  methods: {
    getList(payload) {
      console.log(this.userInfo);
      const { page: current, limit: size } = this.pagination;
      // const { userId } = this.userInfo;
      let obj = {
        current,
        size,
        url: "/sys/user/list",
      };
      if (payload) obj = { ...obj, ...payload };
      getData(obj).then((res) => {
        const { records, pageInfo } = res.result;
        const { total, current, size: limit } = pageInfo;
        this.tableData = records;
        this.total = total;
        this.pagination.page = current;
        this.pagination.limit = limit;
      });
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
    tranLabel(value) {
      if (!value) return "";
      return this.disOptions.find((item) => item.value === value)?.label ?? "";
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
          this.roleVisible = true;
          this.role(row);
          break;

        case "resetPwd":
          this.resetPwd(row);
          break;
        default:
      }
    },
    coloseUserForm() {
      this.$refs.userForm2.resetFields();
      this.userFormVisible = false;
    },
    addUser() {
      this.userFormVisible = true;
      this.$nextTick(() => {
        this.$refs.userForm2.resetFields();
        this.isEditUser = false;
        this.getRole(); // 获取角色
        // this.getDealer(); // 获取经销商
      });
    },

    saveUser() {
      if (this.saveLoading) return;
      this.$refs.userForm2.validate((valid) => {
        if (valid) {
          const { phone, name, userName, password, roleId } = this.userForm;
          const rsaPassword = new JSEncrypt();
          rsaPassword.setPublicKey(publicKey);
          const ps = rsaPassword.encrypt(password);
          this.saveLoading = true;
          let obj = {
            url: "/sys/user/add",
            loginAccount: userName,
            phoneNumber: phone,
            userName: name,
            password: ps,
            roleId,
          };
          if (this.isEditUser) {
            obj = {
              url: "/sys/user/edit",
              loginAccount: userName,
              phoneNumber: phone,
              userName: name,
              roleId,
              userId: this.currentUser.userId,
            };
          }
          submitData(obj)
            .then(async (res) => {
              this.userFormVisible = false;
              this.saveLoading = false;
              if (this.isEditUser) {
                this.$message.success("编辑用户成功");
              } else {
                this.$message.success("新建用户成功");
              }
              this.isEditUser = false;

              this.getList();
            })
            .catch(() => {
              this.saveLoading = false;
            });
        }
      });
    },
    // async resetRoute() {
    //   const { roleInfo } = await store.dispatch("user/getInfo");
    //   const accessRoutes = await store.dispatch(
    //     "permission/generateRoutes",
    //     roleInfo
    //   );
    //   const router = await resetRouter();
    //   router.addRoutes(accessRoutes);
    //   this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    // },
    async editUser(row) {
      this.isEditUser = true;
      this.currentUser = row;
      await this.getRole();
      getData({ url: `/sys/user/${row.userId}` }).then((res) => {
        const { userName, userId, roleId, phoneNumber, loginAccount } =
          res.result;

        this.userFormVisible = true;
        this.currentUser = { userId, roleId };
        this.userForm = {
          userName: loginAccount,
          roleId,
          phone: phoneNumber,
          name: userName,
          password: "Server@2023",
        };
      });
    },
    delete(row) {
      const self = this;
      this.$confirm("确定要删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: (action) => {
          if (action !== "confirm") return;
          submitData({
            url: `/sys/user/${row.userId}`,
            method: "delete",
          }).then((res) => {
            self.$message.success("删除成功");
            self.getList();
          });
        },
      });
    },
    async getRole() {
      const res = await getData({
        url: `/sys/role/getRoleList`,
      });
      this.roleOptioins = res.result.map((item) => ({
        label: item.roleName,
        value: item.roleId,
      }));
    },
    getDealer() {
      getData({ url: "/apple-data-center/distribute/distribute/list" }).then(
        (res) => {
          this.disOptions = res.result.map((item) => ({
            ...item,
            label: item.disName,
            value: item.disId,
          }));
          const options = [
            {
              label: "厂商",
              options: this.getOptions2(3),
            },
            {
              label: "总代",
              options: this.getOptions2(2),
            },
            {
              label: "T2",
              options: this.getOptions2(1),
            },
          ];
          this.disOptions2 = [...options];
        }
      );
    },
    getOptions2(type) {
      return this.disOptions
        .filter((item) => item.type === type)
        .map((item) => ({ label: item.disName, value: item.disId }));
    },
    async role(row) {
      this.currentUser = row;

      const res2 = await getData({
        url: `/apple-data-center/sys/user/${row.id}/role`,
      });
      this.$nextTick(() => {
        this.roleForm.role = res2.result.map((item) => item.roleName);
      });
    },
    resetPwd(row) {
      const self = this;
      this.$confirm("确定要重置密码吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: (action) => {
          if (action !== "confirm") return;
          submitData({
            url: "/sys/user/resetPassword",
            userId: row.userId,
          }).then((res) => {
            self.$message.success("重置密码成功");
          });
        },
      });
    },
    coloseRoleForm() {
      this.roleVisible = false;
      this.$refs.roleForm2.resetFields();
    },
    saveRole() {
      this.$refs.roleForm2.validate((valid) => {
        if (valid) {
          const list = this.roleOptioins
            .filter((item) => this.roleForm.role.includes(item.label))
            .map((val) => val.value);
          const obj = {
            url: "/apple-data-center/sys/user/auth",
            roleIds: list,
            userId: this.currentUser.id,
          };
          submitData(obj).then((res) => {
            this.roleVisible = false;
            this.getList();
            this.$message.success("角色分配成功");
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
