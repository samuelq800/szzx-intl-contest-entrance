# 苏州中学国际部竞赛平台 Version 1-44 更新简报

> 说明：早期版本尚未在仓库中逐版打标签，Version 1-39 根据项目提交记录与历次需求记录重建；Version 40 起与网页显示版本及分支提交对应。

| 版本 | 主要更新 |
| --- | --- |
| Version 1 | 建立 AMC 10/12 静态练习平台原型，支持单题浏览与选择题作答。 |
| Version 2 | 开始整理 2010 年至今 AMC 10/12 历年真题、答案、来源与知识点。 |
| Version 3 | 扩充 AMC 答案覆盖并改善数学内容的正常公式显示。 |
| Version 4 | 将题目选择区改为固定高度滚动模块，减少页面纵向长度。 |
| Version 5 | 增加提交后自动显示解析和作答前主动查看解析。 |
| Version 6 | 将解析拆分为“初步思路、关键步骤、完整计算”三个阶段。 |
| Version 7 | 核查空解析、阶段错位和多解法堆叠，补全可恢复内容。 |
| Version 8 | 重做 AMC 封面视觉与双语信息层级，移除不协调的装饰。 |
| Version 9 | 导入 BMO1 2000-2023 分类题库，同时保护原有 AMC 题库不被改写。 |
| Version 10 | 将 BMO 与 AMC 训练模式分离，并补充 BMO 页面与 About 内容。 |
| Version 11 | 统一学校与 IB 图片相对路径，适配 GitHub Pages。 |
| Version 12 | 恢复 BMO 解析文本，按思路、步骤、完整解析显示。 |
| Version 13 | 创建 NEC 经济学练习平台，导入九个主题 PDF 题库。 |
| Version 14 | 修复 NEC 本地与 GitHub Pages 题库加载问题。 |
| Version 15 | 建立苏州中学国际部竞赛总入口，连接 AMC/BMO 与 NEC。 |
| Version 16 | 将各网站整理到独立 GitHub 非 main 发布分支。 |
| Version 17 | 在总入口建立 Supabase 统一登录中心与共享账号状态。 |
| Version 18 | 修复 NEC 空题面板、题目文本和选项渲染。 |
| Version 19 | 创建 LSESU Economics Challenge 分区练习平台。 |
| Version 20 | 为 LSESU 图示题加入题目图片并保持分阶段解析。 |
| Version 21 | 创建 AIME 单题练习区并加入三位整数作答。 |
| Version 22 | 整理 SAT 可读取试卷，剔除严重错乱题目与选项。 |
| Version 23 | 增加 Math Club 成员角色和 AMC 老师布置题目入口。 |
| Version 24 | 修复 Math Club 已布置题目无法载入及旧题号兼容问题。 |
| Version 25 | 恢复并重新接入 BMO 训练模式与分类题库。 |
| Version 26 | 为 AMC、NEC、LSESU 增加返回竞赛总平台入口。 |
| Version 27 | 增加 BMO 证明解答提交、云端保存和教师评阅基础能力。 |
| Version 28 | 建立 Econ Club 成员角色，支持 NEC/LSESU 任务布置与成员入口。 |
| Version 29 | 重新扫描 SAT 本地题库，增加可用题目和答案质量检查。 |
| Version 30 | 将 BMO 稳定整合进 AMC 数学平台并恢复 Supabase 连接。 |
| Version 31 | BMO 解析改为默认隐藏；各竞赛页面统一总平台导航。 |
| Version 32 | 建立基于正确率、知识点与难度的浏览器端推荐算法。 |
| Version 33 | 总入口增加每日数学/经济推荐和八维个人能力雷达图。 |
| Version 34 | 数学推荐限定 AMC；经济推荐在 NEC 与 LSESU 之间择一推送。 |
| Version 35 | 将 AIME 接入 AMC 平台并设为高于 AMC 12 的练习难度。 |
| Version 36 | 全面核查 AMC、AIME、BMO、NEC、LSESU 空题与损坏选项。 |
| Version 37 | 修复数学分数、分数公式和 fraction 显示问题。 |
| Version 38 | 雷达图改为十题置信阈值，样本增加后逐步转向正确率评分。 |
| Version 39 | 修复经济题单词粘连、题干空格和阅读排版。 |
| Version 40 | 四个平台统一接入每日推荐与能力报告基础版本。 |
| Version 41 | 统一能力算法，十题后以正确率为主要评分依据。 |
| Version 42 | 核查空题、数学分数显示和经济题排版，并统一缓存版本。 |
| Version 43 | 放开 LSESU/AIME 云端作答类型；补传 LSESU 本机记录；总后台增加数学分和经济分。 |
| Version 44 | AMC、NEC、LSESU 均增加独立管理员模式；AMC 后台统一查看 AMC/AIME/BMO；新增三类数学任务发布、BMO 0-10 整数人工评分与总后台 BMO 汇总；修复 Publish 按钮可见性。 |

## Supabase 使用原则

- 只保存真实业务数据：账号资料、作答、收藏、任务、BMO 证明解答及教师评分。
- 不保存 Dashboard 汇总、雷达图点位、推荐结果或每日快照。
- 所有筛选、统计、正确率、能力分、推荐匹配和 BMO 总分均在浏览器端即时计算。
- 独立竞赛 Dashboard 直接筛选现有记录，不复制数据，不建立竞赛专用统计表。
