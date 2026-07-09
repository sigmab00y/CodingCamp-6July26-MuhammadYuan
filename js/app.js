let users = JSON.parse(localStorage.getItem('sigmauang_users')) || [];
let currentUser = localStorage.getItem('sigmauang_current_user') || null;

let transactions = [];
let customCategories = [];
let budgetLimit = 0;
let currentTheme = localStorage.getItem('theme') || 'light';
let expenseChart;
let currentTrxType = 'expense';

const defaultCategories = ['Food', 'Transport', 'Fun'];

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toRegisterLink = document.getElementById('to-register');
const toLoginLink = document.getElementById('to-login');
const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');
const authMascotSpeech = document.getElementById('auth-mascot-speech');
const authMascotCharacter = document.querySelector('.auth-mascot-character');

const balanceEl = document.getElementById('total-balance');
const monthlyTotalEl = document.getElementById('monthly-total');
const currentMonthEl = document.getElementById('current-month');
const limitBadge = document.getElementById('limit-badge');
const balanceCard = document.querySelector('.balance-card');
const budgetLimitInput = document.getElementById('budget-limit');
const mascotSpeech = document.getElementById('mascot-speech');
const mascotCharacterElement = document.querySelector('.mascot-character');
const form = document.getElementById('transaction-form');

const tabExpense = document.getElementById('tab-expense');
const tabIncome = document.getElementById('tab-income');

const categorySelect = document.getElementById('category');
const customCategoryGroup = document.getElementById('custom-category-group');
const customCategoryInput = document.getElementById('custom-category-input');
const btnSaveCategory = document.getElementById('btn-save-category');
const list = document.getElementById('transaction-list');
const sortBySelect = document.getElementById('sort-by');
const themeToggleBtn = document.getElementById('theme-toggle');

const formatIDR = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

const triggerAuthMascotTalk = (text) => {
    authMascotSpeech.innerHTML = text;
    authMascotCharacter.classList.add('talking');
    setTimeout(() => {
        authMascotCharacter.classList.remove('talking');
    }, 2000);
};

toRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    triggerAuthMascotTalk("Yuk buat akun baru! Masukkan username unik dan password yang aman ya Bos.");
});

toLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    triggerAuthMascotTalk("Silakan masukkan username dan password akun SigmaUang-mu untuk melanjutkan.");
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    if(users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        triggerAuthMascotTalk("❌ Waduh, <b>username sudah dipakai</b> orang lain. Coba cari nama unik yang lain ya!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem('sigmauang_users', JSON.stringify(users));
    alert('Akun berhasil dibuat! Silakan masuk.');
    registerForm.reset();
    toLoginLink.click();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if(!user) {
        triggerAuthMascotTalk("⚠️ <b>Akses ditolak!</b> Username atau password yang kamu masukkan salah nih, Bos.");
        return;
    }

    currentUser = user.username;
    localStorage.setItem('sigmauang_current_user', currentUser);
    loginForm.reset();
    authMascotSpeech.innerHTML = "Halo Bos! Selamat datang di SigmaUang. Silakan masuk ke akunmu terlebih dahulu ya!";
    loadDashboard();
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('sigmauang_current_user');
    appScreen.style.display = 'none';
    authScreen.style.display = 'flex';
});

const loadDashboard = () => {
    authScreen.style.display = 'none';
    appScreen.style.display = 'block';
    userDisplay.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser}`;

    transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser}`)) || [];
    customCategories = JSON.parse(localStorage.getItem(`customCategories_${currentUser}`)) || [];
    budgetLimit = localStorage.getItem(`budgetLimit_${currentUser}`) || 0;

    setMonthName();
    budgetLimitInput.value = budgetLimit > 0 ? budgetLimit : '';
    
    currentTrxType = 'expense';
    tabExpense.classList.add('active-expense');
    tabIncome.classList.remove('active-income');
    
    renderCategories();
    renderList();
    updateValues();
    
    setTimeout(() => {
        mascotUpdateSpeech();
    }, 800);
};

