<template>

  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">    

        <el-form-item label="内容" prop="info">
          <el-select v-model="queryParams.info" placeholder="请选择内容" clearable size="small">
              <el-option label="请选择字典生成" value="" />
          </el-select>
        </el-form-item>    

        <el-form-item label="单图" prop="img">
          <el-select v-model="queryParams.img" placeholder="请选择单图" clearable size="small">
              <el-option label="请选择字典生成" value="" />
          </el-select>
        </el-form-item>    

        <el-form-item label="多图" prop="imgs">
          <el-select v-model="queryParams.imgs" placeholder="请选择多图" clearable size="small">
              <el-option label="请选择字典生成" value="" />
          </el-select>
        </el-form-item>    

        <el-form-item label="单文件" prop="file">
          <el-select v-model="queryParams.file" placeholder="请选择单文件" clearable size="small">
              <el-option label="请选择字典生成" value="" />
          </el-select>
        </el-form-item>    

        <el-form-item label="多文件" prop="files">
          <el-select v-model="queryParams.files" placeholder="请选择多文件" clearable size="small">
              <el-option label="请选择字典生成" value="" />
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
          v-hasPermi="['system/demoGenOther/add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system/demoGenOther/edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system/demoGenOther/delete']"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="demoGenOtherList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />      

      <el-table-column label="ID" align="center" prop="id" />      

      <el-table-column label="内容" align="center" prop="info" />      

      <el-table-column align="center" label="缩略图" width="100">
      <template slot-scope="scope">
        <img v-if="scope.row.img!=''" :src="scope.row.img|urlCorrection"
             style="width: 150px; "
        >
      </template>
      </el-table-column>      

      <el-table-column label="多图" align="center" prop="imgs" />      

      <el-table-column label="单文件" align="center" prop="file" />      

      <el-table-column label="多文件" align="center" prop="files" />      

      <el-table-column label="描述" align="center" prop="remark" />      

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system/demoGenOther/edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system/demoGenOther/delete']"
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

    <!-- 添加或修改特殊字段测试对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">      

        <el-form-item label="内容">
          <Editor ref="cke" v-model="form.info" @setEditContent="setInfoEditContent"/>
        </el-form-item>      

       <el-form-item label="单图" prop="img">
         <el-upload
           v-loading="upLoadingImg"
           :action="apiUrl+'/system/upload/upImg'"
           :before-upload="beforeAvatarUploadImg"
           :data="setUpData()"
           :on-success="handleAvatarSuccessImg"
           :show-file-list="false"
           class="avatar-uploader"
           name="file"
         >
           <img v-if="imageUrlImg" :src="imageUrlImg" class="avatar">
           <i v-else class="el-icon-plus avatar-uploader-icon"></i>
         </el-upload>
       </el-form-item>      

       <el-form-item label="多图" prop="imgs" >
         <up-imgs :action="apiUrl+'/system/upload/upImg'" v-model="form.imgs" @setUpImgList="setUpImgListImgs"></up-imgs>
       </el-form-item>      

        <el-form-item label="单文件" prop="file" >
        <up-file :action="apiUrl+'/system/upload/upFile'" v-model="form.file" @setUpFielList="setUpFileListFile" :limit="1"></up-file>
        </el-form-item>      

        <el-form-item label="多文件" prop="files" >
        <up-file :action="apiUrl+'/system/upload/upFile'" v-model="form.files" @setUpFielList="setUpFileListFiles" :limit="10"></up-file>
        </el-form-item>      

        <el-form-item label="描述">
          <Editor ref="cke" v-model="form.remark" @setEditContent="setRemarkEditContent"/>
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
    listDemoGenOther,
    getDemoGenOther,
    delDemoGenOther,
    addDemoGenOther,
    updateDemoGenOther,    

} from "@/api/system/demoGenOther";

import Editor from "@/components/CKeditor";

import { getToken } from '@/utils/auth'

import upImgs from "@/components/upImgs"

import upFile from "@/components/upfile"

export default {
  components:{    

    Editor,    

    upImgs,    

    upFile,    

  },
  name: "DemoGenOther",
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
      // 特殊字段测试表格数据
      demoGenOtherList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,      

       //图片上传地址
       imageUrlImg: '',
       //上传加载
       upLoadingImg: false,      

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        info: undefined,
        img: undefined,
        imgs: undefined,
        file: undefined,
        files: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: { 
      }
    };
  },
  created() {

    this.getList();
  },
  methods: {    

    //富文本编辑器内容
    setInfoEditContent(data) {
      this.form.info = data
    },    

    //单图上传单图
    handleAvatarSuccessImg(res, file) {
      if (res.code === 0) {
        this.imageUrlImg = URL.createObjectURL(file.raw)
        this.form.img = res.data.fileInfo.fileUrl
      } else {
        this.msgError(res.msg)
      }
      this.upLoadingImg = false
    },
    beforeAvatarUploadImg(file) {
      this.upLoadingImg = true
      return true
    },    

    setUpData() {
      return { token: getToken() }
    },    

    setUpImgListImgs(data){
        this.form.imgs = data
    },    

    setUpFileListFile(data){
        this.form.file = data
    },    

    setUpFileListFiles(data){
        this.form.files = data
    },    

    //富文本编辑器描述
    setRemarkEditContent(data) {
      this.form.remark = data
    },    

    /** 查询特殊字段测试列表 */
    getList() {
      this.loading = true;
      listDemoGenOther(this.queryParams).then(response => {
        this.demoGenOtherList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
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

        info: undefined,        

        img: undefined,        

        imgs: undefined,        

        file: undefined,        

        files: undefined,        

        remark: undefined,        

      };      

      this.imageUrlImg = ''      

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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加特殊字段测试";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDemoGenOther(id).then(response => {
        let data = response.data;        

        //单图地址赋值
        this.imageUrlImg = data.img ? this.getUpFileUrl(process.env.VUE_APP_BASE_API,data.img) : ''        

        data.imgs =data.imgs?JSON.parse(data.imgs):[]        

        data.file =data.file?JSON.parse(data.file):[]        

        data.files =data.files?JSON.parse(data.files):[]        

        this.form = data;
        this.open = true;
        this.title = "修改特殊字段测试";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateDemoGenOther(this.form).then(response => {
              if (response.code === 0) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addDemoGenOther(this.form).then(response => {
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
      this.$confirm('是否确认删除特殊字段测试编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delDemoGenOther(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    }
  }
};
</script>

<style>

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

</style>