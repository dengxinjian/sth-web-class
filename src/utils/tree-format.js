import { cloneDeep } from "lodash";
/**
 * @description: 树的搜索，深度遍历
 * @param searchValue {String} 需要搜索的数据
 * @param treeData {Array} 原始树结构
 * @param sign {String} 树种节点需要被搜索的数据键
 * @param childrenName {String} 树数据中子节点关键字
 * @return treeData {Array} 搜索结果
 */
export const treeSearch = (
  treeData,
  searchValue,
  sign,
  childrenName = "children"
) => {
  let innerTreeData = cloneDeep(treeData);
  const loopFunction = (searchValue, treeData, sign) => {
    const hasCondition = [];
    for (const index in treeData) {
      if (
        treeData[index][childrenName] &&
        treeData[index][childrenName].length !== 0
      ) {
        treeData[index][childrenName] = loopFunction(
          searchValue,
          treeData[index][childrenName],
          sign
        );
      }
      if (
        treeData[index][sign]
          .toLocaleLowerCase()
          .indexOf(searchValue.toLocaleLowerCase()) > -1 ||
        (treeData[index][childrenName] &&
          treeData[index][childrenName].length !== 0)
      ) {
        hasCondition.push(treeData[index]);
      }
    }
    return hasCondition;
  };
  loopFunction(searchValue, innerTreeData, sign);
  innerTreeData = innerTreeData.filter(
    (l) =>
      l[childrenName].length !== 0 ||
      l[sign].toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) > -1
  );
  return innerTreeData;
};

/**
 * @description: 用于处理树结构数据，增加或删除节点中的部分数据
 * @param treeData {Array} 原始树结构
 * @param childrenName {String} 树数据中子节点关键字
 * @param callBack {Function} 处理函数，用户处理各个节点数据
 * @return treeData {Array} 新的树结构
 */
export const operateTreeData = (
  treeData,
  callBack,
  childrenName = "children"
) => {
  const innerTreeData = cloneDeep(treeData);
  const level = 0;
  const loopFunction = (treeData, callBack, level) => {
    for (const index in treeData) {
      if (
        treeData[index][childrenName] &&
        treeData[index][childrenName].length !== 0
      ) {
        loopFunction(treeData[index][childrenName], callBack, level + 1);
      }
      if (typeof callBack === "function") {
        treeData[index].level = level;
        treeData[index] = callBack(treeData[index]);
      }
    }
  };
  loopFunction(innerTreeData, callBack, level);
  return innerTreeData;
};
/**
 * @description: 根据id获取当前节点
 * @param treeData {Array} 原始树结构
 * @param searchId {Number} 要查询的ID
 * @param childrenName {String} 树数据中子节点关键字
 * @return node {Object} 查找的node
 */
export const findNodeById = (treeData, searchId, childrenName = "children") => {
  let node = "";
  const loopFunction = (arr, searchId) => {
    for (let index = 0; index < arr.length; index++) {
      const item = arr[index];
      if (item.id === Number(searchId)) {
        node = item;
        break;
      } else if (item[childrenName] && item[childrenName].length !== 0) {
        loopFunction(item[childrenName], searchId);
      }
    }
  };
  loopFunction(treeData, searchId);
  return node;
};
/**
 * @description: 获取树结构某个属性数组集合
 * @param treeData {Array} 原始树结构
 * @param key {String} 要获取的属性名
 * @param childrenName {String} 树数据中子节点关键字
 * @return valueList {Aarray} 属性值集合
 */

export const findValueByKey = (treeData, key, childrenName = "children") => {
  const valueList = [];
  function loopFunction(arr, key) {
    for (let index = 0; index < arr.length; index++) {
      const item = arr[index];
      for (const eleKey in item) {
        // eslint-disable-next-line no-prototype-builtins
        if (item.hasOwnProperty(eleKey) && eleKey === key) {
          if (item[childrenName] && item[childrenName].length !== 0) {
            loopFunction(item[childrenName], key);
          } else if (item.operations && item.operations.length !== 0) {
            loopFunction(item.operations, key);
          }
          valueList.push(item[key]);
        }
      }
    }
  }
  loopFunction(treeData, key);
  return valueList;
};

// tree树形结构菜单换为talbe表格结构
export const formatMenuData = (menuData) => {
  const result = [];

  // 遍历每个一级菜单
  menuData.forEach((menu) => {
    const module = [
      {
        label: menu.menuName,
        code: menu.code,
        menuId: menu.menuId,
        checked: false,
        moduleHalf: false,
      },
    ];
    const subMenu = menu.childMenu;

    // 遍历每个二级菜单
    subMenu.forEach((sub) => {
      const menu = {
        parentId: sub.parentId,
        label: sub.menuName,
        code: sub.code,
        menuId: sub.menuId,
        checked: false,
        menuHalf: false,
      };
      const operations = sub.operations;

      // 遍历每个操作按钮
      const btn = operations?.map((operation) => {
        return {
          parentId: sub.menuId,
          menuId: operation.menuId,
          label: operation.btnName,
          code: operation.code,
          btnId: operation.btnId,
          checked: false,
        };
      });

      result.push({ module, menu: [menu], btn });
    });
  });
  return result;
};

// 查找所有的btnId
export const findBtnId = (arr) => {
  const btnIdArr = [];
  function loopFunction(arr) {
    arr.forEach((item) => {
      if (item.btnId) {
        btnIdArr.push(item.btnId);
      }
      if (item.childMenu && item.childMenu.length > 0) {
        loopFunction(item.childMenu);
      } else if (item.operations && item.operations.length > 0) {
        loopFunction(item.operations);
      }
    });
  }
  loopFunction(arr);
  return btnIdArr;
};
