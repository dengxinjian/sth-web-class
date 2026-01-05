import request from "@/utils/request";

export function login(data) {
  return request({
    // url: "/api/auth/login",
    // url: `/gateway/auth/wx/loginMockPhone?phone=${data.phone}`,
    url: `/gateway/auth/wx/loginMock?openid=${data.openid}`,
    method: "post",
    data,
  });
}

export function getInfo() {
  return request({
    url: "/sys/getUserAuthorInfo",
    method: "get",
  });
}

export function getRoleInfo(data) {
  return request({
    url: "/sys/role/getRoleAuthorInfo",
    method: "get",
    params: data,
  });
}

export function logout() {
  return request({
    url: "/logout",
    method: "post",
  });
}
