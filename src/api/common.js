import request from "@/utils/request";
// 获取数据
export function getData(params) {
  console.log(params);
  const { url, responseType = "json", ...reset } = params;
  return request({
    url: url,
    method: "get",
    params: { ...reset },
    responseType: responseType,
  });
}

// 提交数据
export function submitData(params) {
  const {
    url,
    method = "post",
    requestData,
    responseType = "json",
    ...reset
  } = params;
  return request({
    url: url,
    method: method,
    data: requestData || { ...reset },
    responseType: responseType,
  });
}

// t2经销商
export function getT2List() {
  return request({
    url: "/apple-data-center/distribute/distributors",
    method: "get",
  });
}

// 一级来源
export function getPrimarySource() {
  return request({
    url: "/apple-data-center/trafficStructure/getPrimarySource",
    method: "get",
  });
}

// 二级来源
export function getSecondSource(id) {
  return request({
    url: `/apple-data-center/trafficStructure/getSecondSource/${id}`,
    method: "get",
  });
}
export function getOptoins(id) {
  return request({
    url: `/apple-data-center/trafficStructure/getOptoins/${id}`,
    method: "get",
  });
}
export async function getCommonOptions() {
  const list = await Promise.all([
    getData({
      url: "/apple-data-center/distribute/distributors",
    }),
    getData({
      url: `/apple-data-center/fiscal/list`,
    }),
    getData({
      url: "/apple-data-center/mapping/product/menus",
    }),
  ]);
  const [{ result: res }, { result: res1 }, { result: res2 }] = list;
  const t2Options = res.map((item) => ({
    ...item,
    label: item.disName,
    value: item.disId,
  }));
  const yearOptions = res1.map((item) => ({
    ...item,
    label: item.year,
    value: item.year,
  }));
  const lobOptions = res2.map((item) => ({
    label: item.lob,
    value: item.lob,
  }));
  const subLob = res2.map((item) => ({
    lob: item.lob,
    subLob: item.subLob.map((item) => ({ label: item, value: item })),
  }));
  return Promise.resolve({
    t2Options,
    yearOptions,
    lobOptions,
    subLob,
  });
}

// 根据经销商id查询店铺列表
export function getShopById(id) {
  return request({
    url: `/apple-data-center/sys/shop/getShopById/${id}`,
    method: "get",
  });
}

// sublob
export function getSublob() {
  return request({
    url: `/apple-data-center/mapping/product/subLob`,
    method: "get",
  });
}

// allShop
export function allShop() {
  return request({
    url: `/apple-data-center/sys/shop/allShop`,
    method: "get",
  });
}
