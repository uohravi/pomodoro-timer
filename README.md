# 🍅 Pomodoro Timer - Made with ❤️

A beautiful, feature-rich Pomodoro Timer web application built with modern web technologies. Perfect for boosting productivity and maintaining focus during work sessions.

![Pomodoro Timer](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![Tests](https://img.shields.io/badge/Tests-Comprehensive-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 Core Functionality
- **Customizable Timer**: Set your own focus, break, and long break durations
- **Task Management**: Associate tasks with each Pomodoro session
- **Smart Mode Switching**: Automatic switching between focus, break, and long break modes
- **Session Counter**: Track completed sessions and configure long break frequency
- **Sound Notifications**: Audio alerts when timers complete
- **Desktop Notifications**: Browser notifications for timer completion

### 📊 Analytics & Reporting
- **Comprehensive History**: Track all your Pomodoro sessions
- **Detailed Statistics**: View focus hours, break time, and productivity metrics
- **Monthly Reports**: Analyze your productivity trends over time
- **Export Functionality**: Export your data for backup or analysis
- **Visual Analytics**: Beautiful charts and progress indicators

### 💾 Data Management
- **IndexedDB Storage**: Robust local database for data persistence
- **Data Export/Import**: Backup and restore your data
- **Migration Support**: Seamless transition from localStorage
- **Data Cleanup**: Automatic cleanup of old records
- **Database Management**: Full control over your data

### 🧪 Testing & Quality
- **Comprehensive Test Suite**: Unit tests, integration tests, and UI tests
- **Database Testing**: Thorough testing of all database operations
- **Cross-browser Compatibility**: Works on all modern browsers
- **Error Handling**: Robust error handling and recovery
- **Performance Optimized**: Fast and responsive interface

### 🐳 Deployment & DevOps
- **Docker Support**: Complete containerization with Docker
- **Production Ready**: Optimized for production deployment
- **Health Checks**: Automatic health monitoring
- **Easy Deployment**: One-command deployment script
- **Scalable Architecture**: Ready for horizontal scaling

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd pomodo

# Start the application
./docker-start.sh
```

Access the application at: http://localhost:8080

### Option 2: Local Development

```bash
# Clone the repository
git clone <repository-url>
cd pomodo

# Open index.html in your browser
# Or use any local web server
python -m http.server 8080
# or
npx http-server -p 8080
```

## 🐳 Docker Deployment

### Prerequisites
- Docker installed and running
- Docker Compose (usually comes with Docker Desktop)

### Quick Start
```bash
./docker-start.sh
```

### Manual Commands
```bash
# Build and start
docker-compose up -d

# View logs
docker logs pomodoro-timer

# Stop application
docker-compose down

# Restart application
docker-compose restart
```

### Access URLs
- **Main Application**: http://localhost:8080
- **Test Suite**: http://localhost:8080/tests.html

## 🧪 Testing

### Run All Tests
1. Open http://localhost:8080/tests.html
2. Click "Run All Tests" to execute the complete test suite

### Test Categories
- **Database Tests**: IndexedDB operations, data persistence
- **Timer Tests**: Core timer functionality, mode switching
- **UI Tests**: User interface elements and interactions
- **Integration Tests**: End-to-end workflows
- **Unit Tests**: Individual function testing

### Test Results
The test suite provides detailed results including:
- Pass/fail status for each test
- Execution time and performance metrics
- Detailed error messages and debugging information
- Console output for troubleshooting

## 📁 Project Structure

```
pomodo/
├── 📄 index.html              # Main application interface
├── 🎨 styles.css              # Application styling
├── ⚡ script.js               # Core application logic
├── 💾 database.js             # IndexedDB operations
├── 🧪 unit-tests.js           # Unit test suite
├── 🧪 tests.html              # Test suite interface
├── 📖 README.md               # This file
├── 🐳 Dockerfile              # Docker container definition
├── 🐳 docker-compose.yml      # Docker orchestration
├── 🐳 .dockerignore           # Docker build exclusions
├── 🐳 docker-start.sh         # Docker startup script
├── 📖 DOCKER_README.md        # Docker documentation
└── 📖 VIBE_CODING.md          # Development journey
```

## 🎯 How It Works

### Pomodoro Technique
The application implements the Pomodoro Technique, a time management method developed by Francesco Cirillo:

1. **Focus Session**: Work on a task for 25 minutes (configurable)
2. **Short Break**: Take a 5-minute break (configurable)
3. **Long Break**: After 4 sessions, take a 15-minute break (configurable)
4. **Repeat**: Continue the cycle

### Technical Architecture
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: IndexedDB for robust local data persistence
- **Notifications**: Web Notifications API + Web Audio API
- **Testing**: Comprehensive test suite with multiple test types
- **Deployment**: Docker containerization for easy deployment

## ⚙️ Configuration

### Timer Settings
- **Focus Time**: Default 25 minutes (5-60 minutes)
- **Break Time**: Default 5 minutes (1-30 minutes)
- **Long Break Time**: Default 15 minutes (5-60 minutes)
- **Sessions Before Long Break**: Default 4 sessions (1-10 sessions)

### Features
- **Sound Notifications**: Enable/disable audio alerts
- **Desktop Notifications**: Enable/disable browser notifications
- **Auto-start**: Automatically start next session
- **Data Retention**: Configure how long to keep session history

## 🔧 Customization

### Styling
The application uses CSS custom properties for easy theming:
```css
:root {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
  --background-color: #f7f7f7;
  --text-color: #2c3e50;
}
```

### Adding Features
The modular architecture makes it easy to add new features:
- Database operations in `database.js`
- UI components in `script.js`
- Styling in `styles.css`
- Tests in `unit-tests.js`

## 🌐 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Performance

- **Lightweight**: ~50KB total bundle size
- **Fast Loading**: Optimized for quick startup
- **Responsive**: Works on all screen sizes
- **Offline Capable**: Works without internet connection
- **Memory Efficient**: Minimal memory footprint

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: Ensure all tests pass
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd pomodo

# Start development server
python -m http.server 8080

# Run tests
open http://localhost:8080/tests.html
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Francesco Cirillo** for the Pomodoro Technique
- **Modern Web Technologies** for making this possible
- **Open Source Community** for inspiration and tools
- **You** for using this application! ❤️

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** in this README
2. **Run the test suite** to identify issues
3. **Check browser console** for error messages
4. **Open an issue** on GitHub with detailed information

## 🎉 Made with Love

This project was built with passion, attention to detail, and a commitment to creating something truly useful. Every line of code, every test, and every feature was crafted with care to provide the best possible Pomodoro Timer experience.

**Happy Productivity! 🍅✨**

---

*"The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks."* 