# 2d_webgame_test
this is just a repo for testing, using chatgpt to create 2d webgame

## 晨光冒险 · 第一关

无需安装依赖的原创 Canvas 横版平台游戏，包含金币、砖块、敌人、深坑、终点、键盘与触屏按钮。

下载或克隆仓库后，将 `index.html` 和 `game.js` 保持在同一个文件夹，用浏览器打开 `index.html` 即可。
也可以在仓库目录运行 `python3 -m http.server 8000`，通过本机浏览器访问该服务。

点击“开始游戏”后，使用方向键或 A/D 移动，空格、W 或向上键跳跃，Shift 加速，R 重开。按住跳跃键可跳得更远；切换窗口会暂停游戏。

开发检查：`node --check game.js`。无需构建步骤或外部素材。

### 地下宝库

站在第三根水管（带“地下入口”标记）顶部，按 ↓ 或 S，或点击“钻管”按钮进入地下宝库。收集金币后，站在地下右侧出口水管顶部，用相同操作返回第一关最后一根水管。分数、剩余时间和两处场景的金币状态保留；重新开始会重置所有场景。

水管场景回归测试：`node --test tests/pipe-scenes.test.cjs`（只使用 Node 内置模块，无需安装依赖）。
