class PomodoroDatabase {
    constructor() {
        this.dbName = 'PomodoroDB';
        this.dbVersion = 2; // Increment version for new schema
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
                const oldVersion = event.oldVersion;
                const newVersion = event.newVersion;

                console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

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
                    sessionsStore.createIndex('taskId', 'taskId', { unique: false });
                }

                // Create tasks table for task history
                if (!db.objectStoreNames.contains('tasks')) {
                    const tasksStore = db.createObjectStore('tasks', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Create indexes for task querying
                    tasksStore.createIndex('name', 'name', { unique: false });
                    tasksStore.createIndex('createdAt', 'createdAt', { unique: false });
                    tasksStore.createIndex('lastUsed', 'lastUsed', { unique: false });
                    tasksStore.createIndex('totalSessions', 'totalSessions', { unique: false });
                }

                // Create settings table
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { 
                        keyPath: 'key' 
                    });
                }

                // Migrate existing data if upgrading from version 1
                if (oldVersion < 2) {
                    this.migrateToVersion2(db);
                }

                console.log('Database schema created/upgraded');
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

    // Task Management Methods
    async addTask(taskName) {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            try {
                // Check if task already exists
                const existingTask = await this.getTaskByName(taskName);
                
                if (existingTask) {
                    // Update existing task
                    existingTask.lastUsed = new Date().toISOString();
                    existingTask.totalSessions = (existingTask.totalSessions || 0) + 1;
                    
                    const updateTransaction = this.db.transaction(['tasks'], 'readwrite');
                    const updateStore = updateTransaction.objectStore('tasks');
                    const updateRequest = updateStore.put(existingTask);
                    
                    updateRequest.onsuccess = () => {
                        resolve(existingTask.id);
                    };
                    
                    updateRequest.onerror = () => {
                        reject(updateRequest.error);
                    };
                } else {
                    // Create new task
                    const newTask = {
                        name: taskName,
                        createdAt: new Date().toISOString(),
                        lastUsed: new Date().toISOString(),
                        totalSessions: 1
                    };
                    
                    const transaction = this.db.transaction(['tasks'], 'readwrite');
                    const store = transaction.objectStore('tasks');
                    const request = store.add(newTask);
                    
                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                    
                    request.onerror = () => {
                        reject(request.error);
                    };
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async getTaskByName(taskName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const nameIndex = store.index('name');
            const request = nameIndex.get(taskName);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getAllTasks() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by lastUsed descending (most recently used first)
                const tasks = request.result.sort((a, b) => 
                    new Date(b.lastUsed) - new Date(a.lastUsed)
                );
                resolve(tasks);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getTaskById(taskId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const request = store.get(taskId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getSessionsByTask(taskId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const taskIndex = store.index('taskId');
            const request = taskIndex.getAll(taskId);

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

    async getTaskStats() {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            try {
                const tasks = await this.getAllTasks();
                const stats = {
                    totalTasks: tasks.length,
                    totalSessions: tasks.reduce((sum, task) => sum + (task.totalSessions || 0), 0),
                    mostUsedTask: tasks.length > 0 ? tasks[0] : null,
                    recentTasks: tasks.slice(0, 5), // Top 5 most recent
                    averageSessionsPerTask: tasks.length > 0 ? 
                        tasks.reduce((sum, task) => sum + (task.totalSessions || 0), 0) / tasks.length : 0
                };
                resolve(stats);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Migration function for version 2
    async migrateToVersion2(db) {
        console.log('Migrating to version 2: Adding task history support');
        
        try {
            // Get all existing sessions
            const transaction = db.transaction(['sessions'], 'readonly');
            const sessionsStore = transaction.objectStore('sessions');
            const sessionsRequest = sessionsStore.getAll();
            
            sessionsRequest.onsuccess = async () => {
                const sessions = sessionsRequest.result;
                
                // Process each session to extract task information
                for (const session of sessions) {
                    if (session.task && !session.taskId) {
                        try {
                            // Add task to tasks table
                            const taskId = await this.addTask(session.task);
                            
                            // Update session with taskId
                            session.taskId = taskId;
                            
                            // Update session in database
                            const updateTransaction = db.transaction(['sessions'], 'readwrite');
                            const updateStore = updateTransaction.objectStore('sessions');
                            updateStore.put(session);
                            
                        } catch (error) {
                            console.error('Error migrating session:', error);
                        }
                    }
                }
                
                console.log('Migration to version 2 completed');
            };
            
        } catch (error) {
            console.error('Migration error:', error);
        }
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

    async clearAllTasks() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['tasks'], 'readwrite');
            const store = transaction.objectStore('tasks');
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
            const tasks = await this.getAllTasks();
            const settings = await this.loadSettings();
            
            return {
                sessions,
                tasks,
                settings,
                exportDate: new Date().toISOString(),
                version: '2.0',
                metadata: {
                    totalSessions: sessions.length,
                    totalTasks: tasks.length,
                    exportTimestamp: Date.now()
                }
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
            await this.clearAllTasks();

            // Import tasks (if available)
            if (data.tasks && Array.isArray(data.tasks)) {
                for (const task of data.tasks) {
                    await this.addTask(task.name);
                }
            }

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