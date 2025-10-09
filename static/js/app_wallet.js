// 家計簿アプリ - 完全実装版
class WalletApp {
    constructor() {
        this.db = null;
        this.initDB();
        this.transactions = [];
        this.categories = {
            income: ['給料', '副業', '投資収益', 'その他収入'],
            expense: ['食費', '住居費', '光熱費', '通信費', '交通費', '医療費', '教育費', '娯楽費', '衣服費', 'その他']
        };
        this.budgets = {};
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('UnloqWallet', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Transactions store
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    transactionStore.createIndex('date', 'date', { unique: false });
                    transactionStore.createIndex('category', 'category', { unique: false });
                    transactionStore.createIndex('type', 'type', { unique: false });
                }

                // Budgets store
                if (!db.objectStoreNames.contains('budgets')) {
                    db.createObjectStore('budgets', { keyPath: 'category' });
                }

                // Recurring transactions
                if (!db.objectStoreNames.contains('recurring')) {
                    const recurringStore = db.createObjectStore('recurring', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    recurringStore.createIndex('nextDate', 'nextDate', { unique: false });
                }
            };
        });
    }

    async addTransaction(transaction) {
        const tx = this.db.transaction(['transactions'], 'readwrite');
        const store = tx.objectStore('transactions');

        const data = {
            ...transaction,
            timestamp: new Date().toISOString(),
            date: transaction.date || new Date().toISOString().split('T')[0]
        };

        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => {
                this.notifyAI(data);
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getTransactions(filter = {}) {
        const tx = this.db.transaction(['transactions'], 'readonly');
        const store = tx.objectStore('transactions');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                let transactions = request.result;

                // Apply filters
                if (filter.startDate) {
                    transactions = transactions.filter(t => t.date >= filter.startDate);
                }
                if (filter.endDate) {
                    transactions = transactions.filter(t => t.date <= filter.endDate);
                }
                if (filter.category) {
                    transactions = transactions.filter(t => t.category === filter.category);
                }
                if (filter.type) {
                    transactions = transactions.filter(t => t.type === filter.type);
                }

                resolve(transactions);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getMonthlyReport(year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        const transactions = await this.getTransactions({ startDate, endDate });

        const report = {
            income: 0,
            expense: 0,
            balance: 0,
            byCategory: {},
            daily: {},
            transactions: transactions
        };

        transactions.forEach(t => {
            if (t.type === 'income') {
                report.income += t.amount;
            } else {
                report.expense += t.amount;
            }

            // By category
            if (!report.byCategory[t.category]) {
                report.byCategory[t.category] = { total: 0, count: 0, transactions: [] };
            }
            report.byCategory[t.category].total += t.amount;
            report.byCategory[t.category].count++;
            report.byCategory[t.category].transactions.push(t);

            // Daily
            if (!report.daily[t.date]) {
                report.daily[t.date] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                report.daily[t.date].income += t.amount;
            } else {
                report.daily[t.date].expense += t.amount;
            }
        });

        report.balance = report.income - report.expense;

        // Add AI insights
        report.insights = await this.generateInsights(report);

        return report;
    }

    async setBudget(category, amount) {
        const tx = this.db.transaction(['budgets'], 'readwrite');
        const store = tx.objectStore('budgets');

        return new Promise((resolve, reject) => {
            const request = store.put({ category, amount, createdAt: new Date().toISOString() });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async checkBudgetStatus() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const report = await this.getMonthlyReport(year, month);
        const budgets = await this.getAllBudgets();

        const status = [];

        for (const budget of budgets) {
            const spent = report.byCategory[budget.category]?.total || 0;
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;

            status.push({
                category: budget.category,
                budget: budget.amount,
                spent,
                remaining,
                percentage,
                status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
            });
        }

        return status;
    }

    async getAllBudgets() {
        const tx = this.db.transaction(['budgets'], 'readonly');
        const store = tx.objectStore('budgets');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addRecurringTransaction(transaction) {
        const tx = this.db.transaction(['recurring'], 'readwrite');
        const store = tx.objectStore('recurring');

        const data = {
            ...transaction,
            nextDate: transaction.startDate || new Date().toISOString().split('T')[0],
            frequency: transaction.frequency || 'monthly', // daily, weekly, monthly, yearly
            active: true
        };

        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async processRecurringTransactions() {
        const tx = this.db.transaction(['recurring'], 'readonly');
        const store = tx.objectStore('recurring');
        const index = store.index('nextDate');

        const today = new Date().toISOString().split('T')[0];
        const range = IDBKeyRange.upperBound(today);

        return new Promise((resolve, reject) => {
            const request = index.getAll(range);
            request.onsuccess = async () => {
                const recurring = request.result.filter(r => r.active);

                for (const r of recurring) {
                    // Add transaction
                    await this.addTransaction({
                        type: r.type,
                        category: r.category,
                        amount: r.amount,
                        description: r.description + ' (定期)',
                        date: r.nextDate
                    });

                    // Update next date
                    await this.updateNextDate(r.id, r.frequency);
                }

                resolve(recurring.length);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateNextDate(id, frequency) {
        const tx = this.db.transaction(['recurring'], 'readwrite');
        const store = tx.objectStore('recurring');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const recurring = getRequest.result;
                const currentDate = new Date(recurring.nextDate);

                switch (frequency) {
                    case 'daily':
                        currentDate.setDate(currentDate.getDate() + 1);
                        break;
                    case 'weekly':
                        currentDate.setDate(currentDate.getDate() + 7);
                        break;
                    case 'monthly':
                        currentDate.setMonth(currentDate.getMonth() + 1);
                        break;
                    case 'yearly':
                        currentDate.setFullYear(currentDate.getFullYear() + 1);
                        break;
                }

                recurring.nextDate = currentDate.toISOString().split('T')[0];

                const updateRequest = store.put(recurring);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async generateInsights(report) {
        const insights = [];

        // 支出が多いカテゴリ
        const topExpenses = Object.entries(report.byCategory)
            .filter(([_, data]) => data.total > 0)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 3);

        if (topExpenses.length > 0) {
            insights.push({
                type: 'top_expense',
                title: '支出TOP3',
                description: `今月は${topExpenses[0][0]}に¥${topExpenses[0][1].total.toLocaleString()}使っています`,
                action: '詳細を見る'
            });
        }

        // 予算オーバー
        const budgetStatus = await this.checkBudgetStatus();
        const overBudget = budgetStatus.filter(b => b.status === 'over');

        if (overBudget.length > 0) {
            insights.push({
                type: 'budget_alert',
                title: '予算オーバー',
                description: `${overBudget.length}個のカテゴリが予算を超えています`,
                action: '確認する',
                priority: 'high'
            });
        }

        // 節約提案
        if (report.expense > report.income) {
            insights.push({
                type: 'saving_tip',
                title: '収支改善のヒント',
                description: '今月は支出が収入を上回っています。固定費の見直しをお勧めします',
                action: 'アドバイスを見る',
                priority: 'medium'
            });
        }

        // 前月比較
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthReport = await this.getMonthlyReport(
            lastMonth.getFullYear(),
            lastMonth.getMonth() + 1
        );

        const expenseChange = ((report.expense - lastMonthReport.expense) / lastMonthReport.expense * 100).toFixed(1);

        insights.push({
            type: 'comparison',
            title: '前月比較',
            description: `支出は前月比${expenseChange > 0 ? '+' : ''}${expenseChange}%`,
            trend: expenseChange > 0 ? 'up' : 'down'
        });

        return insights;
    }

    async exportData(format = 'json') {
        const transactions = await this.getTransactions();
        const budgets = await this.getAllBudgets();

        const data = {
            transactions,
            budgets,
            exportDate: new Date().toISOString()
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            let csv = 'Date,Type,Category,Amount,Description\n';
            transactions.forEach(t => {
                csv += `${t.date},${t.type},${t.category},${t.amount},"${t.description || ''}"\n`;
            });
            return csv;
        }
    }

    async importData(dataString, format = 'json') {
        try {
            let data;

            if (format === 'json') {
                data = JSON.parse(dataString);

                // Import transactions
                for (const transaction of data.transactions) {
                    await this.addTransaction(transaction);
                }

                // Import budgets
                for (const budget of data.budgets) {
                    await this.setBudget(budget.category, budget.amount);
                }
            } else if (format === 'csv') {
                const lines = dataString.split('\n');
                const headers = lines[0].split(',');

                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i]) continue;

                    const values = lines[i].split(',');
                    const transaction = {
                        date: values[0],
                        type: values[1],
                        category: values[2],
                        amount: parseFloat(values[3]),
                        description: values[4]?.replace(/"/g, '')
                    };

                    await this.addTransaction(transaction);
                }
            }

            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }

    notifyAI(transaction) {
        // AIに取引を通知して分析
        if (window.unloqAI) {
            window.unloqAI.analyzeTransaction(transaction);
        }
    }

    async getFinancialHealth() {
        const now = new Date();
        const report = await this.getMonthlyReport(now.getFullYear(), now.getMonth() + 1);
        const budgetStatus = await this.checkBudgetStatus();

        let score = 100;

        // 収支バランス
        if (report.expense > report.income) {
            score -= 20;
        }

        // 予算遵守
        const overBudgetCount = budgetStatus.filter(b => b.status === 'over').length;
        score -= overBudgetCount * 10;

        // 貯蓄率
        const savingRate = ((report.income - report.expense) / report.income) * 100;
        if (savingRate < 10) score -= 15;
        else if (savingRate > 30) score += 10;

        return {
            score: Math.max(0, Math.min(100, score)),
            savingRate,
            budgetCompliance: ((budgetStatus.length - overBudgetCount) / budgetStatus.length) * 100,
            recommendation: score < 50 ? '財務状況の改善が必要です' : score < 80 ? '良好ですが、改善の余地があります' : '素晴らしい財務状況です！'
        };
    }
}

// Export for use in other modules
window.WalletApp = WalletApp;