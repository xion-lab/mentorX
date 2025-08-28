<!-- Optional: Add a banner here -->
<!-- <p align="center">
  <img src="./assets/banner.png" alt="MentorX Banner" width="700"/>
</p> -->

<h1 align="center">MentorX – 去中心化导师评价网 (Powered by Xion)</h1>

<p align="center">
  <!-- Optional: Add badges here -->
  <!-- Example: -->
  <!-- <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status"> -->
  <!-- <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"> -->
</p>

<p align="center">
  🚀 MentorX 是一个基于 Xion 区块链的去中心化导师评价平台，学生可以自由、匿名地对导师进行评价，数据存储在链上 + IPFS，保证透明、不可篡改。同时引入 Web3 身份 (DID/钱包) 与 积分/NFT 激励机制，让学生评价更真实、更可信。
</p>

---

## 📖 目录 (Table of Contents)

- [✨ 功能特性](#-功能特性)
- [📸 应用截图](#-应用截图)
- [🏗️ 技术架构与数据流](#️-技术架构与数据流)
- [🛠️ 技术栈](#️-技术栈)
- [🚀 本地运行](#-本地运行)
- [🤝 如何贡献](#-如何贡献)
- [🗺️ 未来规划](#️-未来规划)
- [📄 许可证](#️-许可证)

---

## ✨ 功能特性

- **去中心化身份 (DID/钱包登录)**：用户使用钱包直接登录，免注册，链上身份唯一。
- **导师评价**：学生可以自由发布评价，数据存储于 IPFS，链上存储哈希保障不可篡改。
- **热门导师榜**：基于链上评价聚合，透明可信，无法造假。
- **学生积分/NFT 激励**：每次评价都会获得奖励，可兑换 NFT 或特权。
- **4 大核心模块**：
  - 🏠 **首页**：热门导师榜 + 最新评价
  - 📖 **导师**：搜索/筛选/查看导师详情
  - ✍️ **评价**：学生发布/管理评价
  - 👤 **我的**：钱包、个人信息、奖励

---

## 📸 应用截图

<!-- Add screenshots of your application here -->
<!--
<table>
  <tr>
    <td><img src="./assets/screenshot1.png" alt="Screenshot 1" width="300"/></td>
    <td><img src="./assets/screenshot2.png" alt="Screenshot 2" width="300"/></td>
  </tr>
</table>
-->

---

## 🏗️ 技术架构与数据流

下图展示了 MentorX 的核心技术架构和数据流动路径。

<!-- 
建议使用 Mermaid.js 或图片来展示架构图，会比纯文本更清晰。
下面是一个 Mermaid.js 示例，GitHub 会自动渲染。
-->

```mermaid
graph TD
    A[React Native DApp] -->|1. 发布评价| B(IPFS);
    A -->|2. 调用合约 submitReview()| C{Xion 区块链};
    C -->|3. 合约事件| D[后端 Indexer];
    B -->|评价内容| D;
    D -->|索引/聚合数据| E[(Postgres/Redis)];
    D -->|监听 gRPC/WebSocket| C;
    F[前端 API] --> A;
    E --> F;
```

**数据流示例:**

1. **学生在 App 上发布评价** → 内容加密后存储到 IPFS。
2. **App 调用合约 `submitReview()`** → 将评价哈希与 IPFS CID 上链。
3. **后端服务监听链上事件** → 将数据写入数据库，做索引和聚合。
4. **前端通过 API 读取数据** → 展示热门导师榜和最新评价。

### 数据结构

#### Mentor - 导师数据

```json
{
  "name": "Ivy",
  "institution": "野鸡大学",
  "department": "计算机学院",
  "avatar": "https://avatars.githubusercontent.com/u/103652334?v=4", // optional
  "created_at": "2025-08-25T15:29:44Z....",
  "created_by": "xion......",
  "links": [ "https://github.com/yuchangongzhu" ],
  "updated_at": "2025-08-25T......",
  "updated_by": "xion......",
  "comments": [
    "cidxxxxxx",
    "cidyyyyyy"
  ]
}
```

#### User - 用户数据

```json
{
  "id": "xion.......",
  "institution": "xxxxx", // optional, ZK
  "posted_comments": [
    "cidxxxxxx",
    "cidyyyyyy"
  ]
}
```

#### Comment - 评论数据

```json
{
  "created_at": "2025-08-28Txxxx",
  "created_by": "xion......",
  "rating": 9,
  "comment": "Ivy老师是世界上最好的老师",
  "likes": 100 // can be negative
}
```

---

## 🛠️ 技术栈

| 类型         | 技术                                               |
|--------------|----------------------------------------------------|
| **前端**       | `React Native`, `Wagmi`, `Viem`, `Tailwind CSS`      |
| **智能合约** | `CosmWasm`, `Rust`                                 |
| **后端**       | `Node.js`, `TypeScript`, `NestJS`, `PostgreSQL`, `Redis` |
| **存储**       | `IPFS` (内容), `Xion` (哈希/CID)                   |
| **安全**       | `钱包签名`, `OpenZeppelin (等效库)`, `zk (可选)`     |

---

## 🚀 本地运行 (Getting Started)

请按照以下步骤在本地运行此项目。

### 1. 环境准备 (Prerequisites)

确保你已经安装了以下环境：

- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/) 或 `npm`
- [Docker](https://www.docker.com/) (用于数据库)

### 2. 安装依赖 (Installation)

```bash
# 克隆项目
git clone https://github.com/your-repo/mentorx.git
cd mentorx

# 安装依赖
yarn install
```

### 3. 启动项目 (Running the App)

```bash
# 启动后端服务和数据库
yarn start:dev

# 启动移动端应用 (iOS/Android)
yarn ios
# or
yarn android
```

---

## 🤝 如何贡献 (Contributing)

我们欢迎任何形式的贡献！请阅读我们的 [CONTRIBUTING.md](CONTRIBUTING.md) 文件了解详情。

1. Fork 本项目
2. 创建你的分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交一个 Pull Request

---

## 🗺️ 未来规划 (Roadmap)

- [ ] **引入零知识证明 (zkID)**，保证身份唯一但匿名。
- [ ] **NFT 激励机制** → 学生可获得“贡献者 NFT”。
- [ ] **DAO 治理机制** → 学生与导师共同管理规则。

---

## 📄 许可证 (License)

本项目使用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。
