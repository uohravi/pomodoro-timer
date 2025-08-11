/**
 * Unit Tests for Pomodoro Timer Application
 * This file contains detailed unit tests for individual functions and components
 */

// Global flag to verify script loading
if (typeof window !== 'undefined') {
    window.unitTestsScriptLoaded = true;
    console.log('unit-tests.js script loaded successfully');
}

class PomodoroUnitTests {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }

    // Test result tracking
    assert(condition, testName, description) {
        this.totalTests++;
        const passed = condition;
        if (passed) {
            this.passedTests++;
        } else {
            this.failedTests++;
        }
        
        this.testResults.push({
            name: testName,
            description: description,
            passed: passed,
            timestamp: new Date().toISOString()
        });
        
        return passed;
    }

    // Test utility functions
    testTimeFormatting() {
        console.log('Testing time formatting functions...');
        
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        };

        // Test cases
        const testCases = [
            { input: 0, expected: '00:00', description: 'Zero seconds' },
            { input: 30, expected: '00:30', description: '30 seconds' },
            { input: 60, expected: '01:00', description: '1 minute' },
            { input: 90, expected: '01:30', description: '1 minute 30 seconds' },
            { input: 1500, expected: '25:00', description: '25 minutes' },
            { input: 3600, expected: '60:00', description: '1 hour' },
            { input: 3661, expected: '61:01', description: '1 hour 1 minute 1 second' }
        ];

        testCases.forEach(testCase => {
            const result = formatTime(testCase.input);
            this.assert(
                result === testCase.expected,
                `Time Formatting: ${testCase.description}`,
                `Input: ${testCase.input}s, Expected: ${testCase.expected}, Got: ${result}`
            );
        });
    }

    testModeSwitchingLogic() {
        console.log('Testing mode switching logic...');
        
        const autoSwitchMode = (currentMode, sessionCount, sessionsBeforeLongBreak) => {
            if (currentMode === 'focus') {
                return sessionCount % sessionsBeforeLongBreak === 0 ? 'long-break' : 'break';
            } else {
                return 'focus';
            }
        };

        // Test cases for mode switching
        const testCases = [
            // Focus mode tests
            { mode: 'focus', count: 1, before: 4, expected: 'break', description: 'First focus session' },
            { mode: 'focus', count: 2, before: 4, expected: 'break', description: 'Second focus session' },
            { mode: 'focus', count: 3, before: 4, expected: 'break', description: 'Third focus session' },
            { mode: 'focus', count: 4, before: 4, expected: 'long-break', description: 'Fourth focus session (long break)' },
            { mode: 'focus', count: 8, before: 4, expected: 'long-break', description: 'Eighth focus session (long break)' },
            
            // Break mode tests
            { mode: 'break', count: 1, before: 4, expected: 'focus', description: 'After short break' },
            { mode: 'long-break', count: 1, before: 4, expected: 'focus', description: 'After long break' },
            
            // Custom long break frequency
            { mode: 'focus', count: 6, before: 6, expected: 'long-break', description: 'Sixth session with 6-session cycle' },
            { mode: 'focus', count: 5, before: 6, expected: 'break', description: 'Fifth session with 6-session cycle' }
        ];

        testCases.forEach(testCase => {
            const result = autoSwitchMode(testCase.mode, testCase.count, testCase.before);
            this.assert(
                result === testCase.expected,
                `Mode Switching: ${testCase.description}`,
                `Mode: ${testCase.mode}, Count: ${testCase.count}, Expected: ${testCase.expected}, Got: ${result}`
            );
        });
    }

    testSessionDataStructure() {
        console.log('Testing session data structure...');
        
        const createSessionData = (task, mode, duration, sessionNumber) => {
            const now = new Date();
            return {
                task: task || 'No task specified',
                mode: mode,
                duration: duration,
                completedAt: now.toISOString(),
                sessionNumber: sessionNumber,
                date: now.toISOString().split('T')[0],
                hour: now.getHours(),
                dayOfWeek: now.getDay(),
                month: now.getMonth() + 1,
                year: now.getFullYear()
            };
        };

        // Test session data creation
        const testSession = createSessionData('Test Task', 'focus', 25, 1);
        
        this.assert(
            testSession.task === 'Test Task',
            'Session Data: Task field',
            `Expected: Test Task, Got: ${testSession.task}`
        );
        
        this.assert(
            testSession.mode === 'focus',
            'Session Data: Mode field',
            `Expected: focus, Got: ${testSession.mode}`
        );
        
        this.assert(
            testSession.duration === 25,
            'Session Data: Duration field',
            `Expected: 25, Got: ${testSession.duration}`
        );
        
        this.assert(
            testSession.sessionNumber === 1,
            'Session Data: Session number field',
            `Expected: 1, Got: ${testSession.sessionNumber}`
        );
        
        this.assert(
            testSession.date === new Date().toISOString().split('T')[0],
            'Session Data: Date field',
            `Expected: ${new Date().toISOString().split('T')[0]}, Got: ${testSession.date}`
        );
        
        this.assert(
            typeof testSession.completedAt === 'string' && testSession.completedAt.includes('T'),
            'Session Data: CompletedAt field format',
            `Expected: ISO string, Got: ${testSession.completedAt}`
        );
    }

    testSettingsValidation() {
        console.log('Testing settings validation...');
        
        const validateSettings = (settings) => {
            const errors = [];
            
            // Check required fields
            if (!settings.focusTime || settings.focusTime < 1 || settings.focusTime > 60) {
                errors.push('Focus time must be between 1 and 60 minutes');
            }
            
            if (!settings.breakTime || settings.breakTime < 1 || settings.breakTime > 30) {
                errors.push('Break time must be between 1 and 30 minutes');
            }
            
            if (!settings.longBreakTime || settings.longBreakTime < 5 || settings.longBreakTime > 60) {
                errors.push('Long break time must be between 5 and 60 minutes');
            }
            
            if (!settings.sessionsBeforeLongBreak || settings.sessionsBeforeLongBreak < 2 || settings.sessionsBeforeLongBreak > 10) {
                errors.push('Sessions before long break must be between 2 and 10');
            }
            
            if (typeof settings.soundEnabled !== 'boolean') {
                errors.push('Sound enabled must be a boolean');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        };

        // Test valid settings
        const validSettings = {
            focusTime: 25,
            breakTime: 5,
            longBreakTime: 15,
            sessionsBeforeLongBreak: 4,
            soundEnabled: true
        };
        
        const validResult = validateSettings(validSettings);
        this.assert(
            validResult.isValid,
            'Settings Validation: Valid settings',
            `Expected: true, Got: ${validResult.isValid}, Errors: ${validResult.errors.join(', ')}`
        );

        // Test invalid settings
        const invalidSettings = {
            focusTime: 0, // Invalid
            breakTime: 5,
            longBreakTime: 15,
            sessionsBeforeLongBreak: 4,
            soundEnabled: true
        };
        
        const invalidResult = validateSettings(invalidSettings);
        this.assert(
            !invalidResult.isValid && invalidResult.errors.length > 0,
            'Settings Validation: Invalid settings',
            `Expected: false, Got: ${invalidResult.isValid}, Errors: ${invalidResult.errors.join(', ')}`
        );
    }

    testObjectComparison() {
        console.log('Testing object comparison methods...');
        
        // Test robust object comparison that ignores property order
        const compareObjects = (obj1, obj2) => {
            const keys1 = Object.keys(obj1).sort();
            const keys2 = Object.keys(obj2).sort();
            
            if (keys1.length !== keys2.length) return false;
            
            for (let key of keys1) {
                if (obj1[key] !== obj2[key]) return false;
            }
            
            return true;
        };

        // Test cases for object comparison
        const testCases = [
            {
                obj1: { a: 1, b: 2, c: 3 },
                obj2: { c: 3, a: 1, b: 2 },
                expected: true,
                description: 'Same properties, different order'
            },
            {
                obj1: { a: 1, b: 2 },
                obj2: { a: 1, b: 2, c: 3 },
                expected: false,
                description: 'Different number of properties'
            },
            {
                obj1: { a: 1, b: 2 },
                obj2: { a: 1, b: 3 },
                expected: false,
                description: 'Different values'
            },
            {
                obj1: { focusTime: 25, breakTime: 5 },
                obj2: { breakTime: 5, focusTime: 25 },
                expected: true,
                description: 'Settings-like objects with different order'
            }
        ];

        testCases.forEach(testCase => {
            const result = compareObjects(testCase.obj1, testCase.obj2);
            this.assert(
                result === testCase.expected,
                `Object Comparison: ${testCase.description}`,
                `Expected: ${testCase.expected}, Got: ${result}`
            );
        });
    }

    testStatisticsCalculation() {
        console.log('Testing statistics calculation...');
        
        const calculateStats = (sessions, days = 30) => {
            const now = new Date();
            const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
            
            const recentSessions = sessions.filter(session => 
                new Date(session.completedAt) >= cutoffDate
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
        };

        // Create test sessions
        const testSessions = [
            {
                task: 'Task 1',
                mode: 'focus',
                duration: 25,
                completedAt: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0]
            },
            {
                task: 'Task 2',
                mode: 'focus',
                duration: 25,
                completedAt: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0]
            },
            {
                task: 'Break',
                mode: 'break',
                duration: 5,
                completedAt: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0]
            }
        ];

        const stats = calculateStats(testSessions);
        
        this.assert(
            stats.totalSessions === 3,
            'Statistics: Total sessions count',
            `Expected: 3, Got: ${stats.totalSessions}`
        );
        
        this.assert(
            stats.totalFocusHours === 50/60, // 50 minutes = 50/60 hours
            'Statistics: Total focus hours',
            `Expected: ${50/60}, Got: ${stats.totalFocusHours}`
        );
        
        this.assert(
            stats.totalBreakHours === 5/60, // 5 minutes = 5/60 hours
            'Statistics: Total break hours',
            `Expected: ${5/60}, Got: ${stats.totalBreakHours}`
        );
        
        this.assert(
            stats.daysActive === 1,
            'Statistics: Days active',
            `Expected: 1, Got: ${stats.daysActive}`
        );
    }

    testMonthlyDataAggregation() {
        console.log('Testing monthly data aggregation...');
        
        const calculateMonthlyStats = (sessions) => {
            const monthlyData = {};

            sessions.forEach(session => {
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
        };

        // Create test sessions across multiple months
        const currentYear = new Date().getFullYear();
        const testSessions = [
            {
                task: 'Task 1',
                mode: 'focus',
                duration: 25,
                completedAt: `${currentYear}-01-15T10:00:00.000Z`,
                date: `${currentYear}-01-15`
            },
            {
                task: 'Task 2',
                mode: 'focus',
                duration: 25,
                completedAt: `${currentYear}-01-16T10:00:00.000Z`,
                date: `${currentYear}-01-16`
            },
            {
                task: 'Task 3',
                mode: 'break',
                duration: 5,
                completedAt: `${currentYear}-02-01T10:00:00.000Z`,
                date: `${currentYear}-02-01`
            }
        ];

        const monthlyStats = calculateMonthlyStats(testSessions);
        const januaryKey = `${currentYear}-01`;
        const februaryKey = `${currentYear}-02`;
        
        this.assert(
            monthlyStats[januaryKey] && monthlyStats[januaryKey].sessions === 2,
            'Monthly Stats: January sessions count',
            `Expected: 2, Got: ${monthlyStats[januaryKey]?.sessions || 0}`
        );
        
        this.assert(
            monthlyStats[januaryKey] && monthlyStats[januaryKey].focusHours === 50/60,
            'Monthly Stats: January focus hours',
            `Expected: ${50/60}, Got: ${monthlyStats[januaryKey]?.focusHours || 0}`
        );
        
        this.assert(
            monthlyStats[januaryKey] && monthlyStats[januaryKey].activeDays === 2,
            'Monthly Stats: January active days',
            `Expected: 2, Got: ${monthlyStats[januaryKey]?.activeDays || 0}`
        );
        
        this.assert(
            monthlyStats[februaryKey] && monthlyStats[februaryKey].sessions === 1,
            'Monthly Stats: February sessions count',
            `Expected: 1, Got: ${monthlyStats[februaryKey]?.sessions || 0}`
        );
    }

    testDataExportFormat() {
        console.log('Testing data export format...');
        
        const createExportData = (sessions, settings) => {
            return {
                sessions: sessions,
                settings: settings,
                exportDate: new Date().toISOString(),
                version: '1.0',
                metadata: {
                    totalSessions: sessions.length,
                    totalSettings: Object.keys(settings).length,
                    exportFormat: 'JSON'
                }
            };
        };

        const testSessions = [
            {
                task: 'Test Task',
                mode: 'focus',
                duration: 25,
                completedAt: new Date().toISOString()
            }
        ];

        const testSettings = {
            focusTime: 25,
            breakTime: 5,
            soundEnabled: true
        };

        const exportData = createExportData(testSessions, testSettings);
        
        this.assert(
            exportData.sessions && Array.isArray(exportData.sessions),
            'Export Format: Sessions array',
            `Expected: Array, Got: ${typeof exportData.sessions}`
        );
        
        this.assert(
            exportData.settings && typeof exportData.settings === 'object',
            'Export Format: Settings object',
            `Expected: Object, Got: ${typeof exportData.settings}`
        );
        
        this.assert(
            exportData.exportDate && exportData.exportDate.includes('T'),
            'Export Format: Export date',
            `Expected: ISO string, Got: ${exportData.exportDate}`
        );
        
        this.assert(
            exportData.version === '1.0',
            'Export Format: Version',
            `Expected: 1.0, Got: ${exportData.version}`
        );
        
        this.assert(
            exportData.metadata && exportData.metadata.totalSessions === 1,
            'Export Format: Metadata',
            `Expected: 1 session, Got: ${exportData.metadata?.totalSessions || 0}`
        );
    }

    // Run all unit tests
    runAllUnitTests() {
        console.log('🧪 Starting Pomodoro Timer Unit Tests...\n');
        
        this.testTimeFormatting();
        this.testModeSwitchingLogic();
        this.testSessionDataStructure();
        this.testSettingsValidation();
        this.testObjectComparison();
        this.testStatisticsCalculation();
        this.testMonthlyDataAggregation();
        this.testDataExportFormat();
        
        console.log('\n📊 Unit Test Results:');
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.failedTests}`);
        console.log(`Success Rate: ${Math.round((this.passedTests / this.totalTests) * 100)}%`);
        
        // Log failed tests
        const failedTests = this.testResults.filter(test => !test.passed);
        if (failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            failedTests.forEach(test => {
                console.log(`- ${test.name}: ${test.description}`);
            });
        }
        
        return {
            total: this.totalTests,
            passed: this.passedTests,
            failed: this.failedTests,
            successRate: Math.round((this.passedTests / this.totalTests) * 100),
            results: this.testResults
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PomodoroUnitTests;
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined') {
    try {
        window.PomodoroUnitTests = PomodoroUnitTests;
        
        // Add to global scope for easy access
        window.runUnitTests = () => {
            const unitTests = new PomodoroUnitTests();
            return unitTests.runAllUnitTests();
        };
        
        // Debug: Log when the class is loaded
        console.log('PomodoroUnitTests loaded and available globally');
        
        // Add a simple global flag to verify script loading
        window.unitTestsLoaded = true;
        
        // Additional verification
        console.log('PomodoroUnitTests class type:', typeof PomodoroUnitTests);
        console.log('window.PomodoroUnitTests type:', typeof window.PomodoroUnitTests);
        
    } catch (error) {
        console.error('Error loading PomodoroUnitTests:', error);
        window.unitTestsLoaded = false;
    }
} 