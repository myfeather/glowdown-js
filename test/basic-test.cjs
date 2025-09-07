// 简单的测试脚本，验证Glowdown库的基本功能
const path = require('path');
const fs = require('fs');

// 加载fetch库（使用node-fetch的CommonJS兼容模式）
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 加载Glowdown库
const Glowdown = require('../dist/glowdown.cjs').default;

// 创建一个简单的本地JSON文件作为数据源
const mockDataPath = path.join(__dirname, 'mock-memorial-dates.json');
fs.writeFileSync(mockDataPath, JSON.stringify([
  {
    name: '测试纪念日',
    start: { y: 2025, m: 9, d: 6, h: 0, min: 0 },
    end: { y: 2025, m: 9, d: 6, h: 23, min: 59 }
  },
  {
    name: '另一个测试',
    start: { y: 2025, m: 9, d: 7, h: 0, min: 0 },
    end: { y: 2025, m: 9, d: 7, h: 23, min: 59 }
  },
  {
    name: '测试祭日',
    start: { y: 2025, m: 9, d: 9, h: 0, min: 0 },
    end: { y: 2025, m: 9, d: 9, h: 23, min: 59 },
    isGrayDay: true
  }
]));

// 创建一个简单的HTTP服务器来提供mock数据
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/api/memorial-dates') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    fs.createReadStream(mockDataPath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});
server.listen(3000, () => {
  console.log('Mock API server running on http://localhost:3000');
  runTests();
});

