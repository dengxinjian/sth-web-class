<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="600px"
    append-to-body
    :before-close="handleClose"
    :close-on-click-modal="false"
    :title="isEditMode ? '编辑赛事' : '新增赛事'"
  >
    <el-form
      ref="eventForm"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <!-- 优先级 -->
      <el-form-item label="优先级" prop="priority" required>
        <el-radio-group
          v-model="formData.priority"
          class="priority-radio-group"
        >
          <el-radio-button label="PRIMARY">首要赛事</el-radio-button>
          <el-radio-button label="SECONDARY">次要赛事</el-radio-button>
          <el-radio-button label="FOCUS">关注赛事</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 赛事名称 -->
      <el-form-item label="赛事名称" prop="eventName" required>
        <el-input
          v-model="formData.eventName"
          placeholder="请输入赛事名称"
          :maxlength="100"
        />
      </el-form-item>

      <!-- 赛事地点 -->
      <el-form-item label="赛事地点" prop="location" required>
        <el-cascader
          :key="cascaderKey"
          ref="locationCascader"
          v-model="formData.location"
          :options="cityOptions"
          :props="cascaderProps"
          placeholder="请选择赛事地点"
          clearable
          style="width: 100%"
        />
      </el-form-item>

      <!-- 比赛类型 -->
      <el-form-item label="比赛类型" prop="competitionType" required>
        <el-select
          v-model="formData.competitionType"
          placeholder="请选择比赛类型"
          style="width: 100%"
          @change="handleCompetitionTypeChange"
        >
          <el-option
            v-for="item in competitionTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 距离 -->
      <el-form-item label="距离" prop="distance" required>
        <div style="display: flex; gap: 10px; width: 100%">
          <el-select
            v-model="formData.distance"
            placeholder="请选择距离"
            style="flex: 1"
            @change="handleDistanceChange"
          >
            <el-option
              v-for="item in distanceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-form-item
            v-if="showCustomDistance"
            prop="customDistance"
            style="flex: 1; margin-bottom: 0"
          >
            <el-input
              v-model="formData.customDistance"
              placeholder="请输入距离"
              :step="formData.competitionDistanceUnit === 'km' ? 0.001 : 1"
              :precision="formData.competitionDistanceUnit === 'km' ? 3 : 0"
              @input="handleCustomDistanceInput"
            >
              <template slot="append">
                <el-select
                  v-model="formData.competitionDistanceUnit"
                  placeholder="请选择距离单位"
                  style="width: 80px"
                  @change="handleDistanceUnitChange"
                >
                  <el-option label="km" value="km" />
                  <el-option label="m" value="m" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </div>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { competitionApi } from "@/views/classManagement/services/classManagement";

