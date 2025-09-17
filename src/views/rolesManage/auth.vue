<template>
  <page-header-wrapper :breadcrumb="true" :title="false">
    <el-card :bordered="false">
      <el-form @submit="handleSubmit" :form="form" class="form">
        <el-table
          ref="table"
          size="default"
          rowKey="key"
          :span-method="tableSpan"
          :data="dataSource"
        >
          <el-table-column prop="menuName" label="模块">
            <template slot-scope="scope">
              <el-checkbox
                :value="checkedKeys.includes(scope.row.menuId)"
                @change="
                  (a) => {
                    checkedChange(a, scope.row.menuId);
                  }
                "
              >
                {{ scope.row.menuName }}
              </el-checkbox>
            </template>
          </el-table-column>
          <el-table-column prop="sonMenuName" label="二级模块">
            <template slot-scope="scope">
              <el-checkbox
                v-if="scope.row.sonMenuId"
                :value="checkedKeys.includes(scope.row.sonMenuId)"
                @change="
                  (a) => {
                    checkedChange(a, scope.row.sonMenuId);
                  }
                "
                style="margin-right: 10px"
              >
                {{ scope.row.sonMenuName }}
              </el-checkbox>
            </template>
          </el-table-column>
          <el-table-column prop="operations" label="按钮" className="btnTd">
            <template slot-scope="scope">
              <el-checkbox
                v-for="item in scope.row.operations"
                :value="btnKeys.includes(item.btnId)"
                :key="item.btnId"
                @change="
                  (a) => {
                    btnChange(a, item.btnId);
                  }
                "
                style="margin-right: 10px"
              >
                {{ item.btnName }}
              </el-checkbox>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px">
          <el-form-item
            label="存货费用（对外）品类维护"
            required
            :error="lobList.length ? null : '请选择存货费用（对外）品类维护'"
            label-width="210px"
          >
            <el-checkbox-group v-model="lobList">
              <el-checkbox label="iPhone"></el-checkbox>
              <el-checkbox label="iPad"></el-checkbox>
              <el-checkbox label="Watch"></el-checkbox>
              <el-checkbox label="配件"></el-checkbox>
              <el-checkbox label="CPU"></el-checkbox>
              <el-checkbox label="AirPods"></el-checkbox>
              <el-checkbox label="Beats"></el-checkbox>
              <el-checkbox label="ACPP"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <div style="text-align: center; padding-top: 20px">
          <el-button
            type="primary"
            style="margin-right: 20px"
            @click="handleSubmit"
            >保存</el-button
          >
          <el-button type="default" @click="handleGoBack">返回</el-button>
        </div>
      </el-form>
    </el-card>
  </page-header-wrapper>
</template>

