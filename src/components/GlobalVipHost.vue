<template>
  <div class="global-vip-host">
    <Vip1
      :visible="vipDialogState.vip1.visible"
      :tradeType="vipDialogState.vip1.tradeType"
      :forceShow="vipDialogState.vip1.forceShow"
      @update:visible="handleVip1VisibleChange" />
    <Vip2
      :visible="vipDialogState.vip2.visible"
      :tradeType="vipDialogState.vip2.tradeType"
      :forceShow="vipDialogState.vip2.forceShow"
      @update:visible="handleVip2VisibleChange" />
  </div>
</template>

<script>
import { vipDialog } from "@/plugins/vip-dialog"

export default {
  name: "GlobalVipHost",
  computed: {
    vipDialogState() {
      return vipDialog.state
    },
  },
  methods: {
    handleVip1VisibleChange(val) {
      if (!val) {
        vipDialog.closeVip1()
      }
    },
    handleVip2VisibleChange(val) {
      if (!val) {
        vipDialog.closeVip2()
      }
    },
  },
}
</script>
