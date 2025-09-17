const state = {
  shopName: null,
  shopOptions: [],
  userType: null,
  shopId: null,
};
const mutations = {
  SET_SHOP_NAME: (state, shopName) => {
    state.shopName = shopName;
  },
  SET_SHOP_OPTIONS: (state, shopOptions) => {
    state.shopOptions = shopOptions;
  },
  SET_USER_TYPE: (state, userType) => {
    state.userType = userType;
  },
  SET_SHOP_ID: (state, shopId) => {
    state.shopId = shopId;
  },
  RESET_INFO: (state) => {
    state.shopName = null;
    state.shopOptions = [];
    state.userType = null;
    state.shopId = null;
  },
};
export default {
  namespaced: true,
  state,
  mutations,
};
