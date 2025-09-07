# Glowdown 纪念日灰度化库

一个轻量级、完全类型安全的TypeScript库，用于在特定纪念日自动为网页应用灰度滤镜效果，支持普通纪念日和特殊祭日的区分处理。

## 功能特性

- 📅 根据配置的纪念日日期自动触发自定义行为
- 📁 支持从JSON文件加载纪念日数据或直接传入配置
- 🎨 完全可定制的纪念日行为，通过回调函数控制
- 🔧 支持灵活的时间配置，包括时分设置
- 🔄 **完美支持跨年纪念日**（如12月31日至1月1日）
- ⚫ **支持祭日等特殊日期的变灰处理**，可与普通纪念日区分
- 🔒 完全类型安全的TypeScript实现
- 🚀 轻量级设计，无运行时依赖
- 🌐 同时支持浏览器和Node.js环境

## 安装

使用pnpm（推荐，更快、更节省空间）：

```bash
pnpm add glowdown
```

使用npm：

```bash
npm install glowdown
```

使用yarn：

```bash
yarn add glowdown
```

## 使用方法

### 使用pnpm和TypeScript创建项目

如果您正在使用pnpm创建新的TypeScript项目，可以按照以下步骤操作：

```bash
# 创建新项目
mkdir my-project && cd my-project

# 初始化pnpm
pnpm init

# 安装TypeScript作为开发依赖
pnpm add -D typescript

# 创建tsconfig.json配置文件
echo '{"compilerOptions":{"target":"ES2020","module":"NodeNext","strict":true,"esModuleInterop":true,"skipLibCheck":true,"forceConsistentCasingInFileNames":true},"include":["src"]}' > tsconfig.json

# 安装Glowdown
pnpm add glowdown
```

### 在TypeScript项目中使用

```typescript
import Glowdown, { MemorialDate, GlowdownOptions } from 'glowdown';

// 定义纪念日数据
const memorialDates: MemorialDate[] = [
  {
    name: "南京大屠杀纪念日",
    start: { y: -1, m: 12, d: 13, h: 0, min: 0 },
    end: { y: -1, m: 12, d: 13, h: 23, min: 59 }
  },
  {
    name: "国家公祭日",
    start: { y: -1, m: 12, d: 13, h: 0, min: 0 },
    end: { y: -1, m: 12, d: 13, h: 23, min: 59 }
  }
];

// 创建配置选项
const options: GlowdownOptions = {
  dates: memorialDates,
  onMemorialDay: () => {
    // 自定义纪念日行为
    console.log('今天是纪念日，网页将变为灰度');
    if (typeof document !== 'undefined') {
      document.body.style.filter = 'grayscale(100%)';
    }
  }
};

// 创建Glowdown实例
const gd = new Glowdown(options);

// 应用样式（在浏览器环境中）
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    gd.applyStyle();
  });
}

// 在Node.js环境中使用
// gd.applyStyle();

### 在浏览器中直接使用

使用ES模块导入（推荐）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Glowdown示例</title>
  <script type="module">
    import Glowdown from 'https://unpkg.com/glowdown@latest/dist/glowdown.mjs';
    
    const gd = new Glowdown({
      dates: [{
        name: "南京大屠杀纪念日",
        start: { y: -1, m: 12, d: 13, h: 0, min: 0 },
        end: { y: -1, m: 12, d: 13, h: 23, min: 59 }
      }],
      onMemorialDay: () => {
        document.body.style.filter = 'grayscale(100%)';
      }
    });
    
    document.addEventListener('DOMContentLoaded', () => {
      gd.applyStyle();
    });
  </script>
</head>
<body>
  <h1>Glowdown浏览器示例</h1>
  <p>如果今天是纪念日，页面将自动变为灰度。</p>
</body>
</html>
```

使用传统script标签：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Glowdown示例</title>
  <script src="https://unpkg.com/glowdown@latest/dist/glowdown.cjs" defer></script>
  <script defer>
    document.addEventListener('DOMContentLoaded', () => {
      const gd = new Glowdown({
        dates: [{
          name: "南京大屠杀纪念日",
          start: { y: -1, m: 12, d: 13, h: 0, min: 0 },
          end: { y: -1, m: 12, d: 13, h: 23, min: 59 }
        }],
        onMemorialDay: () => {
          document.body.style.filter = 'grayscale(100%)';
        }
      });
      
      gd.applyStyle();
    });
  </script>
</head>
<body>
  <h1>Glowdown浏览器示例</h1>
  <p>如果今天是纪念日，页面将自动变为灰度。</p>
</body>
</html>
```

### 自定义行为示例

#### 1. 灰度效果与公告提示

```typescript
import Glowdown from 'glowdown';

