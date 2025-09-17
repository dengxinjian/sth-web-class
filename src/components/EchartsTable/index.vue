<template>
  <div class="table" v-if="tableData.length" :class="className">
    <div
      v-for="(item, index) in tableData.slice(0, 1)"
      :key="item.tit"
      class="table-head"
    >
      <div
        class="table-item"
        v-for="(val, ind) in Object.keys(item)"
        :key="ind + 1"
        :class="{ head: index === 0 }"
      >
        {{ item[val] }}
      </div>
    </div>
    <div
      class="table-scrol-col"
      :style="{ overflow: className ? 'unset' : 'auto' }"
    >
      <div v-for="item in tableData.slice(1)" :key="item.tit">
        <div
          class="table-item"
          v-for="(val, ind) in Object.keys(item)"
          :key="ind + 1"
        >
          {{ item[val] }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
    className: {
      type: String,
      default: "",
    },
  },
};
</script>
<style lang="scss" scoped>
.table {
  display: flex;
  width: 80%;
  margin: 10px auto;
  justify-content: center;
  .table-head {
    flex: 1;
    .table-item:not(:first-child) {
      border-top: none;
    }
    // position: sticky;
    // left: 0;
  }
  .table-scrol-col {
    display: flex;
    flex: 8;
    flex-wrap: nowrap;
    div {
      flex: 1;
    }
    .table-item {
      border-left: none;
      &:not(:first-child) {
        border-top: none;
      }
    }
  }

  .table-item {
    border: 1px solid #1c1a1a;
    text-align: center;
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 70px;
    padding: 0 5px;
  }
  .head {
    font-size: 12px;
  }
}
</style>
