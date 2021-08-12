<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="组织机构" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入组织机构"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="系统类型" prop="appId">
        <el-select
          v-model="queryParams.appId"
          placeholder="请选择系统类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in appIdOptions"
            :key="dict.key"
            :label="dict.value"
            :value="dict.key"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="参数名称" prop="configName">
        <el-input
          v-model="queryParams.configName"
          placeholder="请输入参数名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="参数键名" prop="configKey">
        <el-input
          v-model="queryParams.configKey"
          placeholder="请输入参数键名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- <el-form-item label="系统名称" prop="appName">
        <el-input
            v-model="queryParams.appName"
            placeholder="请输入系统名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>       -->

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['org/sysOrgConfig/add']"
        >新增</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['org/sysOrgConfig/edit']"
          >修改</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['org/sysOrgConfig/delete']"
        >删除</el-button>
      </el-col> -->
    </el-row>

    <el-table
      v-loading="loading"
      :data="sysOrgConfigList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="组织机构" align="center" prop="deptId" />
      <el-table-column
        label="系统类型"
        align="center"
        prop="appId"
        :formatter="appIdFormat"
      />

      <!-- <el-table-column label="系统名称" align="center" prop="appName" />       -->
      <!-- <el-table-column label="主键" align="center" prop="id" />       -->

      <el-table-column label="参数名称" align="center" prop="configName" />

      <el-table-column label="参数键名" align="center" prop="configKey" />

      <el-table-column label="参数键值" align="center" prop="configValue" />

      <el-table-column label="备注" align="center" prop="remark" />

      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['org/sysOrgConfig/edit']"
            >修改</el-button
          >
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['org/sysOrgConfig/delete']"
          >删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改公司参数管理对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="组织机构id 就是部门ID" prop="deptId">
          <el-input
            v-model="form.deptId"
            placeholder="请输入组织机构id 就是部门ID"
          />
        </el-form-item>

        <el-form-item label="参数主键" prop="configId">
          <el-input v-model="form.configId" placeholder="请输入参数主键" />
        </el-form-item>

        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>

        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>

        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" />
        </el-form-item>

        <el-form-item label="系统内置（Y是 N否）" prop="configType">
          <el-select
            v-model="form.configType"
            placeholder="请选择系统内置（Y是 N否）"
          >
            <el-option label="请选择字典生成" value="" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建者" prop="createBy">
          <el-input v-model="form.createBy" placeholder="请输入创建者" />
        </el-form-item>

        <el-form-item label="更新者" prop="updateBy">
          <el-input v-model="form.updateBy" placeholder="请输入更新者" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>

        <el-form-item label="系统类型" prop="appId">
          <el-select v-model="form.appId" placeholder="请选择系统类型">
            <el-option
              v-for="dict in appIdOptions"
              :key="dict.key"
              :label="dict.value"
              :value="dict.key"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="系统名称" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入系统名称" />
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
  listSysOrgConfig,
  getSysOrgConfig,
  delSysOrgConfig,
  addSysOrgConfig,
  updateSysOrgConfig,
} from "@/api/org/sysOrgConfig";

export default {
  components: {},
  name: "SysOrgConfig",
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
      // 公司参数管理表格数据
      sysOrgConfigList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      // appIdOptions字典数据
      appIdOptions: [],

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deptId: undefined,
        configName: undefined,
        configKey: undefined,
        appId: undefined,
        appName: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configName: [
          { required: true, message: "参数名称不能为空", trigger: "blur" },
        ],
        appName: [
          { required: true, message: "系统名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getDicts("app_id").then((response) => {
      this.appIdOptions = response.data.values || [];
    });

    this.getList();
  },
  methods: {
    /** 查询公司参数管理列表 */
    getList() {
      this.loading = true;
      listSysOrgConfig(this.queryParams).then((response) => {
        this.sysOrgConfigList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },

    // 系统类型字典翻译
    appIdFormat(row, column) {
      return this.selectDictLabel(this.appIdOptions, row.appId);
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,

        deptId: undefined,

        configId: undefined,

        configName: undefined,

        configKey: undefined,

        configValue: undefined,

        configType: undefined,

        createBy: undefined,

        updateBy: undefined,

        remark: undefined,

        createdAt: undefined,

        updatedAt: undefined,

        deletedAt: undefined,

        appId: undefined,

        appName: undefined,
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
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加公司参数管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getSysOrgConfig(id).then((response) => {
        let data = response.data;

        data.configType = "" + data.configType;

        data.appId = "" + data.appId;

        this.form = data;
        this.open = true;
        this.title = "修改公司参数管理";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateSysOrgConfig(this.form).then((response) => {
              if (response.code === 0) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addSysOrgConfig(this.form).then((response) => {
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
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除公司参数管理编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delSysOrgConfig(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function () {});
    },
  },
};
</script>

<style>
</style>