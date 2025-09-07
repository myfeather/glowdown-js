// 测试脚本 - 检查Glowdown库的功能

// 模拟浏览器环境
global = {}

// 导入库
import Glowdown from '../dist/glowdown.mjs';

// 模拟document对象用于测试
const document = {
  body: {
    style: {}
  }
};

// 测试1: 检查当前日期是否是纪念日
console.log('=== 测试1: 检查当前日期 ===');
const gd1 = new Glowdown({
  dates: [{
    name: "测试纪念日",
    start: { y: -1, m: new Date().getMonth() + 1, d: new Date().getDate(), h: 0, min: 0 },
    end: { y: -1, m: new Date().getMonth() + 1, d: new Date().getDate(), h: 23, min: 59 }
  }],
  onMemorialDay: () => {
    console.log('今天是测试纪念日！');
  }
});

const isTodayMemorialDay = gd1.checkDate();
console.log(`今天是纪念日吗？${isTodayMemorialDay}`);

// 测试2: 检查特定日期是否是纪念日
console.log('\n=== 测试2: 检查特定日期 ===');
const testDate = new Date(2023, 11, 13); // 2023年12月13日
const gd2 = new Glowdown({
  dates: [{
    name: "南京大屠杀纪念日",
    start: { y: -1, m: 12, d: 13, h: 0, min: 0 },
    end: { y: -1, m: 12, d: 13, h: 23, min: 59 }
  }]
});

const isSpecificDateMemorialDay = gd2.checkDate(testDate);
console.log(`2023年12月13日是纪念日吗？${isSpecificDateMemorialDay}`);

// 测试3: 测试跨年纪念日逻辑
console.log('\n=== 测试3: 测试跨年纪念日 ===');
const gd3 = new Glowdown({
  dates: [{
    name: "跨年纪念日",
    start: { y: -1, m: 12, d: 31, h: 0, min: 0 },
    end: { y: -1, m: 1, d: 1, h: 23, min: 59 }
  }]
});

const newYearEve = new Date(2023, 11, 31);
const newYearDay = new Date(2024, 0, 1);

console.log(`2023年12月31日是跨年纪念日吗？${gd3.checkDate(newYearEve)}`);
console.log(`2024年1月1日是跨年纪念日吗？${gd3.checkDate(newYearDay)}`);

// 测试4: 测试applyStyle方法
console.log('\n=== 测试4: 测试applyStyle方法 ===');
let memorialDayTriggered = false;
const gd4 = new Glowdown({
  dates: [{
    name: "触发测试纪念日",
    start: { y: -1, m: new Date().getMonth() + 1, d: new Date().getDate(), h: 0, min: 0 },
    end: { y: -1, m: new Date().getMonth() + 1, d: new Date().getDate(), h: 23, min: 59 }
  }],
  onMemorialDay: () => {
    memorialDayTriggered = true;
    console.log('onMemorialDay回调被触发');
  }
});

gd4.applyStyle();
console.log(`回调是否被触发？${memorialDayTriggered}`);

console.log('\n测试完成！');