import { createRouter, createWebHistory } from 'vue-router'

// 导入组件
import Login from '../views/Login.vue'
import Layout from '../views/Layout.vue'
import ArticleCategoryVue from '../views/article/ArticleCategory.vue'
import ArticleManageVue from '../views/article/ArticleManage.vue'
import UserAvatarVue from '../views/user/UserAvatar.vue'
import UserInfoVue from '../views/user/UserInfo.vue'
import UserResetPasswordVue from '../views/user/UserResetPassword.vue'

// 定义路由关系(路由表,某个路由路径对应哪个视图组件)
const routes = [
    { path: '/login', component: Login },
    {
        path: '/', component: Layout, redirect: '/article/manage',
        // 牵头路由（子路由），对应的组件会展示在当前组件内部
        children: [
            { path: '/article/category', component: ArticleCategoryVue },
            { path: '/article/manage', component: ArticleManageVue },
            { path: '/user/avatar', component: UserAvatarVue },
            { path: '/user/info', component: UserInfoVue },
            { path: '/user/resetPassword', component: UserResetPasswordVue }
        ]
    },
    // 用户访问的路由地址不存在(懒加载)
    { path: '/404', component: () => import('../views/404View.vue') },
    { path: '/:catchAll(.*)', redirect: '/404' }
]

// 创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

// 导出路由
export default router