const generateConclusionReport = (actionContext = "") => {
    if (transactions.length === 0) {
        return `Halo Bos <b>${currentUser}</b>! Laporan masih kosong nih. Yuk, catat transaksi pertamamu sekarang!`;
    }

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const allCats = [...defaultCategories, ...customCategories];
    const totals = {};
    allCats.forEach(c => totals[c] = 0);
    expenseTransactions.forEach(t => {
        if (totals.hasOwnProperty(t.category)) totals[t.category] += Number(t.amount);
    });

    let mostExpensiveCategory = "";
    let maxSpend = 0;
    allCats.forEach(c => {
        if (totals[c] > maxSpend) {
            maxSpend = totals[c];
            mostExpensiveCategory = c;
        }
    });

    const currentMonthNum = new Date().getMonth();
    const currentYearNum = new Date().getFullYear();
    const monthlyExpense = expenseTransactions
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum;
        })
        .reduce((acc, item) => acc + Number(item.amount), 0);

    const limit = Number(budgetLimit);
    let limitAnalysis = "";
    if (limit > 0) {
        if (monthlyExpense > limit) {
            limitAnalysis = ` 🚨 GAWAT! Belanja bulananmu jebol sebesar ${formatIDR(monthlyExpense - limit)}!`;
        } else {
            limitAnalysis = ` Sisa kuota aman belanja bulan ini ada ${formatIDR(limit - monthlyExpense)}.`;
        }
    } else {
        limitAnalysis = " Kamu belum pasang target limit budget belanja bulanan nih.";
    }

    let contextPrefix = "";
    if (actionContext === "add") contextPrefix = "Transaksi baru berhasil disimpan! ";
    if (actionContext === "delete") contextPrefix = "Transaksi sukses dihapus! ";

    let reportOutput = `${contextPrefix}Total pengeluaran bulananmu <b>${formatIDR(monthlyExpense)}</b>. `;
    if (maxSpend > 0) {
        reportOutput += `Dana paling banyak habis di <b>${mostExpensiveCategory}</b> (${formatIDR(maxSpend)}).`;
    }
    reportOutput += limitAnalysis;

    return reportOutput;
};

const mascotUpdateSpeech = (actionContext = "") => {
    mascotCharacterElement.classList.add('talking');
    mascotSpeech.innerHTML = generateConclusionReport(actionContext);
    setTimeout(() => { mascotCharacterElement.classList.remove('talking'); }, 2500);
};

const setMonthName = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    currentMonthEl.textContent = months[new Date().getMonth()];
};

const renderCategories = () => {
    categorySelect.innerHTML = '';
    
    if (currentTrxType === 'income') {
        const optIncome = document.createElement('option');
        optIncome.value = 'Income'; optIncome.textContent = 'Income';
        categorySelect.appendChild(optIncome);
        customCategoryGroup.style.display = 'none';
        return;
    }

    const allCategories = [...defaultCategories, ...customCategories];
    allCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat; opt.textContent = cat;
        categorySelect.appendChild(opt);
    });
    const optCustom = document.createElement('option');
    optCustom.value = 'TRIGGER_CUSTOM'; optCustom.textContent = '➕ Tambah Kategori...';
    categorySelect.appendChild(optCustom);
};

tabExpense.addEventListener('click', () => {
    currentTrxType = 'expense';
    tabExpense.classList.add('active-expense');
    tabIncome.classList.remove('active-income');
    renderCategories();
});

tabIncome.addEventListener('click', () => {
    currentTrxType = 'income';
    tabIncome.classList.add('active-income');
    tabExpense.classList.remove('active-expense');
    renderCategories();
});

categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'TRIGGER_CUSTOM') {
        customCategoryGroup.style.display = 'block';
        customCategoryInput.focus();
    } else {
        customCategoryGroup.style.display = 'none';
    }
});

btnSaveCategory.addEventListener('click', () => {
    const newCat = customCategoryInput.value.trim();
    if (!newCat) return;
    customCategories.push(newCat);
    localStorage.setItem(`customCategories_${currentUser}`, JSON.stringify(customCategories));
    renderCategories();
    categorySelect.value = newCat;
    customCategoryGroup.style.display = 'none';
    customCategoryInput.value = '';
    mascotUpdateSpeech();
});

const updateChart = () => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const allCats = [...defaultCategories, ...customCategories];
    const totals = {};
    allCats.forEach(c => totals[c] = 0);
    expenseTransactions.forEach(t => {
        if (totals.hasOwnProperty(t.category)) totals[t.category] += Number(t.amount);
    });

    const colors = ['#ff9f43', '#54a0ff', '#5f27cd', '#ff6b6b', '#1dd1a1', '#feca57', '#48dbfb', '#10ac84'];
    const chartColors = allCats.map((_, index) => colors[index % colors.length]);

    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: allCats,
            datasets: [{ data: allCats.map(c => totals[c]), backgroundColor: chartColors, borderWidth: 1 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: currentTheme === 'dark' ? '#fff' : '#333' } } }
        }
    });
};

