import { LiveDataSource, LiveUpdateConfig, MemoryCache, DataCache } from './live-update.js';

interface MemorialDate {
  name: string;
  start: { y: number; m: number; d: number; h: number; min: number };
  end: { y: number; m: number; d: number; h: number; min: number };
  /**
   * 是否是需要变灰处理的特殊日期（如祭日）
   */
  isGrayDay?: boolean;
}

interface LiveOptions {
  /**
   * 是否启用实时更新
   */
  enabled?: boolean;
  
  /**
   * 更新间隔时间（毫秒），默认3600000ms（1小时）
   */
  intervalMs?: number;
  
  /**
   * 数据获取成功回调
   */
  onDataUpdate?: (dates: MemorialDate[]) => void;
  
  /**
   * 获取失败回调
   */
  onError?: (error: Error) => void;
}

interface GlowdownOptions {
  dataUrl?: string;
  dates?: MemorialDate[];
  onMemorialDay?: () => void;
  
  /**
   * 祭日等需要变灰处理的日期回调函数
   */
  onGrayDay?: () => void;
  
  /**
   * 实时更新配置
   */
  live?: LiveOptions;
  
  /**
   * 自定义缓存实现
   */
  cache?: DataCache;
  
  /**
   * 自定义fetch函数，用于Node.js环境
   */
  fetch?: typeof fetch;
}

class Glowdown {
  private dates: MemorialDate[] = [];
  private options: GlowdownOptions;
  private liveDataSource: LiveDataSource | null = null;

  constructor(options: GlowdownOptions = {}) {
    this.options = options;
    if (options.dates) {
      this.dates = options.dates;
    }
    
    // 初始化实时数据源
    this.initLiveDataSource();
  }
  
  /**
   * 初始化实时数据源
   */
  private initLiveDataSource(): void {
    const { dataUrl, live, cache, fetch: fetchFn } = this.options;
    
    if (dataUrl && live?.enabled) {
      const liveConfig: LiveUpdateConfig = {
        intervalMs: live.intervalMs,
        immediateFetch: false, // 延迟到init方法中执行
        onDataUpdate: (dates: any[]) => {
          this.updateDates(dates);
          if (live.onDataUpdate) {
            live.onDataUpdate(dates);
          }
        },
        onFetchError: live.onError
      };
      
      this.liveDataSource = new LiveDataSource(
        dataUrl,
        liveConfig,
        cache || new MemoryCache(),
        fetchFn // 传递fetch函数
      );
    }
  }
  
  /**
   * 更新纪念日数据
   */
  private updateDates(dates: MemorialDate[]): void {
    this.dates = dates;
  }
  
  /**
   * 开始实时更新
   */
  async startLiveUpdate(): Promise<void> {
    if (this.liveDataSource) {
      await this.liveDataSource.init();
    }
  }
  
  /**
   * 停止实时更新
   */
  stopLiveUpdate(): void {
    if (this.liveDataSource) {
      this.liveDataSource.stopPolling();
    }
  }
  
  /**
   * 手动刷新数据
   */
  async refreshData(): Promise<MemorialDate[]> {
    if (this.liveDataSource) {
      return this.liveDataSource.fetchData(true) as Promise<MemorialDate[]>;
    }
    return Promise.resolve(this.dates);
  }
  
  /**
   * 销毁实例，释放资源
   */
  destroy(): void {
    this.stopLiveUpdate();
    if (this.liveDataSource) {
      this.liveDataSource.destroy();
      this.liveDataSource = null;
    }
  }

  async init(): Promise<void> {
    // 尝试获取fetch函数，用于所有数据获取操作
    let fetchFn: typeof fetch | undefined;
    if (this.options.fetch) {
      fetchFn = this.options.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchFn = window.fetch.bind(window);
    } else if (typeof fetch !== 'undefined') {
      fetchFn = fetch;
    }
    
    // 如果启用了实时更新，启动实时更新功能
    if (this.options.live?.enabled) {
      // 如果有fetch函数但LiveDataSource还没有设置，重新初始化LiveDataSource
      if (fetchFn && this.liveDataSource && !this.liveDataSource['fetchFn']) {
        this.initLiveDataSource();
      }
      await this.startLiveUpdate();
    } else if (this.options.dataUrl && !this.options.dates) {
      // 未启用实时更新，但有dataUrl，只获取一次数据
      try {
        if (!fetchFn) {
          // 如果Node.js环境没有fetch，提示用户安装node-fetch
          throw new Error('Fetch API is not available. Please install "node-fetch" for Node.js environment.');
        }
        const response = await fetchFn(this.options.dataUrl);
        this.dates = await response.json();
      } catch (err) {
        console.error('Failed to load memorial dates:', err);
      }
    }
  }