const gd = new Glowdown({
  dates: [
    {
      name: "南京大屠杀纪念日",
      start: { y: -1, m: 12, d: 13, h: 0, min: 0 },
      end: { y: -1, m: 12, d: 13, h: 23, min: 59 },
      isGrayDay: true
    },
    {
      name: "国庆节",
      start: { y: -1, m: 10, d: 1, h: 0, min: 0 },
      end: { y: -1, m: 10, d: 1, h: 23, min: 59 }
    }
  ],
  onMemorialDay: () => {
    // 普通纪念日行为
    console.log('今天是普通纪念日');
  },
  onGrayDay: () => {
    // 应用灰度效果
    document.body.style.filter = 'grayscale(100%)';
    document.body.style.transition = 'filter 0.5s ease';
    
    // 创建并显示公告
    const notice = document.createElement('div');
    notice.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 15px 30px;
      border-radius: 5px;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    notice.textContent = '今天是南京大屠杀纪念日，我们深切缅怀遇难同胞。';
    
    document.body.appendChild(notice);
    
    // 30秒后自动移除公告
    setTimeout(() => {
      notice.style.opacity = '0';
      notice.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        document.body.removeChild(notice);
      }, 500);
    }, 30000);
  }
});

// 应用样式
gd.applyStyle();
```

#### 2. 加载外部JSON配置

```typescript
import Glowdown from 'glowdown';

const gd = new Glowdown({
  dataUrl: '/api/memorial-dates.json', // 服务器上的JSON配置文件
  onMemorialDay: () => {
    console.log('今天是普通纪念日');
  },
  onGrayDay: () => {
    document.body.style.filter = 'grayscale(100%)';
    console.log('今天是特殊祭日');
  }
});

// 初始化并加载数据
gd.init().then(() => {
  console.log('纪念日数据加载成功');
  gd.applyStyle();
}).catch(error => {
  console.error('加载纪念日数据失败:', error);
});
```

#### 3. 使用getStyleType方法自定义样式

```typescript
import Glowdown from 'glowdown';

const gd = new Glowdown({
  dates: [
    {
      name: "普通纪念日",
      start: { y: -1, m: 1, d: 1, h: 0, min: 0 },
      end: { y: -1, m: 1, d: 1, h: 23, min: 59 }
    },
    {
      name: "特殊祭日",
      start: { y: -1, m: 2, d: 1, h: 0, min: 0 },
      end: { y: -1, m: 2, d: 1, h: 23, min: 59 },
      isGrayDay: true
    }
  ]
});

// 检查特定日期的样式类型
function applyCustomStyle(date) {
  const styleType = gd.getStyleType(date);
  
  switch (styleType) {
    case 'gray':
      // 特殊祭日样式
      document.body.style.filter = 'grayscale(100%)';
      document.body.style.backgroundColor = '#f0f0f0';
      console.log('应用特殊祭日样式');
      break;
    case 'memorial':
      // 普通纪念日样式
      document.body.style.filter = 'sepia(50%)';
      document.body.style.backgroundColor = '#fff8f0';
      console.log('应用普通纪念日样式');
      break;
    default:
      // 普通日期样式
      document.body.style.filter = 'none';
      document.body.style.backgroundColor = '#ffffff';
      console.log('应用普通日期样式');
  }
}

// 应用当前日期样式
applyCustomStyle(new Date());

// 应用特定日期样式
applyCustomStyle(new Date('2025-02-01')); // 应用特殊祭日样式
applyCustomStyle(new Date('2025-01-01')); // 应用普通纪念日样式
applyCustomStyle(new Date('2025-03-01')); // 应用普通日期样式
```
```
## API 文档

### `Glowdown` 类

#### 构造函数
```typescript
new Glowdown(options?: GlowdownOptions)
```

**参数:**
- `options` (可选): 配置选项对象，包含纪念日数据和回调函数

**返回值:**
- Glowdown实例

#### 方法

##### `init(): Promise<void>`
初始化并加载纪念日数据（从指定的dataUrl）。

**返回值:**
- Promise<void>: 初始化完成的Promise

**使用场景:**
- 当通过`dataUrl`从外部加载纪念日数据时，需要先调用此方法
- 在Node.js环境中使用时，通常需要调用此方法

##### `checkDate(date?: Date): boolean`
检查指定日期是否是纪念日（包括普通纪念日和特殊祭日）。

**参数:**
- `date` (可选): 要检查的日期，默认为当前日期

**返回值:**
- boolean: 如果是纪念日返回true，否则返回false

**使用场景:**
- 需要手动检查特定日期是否是纪念日
- 用于自定义纪念日逻辑判断

##### `getDateStatus(date?: Date): { isMemorialDay: boolean; isGrayDay: boolean }`
获取指定日期的状态信息，包括是否是纪念日以及是否是特殊祭日。

**参数:**
- `date` (可选): 要检查的日期，默认为当前日期

**返回值:**
- 对象：包含`isMemorialDay`（是否是纪念日）和`isGrayDay`（是否是特殊祭日）两个布尔值

**使用场景:**
- 需要区分普通纪念日和特殊祭日时使用
- 需要根据不同日期类型执行不同逻辑时使用

##### `getStyleType(date?: Date): 'normal' | 'memorial' | 'gray'`
获取指定日期应应用的样式类型。

**参数:**
- `date` (可选): 要检查的日期，默认为当前日期

