// 投資ポートフォリオ管理アプリ - 完全実装版
class InvestmentApp {
    constructor() {
        this.db = null;
        this.initDB();
        this.portfolio = [];
        this.marketData = {};
        this.updateInterval = null;
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('UnloqInvestment', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                this.startMarketUpdates();
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Portfolio holdings
                if (!db.objectStoreNames.contains('holdings')) {
                    const holdingsStore = db.createObjectStore('holdings', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    holdingsStore.createIndex('symbol', 'symbol', { unique: false });
                    holdingsStore.createIndex('type', 'type', { unique: false });
                }

                // Transaction history
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    transactionStore.createIndex('date', 'date', { unique: false });
                    transactionStore.createIndex('symbol', 'symbol', { unique: false });
                }

                // Watchlist
                if (!db.objectStoreNames.contains('watchlist')) {
                    db.createObjectStore('watchlist', { keyPath: 'symbol' });
                }

                // Goals
                if (!db.objectStoreNames.contains('goals')) {
                    db.createObjectStore('goals', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                }
            };
        });
    }

    async addHolding(holding) {
        const tx = this.db.transaction(['holdings', 'transactions'], 'readwrite');
        const holdingsStore = tx.objectStore('holdings');
        const transactionsStore = tx.objectStore('transactions');

        // Check if holding exists
        const existingHoldings = await this.getHoldingBySymbol(holding.symbol);

        if (existingHoldings.length > 0) {
            // Update existing holding
            const existing = existingHoldings[0];
            existing.shares += holding.shares;
            existing.averageCost = ((existing.averageCost * (existing.shares - holding.shares)) +
                                   (holding.purchasePrice * holding.shares)) / existing.shares;

            return new Promise((resolve, reject) => {
                const request = holdingsStore.put(existing);
                request.onsuccess = () => {
                    // Record transaction
                    this.recordTransaction({
                        type: 'buy',
                        symbol: holding.symbol,
                        shares: holding.shares,
                        price: holding.purchasePrice,
                        date: new Date().toISOString()
                    });
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } else {
            // Add new holding
            const data = {
                ...holding,
                averageCost: holding.purchasePrice,
                addedDate: new Date().toISOString()
            };

            return new Promise((resolve, reject) => {
                const request = holdingsStore.add(data);
                request.onsuccess = () => {
                    // Record transaction
                    this.recordTransaction({
                        type: 'buy',
                        symbol: holding.symbol,
                        shares: holding.shares,
                        price: holding.purchasePrice,
                        date: new Date().toISOString()
                    });
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        }
    }

    async getHoldingBySymbol(symbol) {
        const tx = this.db.transaction(['holdings'], 'readonly');
        const store = tx.objectStore('holdings');
        const index = store.index('symbol');

        return new Promise((resolve, reject) => {
            const request = index.getAll(symbol);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async sellHolding(symbol, shares, price) {
        const holdings = await this.getHoldingBySymbol(symbol);

        if (holdings.length === 0) {
            throw new Error('保有していない銘柄です');
        }

        const holding = holdings[0];

        if (holding.shares < shares) {
            throw new Error('売却数量が保有数量を超えています');
        }

        const tx = this.db.transaction(['holdings', 'transactions'], 'readwrite');
        const holdingsStore = tx.objectStore('holdings');

        // Calculate profit/loss
        const costBasis = holding.averageCost * shares;
        const proceeds = price * shares;
        const profitLoss = proceeds - costBasis;

        // Update or remove holding
        if (holding.shares === shares) {
            // Sell all
            return new Promise((resolve, reject) => {
                const request = holdingsStore.delete(holding.id);
                request.onsuccess = () => {
                    this.recordTransaction({
                        type: 'sell',
                        symbol,
                        shares,
                        price,
                        profitLoss,
                        date: new Date().toISOString()
                    });
                    resolve({ profitLoss, soldAll: true });
                };
                request.onerror = () => reject(request.error);
            });
        } else {
            // Partial sell
            holding.shares -= shares;

            return new Promise((resolve, reject) => {
                const request = holdingsStore.put(holding);
                request.onsuccess = () => {
                    this.recordTransaction({
                        type: 'sell',
                        symbol,
                        shares,
                        price,
                        profitLoss,
                        date: new Date().toISOString()
                    });
                    resolve({ profitLoss, soldAll: false });
                };
                request.onerror = () => reject(request.error);
            });
        }
    }

    async recordTransaction(transaction) {
        const tx = this.db.transaction(['transactions'], 'readwrite');
        const store = tx.objectStore('transactions');

        return new Promise((resolve, reject) => {
            const request = store.add(transaction);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getPortfolio() {
        const tx = this.db.transaction(['holdings'], 'readonly');
        const store = tx.objectStore('holdings');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = async () => {
                const holdings = request.result;

                // Add current market data
                for (const holding of holdings) {
                    const marketData = await this.getMarketData(holding.symbol);
                    holding.currentPrice = marketData.price || holding.averageCost;
                    holding.marketValue = holding.currentPrice * holding.shares;
                    holding.profitLoss = holding.marketValue - (holding.averageCost * holding.shares);
                    holding.profitLossPercent = ((holding.currentPrice - holding.averageCost) / holding.averageCost) * 100;
                    holding.dayChange = marketData.dayChange || 0;
                    holding.dayChangePercent = marketData.dayChangePercent || 0;
                }

                resolve(holdings);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getMarketData(symbol) {
        // Simulate market data (in production, would call real API)
        if (!this.marketData[symbol]) {
            this.marketData[symbol] = {
                price: Math.random() * 10000 + 100,
                dayChange: (Math.random() - 0.5) * 100,
                dayChangePercent: (Math.random() - 0.5) * 5,
                volume: Math.floor(Math.random() * 1000000),
                marketCap: Math.floor(Math.random() * 1000000000),
                pe: Math.random() * 30 + 10,
                dividendYield: Math.random() * 3
            };
        }

        // Simulate price movements
        const data = this.marketData[symbol];
        const changePercent = (Math.random() - 0.5) * 0.1;
        data.price *= (1 + changePercent);
        data.dayChange = data.price * changePercent;
        data.dayChangePercent = changePercent * 100;

        return data;
    }

    async getPortfolioSummary() {
        const portfolio = await this.getPortfolio();

        const summary = {
            totalValue: 0,
            totalCost: 0,
            totalProfitLoss: 0,
            totalProfitLossPercent: 0,
            dayChange: 0,
            dayChangePercent: 0,
            holdings: portfolio.length,
            allocation: {},
            topPerformers: [],
            worstPerformers: []
        };

        portfolio.forEach(holding => {
            summary.totalValue += holding.marketValue;
            summary.totalCost += holding.averageCost * holding.shares;
            summary.totalProfitLoss += holding.profitLoss;
            summary.dayChange += holding.dayChange * holding.shares;

            // Track allocation by type
            if (!summary.allocation[holding.type]) {
                summary.allocation[holding.type] = 0;
            }
            summary.allocation[holding.type] += holding.marketValue;
        });

        summary.totalProfitLossPercent = (summary.totalProfitLoss / summary.totalCost) * 100;
        summary.dayChangePercent = (summary.dayChange / summary.totalValue) * 100;

        // Convert allocation to percentages
        Object.keys(summary.allocation).forEach(type => {
            summary.allocation[type] = (summary.allocation[type] / summary.totalValue) * 100;
        });

        // Find top and worst performers
        const sorted = portfolio.sort((a, b) => b.profitLossPercent - a.profitLossPercent);
        summary.topPerformers = sorted.slice(0, 3);
        summary.worstPerformers = sorted.slice(-3);

        return summary;
    }

    async addToWatchlist(symbol, name, targetPrice) {
        const tx = this.db.transaction(['watchlist'], 'readwrite');
        const store = tx.objectStore('watchlist');

        const data = {
            symbol,
            name,
            targetPrice,
            addedDate: new Date().toISOString(),
            alerts: []
        };

        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getWatchlist() {
        const tx = this.db.transaction(['watchlist'], 'readonly');
        const store = tx.objectStore('watchlist');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = async () => {
                const watchlist = request.result;

                // Add current market data
                for (const item of watchlist) {
                    const marketData = await this.getMarketData(item.symbol);
                    item.currentPrice = marketData.price;
                    item.dayChange = marketData.dayChange;
                    item.dayChangePercent = marketData.dayChangePercent;
                    item.distanceToTarget = ((item.targetPrice - item.currentPrice) / item.currentPrice) * 100;

                    // Check for alerts
                    if (item.currentPrice >= item.targetPrice && !item.alertSent) {
                        this.sendAlert(item.symbol, '目標価格に到達しました！');
                        item.alertSent = true;
                    }
                }

                resolve(watchlist);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async setInvestmentGoal(goal) {
        const tx = this.db.transaction(['goals'], 'readwrite');
        const store = tx.objectStore('goals');

        const data = {
            ...goal,
            createdDate: new Date().toISOString(),
            status: 'active'
        };

        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async checkGoalProgress() {
        const tx = this.db.transaction(['goals'], 'readonly');
        const store = tx.objectStore('goals');
        const summary = await this.getPortfolioSummary();

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const goals = request.result.filter(g => g.status === 'active');
                const progress = [];

                goals.forEach(goal => {
                    let currentProgress = 0;
                    let percentComplete = 0;

                    switch (goal.type) {
                        case 'totalValue':
                            currentProgress = summary.totalValue;
                            percentComplete = (currentProgress / goal.targetAmount) * 100;
                            break;
                        case 'monthlyInvestment':
                            // Calculate based on transaction history
                            currentProgress = this.getMonthlyInvestmentAmount();
                            percentComplete = (currentProgress / goal.targetAmount) * 100;
                            break;
                        case 'returns':
                            currentProgress = summary.totalProfitLossPercent;
                            percentComplete = (currentProgress / goal.targetPercent) * 100;
                            break;
                    }

                    progress.push({
                        ...goal,
                        currentProgress,
                        percentComplete,
                        onTrack: percentComplete >= this.getExpectedProgress(goal)
                    });
                });

                resolve(progress);
            };
            request.onerror = () => reject(request.error);
        });
    }

    getExpectedProgress(goal) {
        const now = new Date();
        const created = new Date(goal.createdDate);
        const target = new Date(goal.targetDate);

        const totalTime = target - created;
        const elapsed = now - created;

        return (elapsed / totalTime) * 100;
    }

    async getMonthlyInvestmentAmount() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const tx = this.db.transaction(['transactions'], 'readonly');
        const store = tx.objectStore('transactions');
        const index = store.index('date');

        const range = IDBKeyRange.lowerBound(startOfMonth.toISOString());

        return new Promise((resolve, reject) => {
            const request = index.getAll(range);
            request.onsuccess = () => {
                const transactions = request.result.filter(t => t.type === 'buy');
                const total = transactions.reduce((sum, t) => sum + (t.shares * t.price), 0);
                resolve(total);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async analyzePortfolio() {
        const portfolio = await this.getPortfolio();
        const summary = await this.getPortfolioSummary();

        const analysis = {
            diversification: this.calculateDiversification(portfolio),
            risk: this.calculateRisk(portfolio),
            recommendations: []
        };

        // Diversification check
        if (analysis.diversification < 0.5) {
            analysis.recommendations.push({
                type: 'diversification',
                priority: 'high',
                message: 'ポートフォリオの分散が不十分です。異なるセクターや資産クラスへの投資を検討してください。'
            });
        }

        // Risk check
        if (analysis.risk > 0.7) {
            analysis.recommendations.push({
                type: 'risk',
                priority: 'high',
                message: 'リスクレベルが高めです。債券や安定株式の追加を検討してください。'
            });
        }

        // Performance check
        if (summary.totalProfitLossPercent < 0) {
            analysis.recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: '全体的にマイナスリターンです。ポートフォリオの見直しを検討してください。'
            });
        }

        // Concentration check
        const maxAllocation = Math.max(...Object.values(summary.allocation));
        if (maxAllocation > 50) {
            analysis.recommendations.push({
                type: 'concentration',
                priority: 'high',
                message: '特定の資産クラスに過度に集中しています。リバランスを検討してください。'
            });
        }

        return analysis;
    }

    calculateDiversification(portfolio) {
        // Simple diversification score based on number of holdings and types
        const types = new Set(portfolio.map(h => h.type)).size;
        const holdings = portfolio.length;

        return Math.min(1, (types * holdings) / 20);
    }

    calculateRisk(portfolio) {
        // Simplified risk calculation
        let riskScore = 0;
        let totalWeight = 0;

        portfolio.forEach(holding => {
            const weight = holding.marketValue;
            const volatility = holding.type === 'stock' ? 0.8 :
                             holding.type === 'bond' ? 0.2 : 0.5;

            riskScore += volatility * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? riskScore / totalWeight : 0;
    }

    async rebalancePortfolio(targetAllocation) {
        const portfolio = await this.getPortfolio();
        const summary = await this.getPortfolioSummary();

        const rebalanceActions = [];

        Object.keys(targetAllocation).forEach(type => {
            const currentAllocation = summary.allocation[type] || 0;
            const targetPercent = targetAllocation[type];
            const difference = targetPercent - currentAllocation;

            if (Math.abs(difference) > 5) {
                const targetValue = (targetPercent / 100) * summary.totalValue;
                const currentValue = (currentAllocation / 100) * summary.totalValue;
                const changeNeeded = targetValue - currentValue;

                rebalanceActions.push({
                    type,
                    action: changeNeeded > 0 ? 'buy' : 'sell',
                    amount: Math.abs(changeNeeded),
                    currentPercent: currentAllocation,
                    targetPercent
                });
            }
        });

        return rebalanceActions;
    }

    async exportPortfolio(format = 'json') {
        const portfolio = await this.getPortfolio();
        const transactions = await this.getAllTransactions();

        if (format === 'json') {
            return JSON.stringify({ portfolio, transactions }, null, 2);
        } else if (format === 'csv') {
            let csv = 'Symbol,Name,Shares,Average Cost,Current Price,Market Value,Profit/Loss,Profit/Loss %\n';
            portfolio.forEach(h => {
                csv += `${h.symbol},${h.name},${h.shares},${h.averageCost},${h.currentPrice},${h.marketValue},${h.profitLoss},${h.profitLossPercent}\n`;
            });
            return csv;
        }
    }

    async getAllTransactions() {
        const tx = this.db.transaction(['transactions'], 'readonly');
        const store = tx.objectStore('transactions');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    sendAlert(symbol, message) {
        if (window.unloqAI) {
            window.unloqAI.sendNotification({
                type: 'investment_alert',
                symbol,
                message,
                timestamp: new Date().toISOString()
            });
        }
    }

    startMarketUpdates() {
        // Update market data every 30 seconds
        this.updateInterval = setInterval(() => {
            Object.keys(this.marketData).forEach(symbol => {
                this.getMarketData(symbol);
            });
        }, 30000);
    }

    stopMarketUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Export for use in other modules
window.InvestmentApp = InvestmentApp;