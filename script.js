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

// 初始化圖表
let distributionChart = null;
let trendChart = null;

// 當文檔加載完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
});

// 初始化圖表
function initializeCharts() {
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    const trendCtx = document.getElementById('trendChart').getContext('2d');

    // 分布圖配置
    distributionChart = new Chart(distributionCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '數據分布',
                data: [],
                backgroundColor: 'rgba(33, 150, 243, 0.5)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '數據分布分析'
                }
            }
        }
    });

    // 趨勢圖配置
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '趨勢分析',
                data: [],
                fill: false,
                borderColor: 'rgba(25, 118, 210, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '數據趨勢分析'
                }
            }
        }
    });
}

// 設置事件監聽器
function setupEventListeners() {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('csvFile');

    uploadBtn.addEventListener('click', function() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            parseCSV(file);
        } else {
            alert('請選擇一個CSV文件');
        }
    });
}

// 解析CSV文件
function parseCSV(file) {
    Papa.parse(file, {
        complete: function(results) {
            if (results.data && results.data.length > 0) {
                processData(results.data);
            }
        },
        header: true
    });
}

// 處理數據
function processData(data) {
    // 獲取數值型列
    const numericColumns = Object.keys(data[0]).filter(key => {
        return !isNaN(parseFloat(data[0][key]));
    });

    if (numericColumns.length === 0) {
        alert('未找到數值型數據列');
        return;
    }

    // 使用第一個數值型列進行分析
    const targetColumn = numericColumns[0];
    const values = data.map(row => parseFloat(row[targetColumn])).filter(val => !isNaN(val));

    // 計算基本統計信息
    const stats = calculateStats(values);
    displayStats(stats);

    // 更新圖表
    updateCharts(values);
}

// 計算基本統計信息
function calculateStats(values) {
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues[Math.floor(values.length / 2)];
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
        count: values.length,
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        max: max.toFixed(2),
        min: min.toFixed(2)
    };
}

// 顯示統計信息
function displayStats(stats) {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = `
        <div class="row">
            <div class="col">
                <p><strong>數據量：</strong> ${stats.count}</p>
                <p><strong>平均值：</strong> ${stats.mean}</p>
                <p><strong>中位數：</strong> ${stats.median}</p>
                <p><strong>最大值：</strong> ${stats.max}</p>
                <p><strong>最小值：</strong> ${stats.min}</p>
            </div>
        </div>
    `;
}

// 更新圖表
function updateCharts(values) {
    // 更新分布圖
    const bins = calculateHistogramBins(values);
    distributionChart.data.labels = bins.labels;
    distributionChart.data.datasets[0].data = bins.counts;
    distributionChart.update();

    // 更新趨勢圖
    trendChart.data.labels = Array.from({length: values.length}, (_, i) => i + 1);
    trendChart.data.datasets[0].data = values;
    trendChart.update();
}

// 計算直方圖數據
function calculateHistogramBins(values) {
    const binCount = 10;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const labels = [];

    // 創建區間標籤
    for (let i = 0; i < binCount; i++) {
        const start = min + (i * binWidth);
        const end = start + binWidth;
        labels.push(`${start.toFixed(1)}-${end.toFixed(1)}`);
    }

    // 計算每個區間的數量
    values.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
        bins[binIndex]++;
    });

    return {
        labels: labels,
        counts: bins
    };
}
