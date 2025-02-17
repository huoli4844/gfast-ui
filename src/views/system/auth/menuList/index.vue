<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="菜单名称">
        <el-input
          v-model="queryParams.menuName"
          placeholder="请输入菜单名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions.values"
            :key="dict.key"
            :label="dict.value"
            :value="dict.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system/auth/addMenu']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="title" label="菜单名称" :show-overflow-tooltip="true" width="160"></el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="weigh" label="排序" width="60"></el-table-column>
      <el-table-column prop="name" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="status" label="状态" :formatter="statusFormat" width="80"></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createtime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system/auth/editMenu']"
          >修改</el-button>

          <el-button
            v-if="scope.row.menu_type!=2"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system/auth/addMenu']"
          >新增</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system/auth/deleteMenu']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级菜单"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="0">目录</el-radio>
                <el-radio label="1">菜单</el-radio>
                <el-radio label="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.menuType != '2'" label="菜单图标">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" >
                  <svg-icon
                    v-if="form.icon"
                    slot="prefix"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px;width: 16px;"
                  />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != '2'" label="是否外链">
              <el-radio-group v-model="form.isFrame">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != '2'" label="路由地址" prop="path">
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" >
            <el-form-item label="权限规则" prop="name">
              <el-input v-model="form.name" placeholder="请输入权限规则" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item v-if="form.menuType != '2'" label="显示状态">
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in visibleOptions.values"
                  :key="dict.key"
                  :label="dict.key"
                >{{dict.value}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != '2'" label="菜单状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions.values"
                  :key="dict.key"
                  :label="dict.key"
                >{{dict.value}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属模块" prop="moduleType">
              <el-select v-model="form.moduleType" @change="changeModule">
                <el-option
                  v-for="dict in moduleTypeOptions.values"
                  :key="dict.key"
                  :label="dict.value"
                  :value="dict.key"
                >{{dict.value}}</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联模型">
              <el-select v-model="form.modelId" clearable>
                <el-option
                  v-for="dict in modelOptions"
                  :key="dict.modelId"
                  :label="dict.modelTitle"
                  :value="dict.modelId"
                >{{dict.modelTitle}}</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"  v-if="form.menuType == '1'">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType=='0'">
            <el-form-item label="跳转路由" prop="jumpPath">
              <el-input v-model="form.jumpPath" placeholder="请输入跳转路由地址" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMenu,treeselect, getMenu, delMenu, addMenu, updateMenu,getModelOptions } from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
  name: "Menu",
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示状态数据字典
      visibleOptions: [],
      // 菜单状态数据字典
      statusOptions: [],
      //模型选项
      modelOptions:[],
      //单独所属模块选项
      moduleTypeOptions:[],
      // 查询参数
      queryParams: {
        menuName: undefined,
        visible: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        menuName: [
          { required: true, message: "菜单名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "菜单顺序不能为空", trigger: "blur" }
        ],
        path: [
          { required: true, message: "路由地址不能为空", trigger: "blur" }
        ],
        moduleType:[
          { required: true, message: "所属模块不能为空", trigger: "change" }
        ]
      }
    };
  },
  created() {
    this.getDicts("sys_show_hide").then(response => {
      this.visibleOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("menu_module_type").then(response => {
      this.moduleTypeOptions = response.data;
    });
    this.getList();
  },
  methods: {
    // 选择图标
    selected(name) {
      this.form.icon = name;
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      listMenu(this.queryParams).then(response => {
        this.menuList = this.handleTree(response.data.list, "id","pid");
        this.loading = false;
      });
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.title,
        children: node.children
      };
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.menuOptions = [];
        const menu = { id: 0, title: '主类目', children: [] };
        menu.children = this.handleTree(response.data.parentList, "id","pid");
        this.menuOptions.push(menu);
      });
    },
    // 显示状态字典翻译
    visibleFormat(row, column) {
      if (row.menuType == "2") {
        return "";
      }
      return this.selectDictLabel(this.visibleOptions.values, row.alwaysShow);
    },
    // 菜单状态字典翻译
    statusFormat(row, column) {
      if (row.menuType == "2") {
        return "";
      }
      return this.selectDictLabel(this.statusOptions.values, row.status);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        menuId: undefined,
        parentId: 0,
        name:'',
        menuName: undefined,
        icon: undefined,
        menuType: "0",
        orderNum: "0",
        isFrame: "0",
        visible: "1",
        status: "1",
        path:'',
        jumpPath:'',
        component:'',
        moduleType:'',
        modelId:undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null) {
        this.form.parentId = row.id;
      }
      this.open = true;
      this.title = "添加菜单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getMenu(row.id).then(response => {
        this.menuOptions = [];
        const menu = { id: 0, title: '主类目', children: [] };
        menu.children = this.handleTree(response.data.parentList, "id","pid");
        this.menuOptions.push(menu);
        this.modelOptions = response.data.modelOptions
        const menuInfo = response.data.menu
        this.form = {
          menuId: menuInfo.id,
          parentId: menuInfo.pid,
          name:menuInfo.name,
          menuName: menuInfo.title,
          icon: menuInfo.icon,
          menuType: ""+menuInfo.menuType,
          orderNum: menuInfo.weigh,
          isFrame: ""+menuInfo.isFrame,
          visible: ""+menuInfo.alwaysShow,
          status: ""+menuInfo.status,
          path:menuInfo.path,
          jumpPath:menuInfo.jumpPath,
          component:menuInfo.component,
          moduleType:menuInfo.moduleType,
          modelId:menuInfo.modelId===0?undefined:menuInfo.modelId
        }
        this.open = true;
        this.title = "修改菜单";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.menuId != undefined) {
            updateMenu(this.form).then(response => {
              if (response.code === 0) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addMenu(this.form).then(response => {
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
      this.$confirm('是否确认删除名称为"' + row.title + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delMenu(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 选择模块加载对应模型选项 */
    changeModule(module){
      this.form.modelId=undefined

      getModelOptions(module).then(response=>{

        if(response.data){
            this.modelOptions = response.data
        }else{
          this.modelOptions=[]
        }
      })
    }
  }
};
</script>
