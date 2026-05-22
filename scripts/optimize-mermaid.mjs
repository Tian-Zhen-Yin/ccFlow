/**
 * Optimize all 10 mermaid diagrams in the blog post
 * applying: subgraph dashed borders, Morandi palette, spacing refinement
 */
import fs from 'node:fs';

const filePath = 'content/blogs/building-portfolio-with-claude-code.md';
let content = fs.readFileSync(filePath, 'utf8');

const blocks = [];

const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
let match;
while ((match = mermaidRegex.exec(content)) !== null) {
  blocks.push(match[1].trim());
}

console.log(`Found ${blocks.length} mermaid blocks`);

// ── Chart 1: Architecture Layers (graph TB) ──
// Added: subgraph dashed borders, invisible links between layers
const chart1 = `graph TB

  subgraph content["内容层"]
      MD["Markdown 文件\\ncontent/projects & blogs"]
  end

  subgraph data["数据层"]
      GM["gray-matter\\nFront Matter 解析"]
      RM["remark + rehype\\nMarkdown → HTML"]
  end

  subgraph pages["页面层"]
      HOME["首页\\nHero + 项目展示"]
      PROJ["作品集\\n列表 + 详情"]
      BLOG["博客\\n列表 + 详情 + TOC"]
      ABOUT["关于页面"]
  end

  subgraph infra["基础设施"]
      GH["GitHub Actions\\ntest → build → lint"]
      VC["Vercel\\nISR + CDN"]
  end

  MD --> GM --> RM
  RM --> HOME & PROJ & BLOG & ABOUT
  HOME & PROJ & BLOG & ABOUT ~~~ GH
  GH --> VC

  classDef content fill:#1A4B5E,color:#E0F7FA,stroke:#0D7377,stroke-width:2px
  classDef data fill:#2D3748,color:#E2E8F0,stroke:#4B5563,stroke-width:2px
  classDef pages fill:#4A1E6B,color:#F0E6FF,stroke:#7C3AED,stroke-width:2px
  classDef infra fill:#1B5E3A,color:#E0F5E9,stroke:#059669,stroke-width:2px

  class MD content
  class GM,RM data
  class HOME,PROJ,BLOG,ABOUT pages
  class GH,VC infra

  style content fill:none,stroke:#0D7377,stroke-width:1px,stroke-dasharray:6 4
  style data fill:none,stroke:#4B5563,stroke-width:1px,stroke-dasharray:6 4
  style pages fill:none,stroke:#7C3AED,stroke-width:1px,stroke-dasharray:6 4
  style infra fill:none,stroke:#059669,stroke-width:1px,stroke-dasharray:6 4`;

// ── Chart 2: Writing Plans (graph LR) ──
// Changed to Morandi palette, invisible links for alignment
const chart2 = `graph LR

  A["设计文档\\n3 份"] ~~~ B["writing-plans\\n技能"]
  B ~~~ C["13 个任务"]

  C --> T1["1. 项目脚手架"]
  C --> T2["2. 类型 & 常量"]
  C --> T3["3. Markdown 解析"]
  C --> T4["4. 内容读取器"]
  C --> T5["5. 布局组件"]
  C --> T6["6. 首页 + 粒子动画"]
  C --> T7["7. 项目卡片"]
  C --> T8["8. 博客卡片"]
  C --> T9["9. 作品集详情页"]
  C --> T10["10. 博客详情页"]
  C --> T11["11. 关于页面"]
  C --> T12["12. 安全头配置"]
  C --> T13["13. GitHub CI"]

  classDef input fill:#EBE8FC,color:#4A229D,stroke:#B9AEF3,stroke-width:2px
  classDef process fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px
  classDef task fill:#F5F4F0,color:#333333,stroke:#D1CFC9,stroke-width:1px

  class A input
  class B process
  class C,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13 task`;

