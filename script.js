document.addEventListener('DOMContentLoaded', function() {
    // 後端 API 網址 (Apps Script 發布的網址)
    const API_URL = 'https://script.google.com/macros/s/AKfycbwCjELScYntx661Zw_1sV8SzR7XrbS1f2myK0TyTCFxP8IMENAgG68JmOgJ3mFoG9E5/exec';
    
    // 資料儲存
    let entries = [];
    let currentSort = 'newest';
    
    // 初始化頁面
    showLoading();
    fetchEntries()
        .then(() => {
            updateStatistics();
            displayEntries();
        })
        .catch(error => {
            showApiMessage('error', '無法載入資料: ' + error.message);
        })
        .finally(() => {
            hideLoading();
            setupMobileOptimizations();
            setupSidebarMenu(); // 初始化側邊欄選單
        });
    
    // 表單提交處理
    document.getElementById('score-form').addEventListener('submit', function(e) {
        // 先阻止默認提交
        e.preventDefault();
        
        // 添加提交動畫
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="spinner-border spinner-border-sm text-light me-2" role="status"></div> 提交中...';
        
        // 添加表單震動效果
        this.classList.add('submitting');
        
        // 延遲執行原始提交邏輯
        setTimeout(() => {
            // 移除動畫類
            this.classList.remove('submitting');
            
            // 獲取表單數據
            const newEntry = {
                id: Date.now(),
                date: new Date().toISOString(),
                year: document.getElementById('year').value,
                school: document.getElementById('school').value,
                department: document.getElementById('department').value || '普通班',
                scores: {
                    chinese: document.getElementById('chinese').value,
                    english: document.getElementById('english').value,
                    math: document.getElementById('math').value,
                    science: document.getElementById('science').value,
                    social: document.getElementById('social').value
                },
                total: document.getElementById('total').value || calculateApproximateScore(),
                comment: document.getElementById('comment').value
            };
            
            // 發送到後端 API
            showLoading();
            
            // 使用JSONP方式處理跨域問題
            const formData = new FormData();
            formData.append('action', 'addEntry');
            formData.append('entry', JSON.stringify(newEntry));
            
            fetch(API_URL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // 使用no-cors模式
            })
                .then(response => {
                    // 由於no-cors模式會返回一個不透明的響應
                    // 我們無法直接讀取response內容，所以直接認為成功了
                    // 向本地數據添加新條目
                    entries.unshift(newEntry);
                    
                    // 更新顯示
                    updateStatistics();
                    displayEntries();
                    
                    // 重置表單
                    document.getElementById('score-form').reset();
                    
                    // 提交成功特效
                    showApiMessage('success', '感謝您的分享！您的錄取資訊已成功提交。');
                    
                    // 若在手機版，滾動到結果區
                    if(window.innerWidth < 768) {
                        document.querySelector('.card.mb-4:last-of-type').scrollIntoView({behavior: 'smooth'});
                    }
                })
                .catch(error => {
                    showApiMessage('error', '提交失敗: ' + error.message);
                })
                .finally(() => {
                    hideLoading();
                    
                    // 恢復按鈕狀態
                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalText;
                    }, 1000);
                });
        }, 800);
    });
    
    // API 相關功能
    // 獲取所有項目
    async function fetchEntries() {
        try {
            const response = await fetch(`${API_URL}?action=getEntries`);
            if (!response.ok) throw new Error('網路回應不正常');
            
            const data = await response.json();
            if (data.success) {
                entries = data.entries;
                return data.entries;
            } else {
                throw new Error(data.message || '獲取資料失敗');
            }
        } catch (error) {
            console.error('獲取資料錯誤:', error);
            throw error;
        }
    }
    
    // 新增項目 - 這個方法不再使用，改用直接fetch
    async function addEntry(entry) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'addEntry',
                    entry: entry
                }),
                mode: 'cors'
            });
            
            if (!response.ok) throw new Error('網路回應不正常');
            
            const data = await response.json();
            if (data.success) {
                return data;
            } else {
                throw new Error(data.message || '新增資料失敗');
            }
        } catch (error) {
            console.error('新增資料錯誤:', error);
            throw error;
        }
    }
    
    // UI 顯示相關功能
    // 顯示/隱藏載入中狀態
    function showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }
    
    function hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
    
    // 顯示 API 相關訊息
    const originalShowApiMessage = function(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} api-alert ${type}`;
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'}-fill me-2"></i>
                <div>${message}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        document.body.appendChild(alertDiv);
        
        // 自動關閉
        setTimeout(() => {
            alertDiv.classList.add('fade');
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    };
    
    function showApiMessage(type, message) {
        originalShowApiMessage(type, message);
        
        // 查找最後添加的提示框
        const alertDiv = document.querySelector('.api-alert:last-child');
        if (alertDiv) {
            // 添加圖標和更美觀的樣式
            const icon = type === 'success' ? 
                '<i class="bi bi-check-circle-fill me-2 fs-4"></i>' : 
                '<i class="bi bi-exclamation-circle-fill me-2 fs-4"></i>';
            
            alertDiv.innerHTML = `
                <div class="d-flex align-items-center p-2">
                    ${icon}
                    <div>${message}</div>
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }
    
    // 搜尋功能
    document.getElementById('search-input').addEventListener('input', function() {
        if (this.value.length >= 1) {
            const keyword = this.value.trim().toLowerCase();
            displayEntries(keyword);
        } else if (this.value.length === 0) {
            displayEntries('');
        }
    });
    
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const keyword = document.getElementById('search-input').value.trim().toLowerCase();
        displayEntries(keyword);
        
        // 若在手機版，滾動到結果區
        if(window.innerWidth < 768) {
            document.querySelector('.card.mb-4:last-of-type').scrollIntoView({behavior: 'smooth'});
        }
    });
    
    // 學校標籤點擊
    document.querySelectorAll('.school-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.getElementById('search-input').value = this.textContent;
            displayEntries(this.textContent.toLowerCase());
            
            // 若在手機版，滾動到結果區
            if(window.innerWidth < 768) {
                document.querySelector('.card.mb-4:last-of-type').scrollIntoView({behavior: 'smooth'});
            }
        });
    });
    
    // 排序選項
    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            currentSort = this.dataset.sort;
            document.getElementById('sort-dropdown').innerHTML = `<i class="bi bi-sort-down me-1"></i>${this.textContent}`;
            displayEntries(document.getElementById('search-input').value.trim().toLowerCase());
        });
    });
    
    // 根據目前設定的排序顯示項目
    const originalDisplayEntries = function(searchKeyword = '') {
        let filteredEntries = entries;
        
        // 搜尋過濾
        if (searchKeyword) {
            filteredEntries = entries.filter(entry => {
                return entry.school.toLowerCase().includes(searchKeyword) || 
                       entry.department.toLowerCase().includes(searchKeyword);
            });
        }
        
        // 排序
        filteredEntries = sortEntries(filteredEntries, currentSort);
        
        // 顯示結果
        const resultsTable = document.getElementById('results-table');
        resultsTable.innerHTML = '';
        
        if (filteredEntries.length === 0) {
            resultsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <div class="d-flex flex-column align-items-center">
                            <i class="bi bi-info-circle mb-3" style="font-size: 2rem; color: #6c757d;"></i>
                            <p class="mb-0">尚無符合條件的資料，請嘗試其他關鍵字或分享你的資訊！</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // 檢查是否需要使用移動版卡片布局
        const useCardView = window.innerWidth < 576 && document.querySelector('.table-responsive').classList.contains('mobile-card-view');
        
        if (useCardView) {
            // 移動版卡片布局
            filteredEntries.forEach(entry => {
                const cardRow = document.createElement('div');
                cardRow.className = 'mobile-row';
                
                // 格式化分數顯示
                const scoreDisplay = Object.entries(entry.scores).map(([subject, grade]) => {
                    const subjectIcons = {
                        chinese: '<i class="bi bi-book"></i>',
                        english: '<i class="bi bi-translate"></i>',
                        math: '<i class="bi bi-calculator"></i>',
                        science: '<i class="bi bi-moisture"></i>',
                        social: '<i class="bi bi-globe"></i>'
                    };
                    
                    return `<span class="score-badge score-${grade}" title="${getSubjectName(subject)}">${subjectIcons[subject]} ${grade}</span>`;
                }).join('');
                
                cardRow.innerHTML = `
                    <div class="mobile-cell">
                        <span class="mobile-label">學校/科系:</span>
                        <div class="fw-bold">${entry.school}</div>
                        <div class="small text-muted">${entry.department}</div>
                    </div>
                    <div class="mobile-cell">
                        <span class="mobile-label">會考成績:</span>
                        <div>${scoreDisplay}</div>
                    </div>
                    <div class="mobile-cell">
                        <span class="mobile-label">總積分:</span>
                        <span class="fw-bold">${entry.total}</span>
                    </div>
                    <div class="mobile-cell">
                        <span class="mobile-label">年份:</span>
                        <span>${entry.year}</span>
                    </div>
                    <div class="mobile-cell">
                        <span class="mobile-label">說明:</span>
                        <span>${entry.comment ? `<i class="bi bi-chat-text me-1"></i>${entry.comment}` : '-'}</span>
                    </div>
                `;
                
                resultsTable.appendChild(cardRow);
                
                // 新增項目的淡入效果
                cardRow.style.opacity = '0';
                cardRow.style.transition = 'opacity 0.5s';
                setTimeout(() => cardRow.style.opacity = '1', 10);
            });
        } else {
            // 桌面版表格布局
            filteredEntries.forEach(entry => {
                const row = document.createElement('tr');
                
                // 格式化分數顯示
                const scoreDisplay = Object.entries(entry.scores).map(([subject, grade]) => {
                    const subjectIcons = {
                        chinese: '<i class="bi bi-book"></i>',
                        english: '<i class="bi bi-translate"></i>',
                        math: '<i class="bi bi-calculator"></i>',
                        science: '<i class="bi bi-moisture"></i>',
                        social: '<i class="bi bi-globe"></i>'
                    };
                    
                    return `<span class="score-badge score-${grade}" title="${getSubjectName(subject)}">${subjectIcons[subject]} ${grade}</span>`;
                }).join('');
                
                row.innerHTML = `
                    <td>
                        <div class="fw-bold">${entry.school}</div>
                        <div class="small text-muted">${entry.department}</div>
                    </td>
                    <td>${scoreDisplay}</td>
                    <td class="fw-bold">${entry.total}</td>
                    <td>${entry.year}</td>
                    <td>${entry.comment ? `<i class="bi bi-chat-text me-1"></i>${entry.comment}` : '-'}</td>
                `;
                
                resultsTable.appendChild(row);
                
                // 新增項目的淡入效果
                row.style.opacity = '0';
                row.style.transition = 'opacity 0.5s';
                setTimeout(() => row.style.opacity = '1', 10);
            });
        }
    };
    
    function displayEntries(searchKeyword = '') {
        originalDisplayEntries(searchKeyword);
        
        // 添加項目進入動畫
        const tableRows = document.querySelectorAll('#results-table tr, #results-table .mobile-row');
        tableRows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = `opacity 0.5s ease, transform 0.5s ease ${index * 0.05}s`;
            
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 50);
        });
    }
    
    function getSubjectName(subject) {
        const subjectNames = {
            chinese: '國文',
            english: '英文',
            math: '數學',
            science: '自然',
            social: '社會'
        };
        return subjectNames[subject] || subject;
    }
    
    // 排序邏輯
    function sortEntries(entries, sortMethod) {
        const sorted = [...entries];
        
        switch (sortMethod) {
            case 'highest':
                return sorted.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
            case 'lowest':
                return sorted.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
            case 'newest':
            default:
                return sorted; // 已按最新排序（新增時放在前面）
        }
    }
    
    // 更新統計資訊
    function updateStatistics() {
        document.getElementById('total-entries').textContent = entries.length;
        
        // 計算最熱門學校
        if (entries.length > 0) {
            const schoolCounts = {};
            entries.forEach(entry => {
                schoolCounts[entry.school] = (schoolCounts[entry.school] || 0) + 1;
            });
            
            let popularSchool = Object.keys(schoolCounts).reduce((a, b) => 
                schoolCounts[a] > schoolCounts[b] ? a : b
            );
            
            document.getElementById('popular-school').textContent = 
                `${popularSchool} (${schoolCounts[popularSchool]}筆)`;
                
            // 生成簡單圖表
            createChart(schoolCounts);
        }
    }
    
    // 使用D3.js繪製簡單統計圖表
    function createChart(schoolCounts) {
        // 使用現有代碼的前5名資料
        const chartData = Object.entries(schoolCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        const svg = d3.select('#stats-chart');
        svg.selectAll('*').remove();
        
        const margin = {top: 30, right: 30, bottom: 70, left: 60};
        const width = svg.node().clientWidth - margin.left - margin.right;
        const height = svg.node().clientHeight - margin.top - margin.bottom;
        
        const x = d3.scaleBand()
            .domain(chartData.map(d => d[0]))
            .range([0, width])
            .padding(0.4);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d[1]) * 1.2])
            .nice()
            .range([height, 0]);
            
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
            
        // 增強圖表背景
        g.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'rgba(255,255,255,0.5)')
            .attr('rx', 10)
            .attr('ry', 10);
        
        // 添加網格線
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-width)
                .tickFormat('')
            )
            .selectAll('line')
            .style('stroke', '#e9ecef')
            .style('stroke-opacity', 0.7)
            .style('stroke-dasharray', '3,3');
            
        // 添加x軸
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .tickSize(0))
            .selectAll('text')
            .attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .style('font-size', '11px')
            .style('font-weight', '500');
        
        // 隱藏x軸線條
        g.select('.domain').style('display', 'none');
        
        // 添加y軸
        g.append('g')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(0))
            .selectAll('text')
            .style('font-size', '11px');
        
        // 隱藏y軸線條
        g.selectAll('.domain').style('display', 'none');
        
        // 使用更美觀的漸變色彩
        const colorScale = d3.scaleSequential()
            .domain([0, chartData.length])
            .interpolator(d3.interpolateRainbow);
        
        // 添加更美觀的柱狀圖
        g.selectAll('.bar')
            .data(chartData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d[0]))
            .attr('y', height)  // 動畫起點
            .attr('width', x.bandwidth())
            .attr('height', 0)  // 動畫起點高度
            .attr('rx', 5)      // 圓角
            .attr('ry', 5)      // 圓角
            .attr('fill', (d, i) => colorScale(i))
            .transition()
            .duration(1200)
            .delay((d, i) => i * 150)
            .ease(d3.easeBounceOut)
            .attr('y', d => y(d[1]))
            .attr('height', d => height - y(d[1]));
        
        // 添加數值標籤
        g.selectAll('.label')
            .data(chartData)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => x(d[0]) + x.bandwidth() / 2)
            .attr('y', d => y(d[1]) - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#495057')
            .style('opacity', 0)  // 初始透明
            .text(d => d[1])
            .transition()
            .duration(800)
            .delay((d, i) => i * 150 + 500)
            .style('opacity', 1);  // 淡入
        
        // 為柱狀圖添加懸停效果
        g.selectAll('.bar-group')
            .data(chartData)
            .enter().append('rect')
            .attr('class', 'bar-hover')
            .attr('x', d => x(d[0]))
            .attr('y', 0)
            .attr('width', x.bandwidth())
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('mouseover', function(event, d) {
                d3.select(this.parentNode).selectAll('.bar')
                    .filter((bar, i) => bar[0] === d[0])
                    .transition()
                    .duration(300)
                    .attr('opacity', 0.8)
                    .attr('y', y => y - 5);
                    
                d3.select(this.parentNode).selectAll('.label')
                    .filter((label, i) => label[0] === d[0])
                    .transition()
                    .duration(300)
                    .attr('y', y => y - 5)
                    .style('font-size', '14px');
            })
            .on('mouseout', function(event, d) {
                d3.select(this.parentNode).selectAll('.bar')
                    .filter((bar, i) => bar[0] === d[0])
                    .transition()
                    .duration(300)
                    .attr('opacity', 1)
                    .attr('y', y => y + 5);
                    
                d3.select(this.parentNode).selectAll('.label')
                    .filter((label, i) => label[0] === d[0])
                    .transition()
                    .duration(300)
                    .attr('y', y => y + 5)
                    .style('font-size', '12px');
            });
        
        // 添加標題
        g.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#495057')
            .text('最熱門分享學校');
    }
    
    // 根據五科成績估算約略總分
    function calculateApproximateScore() {
        const scoreValues = {
            'A++': 7, 'A+': 6, 'A': 5, 'B++': 4, 'B+': 3, 'B': 2, 'C': 1
        };
        
        const chinese = scoreValues[document.getElementById('chinese').value] || 0;
        const english = scoreValues[document.getElementById('english').value] || 0;
        const math = scoreValues[document.getElementById('math').value] || 0;
        const science = scoreValues[document.getElementById('science').value] || 0;
        const social = scoreValues[document.getElementById('social').value] || 0;
        
        // 簡單估算，實際錄取分數計算方式可能更複雜
        const approximateScore = (chinese + english + math + science + social) * 3;
        return approximateScore.toFixed(1);
    }
    
    // 設置移動端優化功能
    function setupMobileOptimizations() {
        // 檢查螢幕寬度，在小螢幕上啟用卡片式顯示
        function checkMobileView() {
            const tableResponsive = document.querySelector('.table-responsive');
            if (window.innerWidth < 576) {
                tableResponsive.classList.add('mobile-card-view');
            } else {
                tableResponsive.classList.remove('mobile-card-view');
            }
            // 重新顯示條目以適應新的佈局
            displayEntries(document.getElementById('search-input').value.trim().toLowerCase());
        }
        
        // 初始檢查
        checkMobileView();
        
        // 視窗大小變化時重新檢查
        window.addEventListener('resize', checkMobileView);
        
        // 新增回到頂部按鈕
        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'floating-btn';
        backToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
        document.body.appendChild(backToTopBtn);
        
        // 監聽滾動事件，顯示/隱藏回到頂部按鈕
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // 手動觸發一次滾動事件檢查
        window.dispatchEvent(new Event('scroll'));
    }
    
    // 設置側邊欄菜單
    function setupSidebarMenu() {
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        const sidebarMenu = document.getElementById('sidebar-menu');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const closeBtn = document.getElementById('close-menu-btn');
        
        // 切換側邊欄顯示狀態
        function toggleSidebar() {
            sidebarMenu.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            document.body.style.overflow = sidebarMenu.classList.contains('active') ? 'hidden' : '';
        }
        
        // 打開側邊欄
        menuToggleBtn.addEventListener('click', toggleSidebar);
        
        // 關閉側邊欄
        closeBtn.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', toggleSidebar);
        
        // 側邊欄菜單項點擊
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                // 如果是錨點鏈接，進行平滑滾動
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    
                    // 關閉側邊欄
                    toggleSidebar();
                    
                    // 滾動到目標區域
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') {
                        // 首頁鏈接 - 滾動到頂部
                        window.scrollTo({top: 0, behavior: 'smooth'});
                    } else {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            // 考慮導航欄高度
                            const navbarHeight = document.querySelector('.navbar').offsetHeight;
                            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 10;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }
                    
                    // 更新活動項目
                    document.querySelectorAll('.sidebar-menu .menu-item').forEach(navItem => {
                        navItem.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        });
        
        // 頁面滾動時更新活動菜單項
        function updateActiveSidebarItem() {
            const sections = ['share-section', 'search-section', 'stats-section', 'results-section'];
            const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            
            // 檢查當前滾動位置
            let currentSection = '';
            sections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    if (window.pageYOffset >= sectionTop - navbarHeight - 50 && 
                        window.pageYOffset < sectionBottom - navbarHeight) {
                        currentSection = sectionId;
                    }
                }
            });
            
            // 更新活動菜單項
            menuItems.forEach(item => {
                item.classList.remove('active');
                const href = item.getAttribute('href');
                if (href === '#' && (currentSection === '' || window.pageYOffset < 100)) {
                    item.classList.add('active');
                } else if (href === `#${currentSection}`) {
                    item.classList.add('active');
                }
            });
        }
        
        // 頁面滾動時更新活動菜單項
        window.addEventListener('scroll', updateActiveSidebarItem);
        
        // 初次加載時執行
        updateActiveSidebarItem();
    }
    
    // 導航欄滾動效果
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scroll');
        } else {
            navbar.classList.remove('navbar-scroll');
        }
    });
    
    // 添加頁面載入動畫
    document.body.classList.add('page-loaded');
    
    // 為分數徽章添加工具提示
    initializeTooltips();
    
    // 滾動動畫效果
    initializeScrollAnimations();
    
    // 設置背景圖案顏色
    setRandomBackgroundPattern();
});

