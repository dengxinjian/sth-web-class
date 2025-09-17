<template>
  <div
    class="btn"
    :class="[{ search: isSearch, default: !isSearch }, className]"
    @click="$emit('click')"
  >
    {{ label }}
  </div>
</template>
<script>
export default {
  props: {
    className: {
      type: String,
      default: "",
    },
    isSearch: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: "查询",
    },
    click: {
      type: Function,
      default: () => {},
    },
  },
};
</script>
<style lang="scss" scoped>
.btn {
  cursor: pointer;
  width: 100px;
  border-radius: 25px;
  text-align: center;
  user-select: none;
  &:active {
    opacity: 0.5;
  }
}
.search {
  background-color: #CC2323;
  color: #fff;
}
.default {
  color: #CC2323;
  background: #fff;
  border: 1px solid #CC2323;
}
</style>
