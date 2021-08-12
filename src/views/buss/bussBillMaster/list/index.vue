<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">    
      <el-form-item label="主键" prop="billId">
        <el-input
            v-model="queryParams.billId"
            placeholder="请输入主键"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>    
      <el-form-item label="订单名称" prop="billName">
        <el-input
            v-model="queryParams.billName"
            placeholder="请输入订单名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>    
      <el-form-item label="订单类型" prop="billType">
        <el-select v-model="queryParams.billType" placeholder="请选择订单类型" clearable size="small">
            <el-option
                v-for="dict in billTypeOptions"
                :key="dict.key"
                :label="dict.value"
                :value="dict.key"
            />
        </el-select>
      </el-form-item>    
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
            <el-option
                v-for="dict in statusOptions"
                :key="dict.key"
                :label="dict.value"
                :value="dict.key"
            />
        </el-select>
      </el-form-item>    
      <el-form-item label="订单状态" prop="billStatus">
        <el-select v-model="queryParams.billStatus" placeholder="请选择订单状态" clearable size="small">
            <el-option
                v-for="dict in billStatusOptions"
                :key="dict.key"
                :label="dict.value"
                :value="dict.key"
            />
        </el-select>
      </el-form-item>      
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['buss/bussBillMaster/add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['buss/bussBillMaster/edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['buss/bussBillMaster/delete']"
        >删除</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="bussBillMasterList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />      
      <el-table-column label="主键" align="center" prop="billId" />      
      <el-table-column label="应用系统" align="center" prop="appId" />      
      <el-table-column label="拥有者" align="center" prop="ownerId" />      
      <el-table-column label="会员id" align="center" prop="custId" />      
      <el-table-column label="订单名称" align="center" prop="billName" />      
      <el-table-column label="订单类型" align="center" prop="billType" :formatter="billTypeFormat" />      
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="statusChange(scope.row)"
            ></el-switch>
        </template>
      </el-table-column>      
      <el-table-column label="订单状态" align="center">
        <template slot-scope="scope">
            <el-switch
              v-model="scope.row.billStatus"
              :active-value="1"
              :inactive-value="0"
              @change="billStatusChange(scope.row)"
            ></el-switch>
        </template>
      </el-table-column>      
      <el-table-column label="备注" align="center" prop="remark" />      
      <el-table-column label="创建者" align="center" prop="createBy" />    
        <el-table-column label="创建日期" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createdAt, {y}-{m}-{d}) }}</span>
        </template>
      </el-table-column>    
      <el-table-column label="更新者" align="center" prop="updateBy" />      
      <el-table-column label="订单合计" align="center" prop="billSum" />      
      <el-table-column label="订单数量" align="center" prop="billNum" />      
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['buss/bussBillMaster/edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['buss/bussBillMaster/delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 添加或修改订单主表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">      
      <el-form-item label="应用系统" prop="appId">
           <el-input v-model="form.appId" placeholder="请输入应用系统" />
      </el-form-item>      
      <el-form-item label="拥有者" prop="ownerId">
           <el-input v-model="form.ownerId" placeholder="请输入拥有者" />
      </el-form-item>      
      <el-form-item label="会员id" prop="custId">
           <el-input v-model="form.custId" placeholder="请输入会员id" />
      </el-form-item>      
      <el-form-item label="订单名称" prop="billName">
           <el-input v-model="form.billName" placeholder="请输入订单名称" />
      </el-form-item>      
      <el-form-item label="订单类型" prop="billType">
          <el-select v-model="form.billType" placeholder="请选择订单类型">
              <el-option
                  v-for="dict in billTypeOptions"
                  :key="dict.key"
                  :label="dict.value"                  
                      :value="dict.key"                  
              ></el-option>
          </el-select>
      </el-form-item>      
       <el-form-item label="状态" prop="status">
           <el-radio-group v-model="form.status">
               <el-radio
                v-for="dict in statusOptions"
                :key="dict.key"
                :label="dict.key"
               >{{dict.value }}</el-radio>
           </el-radio-group>
       </el-form-item>      
       <el-form-item label="订单状态" prop="billStatus">
           <el-radio-group v-model="form.billStatus">
               <el-radio
                v-for="dict in billStatusOptions"
                :key="dict.key"
                :label="dict.key"
               >{{dict.value }}</el-radio>
           </el-radio-group>
       </el-form-item>      
      <el-form-item label="备注" prop="remark">
           <el-input v-model="form.remark" placeholder="请输入备注" />
      </el-form-item>      
      <el-form-item label="创建者" prop="createBy">
           <el-input v-model="form.createBy" placeholder="请输入创建者" />
      </el-form-item>    
    
      <el-form-item label="更新者" prop="updateBy">
           <el-input v-model="form.updateBy" placeholder="请输入更新者" />
      </el-form-item>      
      <el-form-item label="订单合计" prop="billSum">
           <el-input v-model="form.billSum" placeholder="请输入订单合计" />
      </el-form-item>      
      <el-form-item label="订单数量" prop="billNum">
           <el-input v-model="form.billNum" placeholder="请输入订单数量" />
      </el-form-item>       
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
    listBussBillMaster,
    getBussBillMaster,
    delBussBillMaster,
    addBussBillMaster,
    updateBussBillMaster,    
    changeBussBillMasterStatus,    
    changeBussBillMasterBillStatus,    
} from "@/api/buss/bussBillMaster";
export default {
  name: "BussBillMaster",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 订单主表表格数据
      bussBillMasterList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,      
      // billTypeOptions字典数据
      billTypeOptions: [],      
      // statusOptions字典数据
      statusOptions: [],      
      // billStatusOptions字典数据
      billStatusOptions: [],      
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        billId: undefined,
        billName: undefined,
        billType: undefined,
        status: undefined,
        billStatus: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: { 
        billName : [
          { required: true, message: "订单名称不能为空", trigger: "blur" }
        ],
        status : [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        billStatus : [
          { required: true, message: "订单状态不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {    
    this.getDicts("sport_service_type").then(response => {
      this.billTypeOptions = response.data.values||[];
    });    
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data.values||[];
    });    
    this.getDicts("sport_bill_status").then(response => {
      this.billStatusOptions = response.data.values||[];
    });
    this.getList();
  },
  methods: {    
    // 状态修改
    statusChange(row) {
      let text = row.status === 1 ? "启用" : "停用";
      this.$confirm('确认要"' + text + '"：吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeBussBillMasterStatus(row.bill_id, row.status);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.userStatus =row.userStatus === 0 ?1 : 0;
        });
    },    
    // 订单状态修改
    billStatusChange(row) {
      let text = row.billStatus === 1 ? "启用" : "停用";
      this.$confirm('确认要"' + text + '"：吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeBussBillMasterBillStatus(row.bill_id, row.billStatus);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.userStatus =row.userStatus === 0 ?1 : 0;
        });
    },    
    /** 查询订单主表列表 */
    getList() {
      this.loading = true;
      listBussBillMaster(this.queryParams).then(response => {
        this.bussBillMasterList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },    
    // 订单类型字典翻译
    billTypeFormat(row, column) {
      return this.selectDictLabel(this.billTypeOptions, row.billType);
    },    
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },    
    // 订单状态字典翻译
    billStatusFormat(row, column) {
      return this.selectDictLabel(this.billStatusOptions, row.billStatus);
    },    
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {        
        billId: undefined,        
        appId: undefined,        
        ownerId: undefined,        
        custId: undefined,        
        billName: undefined,        
        billType: undefined,        
        status: "0" ,        
        billStatus: "0" ,        
        remark: undefined,        
        createBy: undefined,        
        updateBy: undefined,        
        createdAt: undefined,        
        updatedAt: undefined,        
        deletedAt: undefined,        
        billSum: undefined,        
        billNum: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.billId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加订单主表";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const billId = row.billId || this.ids
      getBussBillMaster(billId).then(response => {
        let data = response.data;        
        data.billType = ''+data.billType        
        data.status = ''+data.status        
        data.billStatus = ''+data.billStatus        
        this.form = data;
        this.open = true;
        this.title = "修改订单主表";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.billId != undefined) {
            updateBussBillMaster(this.form).then(response => {
              if (response.code === 0) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addBussBillMaster(this.form).then(response => {
              if (response.code === 0) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const billIds = row.billId || this.ids;
      this.$confirm('是否确认删除订单主表编号为"' + billIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delBussBillMaster(billIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    }
  }
};
</script>