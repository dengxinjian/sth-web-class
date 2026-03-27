import Vue from "vue"
import Vip1 from "@/components/Vip1"
import Vip2 from "@/components/Vip2"
import GlobalVipHost from "@/components/GlobalVipHost.vue"

function createDialogState() {
  return {
    visible: false,
    tradeType: "",
    forceShow: false,
    onClose: null,
  }
}

const state = Vue.observable({
  vip1: createDialogState(),
  vip2: createDialogState(),
})

function resetDialogState(dialogState) {
  dialogState.visible = false
  dialogState.tradeType = ""
  dialogState.forceShow = false
  dialogState.onClose = null
}

function applyDialogOptions(dialogState, options = {}) {
  dialogState.tradeType = options.tradeType || ""
  dialogState.forceShow = Boolean(options.forceShow)
  dialogState.onClose =
    typeof options.onClose === "function" ? options.onClose : null
  dialogState.visible = true
}

export const vipDialog = {
  state,
  openVip1(options = {}) {
    this.closeVip2(false)
    applyDialogOptions(state.vip1, options)
  },
  openVip2(options = {}) {
    this.closeVip1(false)
    applyDialogOptions(state.vip2, options)
  },
  closeVip1(triggerCallback = true) {
    const onClose = state.vip1.onClose
    resetDialogState(state.vip1)
    if (triggerCallback && onClose) onClose()
  },
  closeVip2(triggerCallback = true) {
    const onClose = state.vip2.onClose
    resetDialogState(state.vip2)
    if (triggerCallback && onClose) onClose()
  },
  install(VueCtor) {
    if (this._installed) return
    this._installed = true

    VueCtor.component("Vip1", Vip1)
    VueCtor.component("Vip2", Vip2)
    VueCtor.component("GlobalVipHost", GlobalVipHost)

    VueCtor.prototype.$vip1 = (options = {}) => this.openVip1(options)
    VueCtor.prototype.$vip2 = (options = {}) => this.openVip2(options)
    VueCtor.prototype.$closeVip1 = () => this.closeVip1()
    VueCtor.prototype.$closeVip2 = () => this.closeVip2()
  },
}

export default vipDialog
