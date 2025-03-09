document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const urlInput = document.getElementById('url-input');
    const submitUrlBtn = document.getElementById('submit-url');
    const resultContainer = document.getElementById('result-container');
    const engineerConsole = document.getElementById('engineer-console');
    const tabPhishing = document.getElementById('tab-phishing');
    const tabWhitelist = document.getElementById('tab-whitelist');
    const tabContentPhishing = document.getElementById('tab-content-phishing');
    const tabContentWhitelist = document.getElementById('tab-content-whitelist');
    const phishingList = document.getElementById('phishing-list');
    const whitelistList = document.getElementById('whitelist-list');
    const addPhishingBtn = document.getElementById('add-phishing-btn');
    const addWhitelistBtn = document.getElementById('add-whitelist-btn');
    const addUrlModal = document.getElementById('add-url-modal');
    const modalTitle = document.getElementById('modal-title');
    const newUrlInput = document.getElementById('new-url-input');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Queue for engineer review
    let engineerReviewQueue = [];
    let currentModalMode = '';
    
    // Initialize theme based on user preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Initial render of URL lists
    renderPhishingList();
    renderWhitelistList();
    
    // Event Listeners
    submitUrlBtn.addEventListener('click', handleUrlSubmit);
    tabPhishing.addEventListener('click', () => switchTab('phishing'));
    tabWhitelist.addEventListener('click', () => switchTab('whitelist'));
    addPhishingBtn.addEventListener('click', () => showAddUrlModal('phishing'));
    addWhitelistBtn.addEventListener('click', () => showAddUrlModal('whitelist'));
    modalCancel.addEventListener('click', hideAddUrlModal);
    modalConfirm.addEventListener('click', handleAddUrl);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Allow Enter key to submit URL
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUrlSubmit();
        }
    });
    
    // Handle URL checking process
    async function handleUrlSubmit() {
        const url = urlInput.value.trim();
        if (!url) {
            showMessage('请输入有效的URL', 'error');
            return;
        }
        
        // Show loading state
        showUrlLoading();
        
        // DNS filter check phase
        setTimeout(async () => {
            // Step 1: Check against phishing database
            if (checkIfPhishing(url)) {
                showUrlResult(url, 'blocked', '已拦截', '该URL已被识别为钓鱼链接');
                return;
            }
            
            // Step 2: Check against whitelist
            if (checkIfWhitelisted(url)) {
                showUrlResult(url, 'allowed', '已通过', '该URL在白名单中，已允许访问');
                return;
            }
            
            // Step 3: AI scoring
            showAiScoringProcess();
            const score = await aiScoreUrl(url);
            
            // Interpret AI score
            if (score <= 30) {
                showUrlResult(url, 'allowed', '已通过', `AI评分: ${score}/100，风险较低，已允许访问`);
            } else if (score <= 70) {
                // Medium risk - send to engineer review
                addToEngineerReview(url, score);
                showUrlResult(url, 'pending', '安全工程师审核中', `AI评分: ${score}/100，已提交安全工程师审核`);
            } else {
                // High risk - block and add to phishing list
                addToPhishingList(url);
                renderPhishingList();
                showUrlResult(url, 'blocked', '已拦截', `AI评分: ${score}/100，风险过高，已自动拦截`);
            }
        }, 1000);
    }
    
    // Display functions
    function showUrlLoading() {
        resultContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin text-blue-500">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                <div class="text-center">
                    <p class="font-medium">正在检查URL安全性</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">检查中，请稍候...</p>
                </div>
            </div>
        `;
    }
    
    function showAiScoringProcess() {
        resultContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin text-blue-500">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                </svg>
                <div class="text-center">
                    <p class="font-medium">AI安全评分系统分析中</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">对URL进行风险评估...</p>
                </div>
            </div>
        `;
    }
    
    function showUrlResult(url, status, statusText, message) {
        let statusClass = '';
        let icon = '';
        
        switch (status) {
            case 'blocked':
                statusClass = 'status-blocked';
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" x2="9" y1="9" y2="15"></line>
                    <line x1="9" x2="15" y1="9" y2="15"></line>
                </svg>`;
                break;
            case 'allowed':
                statusClass = 'status-allowed';
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>`;
                break;
            case 'pending':
                statusClass = 'status-pending';
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>`;
                break;
        }
        
        resultContainer.innerHTML = `
            <div class="w-full">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-medium">检测结果</h3>
                    <span class="${statusClass} status-indicator">${statusText}</span>
                </div>
                
                <div class="p-4 border border-gray-100 dark:border-gray-800 rounded-lg mb-4">
                    <div class="flex items-start space-x-3">
                        ${icon}
                        <div>
                            <p class="font-medium break-all">${url}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${message}</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <h4 class="text-sm font-medium">检测流程</h4>
                    <div class="space-y-4 pl-2">
                        <div class="process-step pl-8 relative">
                            <div class="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <span class="text-xs">1</span>
                            </div>
                            <p class="font-medium">DNS过滤检查</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">与已知的钓鱼链接数据库进行对比</p>
                        </div>
                        
                        <div class="process-step pl-8 relative">
                            <div class="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <span class="text-xs">2</span>
                            </div>
                            <p class="font-medium">白名单验证</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">检查URL是否在企业白名单中</p>
                        </div>
                        
                        <div class="process-step pl-8 relative">
                            <div class="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <span class="text-xs">3</span>
                            </div>
                            <p class="font-medium">AI风险评分</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">使用AI技术分析URL的风险程度</p>
                        </div>
                        
                        <div class="process-step pl-8 relative">
                            <div class="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <span class="text-xs">4</span>
                            </div>
                            <p class="font-medium">安全工程师审核</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">中等风险的URL由安全工程师人工审核</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showMessage(message, type = 'info') {
        const alertElement = document.createElement('div');
        alertElement.className = `fixed top-4 right-4 p-4 rounded-lg shadow-md z-50 ${
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`;
        alertElement.textContent = message;
        
        document.body.appendChild(alertElement);
        
        setTimeout(() => {
            alertElement.classList.add('opacity-0', 'transition-opacity');
            setTimeout(() => {
                document.body.removeChild(alertElement);
            }, 300);
        }, 3000);
    }
    
    // Engineer review functions
    function addToEngineerReview(url, score) {
        engineerReviewQueue.push({ url, score });
        renderEngineerConsole();
    }
    
    function renderEngineerConsole() {
        if (engineerReviewQueue.length === 0) {
            engineerConsole.innerHTML = `
                <p class="text-gray-500 dark:text-gray-400 text-center font-geist-mono">无待审核的URL</p>
            `;
            return;
        }
        
        const currentReview = engineerReviewQueue[0];
        engineerConsole.innerHTML = `
            <div class="w-full">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-medium">待审核URL</h4>
                    <span class="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded text-xs">风险评分: ${currentReview.score}/100</span>
                </div>
                <p class="font-geist-mono text-sm break-all mb-4">${currentReview.url}</p>
                <div class="flex space-x-2 justify-end">
                    <button id="reject-url" class="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                        拒绝访问
                    </button>
                    <button id="approve-url" class="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                        允许访问
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to the buttons
        document.getElementById('reject-url').addEventListener('click', () => handleEngineerReview(false));
        document.getElementById('approve-url').addEventListener('click', () => handleEngineerReview(true));
    }
    
    function handleEngineerReview(approved) {
        if (engineerReviewQueue.length === 0) return;
        
        const { url } = engineerReviewQueue.shift();
        
        if (approved) {
            addToWhitelist(url);
            renderWhitelistList();
            showMessage(`已将 ${url} 添加到白名单`, 'info');
        } else {
            addToPhishingList(url);
            renderPhishingList();
            showMessage(`已将 ${url} 添加到钓鱼链接库`, 'info');
        }
        
        renderEngineerConsole();
    }
    
    // Tab functions
    function switchTab(tab) {
        if (tab === 'phishing') {
            tabPhishing.classList.add('active');
            tabWhitelist.classList.remove('active');
            tabContentPhishing.classList.remove('hidden');
            tabContentWhitelist.classList.add('hidden');
        } else {
            tabPhishing.classList.remove('active');
            tabWhitelist.classList.add('active');
            tabContentPhishing.classList.add('hidden');
            tabContentWhitelist.classList.remove('hidden');
        }
    }
    
    // Modal functions
    function showAddUrlModal(type) {
        currentModalMode = type;
        modalTitle.textContent = type === 'phishing' ? '添加钓鱼URL' : '添加白名单URL';
        addUrlModal.classList.remove('hidden');
        newUrlInput.focus();
    }
    
    function hideAddUrlModal() {
        addUrlModal.classList.add('hidden');
        newUrlInput.value = '';
    }
    
    function handleAddUrl() {
        const url = newUrlInput.value.trim();
        if (!url) {
            showMessage('请输入有效的URL', 'error');
            return;
        }
        
        let success = false;
        if (currentModalMode === 'phishing') {
            success = addToPhishingList(url);
            if (success) {
                renderPhishingList();
                showMessage(`已将 ${url} 添加到钓鱼链接库`, 'info');
            } else {
                showMessage(`${url} 已存在于钓鱼链接库中`, 'error');
            }
        } else {
            success = addToWhitelist(url);
            if (success) {
                renderWhitelistList();
                showMessage(`已将 ${url} 添加到白名单`, 'info');
            } else {
                showMessage(`${url} 已存在于白名单中`, 'error');
            }
        }
        
        hideAddUrlModal();
    }
    
    // Database management functions
    function renderPhishingList() {
        phishingList.innerHTML = '';
        
        if (phishingUrls.length === 0) {
            phishingList.innerHTML = `<li class="text-gray-500 dark:text-gray-400 text-center py-2">暂无钓鱼链接</li>`;
            return;
        }
        
        phishingUrls.forEach(url => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800';
            li.innerHTML = `
                <span class="truncate">${url}</span>
                <button class="delete-url text-red-500 hover:text-red-600" data-url="${url}" data-type="phishing">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            phishingList.appendChild(li);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-url[data-type="phishing"]').forEach(btn => {
            btn.addEventListener('click', handleDeleteUrl);
        });
    }
    
    function renderWhitelistList() {
        whitelistList.innerHTML = '';
        
        if (whitelistUrls.length === 0) {
            whitelistList.innerHTML = `<li class="text-gray-500 dark:text-gray-400 text-center py-2">暂无白名单链接</li>`;
            return;
        }
        
        whitelistUrls.forEach(url => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800';
            li.innerHTML = `
                <span class="truncate">${url}</span>
                <button class="delete-url text-red-500 hover:text-red-600" data-url="${url}" data-type="whitelist">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            whitelistList.appendChild(li);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-url[data-type="whitelist"]').forEach(btn => {
            btn.addEventListener('click', handleDeleteUrl);
        });
    }
    
    function handleDeleteUrl(e) {
        const url = e.currentTarget.dataset.url;
        const type = e.currentTarget.dataset.type;
        
        let success = false;
        if (type === 'phishing') {
            success = removeFromPhishingList(url);
            if (success) {
                renderPhishingList();
                showMessage(`已从钓鱼链接库中移除 ${url}`, 'info');
            }
        } else {
            success = removeFromWhitelist(url);
            if (success) {
                renderWhitelistList();
                showMessage(`已从白名单中移除 ${url}`, 'info');
            }
        }
    }
    
    // Theme toggling
    function toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }
});
