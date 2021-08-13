import request from '@/utils/request'

// 查询特殊字段测试列表
export function listDemoGenOther(query) {
  return request({
    url: '/system/demoGenOther/list',
    method: 'get',
    params: query
  })
}

// 查询特殊字段测试详细
export function getDemoGenOther(id) {
  return request({
    url: '/system/demoGenOther/get',
    method: 'get',
    params: {
     id: id
    }
  })
}

// 新增特殊字段测试
export function addDemoGenOther(data) {
  return request({
    url: '/system/demoGenOther/add',
    method: 'post',
    data: data
  })
}

// 修改特殊字段测试
export function updateDemoGenOther(data) {
  return request({
    url: '/system/demoGenOther/edit',
    method: 'put',
    data: data
  })
}

// 删除特殊字段测试
export function delDemoGenOther(ids) {
  return request({
    url: '/system/demoGenOther/delete',
    method: 'delete',
    data:{
       ids:ids
    }
  })
}