const checkBudgetLimit = (currentMonthlySpend) => {
    const limit = Number(budgetLimit);
    if (limit > 0 && currentMonthlySpend > limit) {
        limitBadge.textContent = `OVER ${formatIDR(currentMonthlySpend - limit)}`;
        limitBadge.className = 'badge-over';
        balanceCard.classList.add('overbudget');
    } else {
        limitBadge.textContent = limit > 0 ? 'Aman (Di bawah Limit)' : 'Limit Belum Diatur';
        limitBadge.className = 'badge-safe';
        balanceCard.classList.remove('overbudget');
    }
};

budgetLimitInput.addEventListener('input', (e) => {
    budgetLimit = e.target.value;
    localStorage.setItem(`budgetLimit_${currentUser}`, budgetLimit);
    updateValues();
    mascotUpdateSpeech();
});

const updateValues = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, item) => acc + Number(item.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, item) => acc + Number(item.amount), 0);
    
    const totalBalance = totalIncome - totalExpense;
    balanceEl.textContent = formatIDR(totalBalance);

    const currentMonthNum = new Date().getMonth();
    const currentYearNum = new Date().getFullYear();
    const monthlyExpense = transactions
        .filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum;
        })
        .reduce((acc, item) => acc + Number(item.amount), 0);
        
    monthlyTotalEl.textContent = formatIDR(monthlyExpense);
    checkBudgetLimit(monthlyExpense);

    localStorage.setItem(`transactions_${currentUser}`, JSON.stringify(transactions));
    updateChart();
};

const renderList = () => {
    list.innerHTML = '';
    const sortBy = sortBySelect.value;
    let sortedTransactions = [...transactions];

    if (sortBy === 'amount-high') sortedTransactions.sort((a, b) => b.amount - a.amount);
    else if (sortBy === 'amount-low') sortedTransactions.sort((a, b) => a.amount - b.amount);
    else if (sortBy === 'category') sortedTransactions.sort((a, b) => a.category.localeCompare(b.category));
    else sortedTransactions.sort((a, b) => b.id - a.id);

    sortedTransactions.forEach(t => {
        const li = document.createElement('li');
        li.classList.add('transaction-item');
        
        let tagClass = 'tag-custom';
        if (t.type === 'income') tagClass = 'tag-income';
        else if (defaultCategories.includes(t.category)) tagClass = `tag-${t.category.toLowerCase()}`;

        const prefix = t.type === 'income' ? '+' : '-';
        const colorClass = t.type === 'income' ? 'text-success' : 'text-danger';

        li.innerHTML = `
            <div class="item-info">
                <h4>${t.name}</h4>
                <span class="${tagClass}">${t.category}</span>
            </div>
            <div class="item-right">
                <span class="item-amount ${colorClass}">${prefix} ${formatIDR(t.amount)}</span>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})"><i class="fas fa-trash-can"></i></button>
            </div>
        `;
        list.appendChild(li);
    });
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const typeInput = currentTrxType;
    const nameInput = document.getElementById('item-name').value.trim();
    const amountInput = document.getElementById('amount').value;
    const categoryInput = categorySelect.value;

    const newTransaction = {
        id: Date.now(),
        type: typeInput,
        name: nameInput,
        amount: Number(amountInput),
        category: categoryInput,
        date: new Date().toISOString()
    };

    transactions.push(newTransaction);
    form.reset();
    customCategoryGroup.style.display = 'none';
    
    currentTrxType = 'expense';
    tabExpense.classList.add('active-expense');
    tabIncome.classList.remove('active-income');
    
    renderCategories();
    updateValues();
    renderList();
    mascotUpdateSpeech("add");
});

window.deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    updateValues();
    renderList();
    mascotUpdateSpeech("delete");
};

const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme = theme;
    themeToggleBtn.innerHTML = theme === 'dark' ? `<i class="fas fa-sun"></i> Light` : `<i class="fas fa-moon"></i> Dark`;
    if (expenseChart) updateChart(); 
};

themeToggleBtn.addEventListener('click', () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

sortBySelect.addEventListener('change', renderList);

const init = () => {
    setTheme(currentTheme);
    if (currentUser) {
        loadDashboard();
    } else {
        authScreen.style.display = 'flex';
        appScreen.style.display = 'none';
    }
};

init();