export default {
  name: "AddEvent",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    // 编辑模式时传入的赛事数据
    eventData: {
      type: Object,
      default: null,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      innerVisible: this.visible,
      formData: {
        priority: "PRIMARY",
        eventName: "",
        location: [],
        competitionType: "",
        distance: "",
        customDistance: "",
        competitionDistanceUnit: "km",
      },
      rules: {
        priority: [
          { required: true, message: "请选择优先级", trigger: "change" },
        ],
        eventName: [
          {
            validator: (rule, value, callback) => {
              // 处理 value 可能是数字或其他类型的情况
              const valueStr = value != null ? String(value) : "";
              const trimmedValue = valueStr.trim();
              if (!trimmedValue) {
                callback(new Error("请输入赛事名称"));
              } else {
                callback();
              }
            },
            trigger: ["blur", "change"],
          },
        ],
        location: [
          { required: true, message: "请选择赛事地点", trigger: "change" },
        ],
        competitionType: [
          { required: true, message: "请选择比赛类型", trigger: "change" },
        ],
        distance: [
          { required: true, message: "请选择距离", trigger: "change" },
        ],
        customDistance: [
          {
            validator: (rule, value, callback) => {
              if (this.formData.distance === "OTHER") {
                // 处理 value 可能是数字或字符串的情况
                const valueStr = value != null ? String(value) : "";
                const trimmedValue = valueStr.trim();
                if (!trimmedValue) {
                  callback(new Error("请输入自定义距离"));
                } else {
                  const num = parseFloat(trimmedValue);
                  if (isNaN(num) || num <= 0) {
                    callback(new Error("请输入有效的距离值"));
                  } else {
                    callback();
                  }
                }
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
      cityOptions: [],
      cascaderKey: 0, // 用于强制级联选择器重新渲染
      cascaderProps: {
        value: "value",
        label: "label",
        children: "children",
        expandTrigger: "click",
        lazy: true,
        lazyLoad: (node, resolve) => this.loadAdministrativeOptions(node, resolve),
      },
      competitionTypeOptions: [],
      distanceOptions: [],
      distancesByType: {},
      showCustomDistance: false,
      lastDistanceUnit: "km",
    };
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
      if (val) {
        this.initData();
      }
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
    },
    eventData: {
      handler(val) {
        if (val && this.visible) {
          this.initData();
        }
      },
      deep: true,
    },
  },
  mounted() {
    if (this.visible) {
      this.initData();
    }
  },
  methods: {
    async initData() {
      // 如果是新增模式，先清除所有数据
      if (!this.isEditMode) {
        await this.clearAllData();
      }

      // 重新加载下拉框数据
      await this.loadAdministrativeRoot();
      await this.fetchDropdownOptions();

      // 如果是编辑模式，回填数据
      if (this.isEditMode && this.eventData) {
        // 等待下拉数据加载完成后再回填
        await this.$nextTick();
        await this.fillFormData(this.eventData);
      } else {
        // 重置表单
        await this.resetForm();
      }
    },
    async clearAllData() {
      // 清除所有表单数据
      this.formData = {
        priority: "PRIMARY",
        eventName: "",
        location: [],
        competitionType: "",
        distance: "",
        customDistance: "",
        competitionDistanceUnit: "km",
      };
      // 清除所有状态数据
      this.showCustomDistance = false;
      this.distanceOptions = [];
      this.lastDistanceUnit = "km";
      this.competitionTypeOptions = [];
      this.distancesByType = {};
      this.cityOptions = [];
      // 重置级联选择器，强制重新渲染
      this.cascaderKey += 1;
      // 清除表单验证
      await this.$nextTick();
      if (this.$refs.eventForm) {
        this.$refs.eventForm.clearValidate();
        this.$refs.eventForm.resetFields();
      }
      // 如果级联选择器存在，也清除其状态
      if (this.$refs.locationCascader) {
        this.$refs.locationCascader.$refs.panel?.clearCheckedNodes?.();
      }
    },
    async resetForm() {
      this.formData = {
        priority: "PRIMARY",
        eventName: "",
        location: [],
        competitionType: "",
        distance: "",
        customDistance: "",
        competitionDistanceUnit: "km",
      };
      this.showCustomDistance = false;
      this.distanceOptions = [];
      this.lastDistanceUnit = "km";
      await this.$nextTick();
      this.$refs.eventForm && this.$refs.eventForm.clearValidate();
    },
    async fillFormData(data) {
      if (!data) return;

      // 回填优先级
      this.formData.priority = this.normalizePriority(data.priority);

      // 赛事名称
      this.formData.eventName = data.eventName || data.competitionName || "";

      // 处理地点数据（兼容字符串与数组）
      const locationValue = data.location || data.competitionLocation;
      if (typeof locationValue === "string") {
        // 先解析并加载所有需要的数据
        const locationArray = await this.parseLocationString(locationValue);
        // 确保所有路径数据都已加载到 cityOptions 中，以便级联选择器能够正确回显
        await this.ensureLocationDataLoadedForDisplay(locationArray);
        // 确保 cityOptions 已更新
        await this.$nextTick();
        // 使用 $set 确保响应式更新
        this.$set(this.formData, 'location', locationArray);
        // 等待级联选择器渲染
        await this.$nextTick();
        // 强制级联选择器重新渲染
        this.cascaderKey += 1;
        await this.$nextTick();
      } else if (Array.isArray(locationValue)) {
        // 先解析并加载所有需要的数据
        const locationArray = await this.ensureLocationValues(locationValue);
        // 确保所有路径数据都已加载到 cityOptions 中，以便级联选择器能够正确回显
        await this.ensureLocationDataLoadedForDisplay(locationArray);
        // 确保 cityOptions 已更新
        await this.$nextTick();
        // 使用 $set 确保响应式更新
        this.$set(this.formData, 'location', locationArray);
        // 等待级联选择器渲染
        await this.$nextTick();
        // 强制级联选择器重新渲染
        this.cascaderKey += 1;
        await this.$nextTick();
      } else {
        this.$set(this.formData, 'location', []);
      }

      // 处理比赛类型：兼容 displayValue / value / 数字
      this.formData.competitionType = this.normalizeCompetitionType(
        data.competitionType
      );

      // 根据比赛类型同步距离下拉
      if (this.formData.competitionType) {
        this.updateDistanceOptions(this.formData.competitionType, false);
      }

      // 处理距离：兼容 displayValue（例如 5km）和 value
      const distanceValue =
        this.normalizeDistanceValue(
          data.distance || data.competitionDistance,
          this.formData.competitionType
        ) || "";

      this.formData.distance = distanceValue;

      if (distanceValue === "OTHER") {
        this.showCustomDistance = true;
        this.formData.customDistance = this.extractDistanceNumber(
          data.competitionDistanceValue
        );
        // if (this.formData.competitionDistanceUnit === "km") {
        //   this.formData.customDistance = this.formData.customDistance / 1000;
        // }
      } else {
        this.showCustomDistance = false;
        this.formData.customDistance = "";
      }
      this.formData.competitionDistanceUnit =
        data.competitionDistanceUnit || "km";
      this.lastDistanceUnit = this.formData.competitionDistanceUnit;
    },
    async parseLocationString(locationStr) {
      // 将字符串格式的地点（如：湖北/武汉）转换为级联选择器的 value 数组（动态接口）
      if (!locationStr) return [];

      let parts = locationStr
        .split("/")
        .map((p) => (p ? String(p).trim() : ""))
        .filter(Boolean);

      // 仅保留前三层，避免历史数据带四级导致匹配失败
      if (parts.length > 3) {
        parts = parts.slice(0, 3);
      }
      return this.ensureLocationPath(parts, false);
    },
    async ensureLocationValues(values) {
      if (!Array.isArray(values) || values.length === 0) return [];
      let normalizedValues = values.map((v) =>
        v === 0 ? "0" : String(v).trim()
      );
      // 仅保留前三层，避免历史数据带四级导致匹配失败
      if (normalizedValues.length > 3) {
        normalizedValues = normalizedValues.slice(0, 3);
      }
      return this.ensureLocationPath(normalizedValues, true);
    },
    async ensureLocationPath(parts, matchByValue) {
      const result = [];
      let currentOptions = this.cityOptions;
      let parentId = "";
      let parentOption = null;
      const pathOptions = []; // 记录路径上的所有选项

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (!currentOptions || currentOptions.length === 0) {
          currentOptions = await this.fetchAdministrativeChildren(parentId);
          if (parentId === "") {
            // 更新根节点
            this.$set(this, 'cityOptions', currentOptions);
          } else if (parentOption) {
            // 更新父节点的 children
            this.$set(parentOption, 'children', currentOptions);
          }
        }

        const targetPart = String(part).trim();
        let option = currentOptions.find(
          (opt) =>
            String(opt.value) === targetPart ||
            (!matchByValue && String(opt.label).trim() === targetPart)
        );

        if (!option) {
          // 尝试重新拉取后再匹配
          currentOptions = await this.fetchAdministrativeChildren(parentId);
          if (parentId === "") {
            this.$set(this, 'cityOptions', currentOptions);
          } else if (parentOption) {
            this.$set(parentOption, 'children', currentOptions);
          }
          option = currentOptions.find(
            (opt) =>
              String(opt.value) === targetPart ||
              (!matchByValue && String(opt.label).trim() === targetPart)
          );
        }

        if (!option) break;

        result.push(option.value);
        pathOptions.push(option);

        // 懒加载子级，保证后续匹配（如果不是最后一级）
        if (i < parts.length - 1 && !option.leaf && (!option.children || option.children.length === 0)) {
          const children = await this.fetchAdministrativeChildren(option.value);
          // 当父节点是 level 1（i === 0）且不是"中国"时，子节点标记为叶子节点，只显示两级
          const isLevel1NotChina = i === 0 && option.label !== '中国';
          const processedChildren = children.map(el => {
            delete el.children;
            return {
              ...el,
              // 如果是 level 1 且不是中国，则子节点标记为叶子节点，只显示两级
              leaf: isLevel1NotChina ? true : el.leaf,
            };
          });
          this.$set(option, 'children', processedChildren);
          currentOptions = processedChildren;
        } else {
          currentOptions = option.children || [];
        }

        parentId = option.value;
        parentOption = option;
      }

      // 如果根节点仅包含中国且路径未包含中国，则自动补齐
      if (
        this.cityOptions &&
        this.cityOptions.length === 1 &&
        String(this.cityOptions[0].value) === "100000" &&
        result.length > 0 &&
        String(result[0]) !== "100000"
      ) {
        result.unshift("100000");
      }

      // 确保所有数据都已更新
      await this.$nextTick();

      return result;
    },
    async ensureLocationDataLoadedForDisplay(locationArray) {
      // 确保路径上的所有节点都已加载到 cityOptions 中，以便级联选择器能够正确回显
      // 这个方法专门用于回显时确保数据已加载
      if (!Array.isArray(locationArray) || locationArray.length === 0) {
        return;
      }

      let currentOptions = this.cityOptions;
      let parentOption = null;

      for (let i = 0; i < locationArray.length; i++) {
        const value = String(locationArray[i]).trim();

        // 在当前选项中查找匹配的节点
        let option = currentOptions.find(
          (opt) => String(opt.value) === value
        );

        if (!option) {
          // 如果找不到，说明数据可能还没加载，尝试加载父节点的子节点
          if (parentOption) {
            const children = await this.fetchAdministrativeChildren(parentOption.value);
            // 当父节点是 level 1（i === 1，因为此时 parentOption 是 level 1）且不是"中国"时，子节点标记为叶子节点
            const isLevel1NotChina = i === 1 && parentOption.label !== '中国';
            const processedChildren = children.map(el => {
              delete el.children;
              return {
                ...el,
                leaf: isLevel1NotChina ? true : el.leaf,
              };
            });
            this.$set(parentOption, 'children', processedChildren);
            currentOptions = processedChildren;
            option = currentOptions.find(
              (opt) => String(opt.value) === value
            );
          } else if (i === 0) {
            // 如果是第一级，重新加载根节点
            currentOptions = await this.fetchAdministrativeChildren("");
            this.$set(this, 'cityOptions', currentOptions);
            option = currentOptions.find(
              (opt) => String(opt.value) === value
            );
          }
        }

        if (option) {
          // 如果不是最后一级，确保子节点已加载
          if (i < locationArray.length - 1 && !option.leaf) {
            if (!option.children || option.children.length === 0) {
              const children = await this.fetchAdministrativeChildren(option.value);
              // 当父节点是 level 1（i === 0）且不是"中国"时，子节点标记为叶子节点
              const isLevel1NotChina = i === 0 && option.label !== '中国';
              const processedChildren = children.map(el => {
                delete el.children;
                return {
                  ...el,
                  leaf: isLevel1NotChina ? true : el.leaf,
                };
              });
              this.$set(option, 'children', processedChildren);
            }
            currentOptions = option.children || [];
          }
          parentOption = option;
        } else {
          // 如果找不到匹配的节点，跳出循环
          break;
        }
      }

      // 确保响应式更新
      await this.$nextTick();
    },
    async ensureLocationDataLoaded(locationArray) {
      // 确保路径上的所有节点都已加载到 cityOptions 中，以便级联选择器能够正确回显
      if (!Array.isArray(locationArray) || locationArray.length === 0) {
        return;
      }

      let currentOptions = this.cityOptions;
      let parentOption = null;

      for (let i = 0; i < locationArray.length; i++) {
        const value = String(locationArray[i]).trim();

        // 在当前选项中查找匹配的节点
        let option = currentOptions.find(
          (opt) => String(opt.value) === value
        );

        if (!option) {
          // 如果找不到，说明数据可能还没加载，尝试加载父节点的子节点
          if (parentOption) {
            const children = await this.fetchAdministrativeChildren(parentOption.value);
            this.$set(parentOption, 'children', children);
            currentOptions = children;
            option = currentOptions.find(
              (opt) => String(opt.value) === value
            );
          }
        }

        if (option) {
          // 如果不是最后一级，确保子节点已加载
          if (i < locationArray.length - 1 && !option.leaf) {
            if (!option.children || option.children.length === 0) {
              const children = await this.fetchAdministrativeChildren(option.value);
              this.$set(option, 'children', children);
            }
            currentOptions = option.children || [];
          }
          parentOption = option;
        } else {
          // 如果找不到匹配的节点，跳出循环
          break;
        }
      }

      // 确保响应式更新
      await this.$nextTick();
    },
    async loadAdministrativeRoot() {
      const rootList = await this.fetchAdministrativeChildren("");
      const chinaRoot =
        (rootList || []).find(
          (item) =>
            String(item.value) === "100000" ||
            item.adCode === "100000" ||
            item.label?.includes("中国")
        ) || null;
      if (chinaRoot) {
        // 优先显示中国，其余国家保持可选
        const others = (rootList || []).filter(
          (item) => String(item.value) !== String(chinaRoot.value)
        );
        console.log(others, "others");
        this.cityOptions = [
          {
            ...chinaRoot,
            leaf: false,
            children: undefined,
          },
          ...others.map((item) => ({
            ...item,
            leaf: false,
            children: undefined,
          })),
        ];
      } else {
        this.cityOptions = (rootList || []).map((item) => ({
          ...item,
          leaf: false,
          children: undefined,
        }));
      }
    },
    async loadAdministrativeOptions(node, resolve) {
      // 限制层级：只到省/直辖市 -> 市，level: 0根,1省,2市，3及以上不再加载
      // 允许加载到 level 2（城市），阻止 level 3（区县）
      if (node && node.level >= 3) {
        resolve([]);
        return;
      }

      const parentId = node && node.level > 0 ? node.value : "";
      const children = await this.fetchAdministrativeChildren(parentId);
      // 当 node.level === 1 且 label !== '中国' 时，只显示两级（子节点标记为叶子节点）
      const isLevel1NotChina = node && node.level === 1 && node.label !== '中国';

      const newChildren = children.map(el => {
        // 去除el中children字段
        delete el.children;
        return {
          ...el,
          // 如果是 level 1 且不是中国，则子节点标记为叶子节点，只显示两级
          leaf: isLevel1NotChina ? true : el.leaf,
        }
      });
      if (node && node.level === 0) {
        this.cityOptions = newChildren;
      }
      resolve(newChildren);
    },
    async fetchAdministrativeChildren(parentId = "") {
      try {
        const res = await competitionApi.getAdministrativeDivision(parentId);
        const list = res?.result || res?.data || [];
        if (!Array.isArray(list)) return [];
        return list
          .map((item) => this.normalizeDivisionItem(item))
          .filter(Boolean);
      } catch (error) {
        console.error("获取行政区域失败:", error);
        return [];
      }
    },
    normalizeDivisionItem(item) {
      if (!item) return null;
      const value =
        item.value ||
        item.id ||
        item.code ||
        item.adCode ||
        item.areaCode ||
        item.divisionCode ||
        item.regionCode ||
        item.cityCode;
      const label =
        item.label ||
        item.name ||
        item.adName ||
        item.fullName ||
        item.fullname ||
        item.divisionName ||
        item.regionName ||
        item.cityName ||
        value;
      const normalizedLabel = String(label).trim();
      const normalizedValue = String(value).trim();
      if (!value || !label) return null;

      const children =
        item.children && Array.isArray(item.children)
          ? item.children
            .map((child) => this.normalizeDivisionItem(child))
            .filter(Boolean)
          : undefined;

      const level = item.level || item.levelType || "";
      // 判断是否为城市级别（第3级）
      const isCityLevel =
        level === "city" ||
        level === "CITY" ||
        level === 2 ||
        level === "2" ||
        item.type === "city";

      const mayHaveChildren =
        (level === "country" ||
          level === "province" ||
          level === 1 ||
          item.type === "province") &&
        !isCityLevel; // 城市级别不包含在内

      const hasChildren =
        (children && children.length > 0) ||
        item.hasChildren ||
        item.isLeaf === false ||
        item.childrenCount > 0 ||
        mayHaveChildren;

      // 四个直辖市和城市级别都不展示下一级
      const directControlledCities = ["北京市", "天津市", "上海市", "重庆市"];
      const isDirectControlledCity = directControlledCities.some(
        (city) => normalizedLabel === city || normalizedLabel.includes(city)
      );
      const forceLeaf = isDirectControlledCity || isCityLevel;

      return {
        value: normalizedValue,
        label: normalizedLabel,
        children: forceLeaf ? undefined : children,
        leaf: forceLeaf ? true : !hasChildren,
      };
    },
    async fetchDropdownOptions() {
      try {
        const response = await competitionApi.getDropdownOptions();

        if (response && response.result) {
          const { CompetitionType, distancesByType } = response.result;

          // 处理比赛类型选项
          this.competitionTypeOptions = CompetitionType.map((item) => ({
            label: item.label,
            value: item.value,
            displayValue: item.displayValue,
          }));

          // 保存距离数据
          this.distancesByType = distancesByType || {};
        }
      } catch (error) {
        console.error("获取下拉框数据失败:", error);
        this.$message.error("获取下拉框数据失败，请稍后重试");
      }
    },
    handleCompetitionTypeChange(value) {
      // 重置距离选择
      this.formData.distance = "";
      this.formData.customDistance = "";
      this.showCustomDistance = false;
      if (value === "SWIM") {
        this.formData.competitionDistanceUnit = "m";
      } else {
        this.formData.competitionDistanceUnit = "km";
      }
      this.lastDistanceUnit = this.formData.competitionDistanceUnit;

      // 根据比赛类型更新距离选项
      this.updateDistanceOptions(value);
    },
    handleDistanceChange(value) {
      // 如果选择的是"其他距离"，显示自定义输入框
      if (value === "OTHER") {
        this.showCustomDistance = true;
        // 清空自定义距离值
        if (!this.formData.customDistance) {
          this.formData.customDistance = "";
        }
        // 触发表单验证
        this.$nextTick(() => {
          this.$refs.eventForm.validateField("customDistance");
        });
      } else {
        this.showCustomDistance = false;
        this.formData.customDistance = "";
        // 清除自定义距离的验证错误
        this.$nextTick(() => {
          this.$refs.eventForm.clearValidate("customDistance");
        });
      }
    },
    updateDistanceOptions(value, resetSelection = true) {
      if (value && this.distancesByType[value]) {
        this.distanceOptions = this.distancesByType[value].map((item) => ({
          label:
            value === "TRIATHLON"
              ? item.label + "(" + item.displayValue + ")"
              : item.label,
          value: item.value,
          displayValue: item.displayValue,
        }));
      } else {
        this.distanceOptions = [];
      }
      if (resetSelection) {
        // 如果只有一个选项，自动选择第一个
        if (this.distanceOptions.length === 1) {
          this.formData.distance = this.distanceOptions[0].value;
          // 如果选择的是"其他距离"，需要显示自定义输入框
          if (this.formData.distance === "OTHER") {
            this.showCustomDistance = true;
          }
        } else {
          this.formData.distance = "";
        }
      }
    },
    normalizePriority(priority) {
      if (typeof priority === "number") {
        if (priority === 1) return "PRIMARY";
        if (priority === 2) return "SECONDARY";
        return "FOCUS";
      }
      const allowed = ["PRIMARY", "SECONDARY", "FOCUS"];
      return allowed.includes(priority) ? priority : "PRIMARY";
    },
    normalizeCompetitionType(value) {
      if (!value && value !== 0) return "";
      const valueStr = String(value);

      // 先通过 value 匹配
      const foundByValue = this.competitionTypeOptions.find(
        (item) => String(item.value) === valueStr
      );
      if (foundByValue) return foundByValue.value;

      // 再通过 displayValue 匹配
      const foundByDisplayValue = this.competitionTypeOptions.find(
        (item) => item.displayValue === value
      );
      if (foundByDisplayValue) return foundByDisplayValue.value;

      return value;
    },
    normalizeDistanceValue(distance, typeValue) {
      if (!distance) return "";
      const valueStr = String(distance);

      // 先尝试通过 value 匹配
      const foundByValue = this.distanceOptions.find(
        (item) => String(item.value) === valueStr
      );
      if (foundByValue) return foundByValue.value;

      // 通过 displayValue 匹配（如 5km）
      const foundByDisplay = this.distanceOptions.find(
        (item) => item.displayValue === valueStr
      );
      if (foundByDisplay) return foundByDisplay.value;

      // 如果没有匹配到，但存在具体数值，则使用自定义
      if (valueStr && typeValue) {
        return "OTHER";
      }

      return "";
    },
    extractDistanceNumber(distanceStr) {
      if (!distanceStr) return "";
      const match = distanceStr.match(/[\d.]+/);
      return match ? match[0] : "";
    },
    handleDistanceUnitChange(newUnit) {
      const previousUnit = this.lastDistanceUnit || "km";
      this.lastDistanceUnit = newUnit;

      if (!this.formData.customDistance) {
        this.formData.customDistance = "";
        return;
      }

      const numericValue = parseFloat(this.formData.customDistance);
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        this.formData.customDistance = "";
        return;
      }

      if (newUnit === "m") {
        const meters =
          previousUnit === "km" ? numericValue * 1000 : numericValue;
        this.formData.customDistance = String(Math.trunc(meters));
      } else {
        const kilometers =
          previousUnit === "m" ? numericValue / 1000 : numericValue;
        const normalizedKm = Math.round(kilometers * 100) / 100;
        this.formData.customDistance =
          normalizedKm > 0 ? normalizedKm.toString() : "";
      }

      this.handleCustomDistanceInput();
    },
    handleCustomDistanceInput() {
      const rawValue = this.formData.customDistance;
      let strValue =
        rawValue === undefined || rawValue === null ? "" : String(rawValue);

      if (!strValue) {
        this.formData.customDistance = "";
        return;
      }

      const isKilometer = this.formData.competitionDistanceUnit === "km";

      // 允许以 "." 开头的输入，自动补全为 "0."
      if (isKilometer && strValue.startsWith(".")) {
        strValue = `0${strValue}`;
      }

      const match = strValue.match(
        isKilometer ? /^(\d+(?:\.\d{0,3})?)/ : /^(\d+)/
      );
      const sanitized = match ? match[1] : "";

      if (!sanitized) {
        this.formData.customDistance = "";
        this.$message.error(
          isKilometer
            ? "请输入有效的距离值，小数点后最多3位"
            : "请输入有效的整数距离值"
        );
        return;
      }

      // 如果用户刚输入到 "."，先允许继续输入
      if (isKilometer && sanitized.endsWith(".")) {
        this.formData.customDistance = sanitized;
        return;
      }

      const num = parseFloat(sanitized);
      if (isNaN(num) || num <= 0) {
        // 允许用户暂时输入 0，方便继续补充小数或其他数字
        if (!isNaN(num) && num === 0) {
          this.formData.customDistance = sanitized;
          return;
        }
        this.formData.customDistance = "";
        this.$message.error(
          isKilometer
            ? "请输入有效的距离值，小数点后最多3位"
            : "请输入有效的整数距离值"
        );
        return;
      }

      this.formData.customDistance = isKilometer
        ? sanitized
        : String(Math.trunc(num));
    },
    async handleClose() {
      this.innerVisible = false;
      // 如果是新增模式，清除所有数据
      if (!this.isEditMode) {
        await this.clearAllData();
      } else {
        // 编辑模式只重置表单字段
        this.$refs.eventForm && this.$refs.eventForm.resetFields();
      }
      this.$emit("cancel");
    },
    getLocationPathLabels() {
      const cascader = this.$refs.locationCascader;
      if (cascader && cascader.getCheckedNodes) {
        const nodes = cascader.getCheckedNodes();
        if (nodes && nodes.length > 0 && nodes[0].pathLabels) {
          return nodes[0].pathLabels;
        }
      }
      // fallback: 根据当前 options 计算
      return this.getLocationLabels(this.formData.location, this.cityOptions);
    },
    async handleConfirm() {
      this.$refs.eventForm.validate(async (valid) => {
        if (valid) {
          try {
            // 处理地点数据，转换为字符串格式（如：湖北/武汉）
            let locationStr = "";
            const pathLabels = this.getLocationPathLabels();
            if (pathLabels && pathLabels.length > 0) {
              locationStr = pathLabels.join("/");
            }

            // 获取比赛类型的 displayValue
            const selectedCompetitionType = this.competitionTypeOptions.find(
              (item) => item.value === this.formData.competitionType
            );
            const competitionTypeDisplayValue = selectedCompetitionType
              ? selectedCompetitionType.displayValue
              : this.formData.competitionType;

            const priority =
              this.formData.priority === "PRIMARY"
                ? 1
                : this.formData.priority === "SECONDARY"
                  ? 2
                  : 3;

            // 获取距离的 displayValue（如果不是 OTHER）
            const competitionDistance = this.distanceOptions.find(
              (item) => item.value === this.formData.distance
            ).displayValue;
            console.log(competitionDistance, "competitionDistance");
            console.log(this.formData, "this.formData");
            // 构建提交数据（按照 API 文档的字段名称）
            const submitData = {
              competitionDistance: competitionDistance,
              competitionLocation: locationStr,
              competitionName: this.formData.eventName,
              competitionType: competitionTypeDisplayValue,
              competitionDistanceValue: this.formData.customDistance,
              competitionDistanceUnit: this.formData.competitionDistanceUnit,
              priority: priority,
            };
            // 如果是编辑模式，添加 id
            if (this.isEditMode && this.eventData.id) {
              submitData.id = this.eventData.id;
            }

            this.$emit("confirm", submitData);
            this.handleClose();
          } catch (error) {
            console.error("保存赛事失败:", error);
            this.$message.error(
              this.isEditMode ? "更新赛事失败" : "创建赛事失败"
            );
          }
        } else {
          this.$message.warning("请完善表单信息");
        }
      });
    },
    getLocationLabels(values, options) {
      const labels = [];
      let currentOptions = options;

      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const option = currentOptions.find((opt) => opt.value === value);
        if (option) {
          labels.push(option.label);
          currentOptions = option.children || [];
        } else {
          break;
        }
      }
      console.log(labels, "labels");
      return labels;
    },
  },
};
</script>

<style scoped>
::v-deep .el-dialog__body {
  padding: 20px 24px;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-form-item__label {
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 优先级选择器样式 */
.priority-radio-group ::v-deep .el-radio-button__inner {
  padding: 10px 20px;
  border-color: #dcdfe6;
}

.priority-radio-group
  ::v-deep
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  background-color: #fff;
  border-color: #f56c6c;
  color: #f56c6c;
  box-shadow: -1px 0 0 0 #f56c6c;
}

.priority-radio-group
  ::v-deep
  .el-radio-button:first-child
  .el-radio-button__inner {
  border-left: 1px solid #dcdfe6;
}

.priority-radio-group
  ::v-deep
  .el-radio-button:first-child
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  border-left-color: #f56c6c;
}
</style>
