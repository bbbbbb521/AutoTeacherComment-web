# AutoTeacherComment-web

📱 **在线页面：https://bbbbbb521.github.io/AutoTeacherComment-web/**

教师评价助手 · 油猴脚本 — 自动填写中北大学教务系统教师评价表单。

## 原项目

| 项目 | 信息 |
|------|------|
| **项目名称** | nuc-teacher-comments |
| **原作作者** | [yang-jingyu0722](https://gitee.com/yang-jingyu0722) |
| **原仓库地址** | https://gitee.com/yang-jingyu0722/nuc-teacher-comments |

## 功能

- 自动填写单选按钮（完全同意/同意/一般/不太同意/完全不同意）
- 自动填写打分输入框（0-100分）
- 支持多教师连续评价
- 自定义评分

## 使用方式

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 扩展，然后点击浏览器扩展 → Tampermonkey → 详细信息 → 开启"允许用户脚本"
2. 打开在线页面一键安装
3. 进入教务系统评价页面自动填写

## 评分设置

分数可在 Tampermonkey 菜单中直接选择或自定义输入，以**浮动面板**右上角的数字为准。

> ⚠️ 由于学校教务系统使用Vue.js框架，禁止外部JS注入事件，无法实现自动提交，填写完成后请手动点击"保存/提交"按钮

## 操作说明

- **右上角菜单**：点击 Tampermonkey 图标 → 菜单中直接选择分数（100/95/90/85/80/75/70/60）或点击"自定义分数"输入任意值
- **浮动面板**：页面右上角蓝色面板显示当前生效的分数

## 开发环境

- 油猴脚本 (Tampermonkey)
- 纯 JavaScript，无需构建工具
- 直接在浏览器中开发和调试

## 许可

仅供学习交流使用。