async function runTests() {
  try {
    console.log('\n===== 开始测试 Glowdown 库 =====\n');
    
    // 测试1: 基本功能测试
    console.log('\n测试1: 基本功能测试');
    const basicGlowdown = new Glowdown({
      dates: [
        {
          name: '测试纪念日',
          start: { y: 2025, m: 9, d: 6, h: 0, min: 0 },
          end: { y: 2025, m: 9, d: 6, h: 23, min: 59 }
        }
      ]
    });
    await basicGlowdown.init();
    
    const result = basicGlowdown.checkDate(new Date('2025-09-06'));
    console.log('检查特定日期结果:', result);
    
    // 测试2: 从URL加载数据
    console.log('\n测试2: 从URL加载数据');
    const urlGlowdown = new Glowdown({
      dataUrl: 'http://localhost:3000/api/memorial-dates',
      fetch: fetch // 传递fetch函数
    });
    await urlGlowdown.init();
    
    const urlResult = urlGlowdown.checkDate(new Date('2025-09-06'));
    console.log('从URL加载数据并检查结果:', urlResult);
    
    // 测试3: 祭日变灰处理功能测试
    console.log('\n测试3: 祭日变灰处理功能测试');
    let grayDayCalled = false;
    let memorialDayCalled = false;
    
    const grayDayGlowdown = new Glowdown({
      dates: [
        {
          name: '普通纪念日',
          start: { y: 2025, m: 9, d: 6, h: 0, min: 0 },
          end: { y: 2025, m: 9, d: 6, h: 23, min: 59 }
        },
        {
          name: '测试祭日',
          start: { y: 2025, m: 9, d: 9, h: 0, min: 0 },
          end: { y: 2025, m: 9, d: 9, h: 23, min: 59 },
          isGrayDay: true
        }
      ],
      onMemorialDay: () => {
        memorialDayCalled = true;
        console.log('onMemorialDay回调被调用');
      },
      onGrayDay: () => {
        grayDayCalled = true;
        console.log('onGrayDay回调被调用');
      }
    });
    
    // 测试getStyleType方法
    const styleType1 = grayDayGlowdown.getStyleType(new Date('2025-09-06'));
    console.log('普通纪念日样式类型:', styleType1); // 应为'memorial'
    
    const styleType2 = grayDayGlowdown.getStyleType(new Date('2025-09-09'));
    console.log('祭日样式类型:', styleType2); // 应为'gray'
    
    const styleType3 = grayDayGlowdown.getStyleType(new Date('2025-09-10'));
    console.log('普通日期样式类型:', styleType3); // 应为'normal'
    
    // 测试getDateStatus方法
    const status1 = grayDayGlowdown.getDateStatus(new Date('2025-09-06'));
    console.log('普通纪念日状态:', status1); // 应为{isMemorialDay: true, isGrayDay: false}
    
    const status2 = grayDayGlowdown.getDateStatus(new Date('2025-09-09'));
    console.log('祭日状态:', status2); // 应为{isMemorialDay: true, isGrayDay: true}
    
    // 测试applyStyle方法的回调调用
    console.log('\n测试applyStyle方法回调:');
    memorialDayCalled = false;
    grayDayCalled = false;
    
    console.log('应用普通纪念日样式:');
    grayDayGlowdown.applyStyle(new Date('2025-09-06'));
    console.log('onMemorialDay被调用:', memorialDayCalled); // 应为true
    console.log('onGrayDay被调用:', grayDayCalled); // 应为false
    
    memorialDayCalled = false;
    grayDayCalled = false;
    
    console.log('应用祭日样式:');
    grayDayGlowdown.applyStyle(new Date('2025-09-09'));
    console.log('onMemorialDay被调用:', memorialDayCalled); // 应为false
    console.log('onGrayDay被调用:', grayDayCalled); // 应为true
    
    // 测试4: 实时更新功能初始化
    console.log('\n测试4: 实时更新功能初始化');
    
    // 注意：原测试3已重命名为测试4，这里保留原名称以避免混淆
    const liveGlowdown = new Glowdown({
      dataUrl: 'http://localhost:3000/api/memorial-dates',
      fetch: fetch, // 传递fetch函数
      live: {
        enabled: true,
        intervalMs: 5000,
        onDataUpdate: (data) => {
          console.log('\n数据已更新:', data.length, '条记录');
        },
        onError: (error) => {
          console.error('更新错误:', error);
        }
      }
    });
    
    await liveGlowdown.init();
    console.log('实时更新功能已初始化');
    
    // 模拟数据更新
    setTimeout(() => {
      console.log('\n模拟更新数据源...');
      fs.writeFileSync(mockDataPath, JSON.stringify([
        {
          name: '测试纪念日',
          start: { y: 2025, m: 9, d: 6, h: 0, min: 0 },
          end: { y: 2025, m: 9, d: 6, h: 23, min: 59 }
        },
        {
          name: '另一个测试',
          start: { y: 2025, m: 9, d: 7, h: 0, min: 0 },
          end: { y: 2025, m: 9, d: 7, h: 23, min: 59 }
        },
        {
          name: '新增纪念日',
          start: { y: 2025, m: 9, d: 8, h: 0, min: 0 },
          end: { y: 2025, m: 9, d: 8, h: 23, min: 59 }
        },
        {
          name: '新增祭日',
          start: { y: 2025, m: 9, d: 10, h: 0, min: 0 },
          end: { y: 2025, m: 9, d: 10, h: 23, min: 59 },
          isGrayDay: true
        }
      ]));

      // 手动刷新数据
      setTimeout(() => {
        console.log('\n手动刷新数据...');
        liveGlowdown.refreshData().then(() => {
          const updatedResult = liveGlowdown.checkDate(new Date('2025-09-08'));
          console.log('刷新后检查新增日期结果:', updatedResult);

          // 检查新增祭日
          const grayDayResult = liveGlowdown.getStyleType(new Date('2025-09-10'));
          console.log('刷新后检查新增祭日样式类型:', grayDayResult); // 应为'gray'

          const grayDayStatus = liveGlowdown.getDateStatus(new Date('2025-09-10'));
          console.log('刷新后检查新增祭日状态:', grayDayStatus); // 应为{isMemorialDay: true, isGrayDay: true}

          // 停止实时更新
          console.log('\n停止实时更新...');
          liveGlowdown.stopLiveUpdate();

          // 清理资源
          console.log('\n销毁实例...');
          liveGlowdown.destroy();

          // 关闭服务器
          setTimeout(() => {
            console.log('\n关闭服务器...');
            server.close(() => {
              console.log('\n===== 测试完成 =====');
              process.exit(0);
            });
          }, 1000);
        });
      }, 1000);
    }, 2000);
    
  } catch (error) {
    console.error('测试失败:', error);
    server.close();
    process.exit(1);
  }
}