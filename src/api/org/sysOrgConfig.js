import request from '@/utils/request'

// 查询公司参数管理列表
export function listSysOrgConfig(query) {
  return request({
    url: '/org/sysOrgConfig/list',
    method: 'get',
    params: query
  })
}

// 查询公司参数管理详细
export function getSysOrgConfig(id) {
  return request({
    url: '/org/sysOrgConfig/get',
    method: 'get',
    params: {
     id: id
    }
  })
}

// 新增公司参数管理
export function addSysOrgConfig(data) {
  return request({
    url: '/org/sysOrgConfig/add',
    method: 'post',
    data: data
  })
}

// 修改公司参数管理
export function updateSysOrgConfig(data) {
  return request({
    url: '/org/sysOrgConfig/edit',
    method: 'put',
    data: data
  })
}

// 删除公司参数管理
export function delSysOrgConfig(ids) {
  return request({
    url: '/org/sysOrgConfig/delete',
    method: 'delete',
    data:{
       ids:ids
    }
  })
}

