<template>
  <div class="member-center-legacy-dialog">
    <Vip1 :visible.sync="vip1Visible" :tradeType="tradeType" />
    <Vip2 :visible.sync="vip2Visible" :tradeType="tradeType" />
  </div>
</template>

<script>
import Vip1 from "@/views/plan/components/vip1.vue"
import Vip2 from "@/views/plan/components/vip2.vue"

export default {
  name: "MemberCenterLegacyDialog",
  components: { Vip1, Vip2 },
  data() {
    return {
      vip1Visible: false,
      vip2Visible: false,
      tradeType: "",
    }
  },
}
</script>

<style scoped lang="scss">

</style>