  /**
   * 检查当前日期是否是纪念日
   * @param date 要检查的日期
   * @returns 是否是纪念日
   */
  checkDate(date: Date = new Date()): boolean {
    return this.getDateStatus(date).isMemorialDay;
  }

  /**
   * 获取当前日期的详细状态
   * @param date 要检查的日期
   * @returns 包含是否是纪念日和是否是祭日的状态对象
   */
  getDateStatus(date: Date = new Date()): { isMemorialDay: boolean; isGrayDay: boolean } {
    const currentTime = date.getTime();
    let isMemorialDay = false;
    let isGrayDay = false;

    this.dates.forEach(({ start, end, isGrayDay: grayDay }) => {
      // 计算开始时间和结束时间的时间戳
      const startDate = new Date(
        start.y === -1 ? date.getFullYear() : start.y,
        start.m - 1,
        start.d,
        start.h,
        start.min
      ).getTime();
      const endDate = new Date(
        end.y === -1 ? date.getFullYear() : end.y,
        end.m - 1,
        end.d,
        end.h,
        end.min
      ).getTime();

      let isInRange = false;
      
      // 处理跨年情况：如果开始月份大于结束月份，说明是跨年
      if (start.m > end.m && start.y === -1 && end.y === -1) {
        const currentYear = date.getFullYear();
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).getTime();
        
        // 如果当前月份是1月，需要检查是否在上一年的开始日期到今年的结束日期范围内
        if (date.getMonth() === 0) {
          const prevYearStartDate = new Date(currentYear - 1, start.m - 1, start.d, start.h, start.min).getTime();
          const prevYearEndOfYear = new Date(currentYear - 1, 11, 31, 23, 59, 59).getTime();
          
          // 检查是否在上一年的开始日期到结束日期，或者在今年的1月1日到结束日期范围内
          isInRange = (currentTime >= prevYearStartDate && currentTime <= prevYearEndOfYear) || 
                     (currentTime >= new Date(currentYear, 0, 1, 0, 0).getTime() && currentTime <= endDate);
        } else {
          // 如果当前月份不是1月，检查是否在今年的开始日期到结束日期范围内
          isInRange = currentTime >= startDate && currentTime <= endOfYear;
        }
      } else {
        // 处理普通情况
        isInRange = currentTime >= startDate && currentTime <= endDate;
      }

      if (isInRange) {
        isMemorialDay = true;
        if (grayDay) {
          isGrayDay = true;
        }
      }
    });

    return { isMemorialDay, isGrayDay };
  }

  /**
   * 应用纪念日样式
   * 根据日期类型调用相应的回调函数
   * @param date 要检查的日期，默认为当前日期
   */
  applyStyle(date?: Date): void {
    const status = this.getDateStatus(date);
    
    // 如果是需要变灰处理的日期，优先调用onGrayDay回调
    if (status.isGrayDay) {
      if (this.options.onGrayDay) {
        this.options.onGrayDay();
      }
    }
    // 如果是普通纪念日，调用onMemorialDay回调
    else if (status.isMemorialDay) {
      if (this.options.onMemorialDay) {
        this.options.onMemorialDay();
      }
    }
  }

  /**
   * 获取当前需要应用的样式类型
   * @param date 要检查的日期，默认为当前日期
   * @returns 样式类型（'normal' | 'memorial' | 'gray'）
   */
  getStyleType(date?: Date): 'normal' | 'memorial' | 'gray' {
    const status = this.getDateStatus(date);
    if (status.isGrayDay) {
      return 'gray';
    } else if (status.isMemorialDay) {
      return 'memorial';
    } else {
      return 'normal';
    }
  };
}

// ES模块导出
export default Glowdown;
export { 
  MemorialDate, 
  GlowdownOptions,
  LiveOptions,
  LiveUpdateConfig,
  DataCache,
  MemoryCache,
  LiveDataSource
};

// CommonJS兼容性导出
if (typeof module !== 'undefined') {
  module.exports = Glowdown;
  module.exports.default = Glowdown;
  // 只导出类，不导出类型
  module.exports.MemoryCache = MemoryCache;
  module.exports.LiveDataSource = LiveDataSource;
  
  // 为TypeScript用户提供类型信息（仅在类型检查时可用）
  module.exports.__esModule = true;
}
