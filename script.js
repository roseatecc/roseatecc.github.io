// 主題設置
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // 更新圖標
    const icon = document.querySelector('#theme-toggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// 切換主題
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// 導航欄滾動處理
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');
let isNavbarVisible = true;

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = Math.abs(scrollTop - lastScrollTop);
    const minScrollDelta = 10; // 最小滾動距離才觸發

    // 只在滾動距離超過閾值時處理
    if (scrollDelta > minScrollDelta) {
        if (scrollTop > lastScrollTop && scrollTop > navbar.offsetHeight) {
            // 向下滾動，隱藏導航欄
            if (isNavbarVisible) {
                navbar.style.transform = 'translateY(-100%)';
                isNavbarVisible = false;
            }
        } else {
            // 向上滾動，顯示導航欄
            if (!isNavbarVisible) {
                navbar.style.transform = 'translateY(0)';
                isNavbarVisible = true;
            }
        }
        lastScrollTop = scrollTop;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 檢查用戶之前的偏好設置
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 設置初始主題
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    }

    // 添加切換按鈕事件監聽器
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);

    // 添加滾動事件監聽器，使用節流來優化性能
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
});