**返回值:**
- 字符串：`'normal'`（普通日期）、`'memorial'`（普通纪念日）或`'gray'`（特殊祭日）

**使用场景:**
- 需要根据不同日期类型应用不同样式时使用

##### `applyStyle(date?: Date): void`
检查指定日期是否是纪念日，如果是则执行自定义回调函数。特殊祭日的回调（onGrayDay）优先级高于普通纪念日回调（onMemorialDay）。

**参数:**
- `date` (可选): 要检查的日期，默认为当前日期

**使用场景:**
- 页面加载完成后自动检查并应用纪念日样式
- 需要手动触发纪念日检查的场景

### 配置选项 (`GlowdownOptions`)

```typescript
interface GlowdownOptions {
  dates?: MemorialDate[];    // 纪念日数据数组
  dataUrl?: string;          // 外部数据源URL
  onMemorialDay?: () => void; // 纪念日触发时的回调函数
  onGrayDay?: () => void;    // 特殊祭日触发时的回调函数（优先级高于onMemorialDay）
}
```

**属性说明:**

| 属性 | 类型 | 是否必需 | 说明 |
|------|------|---------|------|
| `dates` | MemorialDate[] | 否 | 纪念日数据数组，当不指定`dataUrl`时必需 |
| `dataUrl` | string | 否 | 外部JSON数据文件的URL，用于动态加载纪念日数据 |
| `onMemorialDay` | () => void | 否 | 当检测到普通纪念日时触发的回调函数 |
| `onGrayDay` | () => void | 否 | 当检测到特殊祭日（isGrayDay为true）时触发的回调函数，优先级高于onMemorialDay |

### 纪念日数据格式 (`MemorialDate`)

```typescript
interface MemorialDate {
  name: string;              // 纪念日名称
  start: {
    y: number;               // 年份（-1表示不指定具体年份，每年都会触发）
    m: number;               // 月份（1-12）
    d: number;               // 日期（1-31）
    h?: number;              // 小时（0-23，可选）
    min?: number;            // 分钟（0-59，可选）
  };
  end: {
    y: number;               // 年份（-1表示不指定具体年份，每年都会触发）
    m: number;               // 月份（1-12）
    d: number;               // 日期（1-31）
    h?: number;              // 小时（0-23，可选）
    min?: number;            // 分钟（0-59，可选）
  };
  isGrayDay?: boolean;       // 是否为需要特殊处理的祭日，默认为false
}
```

**属性说明:**

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | string | 纪念日的名称或描述 |
| `start` | object | 纪念日开始时间 |
| `end` | object | 纪念日结束时间 |

**时间属性特殊说明:**
- 设置`y: -1`表示不指定具体年份，纪念日将每年都会触发
- 支持跨年纪念日，如从12月31日到1月1日
- 未指定`h`和`min`时，默认为0点0分

### TypeScript类型导入

你可以直接从包中导入相关类型用于开发：

```typescript
import Glowdown, { GlowdownOptions, MemorialDate } from 'glowdown';

// 使用类型定义
const customDates: MemorialDate[] = [
  {
    name: "自定义纪念日",
    start: { y: -1, m: 1, d: 1 },
    end: { y: -1, m: 1, d: 1 }
  }
];

const options: GlowdownOptions = {
  dates: customDates,
  onMemorialDay: () => {
    console.log('今天是特殊纪念日');
  }
};

const gd = new Glowdown(options);
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
    },
    "isGrayDay": true
  },
  {
    "name": "国庆节",
    "start": {
      "y": -1,
      "m": 10,
      "d": 1,
      "h": 0,
      "min": 0
    },
    "end": {
      "y": -1,
      "m": 10,
      "d": 1,
      "h": 24,
      "min": 59
    }
  }
]
```

## 发布指南

### 1. 构建库文件

```bash
pnpm run build
```

这会生成：
- ES模块版本：`dist/glowdown.mjs`
- CommonJS版本：`dist/glowdown.cjs`

### 2. 发布到npm

1. 确保已登录npm账号：
```bash
pnpm login
```

2. 发布包：
```bash
pnpm publish
```

### 3. 浏览器版本部署

库支持多种浏览器引入方式：

#### ES模块方式（推荐）
```html
<script type="module">
  import Glowdown from '/path/to/glowdown.mjs';
  // 使用Glowdown
</script>
```

#### 传统脚本方式
```html
<script src="/path/to/glowdown.cjs"></script>
<script>
  // 使用全局变量Glowdown
  const gd = new Glowdown({/* 配置 */});
</script>
```

#### CDN方式
```html
<!-- ES模块 -->
<script type="module">
  import Glowdown from 'https://unpkg.com/glowdown@latest/dist/glowdown.mjs';
  // 使用Glowdown
</script>

<!-- 或传统方式 -->
<script src="https://unpkg.com/glowdown@latest/dist/glowdown.cjs"></script>

## 许可证

MIT


> TIPS:
> Don't forget the fucking **repository** & **version** key in your `package.json` file. 
> --For other developers in this repository. /n
> --minc_nice_100 /n
 