<script>
// import { Checkbox } from 'ant-design-vue'
import { getData, submitData } from "@/api/common";
export default {
  name: "AuthConfig",
  data() {
    this.columns = [
      {
        title: "模块",
        dataIndex: "menuName",
        customRender: (value, row, index) => {
          const obj = {
            children: (
              <a-checkbox
                value={row.menuId}
                checked={this.checkedKeys.includes(row.menuId)}
                onChange={this.checkedChange}
              >
                {value}
              </a-checkbox>
            ),
            attrs: { rowSpan: row.sonCount },
          };
          return obj;
        },
      },
      {
        title: "二级菜单",
        dataIndex: "sonMenuName",
        customRender: (value, row, index) => {
          const obj = {
            children: row.sonMenuId ? (
              <a-checkbox
                value={row.sonMenuId}
                checked={this.checkedKeys.includes(row.sonMenuId)}
                onChange={this.checkedChange}
                style="margin-right: 10px"
              >
                {value}
              </a-checkbox>
            ) : (
              ""
            ),
            attrs: {},
          };
          return obj;
        },
      },
      {
        title: "按钮",
        dataIndex: "btnName",
        customRender: (value, row, index) => {
          const obj = {
            children: row.operations.forEach((item) => {
              return (
                <a-checkbox
                  value={item.btnId}
                  checked={this.btnKeys.includes(item.btnId)}
                  onChange={this.btnChange}
                  style="margin-right: 10px"
                >
                  {value}
                </a-checkbox>
              );
            }),
            attrs: {},
          };
          return obj;
        },
      },
    ];
    return {
      form: {},
      // 查询参数
      queryParam: {},
      rid: "",
      dataSource: [],
      roleName: "",
      checkedKeys: [],
      parentMenuList: [],
      menuList: [],
      btnKeys: [],
      lobList: [],
    };
  },
  computed: {},
  mounted() {
    this.rid = this.$route.query.id;
    this.roleName = this.$route.query.roleName;
    getData({
      url: "/sys/role/getRoleAuthorSubTreeInfo",
      roleId: this.rid,
    }).then((res) => {
      // const { menuIdList, roleName } = res.result
      // this.roleName = roleName
      const menuIds = [];
      const btnIds = [];
      res.result.menuOperationDtoList.forEach((item) => {
        menuIds.push(item.menuId);
        item.childMenu.forEach((part) => {
          menuIds.push(part.menuId);
          if (part.operations) {
            part.operations.forEach((i) => {
              btnIds.push(i.btnId);
            });
          }
        });
      });
      this.checkedKeys = menuIds;
      this.btnKeys = btnIds;
      getData({ url: `/sys/role/getAllMenuOperationTree` }).then((response) => {
        this.parentMenuList = response.result;
        response.result.forEach((item) => {
          if (item.childMenu && item.childMenu.length > 0) {
            item.childMenu.forEach((item2, index) => {
              const aro = {
                menuName: item.menuName,
                menuId: item.menuId,
                sonMenuName: item2.menuName,
                sonMenuId: item2.menuId,
                operations: item2.operations || [],
                sonCount: index === 0 ? item.childMenu.length : 0,
              };
              console.log(this.dataSource);
              this.dataSource.push(aro);
            });
          } else {
            this.dataSource.push({
              menuName: item.menuName,
              menuId: item.id,
              sonMenuName: "",
              sonMenuId: "",
              operations: [],
              sonCount: 1,
            });
          }
        });
      });
    });
    getData({
      url: `/inventoryExpenseAuthor/getByRoleId/${this.rid}`,
    }).then((res) => {
      this.lobList = res.result;
    });
    // const orzId = JSON.parse(localStorage.getItem('userInfo')).orzIdList[0]
  },
  methods: {
    tableSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return {
          rowspan: row.sonCount,
          colspan: 1,
        };
      }
    },
    onChange(checkedValues) {
      console.log("checked = ", checkedValues);
    },
    checkedChange(checked, menuId) {
      if (checked) {
        this.checkedKeys.push(menuId);
        this.getParentId(menuId);

        // 判断是否是模块权限，如果是模块权限则该模块下的所有菜单被选中
        const mod = this.parentMenuList.filter(
          (item) => item.menuId === menuId
        );
        if (mod.length > 0) {
          mod[0].childMenu.forEach((item) => {
            if (!this.checkedKeys.includes(item.menuId)) {
              this.checkedKeys.push(item.menuId);
            }
            item.operations.forEach((part) => {
              if (!this.btnKeys.includes(part.btnId)) {
                this.btnKeys.push(part.btnId);
              }
            });
          });
        }
      } else {
        this.checkedKeys = this.checkedKeys.filter((item) => item !== menuId);
        this.deleteSonId(menuId);

        // 模块下的所有菜单被取消，则该模块的选中状态被取消
        const noSon = this.parentMenuList.filter(
          (item) =>
            this.checkedKeys.includes(item.menuId) &&
            item.childMenu.length > 0 &&
            !item.childMenu.some((item2) =>
              this.checkedKeys.includes(item2.menuId)
            )
        );
        this.checkedKeys = this.checkedKeys.filter(
          (item) => !noSon.some((item2) => item2.menuId === item)
        );
      }
    },
    getParentId(id) {
      const _f = (data) => {
        if (data.parentId && data.menuId === id) {
          data.operations.forEach((item) => {
            if (!this.btnKeys.includes(item.btnId)) {
              this.btnKeys.push(item.btnId);
            }
          });
        }
        if (
          data.parentId &&
          data.menuId === id &&
          !this.checkedKeys.includes(data.parentId)
        ) {
          this.checkedKeys.push(data.parentId);
          this.getParentId(data.parentId);
        } else if (data.childMenu) {
          data.childMenu.forEach((item2) => {
            _f(item2);
          });
        }
      };
      this.parentMenuList.forEach((item) => {
        _f(item);
      });
    },
    deleteSonId(id) {
      const _f = (data) => {
        if (this.checkedKeys.includes(data.menuId)) {
          this.checkedKeys = this.checkedKeys.filter(
            (item) => item !== data.menuId
          );
          this.btnKeys = this.btnKeys.filter((item) => {
            return !data.operations.some((part) => part.btnId === item);
          });
        }
        if (data.childMenu) {
          data.childMenu.forEach((item2) => {
            _f(item2);
          });
        }
      };
      const _g = (data) => {
        if (data.menuId === id && data.childMenu) {
          data.childMenu.forEach((item) => {
            _f(item);
          });
          this.btnKeys = this.btnKeys.filter((item) => {
            return !data.operations.some((part) => part.btnId === item);
          });
        }
        if (data.menuId !== id && data.childMenu) {
          data.childMenu.forEach((item) => {
            _g(item);
          });
        }
      };
      this.parentMenuList.forEach((item) => {
        _g(item);
      });
    },
    btnChange(checked, menuId) {
      if (checked) {
        this.btnKeys.push(menuId);
      } else {
        this.btnKeys = this.btnKeys.filter((item) => item !== menuId);
      }
    },
    handleSubmit() {
      if (!this.lobList.length) return;
      submitData({
        url: "/sys/role/updateRoleAuthor",
        menuIds: this.checkedKeys,
        operationIds: this.btnKeys,
        roleId: parseInt(this.rid),
      }).then((res) => {
        if (res.success) {
          this.$message.success("权限修改成功");
        } else {
          this.$message.warning(res.message);
        }
      });
      submitData({
        url: "/inventoryExpenseAuthor/save",
        roleId: this.rid,
        lobList: this.lobList,
      });
    },
    handleGoBack() {
      this.$router.go(-1);
    },
  },
};
</script>
