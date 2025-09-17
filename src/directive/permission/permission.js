import store from "@/store";
import { findValueByKey } from "@/utils/tree-format";

function checkPermission(el, binding) {
  const { value } = binding;
  const roles = store.getters && store.getters.roles;
  const list = findValueByKey(roles, "code", "childMenu");

  if (value && value instanceof Array) {
    if (value.length > 0) {
      const permissionRoles = value;

      const hasPermission = list.some((role) => {
        return permissionRoles.includes(role);
      });

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    }
  } else {
    throw new Error(`need roles! Like v-permission="['admin','editor']"`);
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding);
  },
  update(el, binding) {
    checkPermission(el, binding);
  },
};
