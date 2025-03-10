# 企业级钓鱼链接防护系统

#https://sadrood.github.io/url

## 项目简介
本项目是一个企业级钓鱼链接防护系统，旨在通过多层次的安全检查和AI评分系统，帮助企业识别和拦截钓鱼链接，保障员工的网络安全。

## 项目结构

## 文件说明

### `index.html`
主页面文件，包含了系统的基本结构和样式引用。

### `styles.css`
样式文件，定义了项目的主题颜色、字体、动画等样式。

### `urlDatabase.js`
包含钓鱼链接和白名单链接的数据库，以及用于URL检查的辅助函数和AI评分系统。

### `app.js`
主逻辑文件，处理URL的输入、检查、结果显示以及与用户的交互。

## 功能说明

### URL 检查流程
1. **DNS过滤检查**：与已知的钓鱼链接数据库进行对比。
2. **白名单验证**：检查URL是否在企业白名单中。
3. **AI风险评分**：使用AI技术分析URL的风险程度。
4. **安全工程师审核**：中等风险的URL由安全工程师人工审核。

### 主要功能
- **钓鱼链接库管理**：添加、删除钓鱼链接。
- **白名单管理**：添加、删除白名单链接。
- **实时检测结果**：输入URL后，系统将进行安全性分析并显示结果。
- **安全工程师审核控制台**：中等风险的URL将提交给安全工程师进行审核。

## 使用说明

### 运行项目
1. 打开 `index.html` 文件以启动项目。
2. 在输入框中输入要访问的URL，点击“访问”按钮，系统将进行安全性分析并显示结果。

### 添加钓鱼链接或白名单链接
1. 点击“添加钓鱼URL”或“添加白名单URL”按钮。
2. 在弹出的模态框中输入URL，点击“确认”按钮。

## 依赖
- [Tailwind CSS](https://cdn.tailwindcss.com)
- [Lucide Icons](https://cdn.jsdelivr.net/npm/lucide-icons@0.244.0/dist/umd/lucide-icons.min.js)

## 贡献
欢迎提交问题和贡献代码！

## 许可证
本项目采用 MIT 许可证。
