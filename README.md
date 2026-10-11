# GrowthFlow

个人成长计划与记录系统。项目正在分阶段开发，目前完成阶段 2 的本地任务管理。

## 使用 Docker 开发

需要 Docker 和 Docker Compose，无需在本机安装 Node.js 或 npm 依赖。

```bash
docker compose up --build -d
```

打开 <http://localhost:5173/>。源代码修改后，开发页面会自动更新。

```bash
docker compose exec app npm run typecheck
docker compose exec app npm run build
docker compose exec app npm run test
```

停止开发容器：

```bash
docker compose down
```

目前提供响应式首页、主题切换和 IndexedDB 任务管理。任务可在“任务管理”页面按日期新增、编辑、完成、调整状态和删除。每日记录、导入与备份等功能会在后续阶段实现。
