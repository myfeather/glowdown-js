interface MemorialDate {
  name: string;
  start: { y: number; m: number; d: number; h: number; min: number };
  end: { y: number; m: number; d: number; h: number; min: number };
}

interface GlowdownOptions {
  dataUrl?: string;
  dates?: MemorialDate[];
  onMemorialDay?: () => void;
}

class Glowdown {
  private dates: MemorialDate[] = [];
  private options: GlowdownOptions;

  constructor(options: GlowdownOptions = {}) {
    this.options = options;
    if (options.dates) {
      this.dates = options.dates;
    }
  }

    async init(): Promise<void> {
      if (this.options.dataUrl && !this.options.dates) {
        try {
          // 兼容浏览器和Node.js环境，Node.js环境下可能需要全局fetch支持
          let fetchFn: typeof fetch;
          if (typeof window !== 'undefined' && window.fetch) {
            fetchFn = window.fetch.bind(window);
          } else if (typeof fetch !== 'undefined') {
            fetchFn = fetch;
          } else {
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

  checkDate(date: Date = new Date()): boolean {
    const currentTime = date.getTime();

    return this.dates.some(({ start, end }) => {
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

      return currentTime >= startDate && currentTime <= endDate;
    });
  }

  applyStyle(): void {
    if (this.checkDate()) {
      if (this.options.onMemorialDay) {
        this.options.onMemorialDay();
      }
    }
  }
}

// ES模块导出
export default Glowdown;
export { MemorialDate, GlowdownOptions };