// ── Chart 3: Subagent Loop (graph TD) ──
// Added: dashed border for loop subgraph, Morandi palette
const chart3 = `graph TD

  PLAN["📋 任务计划\\n13 个任务"] --> SA1

  subgraph loop["子代理执行循环"]
      SA1["🤖 子代理实现\\n编写代码 + 测试"] --> REVIEW1["🔍 规格合规审查"]
      REVIEW1 -->|不通过| FIX1["✏️ 修复"]
      FIX1 --> REVIEW1
      REVIEW1 -->|通过| REVIEW2["🔍 代码质量审查"]
      REVIEW2 -->|不通过| FIX2["✏️ 修复"]
      FIX2 --> REVIEW2
      REVIEW2 -->|通过| DONE["✅ 任务完成"]
  end

  DONE --> SA1

  classDef plan fill:#EBE8FC,color:#4A229D,stroke:#B9AEF3,stroke-width:2px
  classDef agent fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px
  classDef review fill:#FCECDA,color:#B06000,stroke:#F7C38F,stroke-width:2px
  classDef fix fill:#F1ECE4,color:#666666,stroke:#D5CDCE,stroke-width:2px
  classDef done fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px

  class PLAN plan
  class SA1 agent
  class REVIEW1,REVIEW2 review
  class FIX1,FIX2 fix
  class DONE done

  style loop fill:none,stroke:#D1CFC9,stroke-width:1px,stroke-dasharray:6 4`;

// ── Chart 4: Server/Client Components (graph TB) ──
// Added: dashed border subgraphs, Morandi palette
const chart4 = `graph TB

  subgraph server["Server Components"]
      LAYOUT["RootLayout\\n字体 + 元数据"]
      HOME["首页"]
      PROJ["作品集页"]
      BLOG["博客页"]
      ABOUT["关于页"]
  end

  subgraph client["Client Components (use client)"]
      HERO["Hero\\nCanvas 粒子动画"]
      NAV["Navbar\\n滚动 + 移动端菜单"]
      SR["ScrollReveal\\nIntersectionObserver"]
      DEMO["DemoEmbed\\niframe"]
  end

  LAYOUT --> NAV
  HOME --> HERO & SR
  PROJ --> SR & DEMO
  BLOG --> SR

  classDef server fill:#EBE8FC,color:#4A229D,stroke:#B9AEF3,stroke-width:2px
  classDef client fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px

  class LAYOUT,HOME,PROJ,BLOG,ABOUT server
  class HERO,NAV,SR,DEMO client

  style server fill:none,stroke:#B9AEF3,stroke-width:1px,stroke-dasharray:6 4
  style client fill:none,stroke:#A3D7B1,stroke-width:1px,stroke-dasharray:6 4`;

// ── Chart 5: ISR Sequence ──
// Keep sequence diagram (structural changes don't apply), just refine if needed
const chart5 = `sequenceDiagram
    autonumber
    actor User as 用户
    participant CDN as Vercel CDN
    participant Builder as 构建器

    Note over CDN: 首次访问
    User->>CDN: GET /blog/my-post
    activate CDN
    CDN->>Builder: 请求渲染
    activate Builder
    Builder-->>CDN: 返回 HTML
    deactivate Builder
    CDN-->>User: 响应 + 缓存
    deactivate CDN

    Note over CDN: 缓存有效期内
    User->>CDN: GET /blog/my-post
    CDN-->>User: 直接返回缓存

    Note over CDN: revalidate 3600s 后
    User->>CDN: GET /blog/my-post
    CDN-->>User: 返回旧缓存（不阻塞）
    CDN-)Builder: 后台重新渲染
    Builder-->>CDN: 新 HTML 替换旧缓存`;

// ── Chart 6: Markdown Pipeline (graph LR) ──
// Added: longer arrows for spatial separation, Morandi palette
const chart6 = `graph LR

  A[".md 文件"] ---> B["gray-matter"]
  B ---> C["remark-parse"]
  C ---> D["remark-rehype"]
  D ---> E["rehype-slug"]
  E ---> F["rehype-highlight"]
  F ---> G["HTML 输出"]

  classDef source fill:#EBE8FC,color:#4A229D,stroke:#B9AEF3,stroke-width:2px
  classDef process fill:#F5F4F0,color:#333333,stroke:#D1CFC9,stroke-width:1px
  classDef output fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px

  class A source
  class B,C,D,E,F process
  class G output`;

