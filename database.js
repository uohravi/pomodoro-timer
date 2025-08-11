class PomodoroDatabase {
    constructor() {
        this.dbName = 'PomodoroDB';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Database error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create sessions table
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Create indexes for better querying
                    sessionsStore.createIndex('completedAt', 'completedAt', { unique: false });
                    sessionsStore.createIndex('date', 'date', { unique: false });
                    sessionsStore.createIndex('mode', 'mode', { unique: false });
                    sessionsStore.createIndex('month', 'month', { unique: false });
                    sessionsStore.createIndex('year', 'year', { unique: false });
                }

                // Create settings table
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { 
                        keyPath: 'key' 
                    });
                }

                console.log('Database schema created');
            };
        });
    }

    // Session Management Methods
    async addSession(session) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            
            const request = store.add(session);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getAllSessions() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by completedAt descending (newest first)
                const sessions = request.result.sort((a, b) => 
                    new Date(b.completedAt) - new Date(a.completedAt)
                );
                resolve(sessions);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getSessionsByDateRange(startDate, endDate) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const index = store.index('completedAt');
            
            const range = IDBKeyRange.bound(startDate.toISOString(), endDate.toISOString());
            const request = index.getAll(range);

            request.onsuccess = () => {
                const sessions = request.result.sort((a, b) => 
                    new Date(b.completedAt) - new Date(a.completedAt)
                );
                resolve(sessions);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getSessionsByMonth(year, month) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const index = store.index('month');
            
            const request = index.getAll(month);

            request.onsuccess = () => {
                // Filter by year and sort by date
                const sessions = request.result
                    .filter(session => session.year === year)
                    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                resolve(sessions);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async deleteSession(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async clearAllSessions() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getSessionCount() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.count();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Settings Management Methods
    async saveSettings(settings) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            
            // Save each setting as a separate record
            const promises = Object.entries(settings).map(([key, value]) => {
                return new Promise((resolve, reject) => {
                    const request = store.put({ key, value });
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            });

            Promise.all(promises)
                .then(() => resolve())
                .catch(reject);
        });
    }

    async loadSettings() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();

            request.onsuccess = () => {
                const settings = {};
                request.result.forEach(item => {
                    settings[item.key] = item.value;
                });
                resolve(settings);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async clearSettings() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Data Export/Import Methods
    async exportData() {
        try {
            const sessions = await this.getAllSessions();
            const settings = await this.loadSettings();
            
            return {
                sessions,
                settings,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            throw new Error('Failed to export data: ' + error.message);
        }
    }

    async importData(data) {
        try {
            // Validate data structure
            if (!data.sessions || !data.settings) {
                throw new Error('Invalid data format');
            }

            // Clear existing data
            await this.clearAllSessions();

            // Import sessions
            for (const session of data.sessions) {
                await this.addSession(session);
            }

            // Import settings
            await this.saveSettings(data.settings);

            return true;
        } catch (error) {
            throw new Error('Failed to import data: ' + error.message);
        }
    }

    // Database Maintenance Methods
    async getDatabaseSize() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.getAll();

            request.onsuccess = () => {
                const sessions = request.result;
                const totalSize = JSON.stringify(sessions).length;
                resolve({
                    sessionCount: sessions.length,
                    totalSizeBytes: totalSize,
                    totalSizeKB: (totalSize / 1024).toFixed(2),
                    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(4)
                });
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async cleanupOldSessions(daysToKeep = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            const allSessions = await this.getAllSessions();
            const sessionsToDelete = allSessions.filter(session => 
                new Date(session.completedAt) < cutoffDate
            );

            for (const session of sessionsToDelete) {
                await this.deleteSession(session.id);
            }

            return sessionsToDelete.length;
        } catch (error) {
            throw new Error('Failed to cleanup old sessions: ' + error.message);
        }
    }

    // Migration from localStorage
    async migrateFromLocalStorage() {
        try {
            const existingSessions = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
            const existingSettings = JSON.parse(localStorage.getItem('pomodoroSettings')) || {};

            if (existingSessions.length > 0) {
                for (const session of existingSessions) {
                    await this.addSession(session);
                }
                console.log(`Migrated ${existingSessions.length} sessions from localStorage`);
            }

            if (Object.keys(existingSettings).length > 0) {
                await this.saveSettings(existingSettings);
                console.log('Migrated settings from localStorage');
            }

            return {
                sessionsMigrated: existingSessions.length,
                settingsMigrated: Object.keys(existingSettings).length
            };
        } catch (error) {
            throw new Error('Failed to migrate from localStorage: ' + error.message);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PomodoroDatabase;
}

// Export for browser global scope
if (typeof window !== 'undefined') {
    window.PomodoroDatabase = PomodoroDatabase;
} 