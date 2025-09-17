<template>
  <el-card>
    <el-form
      ref="form2"
      :model="form"
      label-width="100px"
      style="width: 600px"
      :rules="rules"
    >
      <el-form-item label="原始密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          :maxLength="50"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item label="新密码密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          :maxLength="50"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          :maxLength="50"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <div>
          密码规则：大小字母+特殊字符（英文特殊字符）+数字，长度大于8位，
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import { submitData } from "@/api/common";
import { mapState } from "vuex";
import JSEncrypt from "jsencrypt";
import { publicKey } from "@/config/setting";

export default {
  name: "UpdatePassword",
  data() {
    return {
      form: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      rules: {
        oldPassword: [
          { required: true, message: "请输入原始密码", trigger: "blur" },
          {
            max: 50,
            message: "最大长度为50",
          },
        ],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          {
            min: 8,
            message: "密码格式不正确",
            trigger: "blur",
            pattern:
              /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[!#@*&.])[a-zA-Z\d!#@*&.]{8,50}$/,
          },
        ],
        confirmPassword: [
          { required: true, message: "请输入确认密码", trigger: "blur" },
          {
            validator: (rule, value, callback) =>
              this.validatorPass(rule, value, callback),
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo,
    }),
  },
  methods: {
    cancel() {
      this.$router.go(-1);
    },
    onSubmit() {
      this.$refs.form2.validate((valid) => {
        if (valid) {
          const { confirmPassword, newPassword, oldPassword } = this.form;
          const rsaPassword = new JSEncrypt();
          rsaPassword.setPublicKey(publicKey);
          const confirmPs = rsaPassword.encrypt(confirmPassword);
          const newPs = rsaPassword.encrypt(newPassword);
          const oldPs = rsaPassword.encrypt(oldPassword);
          const obj = {
            url: "/sys/user/changePassword",
            confirmPassword: confirmPs,
            newPassword: newPs,
            oldPassword: oldPs,
            userId: this.userInfo.userId,
          };
          submitData(obj).then(async (res) => {
            this.$message.success("修改成功");
            await this.$store.dispatch("user/logout");
            this.$router.push(`/login`);
          });
        }
      });
    },
    validatorPass(rule, value, callback) {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.form.newPassword) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    },
    keypress(value) {
      console.log(value, 2222222);
    },
  },
};
</script>
