class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.timer = null;
        this.currentMode = 'focus';
        this.currentTask = '';
        this.sessionCount = 0;
        this.history = [];
        this.database = new PomodoroDatabase();
        
        this.initializeElements();
        this.bindEvents();
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            await this.database.init();
            await this.loadSettings();
            await this.loadHistory();
            this.updateDisplay();
            this.renderHistory();
            this.updateReportStats();
            this.updateDatabaseInfo();
        } catch (error) {
            console.error('Failed to initialize database:', error);
            // Fallback to localStorage if database fails
            this.history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
            this.loadSettings();
            this.updateDisplay();
            this.renderHistory();
        }
    }

    initializeElements() {
        // Timer elements
        this.timerDisplay = document.getElementById('timer');
        this.timerLabel = document.getElementById('timer-label');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');

        // Task elements
        this.taskInput = document.getElementById('task-input');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.taskName = document.getElementById('task-name');

        // Mode buttons
        this.modeButtons = document.querySelectorAll('.mode-btn');

        // Settings elements
        this.focusTimeInput = document.getElementById('focus-time');
        this.breakTimeInput = document.getElementById('break-time');
        this.longBreakTimeInput = document.getElementById('long-break-time');
        this.sessionsBeforeLongBreakInput = document.getElementById('sessions-before-long-break');
        this.soundToggle = document.getElementById('sound-toggle');

        // History elements
        this.historyList = document.getElementById('history-list');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');

        // Audio element
        this.notificationSound = document.getElementById('notification-sound');

        // Database elements
        this.exportDataBtn = document.getElementById('export-data-btn');
        this.importDataBtn = document.getElementById('import-data-btn');
        this.migrateDataBtn = document.getElementById('migrate-data-btn');
        this.cleanupDataBtn = document.getElementById('cleanup-data-btn');
        this.databaseInfo = document.getElementById('database-info');
        this.importFileInput = document.getElementById('import-file-input');
    }

    bindEvents() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        // Task management
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn));
        });

        // Settings
        this.focusTimeInput.addEventListener('change', () => this.updateSettings());
        this.breakTimeInput.addEventListener('change', () => this.updateSettings());
        this.longBreakTimeInput.addEventListener('change', () => this.updateSettings());
        this.sessionsBeforeLongBreakInput.addEventListener('change', () => this.updateSettings());

        // History
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Reports
        const exportReportBtn = document.getElementById('export-report-btn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportReport());
        }

        // Database management
        if (this.exportDataBtn) {
            this.exportDataBtn.addEventListener('click', () => this.exportAllData());
        }
        if (this.importDataBtn) {
            this.importDataBtn.addEventListener('click', () => this.importFileInput.click());
        }
        if (this.migrateDataBtn) {
            this.migrateDataBtn.addEventListener('click', () => this.migrateFromLocalStorage());
        }
        if (this.cleanupDataBtn) {
            this.cleanupDataBtn.addEventListener('click', () => this.cleanupOldData());
        }
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => this.importData(e));
        }

        // Request notification permission
        this.requestNotificationPermission();
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    startTimer() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        this.timer = setInterval(async () => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                await this.completeTimer();
            }
        }, 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timer);
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
    }

    switchMode(button) {
        // Update active button
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Get mode and time
        const mode = button.dataset.mode;
        const time = parseInt(button.dataset.time);

        this.currentMode = mode;
        this.totalTime = time * 60;
        this.timeLeft = this.totalTime;

        // Update timer label
        const labels = {
            'focus': 'Focus Time',
            'break': 'Break Time',
            'long-break': 'Long Break'
        };
        this.timerLabel.textContent = labels[mode];

        this.updateDisplay();
    }

    addTask() {
        const taskName = this.taskInput.value.trim();
        if (taskName) {
            this.currentTask = taskName;
            this.taskName.textContent = taskName;
            this.taskInput.value = '';
        }
    }

    async completeTimer() {
        this.pauseTimer();
        this.sessionCount++;

        // Add to history
        await this.addToHistory();

        // Play sound and show notification
        this.playNotification();
        this.showNotification();

        // Auto-switch to next mode
        this.autoSwitchMode();

        // Reset timer for next session
        this.timeLeft = this.totalTime;
        this.updateDisplay();
    }

    autoSwitchMode() {
        if (this.currentMode === 'focus') {
            // After focus session, switch to break
            const sessionsBeforeLongBreak = parseInt(this.sessionsBeforeLongBreakInput.value) || 4;
            if (this.sessionCount % sessionsBeforeLongBreak === 0) {
                // Take a long break based on user setting
                this.switchMode(document.querySelector('[data-mode="long-break"]'));
            } else {
                this.switchMode(document.querySelector('[data-mode="break"]'));
            }
        } else {
            // After break, switch back to focus
            this.switchMode(document.querySelector('[data-mode="focus"]'));
        }
    }

    async addToHistory() {
        const historyItem = {
            task: this.currentTask || 'No task specified',
            mode: this.currentMode,
            duration: this.totalTime / 60,
            completedAt: new Date().toISOString(),
            sessionNumber: this.sessionCount,
            // Add additional fields for better reporting
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            hour: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        };

        try {
            await this.database.addSession(historyItem);
            await this.loadHistory();
            this.renderHistory();
            this.updateReportStats();
            this.updateDatabaseInfo();
        } catch (error) {
            console.error('Failed to save session to database:', error);
            // Fallback to localStorage
            this.history.unshift(historyItem);
            if (this.history.length > 1000) {
                this.history = this.history.slice(0, 1000);
            }
            this.saveHistory();
            this.renderHistory();
            this.updateReportStats();
        }
    }

    renderHistory() {
        this.historyList.innerHTML = '';

        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No sessions completed yet</p>';
            return;
        }

        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const modeLabels = {
                'focus': 'Focus',
                'break': 'Break',
                'long-break': 'Long Break'
            };

            const modeIcons = {
                'focus': 'fas fa-brain',
                'break': 'fas fa-coffee',
                'long-break': 'fas fa-bed'
            };

            const date = new Date(item.completedAt);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = date.toLocaleDateString();

            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-task">${item.task}</div>
                    <div class="history-details">
                        <i class="${modeIcons[item.mode]}"></i> ${modeLabels[item.mode]} • ${item.duration} min • Session ${item.sessionNumber}
                    </div>
                </div>
                <div class="history-time">
                    ${timeString}<br><small>${dateString}</small>
                </div>
            `;

            this.historyList.appendChild(historyItem);
        });
    }

    async clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            try {
                await this.database.clearAllSessions();
                this.history = [];
                this.renderHistory();
                this.updateReportStats();
                this.updateDatabaseInfo();
            } catch (error) {
                console.error('Failed to clear history from database:', error);
                // Fallback to localStorage
                this.history = [];
                this.saveHistory();
                this.renderHistory();
                this.updateReportStats();
            }
        }
    }

    async loadHistory() {
        try {
            this.history = await this.database.getAllSessions();
        } catch (error) {
            console.error('Failed to load history from database:', error);
            // Fallback to localStorage
            this.history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
        }
    }

    saveHistory() {
        localStorage.setItem('pomodoroHistory', JSON.stringify(this.history));
    }

    async loadSettings() {
        try {
            const settings = await this.database.loadSettings();
            
            if (settings.focusTime) this.focusTimeInput.value = settings.focusTime;
            if (settings.breakTime) this.breakTimeInput.value = settings.breakTime;
            if (settings.longBreakTime) this.longBreakTimeInput.value = settings.longBreakTime;
            if (settings.sessionsBeforeLongBreak) this.sessionsBeforeLongBreakInput.value = settings.sessionsBeforeLongBreak;
            if (settings.soundEnabled !== undefined) this.soundToggle.checked = settings.soundEnabled;

            this.updateSettings();
        } catch (error) {
            console.error('Failed to load settings from database:', error);
            // Fallback to localStorage
            const settings = JSON.parse(localStorage.getItem('pomodoroSettings')) || {};
            
            if (settings.focusTime) this.focusTimeInput.value = settings.focusTime;
            if (settings.breakTime) this.breakTimeInput.value = settings.breakTime;
            if (settings.longBreakTime) this.longBreakTimeInput.value = settings.longBreakTime;
            if (settings.sessionsBeforeLongBreak) this.sessionsBeforeLongBreakInput.value = settings.sessionsBeforeLongBreak;
            if (settings.soundEnabled !== undefined) this.soundToggle.checked = settings.soundEnabled;

            this.updateSettings();
        }
    }

    async updateSettings() {
        const settings = {
            focusTime: parseInt(this.focusTimeInput.value),
            breakTime: parseInt(this.breakTimeInput.value),
            longBreakTime: parseInt(this.longBreakTimeInput.value),
            sessionsBeforeLongBreak: parseInt(this.sessionsBeforeLongBreakInput.value),
            soundEnabled: this.soundToggle.checked
        };

        try {
            await this.database.saveSettings(settings);
        } catch (error) {
            console.error('Failed to save settings to database:', error);
            // Fallback to localStorage
            localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        }

        // Update mode button times
        document.querySelector('[data-mode="focus"]').dataset.time = settings.focusTime;
        document.querySelector('[data-mode="break"]').dataset.time = settings.breakTime;
        document.querySelector('[data-mode="long-break"]').dataset.time = settings.longBreakTime;

        // Update current timer if not running
        if (!this.isRunning) {
            this.totalTime = settings[`${this.currentMode}Time`] * 60;
            this.timeLeft = this.totalTime;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    playNotification() {
        if (this.soundToggle.checked && this.notificationSound) {
            this.notificationSound.currentTime = 0;
            this.notificationSound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const messages = {
                'focus': 'Focus session completed! Time for a break.',
                'break': 'Break time is over! Ready to focus?',
                'long-break': 'Long break completed! Time to get back to work.'
            };

            const notification = new Notification('Pomodoro Timer', {
                body: messages[this.currentMode] || 'Timer completed!',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM2NjdlZWEiLz4KPHBhdGggZD0iTTMyIDhWMTZIMzJWN0gzMlY4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQ4IDMySDQwVjMySDQ4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTMyIDQ4VjQwSDMyVjQ4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDMySDI0VjMySDE2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQyLjQyNCA0Mi40MjRMNDIuNDI0IDQyLjQyNEw0Mi40MjQgNDIuNDI0WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxLjU3NiAyMS41NzZMMjEuNTc2IDIxLjU3NkwyMS41NzYgMjEuNTc2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQyLjQyNCAyMS41NzZMNDIuNDI0IDIxLjU3Nkw0Mi40MjQgMjEuNTc2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxLjU3NiA0Mi40MjRMMjEuNTc2IDQyLjQyNEwyMS41NzYgNDIuNDI0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
                badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM2NjdlZWEiLz4KPHBhdGggZD0iTTMyIDhWMTZIMzJWN0gzMlY4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQ4IDMySDQwVjMySDQ4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTMyIDQ4VjQwSDMyVjQ4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDMySDI0VjMySDE2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQyLjQyNCA0Mi40MjRMNDIuNDI0IDQyLjQyNEw0Mi40MjQgNDIuNDI0WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxLjU3NiAyMS41NzZMMjEuNTc2IDIxLjU3NkwyMS41NzYgMjEuNTc2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQyLjQyNCAyMS41NzZMNDIuNDI0IDIxLjU3Nkw0Mi40MjQgMjEuNTc2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxLjU3NiA0Mi40MjRMMjEuNTc2IDQyLjQyNEwyMS41NzYgNDIuNDI0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
                tag: 'pomodoro-timer',
                requireInteraction: false,
                silent: true
            });

            // Auto-close notification after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);
        }
    }

    // ===== REPORTING METHODS =====

    updateReportStats() {
        this.renderReportStats();
        this.renderMonthlyReport();
    }

    renderReportStats() {
        const stats = this.calculateStats();
        const statsContainer = document.getElementById('report-stats');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.totalSessions}</div>
                    <div class="stat-label">Total Sessions</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalFocusHours.toFixed(1)}h</div>
                    <div class="stat-label">Focus Hours</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalBreakHours.toFixed(1)}h</div>
                    <div class="stat-label">Break Hours</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.averageDailyHours.toFixed(1)}h</div>
                    <div class="stat-label">Avg Daily</div>
                </div>
            </div>
        `;
    }

    renderMonthlyReport() {
        const monthlyData = this.calculateMonthlyStats();
        const reportContainer = document.getElementById('monthly-report');
        if (!reportContainer) return;

        let reportHTML = '<h4>Monthly Report</h4>';
        
        if (Object.keys(monthlyData).length === 0) {
            reportHTML += '<p style="text-align: center; color: #666; font-style: italic;">No data available for monthly report</p>';
        } else {
            reportHTML += '<div class="monthly-grid">';
            
            Object.keys(monthlyData).sort().reverse().forEach(monthKey => {
                const data = monthlyData[monthKey];
                const [year, month] = monthKey.split('-');
                const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                
                reportHTML += `
                    <div class="monthly-item">
                        <div class="monthly-header">
                            <h5>${monthName}</h5>
                            <span class="monthly-total">${data.totalHours.toFixed(1)}h</span>
                        </div>
                        <div class="monthly-details">
                            <div class="monthly-stat">
                                <span class="stat-label">Focus:</span>
                                <span class="stat-value">${data.focusHours.toFixed(1)}h</span>
                            </div>
                            <div class="monthly-stat">
                                <span class="stat-label">Sessions:</span>
                                <span class="stat-value">${data.sessions}</span>
                            </div>
                            <div class="monthly-stat">
                                <span class="stat-label">Days Active:</span>
                                <span class="stat-value">${data.activeDays}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            reportHTML += '</div>';
        }

        reportContainer.innerHTML = reportHTML;
    }

    calculateStats() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const recentSessions = this.history.filter(session => 
            new Date(session.completedAt) >= thirtyDaysAgo
        );

        const focusSessions = recentSessions.filter(session => session.mode === 'focus');
        const breakSessions = recentSessions.filter(session => session.mode !== 'focus');

        const totalFocusMinutes = focusSessions.reduce((sum, session) => sum + session.duration, 0);
        const totalBreakMinutes = breakSessions.reduce((sum, session) => sum + session.duration, 0);

        const daysActive = new Set(recentSessions.map(session => session.date)).size;

        return {
            totalSessions: recentSessions.length,
            totalFocusHours: totalFocusMinutes / 60,
            totalBreakHours: totalBreakMinutes / 60,
            averageDailyHours: daysActive > 0 ? totalFocusMinutes / 60 / daysActive : 0,
            daysActive: daysActive
        };
    }

    calculateMonthlyStats() {
        const monthlyData = {};

        this.history.forEach(session => {
            const date = new Date(session.completedAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    totalHours: 0,
                    focusHours: 0,
                    sessions: 0,
                    activeDays: new Set()
                };
            }

            monthlyData[monthKey].totalHours += session.duration / 60;
            monthlyData[monthKey].sessions += 1;
            monthlyData[monthKey].activeDays.add(session.date);

            if (session.mode === 'focus') {
                monthlyData[monthKey].focusHours += session.duration / 60;
            }
        });

        // Convert activeDays from Set to count
        Object.keys(monthlyData).forEach(monthKey => {
            monthlyData[monthKey].activeDays = monthlyData[monthKey].activeDays.size;
        });

        return monthlyData;
    }

    exportReport() {
        const stats = this.calculateStats();
        const monthlyData = this.calculateMonthlyStats();
        
        let reportText = 'POMODORO TIMER REPORT\n';
        reportText += '=====================\n\n';
        
        reportText += `Generated: ${new Date().toLocaleDateString()}\n`;
        reportText += `Period: Last 30 days\n\n`;
        
        reportText += 'SUMMARY STATISTICS:\n';
        reportText += `- Total Sessions: ${stats.totalSessions}\n`;
        reportText += `- Focus Hours: ${stats.totalFocusHours.toFixed(1)}h\n`;
        reportText += `- Break Hours: ${stats.totalBreakHours.toFixed(1)}h\n`;
        reportText += `- Average Daily Focus: ${stats.averageDailyHours.toFixed(1)}h\n`;
        reportText += `- Days Active: ${stats.daysActive}\n\n`;
        
        reportText += 'MONTHLY BREAKDOWN:\n';
        Object.keys(monthlyData).sort().reverse().forEach(monthKey => {
            const data = monthlyData[monthKey];
            const [year, month] = monthKey.split('-');
            const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            reportText += `${monthName}:\n`;
            reportText += `  - Total Hours: ${data.totalHours.toFixed(1)}h\n`;
            reportText += `  - Focus Hours: ${data.focusHours.toFixed(1)}h\n`;
            reportText += `  - Sessions: ${data.sessions}\n`;
            reportText += `  - Active Days: ${data.activeDays}\n\n`;
        });

        // Create and download file
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pomodoro-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ===== DATABASE MANAGEMENT METHODS =====

    async exportAllData() {
        try {
            const data = await this.database.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Data exported successfully!');
        } catch (error) {
            console.error('Failed to export data:', error);
            alert('Failed to export data: ' + error.message);
        }
    }

    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (confirm('This will replace all existing data. Are you sure?')) {
                await this.database.importData(data);
                await this.loadHistory();
                await this.loadSettings();
                this.renderHistory();
                this.updateReportStats();
                this.updateDatabaseInfo();
                alert('Data imported successfully!');
            }
        } catch (error) {
            console.error('Failed to import data:', error);
            alert('Failed to import data: ' + error.message);
        }

        // Reset file input
        event.target.value = '';
    }

    async migrateFromLocalStorage() {
        try {
            const result = await this.database.migrateFromLocalStorage();
            await this.loadHistory();
            await this.loadSettings();
            this.renderHistory();
            this.updateReportStats();
            this.updateDatabaseInfo();
            alert(`Migration completed! ${result.sessionsMigrated} sessions and ${result.settingsMigrated} settings migrated.`);
        } catch (error) {
            console.error('Failed to migrate data:', error);
            alert('Failed to migrate data: ' + error.message);
        }
    }

    async cleanupOldData() {
        const days = prompt('Enter number of days to keep (default: 365):', '365');
        if (!days) return;

        try {
            const deletedCount = await this.database.cleanupOldSessions(parseInt(days));
            await this.loadHistory();
            this.renderHistory();
            this.updateReportStats();
            this.updateDatabaseInfo();
            alert(`Cleanup completed! Deleted ${deletedCount} old sessions.`);
        } catch (error) {
            console.error('Failed to cleanup data:', error);
            alert('Failed to cleanup data: ' + error.message);
        }
    }

    async updateDatabaseInfo() {
        if (!this.databaseInfo) return;

        try {
            const sizeInfo = await this.database.getDatabaseSize();
            const sessionCount = await this.database.getSessionCount();
            
            this.databaseInfo.innerHTML = `
                <div class="database-stats">
                    <div class="db-stat">
                        <span class="stat-label">Total Sessions:</span>
                        <span class="stat-value">${sessionCount}</span>
                    </div>
                    <div class="db-stat">
                        <span class="stat-label">Database Size:</span>
                        <span class="stat-value">${sizeInfo.totalSizeKB} KB</span>
                    </div>
                    <div class="db-stat">
                        <span class="stat-label">Storage Used:</span>
                        <span class="stat-value">${sizeInfo.totalSizeMB} MB</span>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to update database info:', error);
            this.databaseInfo.innerHTML = '<p style="color: #666;">Database info unavailable</p>';
        }
    }
}

// Export for browser global scope
if (typeof window !== 'undefined') {
    window.PomodoroTimer = PomodoroTimer;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// Handle page visibility changes to pause timer when tab is not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Optionally pause timer when tab is not active
        // This can be uncommented if you want the timer to pause when switching tabs
        // pomodoroTimer.pauseTimer();
    }
}); 