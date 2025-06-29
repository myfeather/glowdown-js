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
          // 兼容浏览器和Node.js环境
          const fetchFn = typeof window !== 'undefined' ? window.fetch : fetch;
          const response = await fetchFn(this.options.dataUrl);
          this.dates = await response.json();
        } catch (err) {
          console.error('Failed to load memorial dates:', err);
        }
      }
    }

  checkDate(date: Date = new Date()): boolean {
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const currentDate = date.getDate();
    const currentHours = date.getHours();
    const currentMinutes = date.getMinutes();

    return this.dates.some(({ start, end }) => {
      if (currentMonth !== start.m || currentDate < start.d || currentDate > end.d) {
        return false;
      }

      if (currentDate === start.d) {
        if (currentHours < start.h || (currentHours === start.h && currentMinutes < start.min)) {
          return false;
        }
      }
      if (currentDate === end.d) {
        if (currentHours > end.h || (currentHours === end.h && currentMinutes > end.min)) {
          return false;
        }
      }

      return true;
    });
  }

  applyStyle(): void {
    if (this.checkDate()) {
      if (this.options.onMemorialDay) {
        this.options.onMemorialDay();
      } else {
        const style = document.createElement('style');
        style.textContent = ':root { filter: grayscale(100%); }';
        document.head.appendChild(style);
      }
    }
  }
}

// ES模块导出
export default Glowdown;
export { MemorialDate, GlowdownOptions };
