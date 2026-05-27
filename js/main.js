/* ===============================================
   こみかるユース福井 - メインJavaScript
   =============================================== */

/**
 * DOM読み込み完了時の初期化
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('こみかるユース福井 - サイト初期化開始');
  
  // 各機能を初期化
  initMobileMenu();
  initSmoothScroll();
  initActiveNavigation();
  initSlideshow();
  initLazyLoading();
  initAnimations();
  preloadSlideImages();
  
  console.log('こみかるユース福井 - サイト初期化完了');
});

/**
 * 遅延読み込み（Lazy Loading）の初期化
 */
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * アニメーション効果の初期化
 */
function initAnimations() {
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, {
      threshold: 0.1
    });

    // アニメーション対象の要素を監視
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      animationObserver.observe(el);
    });
  }
}

/**
 * コンポーネントローダー
 */
class ComponentLoader {
  constructor() {
    this.loadedComponents = new Set();
  }

  /**
   * HTMLコンポーネントを読み込む
   */
  async loadComponent(componentPath, targetId) {
    if (this.loadedComponents.has(componentPath)) {
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      console.warn(`Target element with id "${targetId}" not found`);
      return;
    }

    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      target.innerHTML = html;
      this.loadedComponents.add(componentPath);
      
      // コンポーネント読み込み後にイベントを発火
      document.dispatchEvent(new CustomEvent('componentLoaded', {
        detail: { componentPath, targetId }
      }));
      
    } catch (error) {
      console.error(`Failed to load component ${componentPath}:`, error);
    }
  }

  /**
   * 複数のコンポーネントを並行して読み込む
   */
  async loadComponents(components) {
    const promises = components.map(({ path, target }) => 
      this.loadComponent(path, target)
    );
    
    try {
      await Promise.all(promises);
      console.log('All components loaded successfully');
    } catch (error) {
      console.error('Error loading components:', error);
    }
  }
}

/**
 * データローダー
 */
class DataLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * JSONデータを読み込む
   */
  async loadData(dataPath) {
    if (this.cache.has(dataPath)) {
      return this.cache.get(dataPath);
    }

    try {
      const response = await fetch(dataPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(dataPath, data);
      return data;
      
    } catch (error) {
      console.error(`Failed to load data ${dataPath}:`, error);
      return null;
    }
  }
}

/**
 * ユーティリティ関数
 */
const utils = {
  /**
   * 要素が表示領域内にあるかチェック
   */
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * 要素を指定時間後に表示/非表示
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    const start = performance.now();
    
    const fade = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        element.style.opacity = progress;
        requestAnimationFrame(fade);
      } else {
        element.style.opacity = 1;
      }
    };
    
    requestAnimationFrame(fade);
  },

  fadeOut(element, duration = 300) {
    const start = performance.now();
    const startOpacity = parseFloat(window.getComputedStyle(element).opacity);
    
    const fade = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        element.style.opacity = startOpacity * (1 - progress);
        requestAnimationFrame(fade);
      } else {
        element.style.opacity = 0;
        element.style.display = 'none';
      }
    };
    
    requestAnimationFrame(fade);
  },

  /**
   * デバウンス関数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * スロットル関数
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
};

// グローバルに参照を保存
window.componentLoader = new ComponentLoader();
window.dataLoader = new DataLoader();
window.utils = utils;

/**
 * エラーハンドリング
 */
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});

/**
 * パフォーマンス監視
 */
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        console.log(`Page Load Time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['navigation'] });
}