<script setup>
import {
    Edit,
    Delete
} from '@element-plus/icons-vue'

import { ref } from 'vue'

//文章分类数据模型
const categorys = ref([])

//用户搜索时选中的分类id
const categoryId = ref('')

//用户搜索时选中的发布状态
const state = ref('')

//文章列表数据模型
const articles = ref([])

//分页条数据模型
const pageNum = ref(1)//当前页
const total = ref(20)//总条数
const pageSize = ref(3)//每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
    pageSize.value = size
    getArticles()
}
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
    pageNum.value = num
    getArticles()
}

//回显文章分类
import { articleCategoryListService, articleListService, articleAddService, articleManageUpdateService, articleManageDeleteService } from '@/api/article.js'
const getArticleCategoryList = async () => {
    //获取所有分类
    let resultC = await articleCategoryListService();
    categorys.value = resultC.data
}


//文章列表查询
const getArticles = async () => {
    let params = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        categoryId: categoryId.value ? categoryId.value : null,
        state: state.value ? state.value : null
    }
    let result = await articleListService(params);
    //渲染列表数据
    articles.value = result.data.items
    //为列表中添加categoryName属性，根据分类id查询分类名称
    for (let i = 0; i < articles.value.length; i++) {
        let article = articles.value[i];
        for (let j = 0; j < categorys.value.length; j++) {
            if (article.categoryId === categorys.value[j].id) {
                article.categoryName = categorys.value[j].categoryName
            }
        }
    }
    //渲染总条数
    total.value = result.data.total
}

getArticleCategoryList();   // 获取文章分类
getArticles()               // 获取文章列表


import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import { Plus } from '@element-plus/icons-vue'
//控制抽屉是否显示
const visibleDrawer = ref(false)
//添加表单数据模型
const articleModel = ref({
    title: '',
    categoryId: '',
    coverImg: '',
    content: '',
    state: ''
})

// token
import { useTokenStore } from '@/stores/token.js'
const tokenStore = useTokenStore();

//上传图片成功回调
const uploadSuccess = (img) => {
    //img就是后台响应的数据，格式为：{code:状态码，message：提示信息，data: 图片的存储地址}
    articleModel.value.coverImg = img.data
    //console.log(img.data);
}

//添加文章
import { ElMessage } from 'element-plus'
const addArticle = async (state) => {
    articleModel.value.state = state
    let result = await articleAddService(articleModel.value);
    ElMessage.success(result.message ? result.message : '添加成功')
    //再次调用getArticles,获取文章
    getArticles()
    //隐藏抽屉
    visibleDrawer.value = false
}

//清空模型数据
const cleararticleModel = () => {
    articleModel.value.title = '';
    articleModel.value.categoryId = '';
    articleModel.value.coverImg = '';
    articleModel.value.content = '';
    articleModel.value.state = '';
}

//编辑 删除 添加弹窗
const dialogVisible = ref(false)

//修改分类回显
const updateManageEcho = (row) => {
    dialogVisible.value = true
    //将row中的数据赋值给categoryModel
    articleModel.value.title = row.title
    articleModel.value.categoryId = row.categoryId
    articleModel.value.coverImg = row.coverImg
    articleModel.value.content = row.content
    articleModel.value.state = state
    //修改的时候必须传递分类的id，所以扩展一个id属性
    articleModel.value.id = row.id
}

//修改文章
const updateManage = async () => {
    let result = await articleManageUpdateService(articleModel.value)
    ElMessage.success(result.message ? result.message : '修改成功')
    //隐藏弹窗
    dialogVisible.value = false
    //再次访问后台接口，查询所有文章
    cleararticleModel()
    getArticles()
}

//删除文章
import { ElMessageBox } from 'element-plus'
const deleteManage = (row) => {
    ElMessageBox.confirm(
        '你确认删除该文章信息吗？',
        '温馨提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            //用户点击了确认
            let result = await articleManageDeleteService(row.id)
            ElMessage.success(result.message ? result.message : '删除成功')
            //再次调用getArticles，获取所有文章
            getArticles()
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
        })
        .catch(() => {
            //用户点击了取消
            ElMessage({
                type: 'info',
                message: '取消删除',
            })
        })
}

