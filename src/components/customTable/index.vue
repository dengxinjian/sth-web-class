<template>
  <div>
    <el-table style="width: 100%" v-bind="tableProps">
      <el-table-column
        type="index"
        v-if="hasIndex"
        label="序号"
        width="50"
        :index="renderIndex"
      />
      <el-table-column
        v-for="item in col"
        :key="item.key"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :align="item.align"
        :fixed="item.fixed"
        :formatter="item.formatter"
        :sortable="item.sortable"
        :type="item.type"
      >
      </el-table-column>
      <el-table-column
        v-for="item in actionCol"
        :key="item.label"
        :label="item.label"
        :width="item.width"
      >
        <template slot-scope="scope">
          <slot :name="item.slot" :row="scope.row" />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      @pagination="getList"
    />
  </div>
</template>
<script>
import table from "element-ui/lib/table";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
export default {
  components: {
    Pagination,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    border: {
      type: Boolean,
      default: false,
    },
    getList: {
      type: Function,
      default: () => {},
    },
    pagination: {
      type: Object,
      default: () => {
        return {
          page: 1,
          limit: 10,
        };
      },
    },
  },
  data() {
    return {
      hasIndex: false,
      col: [],
      tableProps: {},
      actionCol: false,
    };
  },

  watch: {
    columns: {
      immediate: true,
      deep: true,
      handler(val) {
        this.hasIndex = val.findIndex((item) => item.type === "index") > -1;
        this.col = val.filter((item) => item.type !== "index" && !item.slot);
        this.actionCol = val.filter((item) => item.slot);
      },
    },
    $props: {
      immediate: true,
      deep: true,
      handler(val) {
        const prop = { ...this.$props, ...this.$attrs };
        Object.keys(table.props).forEach((item) => {
          if (item !== "columns") {
            prop[item] !== undefined && (prop[item] = this[item]);
          }
        });

        this.tableProps = prop;
      },
    },
  },
  methods: {
    renderIndex(index) {
      return (this.pagination.page - 1) * this.pagination.limit + index + 1;
    },
  },
};
</script>
