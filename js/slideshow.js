/* ===============================================
   スライドショー機能
   =============================================== */

/**
 * スライドショーの設定
 */
const SLIDESHOW_CONFIG = {
  autoPlay: true,
  interval: 5000, // 5秒間隔
  images: [
    'comical1.jpg',
    'comical2.jpg', 
    'comical12.jpg',
    'comical10.jpg',
    'comical5.jpg',
    'comical6.jpg',
    'comical11.jpg',
    'comical4.jpg',
    'comical3.jpg'
  ]
};

/**
 * スライドショーのクラス
 */
class Slideshow {
  constructor(containerId, config = SLIDESHOW_CONFIG) {
    this.container = document.getElementById(containerId);
    this.config = config;
    this.currentIndex = 0;
    this.slides = [];
    this.intervalId = null;
    
    if (this.container) {
      this.init();
    }
  }

  /**
   * スライドショーの初期化
   */
  init() {
    this.createSlides();
    if (this.config.autoPlay) {
      this.startAutoPlay();
    }
    this.bindEvents();
  }

  /**
   * スライド要素の作成
   */
  createSlides() {
    this.config.images.forEach((imageSrc, index) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.style.backgroundImage = `url('${imageSrc}')`;
      slide.style.animationDelay = `${index * 5}s`;
      
      this.container.appendChild(slide);
      this.slides.push(slide);
    });
  }

  /**
   * 自動再生の開始
   */
  startAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, this.config.interval);
  }

  /**
   * 自動再生の停止
   */
  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 次のスライドに移動
   */
  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateSlides();
  }

  /**
   * 前のスライドに移動
   */
  prevSlide() {
    this.currentIndex = this.currentIndex === 0 
      ? this.slides.length - 1 
      : this.currentIndex - 1;
    this.updateSlides();
  }

  /**
   * 指定されたスライドに移動
   */
  goToSlide(index) {
    if (index >= 0 && index < this.slides.length) {
      this.currentIndex = index;
      this.updateSlides();
    }
  }

  /**
   * スライドの表示状態を更新
   */
  updateSlides() {
    this.slides.forEach((slide, index) => {
      if (index === this.currentIndex) {
        slide.style.opacity = '1';
        slide.style.zIndex = '10';
      } else {
        slide.style.opacity = '0';
        slide.style.zIndex = '1';
      }
    });
  }

  /**
   * イベントの設定
   */
  bindEvents() {
    // ホバー時に自動再生を停止
    this.container.addEventListener('mouseenter', () => {
      this.stopAutoPlay();
    });

    // ホバー終了時に自動再生を再開
    this.container.addEventListener('mouseleave', () => {
      if (this.config.autoPlay) {
        this.startAutoPlay();
      }
    });

    // フォーカス時の処理（アクセシビリティ対応）
    this.container.addEventListener('focusin', () => {
      this.stopAutoPlay();
    });

    this.container.addEventListener('focusout', () => {
      if (this.config.autoPlay) {
        this.startAutoPlay();
      }
    });

    // キーボード操作（アクセシビリティ対応）
    this.container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextSlide();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.config.autoPlay ? this.stopAutoPlay() : this.startAutoPlay();
          break;
      }
    });
  }

  /**
   * スライドショーの破棄
   */
  destroy() {
    this.stopAutoPlay();
    this.slides.forEach(slide => slide.remove());
    this.slides = [];
  }
}

/**
 * スライドショーの初期化関数
 */
function initSlideshow() {
  // メインヒーローのスライドショーを初期化
  const heroSlideshow = new Slideshow('hero-slideshow');
  
  // グローバルに参照を保存（デバッグ用）
  window.heroSlideshow = heroSlideshow;
  
  return heroSlideshow;
}

/**
 * プリロード機能
 */
function preloadSlideImages() {
  SLIDESHOW_CONFIG.images.forEach(imageSrc => {
    const img = new Image();
    img.src = imageSrc;
  });
}