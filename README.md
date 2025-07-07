# Glowdown 纪念日灰度化库

一个轻量级的TypeScript库，用于在特定纪念日自动为网页应用灰度滤镜效果。

## 功能特性

- 根据配置的纪念日日期自动触发自定义行为
- 支持从JSON文件加载纪念日数据
- **必须明确提供`onMemorialDay`回调来自定义纪念日触发时的行为，库不再默认应用任何样式或效果。**
- 完全类型安全的TypeScript实现

## 安装

```bash
npm install glowdown
# 或
pnpm install glowdown
# 或
yarn add glowdown
```

## 使用方法

### 在Node.js中使用

```typescript
import Glowdown from 'glowdown';

// 如果Node.js环境没有全局fetch，需要安装node-fetch并全局引入
// import fetch from 'node-fetch';
// (global as any).fetch = fetch;

const gd = new Glowdown({ 
  dataUrl: './times.json' // 纪念日数据文件路径
});

gd.init().then(() => {
  gd.applyStyle(); // 检查当前日期并应用样式
});
```

### 在浏览器中直接使用

1. 引入脚本文件：
```html
<script src="path/to/glowdown.browser.js"></script>
```

2. 使用全局变量Glowdown：
```javascript
const gd = new Glowdown({
  dates: [{
    name: "南京大屠杀纪念日",
    start: { y: -1, m: 12, d: 13, h: 0, min: 0 },
    end: { y: -1, m: 12, d: 13, h: 24, min: 59 }
  }]
});

gd.applyStyle();
```

### 自定义行为

```typescript
const gd = new Glowdown({
  dates: [ // 直接传入纪念日数据，支持跨年纪念日
    {
      name: "跨年纪念日示例",
      start: { y: -1, m: 12, d: 31, h: 0, min: 0 },
      end: { y: -1, m: 1, d: 1, h: 23, min: 59 }
    }
  ],
  onMemorialDay: () => {
    // 这里必须自定义纪念日触发时的行为
    document.body.style.filter = 'grayscale(100%)';
    alert('今天是跨年纪念日');
  }
});
```
## API 文档

### `Glowdown` 类

#### 构造函数
```typescript
new Glowdown(options?: GlowdownOptions)
```

#### 方法
- `init(): Promise<void>` - 初始化并加载纪念日数据
- `checkDate(date?: Date): boolean` - 检查指定日期是否是纪念日
- `applyStyle(): void` - 应用纪念日样式

### 配置选项 (`GlowdownOptions`)

| 参数 | 类型 | 说明 |
|------|------|------|
| `dataUrl` | string | 可选，纪念日数据JSON文件的URL |
| `dates` | MemorialDate[] | 可选，直接传入的纪念日数据数组 |
| `onMemorialDay` | () => void | 可选，纪念日触发时的回调函数 |

### `MemorialDate` 接口

```typescript
interface MemorialDate {
  name: string; // 纪念日名称
  start: { // 开始时间
    y: number; // 年 (-1表示每年)
    m: number; // 月 (1-12)
    d: number; // 日 (1-31)
    h: number; // 时 (0-23)
    min: number; // 分 (0-59)
  };
  end: { // 结束时间
    y: number;
    m: number;
    d: number;
    h: number;
    min: number;
  };
}
```

## 纪念日数据格式

纪念日数据应为JSON数组，格式如下：

```json
[
  {
    "name": "南京大屠杀纪念日",
    "start": {
      "y": -1,
      "m": 12,
      "d": 13,
      "h": 0,
      "min": 0
    },
    "end": {
      "y": -1,
      "m": 12,
      "d": 13,
      "h": 24,
      "min": 59
    }
  }
]
```

## 发布指南

### 1. 构建库文件

```bash
npm run build
```

这会生成：
- Node.js版本：`dist/src/glowdown.js`
- 浏览器版本：`dist/glowdown.browser.js`

### 2. 发布到npm

1. 确保已登录npm账号：
```bash
npm login
```

2. 发布包：
```bash
npm publish
```

### 3. 浏览器版本部署

1. 将`dist/glowdown.browser.js`复制到你的静态文件目录
2. 在HTML中通过script标签引入：
```html
<script src="/path/to/glowdown.browser.js"></script>
```

## 许可证

MIT


> TIPS:
> Don't forget the fucking **repository** & **version** key in your `package.json` file. 
> --For other developers in this repository. /n
> --minc_nice_100 /n
 