</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>文章管理</span>
                <div class="extra">
                    <el-button type="primary" @click="visibleDrawer = true">添加文章</el-button>
                </div>
            </div>
        </template>

        <!-- 搜索表单 -->
        <el-form inline>
            <el-form-item label="文章分类：">
                <el-select placeholder="请选择" v-model="categoryId" style="width: 200px;">
                    <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="发布状态：">
                <el-select placeholder="请选择" v-model="state" style="width: 200px;">
                    <el-option label="已发布" value="已发布"></el-option>
                    <el-option label="草稿" value="草稿"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="getArticles">搜索</el-button>
                <el-button @click="categoryId = ''; state = ''">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 文章列表 -->
        <el-table :data="articles" style="width: 100%">
            <el-table-column label="文章标题" width="400" prop="title"></el-table-column>
            <el-table-column label="分类" prop="categoryName"></el-table-column>
            <el-table-column label="发表时间" prop="createTime"> </el-table-column>
            <el-table-column label="状态" prop="state"></el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-button :icon="Edit" circle plain type="primary" @click="updateManageEcho(row)"></el-button>
                    <el-button :icon="Delete" circle plain type="danger" @click="deleteManage(row)"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>

        <!-- 分页条 -->
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5, 10, 15]"
            layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
            @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" />

        <!-- 抽屉 -->
        <el-drawer v-model="visibleDrawer" title="添加文章" direction="rtl" size="50%">
            <!-- 添加文章表单 -->
            <el-form :model="articleModel" label-width="100px">
                <el-form-item label="文章标题">
                    <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="文章分类">
                    <el-select placeholder="请选择" v-model="articleModel.categoryId">
                        <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="文章封面">
                    <!--
                        auto-upload：是否自动上传
                        action：服务器接口路径
                        name：上传的文件字段名
                        headers：设置上传的请求头
                        on-success：上传成功的回调函数
                     -->
                    <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false" action="/api/upload"
                        name="file" :headers="{ Authorization: tokenStore.token }" :on-success="uploadSuccess">
                        <img v-if="articleModel.coverImg" :src="articleModel.coverImg" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="文章内容">
                    <div class="editor">
                        <quill-editor theme="snow" v-model:content="articleModel.content" contentType="html">
                        </quill-editor>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addArticle('已发布'); cleararticleModel()">发布</el-button>
                    <el-button type="info" @click="addArticle('草稿'); cleararticleModel()">草稿</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>

        <!-- 添加编辑弹窗 -->
        <el-dialog v-model="dialogVisible" title="编辑" width="30%">
            <el-form :model="articleModel" label-width="100px" style="padding-right: 30px">
                <el-form-item label="文章标题" prop="title">
                    <el-input v-model="articleModel.title" minlength="1" maxlength="10"></el-input>
                </el-form-item>
                <el-form-item label="文章分类" prop="categoryId">
                    <el-input v-model="articleModel.categoryId" minlength="1" maxlength="15"></el-input>
                </el-form-item>
                <el-form-item label="文章封面" prop="coverImg">
                    <el-input v-model="articleModel.coverImg" minlength="1" maxlength="15"></el-input>
                </el-form-item>
                <el-form-item label="文章内容" prop="content">
                    <el-input v-model="articleModel.content" minlength="1" maxlength="15"></el-input>
                </el-form-item>
                <el-form-item label="发布状态：">
                    <el-select placeholder="请选择" v-model="state" style="width: 200px;">
                        <el-option label="已发布" value="已发布"></el-option>
                        <el-option label="草稿" value="草稿"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="updateManage"> 确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </el-card>
</template>

<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

/* 抽屉样式 */
.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}

.editor {
    width: 100%;

    :deep(.ql-editor) {
        min-height: 200px;
    }
}

/*富文本编辑器 */
.editor {
    width: 100%;

    :deep(.ql-editor) {
        min-height: 200px;
    }
}
</style>