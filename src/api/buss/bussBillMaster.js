import request from '@/utils/request'
// 查询订单主表列表
export function listBussBillMaster(query) {
  return request({
    url: '/buss/bussBillMaster/list',
    method: 'get',
    params: query
  })
}
// 查询订单主表详细
export function getBussBillMaster(bill_id) {
  return request({
    url: '/buss/bussBillMaster/get',
    method: 'get',
    params: {
     id: bill_id
    }
  })
}
// 新增订单主表
export function addBussBillMaster(data) {
  return request({
    url: '/buss/bussBillMaster/add',
    method: 'post',
    data: data
  })
}
// 修改订单主表
export function updateBussBillMaster(data) {
  return request({
    url: '/buss/bussBillMaster/edit',
    method: 'put',
    data: data
  })
}
// 删除订单主表
export function delBussBillMaster(bill_ids) {
  return request({
    url: '/buss/bussBillMaster/delete',
    method: 'delete',
    data:{
       ids:bill_ids
    }
  })
}
// 订单主表状态修改
export function changeBussBillMasterStatus(bill_id,status) {
  const data = {
    bill_id,
    status
  }
  return request({
    url: '/buss/bussBillMaster/changeStatus',
    method: 'put',
    data:data
  })
}
// 订单主表订单状态修改
export function changeBussBillMasterBillStatus(bill_id,billStatus) {
  const data = {
    bill_id,
    billStatus
  }
  return request({
    url: '/buss/bussBillMaster/changeBillStatus',
    method: 'put',
    data:data
  })
}
