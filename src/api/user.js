import request from "@/utils/request";

export function login(data) {
  return request({
    url: "/api/auth/login",
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