// ── Chart 7: Pitfalls (graph TD) ──
// Added: subgraph with dashed border
const chart7 = `graph TD

  subgraph pitfalls["踩坑集锦"]
      P1["坑1: ESM 在 Jest 报错"]
      P2["坑2: next.config.ts 不支持"]
      P3["坑3: Google Fonts SSL"]
      P4["坑4: prose-surface 不存在"]
  end

  P1 ---> S1["transformIgnorePatterns"]
  P2 ---> S2["改用 next.config.mjs"]
  P3 ---> S3["CSS 变量 fallback"]
  P4 ---> S4["改用 prose-invert"]

  classDef pit fill:#F1ECE4,color:#666666,stroke:#D5CDCE,stroke-width:2px
  classDef sol fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px

  class P1,P2,P3,P4 pit
  class S1,S2,S3,S4 sol

  style pitfalls fill:none,stroke:#D5CDCE,stroke-width:1px,stroke-dasharray:6 4`;

// ── Chart 8: CI Pipeline (graph LR) ──
// Added: dashed subgraph, longer arrows, Morandi palette
const chart8 = `graph LR

  PUSH["git push"] --> TEST

  subgraph parallel["并行执行"]
      TEST["🧪 test\\n14 个测试"]
      LINT["📋 lint"]
  end

  TEST ---> BUILD["🏗️ build"]
  BUILD ---> DEPLOY["🚀 Vercel"]
  LINT -.->|并行| BUILD

  classDef trigger fill:#EBE8FC,color:#4A229D,stroke:#B9AEF3,stroke-width:2px
  classDef check fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px
  classDef build fill:#FCECDA,color:#B06000,stroke:#F7C38F,stroke-width:2px
  classDef deploy fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px

  class PUSH trigger
  class TEST,LINT check
  class BUILD build
  class DEPLOY deploy

  style parallel fill:none,stroke:#A3D7B1,stroke-width:1px,stroke-dasharray:6 4`;

// ── Chart 9: Deployment Flow (graph LR) ──
// Added: wrap pitfalls in dashed subgraph
const chart9 = `graph LR

  START["开始部署"] --> P1

  subgraph pitfalls["6 个部署坑"]
      P1["❌ SSH 密钥权限"] -->|解决| P2["❌ 框架检测为 Other"]
      P2 -->|解决| P3["❌ 分支名不匹配"]
      P3 -->|解决| P4["❌ Node.js 版本过高"]
      P4 -->|解决| P5["❌ SSL 证书拦截"]
      P5 -->|解决| P6["❌ CLI 上传失败"]
  end

  P6 -->|解决| SUCCESS["✅ 部署成功"]

  classDef start fill:#EBE8FC,color:#4A229D,stroke:#B9AEF3,stroke-width:2px
  classDef pit fill:#F1ECE4,color:#666666,stroke:#D5CDCE,stroke-width:2px
  classDef done fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px

  class START start
  class P1,P2,P3,P4,P5,P6 pit
  class SUCCESS done

  style pitfalls fill:none,stroke:#D5CDCE,stroke-width:1px,stroke-dasharray:6 4`;

// ── Chart 10: Final Deploy (graph LR) ──
// Added: longer arrows, Morandi palette
const chart10 = `graph LR

  A["本地 push"] ---> B["GitHub"]
  B ---> C["Actions CI"]
  C ---> D["Vercel 构建"]
  D ---> E["Preview"]
  E ---> F["Production"]
  F ---> G["🌐 上线"]

  classDef local fill:#EBE8FC,color:#4A229D,stroke:#B9AEF3,stroke-width:2px
  classDef ci fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px
  classDef build fill:#FCECDA,color:#B06000,stroke:#F7C38F,stroke-width:2px
  classDef live fill:#E6F4EA,color:#137333,stroke:#A3D7B1,stroke-width:2px

  class A local
  class B,C ci
  class D,E,F build
  class G live`;

const replacements = [chart1, chart2, chart3, chart4, chart5, chart6, chart7, chart8, chart9, chart10];

// Replace blocks one by one
let result = content;
let counter = 0;
mermaidRegex.lastIndex = 0;

const allBlocks = [...content.matchAll(/```mermaid\n([\s\S]*?)```/g)];
for (let i = allBlocks.length - 1; i >= 0; i--) {
  const full = allBlocks[i][0];
  const replacement = '```mermaid\n' + replacements[i] + '\n```';
  result = result.substring(0, allBlocks[i].index) + replacement + result.substring(allBlocks[i].index + full.length);
  counter++;
}

fs.writeFileSync(filePath, result);
console.log(`✅ Replaced ${counter} mermaid blocks with optimized versions.`);
