// 实时更新模块

/**
 * 实时更新配置
 */
export interface LiveUpdateConfig {
  /**
   * 更新间隔时间（毫秒），默认3600000ms（1小时）
   */
  intervalMs?: number;
  
  /**
   * 是否在初始化时立即获取数据
   */
  immediateFetch?: boolean;
  
  /**
   * 数据获取成功回调
   */
  onDataUpdate?: (dates: any[]) => void;
  
  /**
   * 获取失败回调
   */
  onFetchError?: (error: Error) => void;
}

/**
 * 数据缓存接口
 */
export interface DataCache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
}

/**
 * 内存缓存实现
 */
export class MemoryCache implements DataCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private defaultTtl: number = 3600000; // 默认1小时

  get<T>(key: string): T | null {
    if (!this.has(key)) return null;
    
    const item = this.cache.get(key)!;
    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTtl);
    this.cache.set(key, { value, expiry });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

/**
 * 实时数据源管理器
 */
export class LiveDataSource {
  private config: LiveUpdateConfig;
  private dataUrl: string;
  private cache: DataCache;
  private intervalId: NodeJS.Timeout | null = null;
  private isFetching: boolean = false;
  private fetchFn: typeof fetch | null = null;

  constructor(
    dataUrl: string,
    config: LiveUpdateConfig = {},
    cache: DataCache = new MemoryCache(),
    fetchFunction?: typeof fetch
  ) {
    this.dataUrl = dataUrl;
    this.config = {
      intervalMs: 3600000, // 默认1小时
      immediateFetch: true,
      ...config
    };
    this.cache = cache;
    
    // 如果提供了fetch函数，直接使用
    if (fetchFunction) {
      this.fetchFn = fetchFunction;
    } else {
      // 否则尝试自动检测
      this.setupFetchFunction();
    }
  }

  private setupFetchFunction(): void {
    if (typeof window !== 'undefined' && window.fetch) {
      this.fetchFn = window.fetch.bind(window);
    } else if (typeof fetch !== 'undefined') {
      this.fetchFn = fetch;
    } else {
      // 如果Node.js环境没有fetch，提示用户安装node-fetch
      throw new Error('Fetch API is not available. Please install "node-fetch" for Node.js environment.');
    }
  }

  /**
   * 初始化实时更新
   */
  async init(): Promise<void> {
    if (this.config.immediateFetch) {
      await this.fetchData();
    }
    
    this.startPolling();
  }

  /**
   * 开始轮询
   */
  private startPolling(): void {
    this.stopPolling();
    
    this.intervalId = setInterval(() => {
      this.fetchData().catch(err => {
        if (this.config.onFetchError) {
          this.config.onFetchError(err);
        } else {
          console.error('Failed to fetch live data:', err);
        }
      });
    }, this.config.intervalMs);
  }

  /**
   * 停止轮询
   */
  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 手动获取数据
   */
  async fetchData(force: boolean = false): Promise<any[]> {
    // 如果正在获取，避免重复请求
    if (this.isFetching) {
      return Promise.reject(new Error('Fetch in progress'));
    }

    // 检查fetch函数是否可用
    if (!this.fetchFn) {
      throw new Error('Fetch function is not available');
    }

    // 检查缓存
    const cacheKey = this.getCacheKey();
    if (!force && this.cache.has(cacheKey)) {
      const cachedData = this.cache.get<any[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      this.isFetching = true;
      const response = await this.fetchFn(this.dataUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 更新缓存
      this.cache.set(cacheKey, data, this.config.intervalMs);
      
      // 通知更新
      if (this.config.onDataUpdate) {
        this.config.onDataUpdate(data);
      }
      
      return data;
    } catch (error) {
      if (this.config.onFetchError) {
        this.config.onFetchError(error instanceof Error ? error : new Error(String(error)));
      }
      throw error;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(): string {
    return `glowdown_live_data_${this.dataUrl}`;
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.stopPolling();
  }
}