// 初始化Bootstrap工具提示
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // 為分數徽章添加工具提示
    document.querySelectorAll('.score-badge').forEach(badge => {
        new bootstrap.Tooltip(badge);
    });
}

// 設置隨機背景圖案顏色
function setRandomBackgroundPattern() {
    const colors = [
        'rgba(13, 110, 253, 0.03)', // 藍色
        'rgba(25, 135, 84, 0.03)',  // 綠色
        'rgba(255, 193, 7, 0.03)',  // 黃色
        'rgba(102, 16, 242, 0.03)'  // 紫色
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.documentElement.style.setProperty('--pattern-color', randomColor);
}

// 添加滾動動畫效果
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.card, .school-tag, .btn, header h1, header p');
    
    // 檢查元素是否在視口中
    function checkIfInView() {
        const windowHeight = window.innerHeight;
        const windowTopPosition = window.scrollY;
        const windowBottomPosition = windowTopPosition + windowHeight;
        
        animatedElements.forEach(element => {
            const elementHeight = element.offsetHeight;
            const elementTopPosition = element.getBoundingClientRect().top + windowTopPosition;
            const elementBottomPosition = elementTopPosition + elementHeight;
            
            // 元素進入視口
            if (elementBottomPosition >= windowTopPosition && elementTopPosition <= windowBottomPosition) {
                element.classList.add('in-view');
            }
        });
    }
    
    // 監聽滾動事件
    window.addEventListener('scroll', checkIfInView);
    
    // 初始檢查
    checkIfInView();
}