# 🎯 AI Debate System

<div align="center">

![AI Debate System](https://img.shields.io/badge/AI%20Debate-System-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=flat&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB.svg?style=flat&logo=python)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**🌐 [Live Demo](https://mlndebate.io.vn) | 👨‍💼 [Admin Dashboard](https://mlndebate.io.vn/admin)**

*An advanced AI-powered debate platform designed for educational purposes, featuring real-time scoring, comprehensive analytics, and interactive debate sessions between students and AI.*

</div>

---

## 📖 Table of Contents

- [🎯 AI Debate System](#-ai-debate-system)
  - [📖 Table of Contents](#-table-of-contents)
  - [🌟 Overview](#-overview)
  - [✨ Key Features](#-key-features)
  - [🏗️ System Architecture](#️-system-architecture)
  - [🛠️ Technology Stack](#️-technology-stack)
  - [⚡ Quick Start](#-quick-start)
  - [📋 Prerequisites](#-prerequisites)
  - [🔧 Installation](#-installation)
  - [🚀 Development](#-development)
  - [🌐 Production Deployment](#-production-deployment)
  - [📊 Debate Flow](#-debate-flow)
  - [🎯 Scoring System](#-scoring-system)
  - [🔗 API Documentation](#-api-documentation)
  - [📱 Features Breakdown](#-features-breakdown)
  - [🎨 UI/UX Design](#-uiux-design)
  - [🔒 Security Features](#-security-features)
  - [📈 Analytics & Monitoring](#-analytics--monitoring)
  - [🧪 Testing](#-testing)
  - [🤝 Contributing](#-contributing)
  - [👥 Development Team](#-development-team)
  - [📝 License](#-license)
  - [🙏 Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

The **AI Debate System** is a sophisticated educational platform that facilitates structured debates between students and artificial intelligence. Developed as part of the Machine Learning and Neural Networks (MLN111-MLN122) coursework at FPT University Ho Chi Minh City, this system provides a comprehensive framework for improving students' critical thinking, argumentation skills, and AI interaction capabilities.

The platform features a multi-phase debate structure, real-time scoring, comprehensive analytics, and an intuitive user interface designed to enhance the learning experience while providing educators with powerful tools to monitor and evaluate student performance.

---

## ✨ Key Features

### 🎭 **Core Debate Features**
- **Multi-Phase Debate Structure**: 4-phase comprehensive debate flow
- **AI-Powered Opposition**: Advanced AI responses using state-of-the-art language models
- **Real-Time Interaction**: Live debate sessions with instant feedback
- **Dynamic Topic Generation**: AI-generated debate topics across various domains

### 📊 **Analytics & Scoring**
- **Comprehensive Scoring System**: 25-point scoring across 4 phases
- **Real-Time Leaderboard**: Live ranking with tier-based achievements (Platinum, Gold, Silver, Bronze)
- **Performance Analytics**: Detailed breakdown of student performance metrics
- **Progress Tracking**: Historical data and improvement trends

### 👨‍💼 **Administrative Tools**
- **Admin Dashboard**: Complete session management and monitoring
- **Live Scoring Interface**: Real-time tracking of concurrent debates
- **Session Management**: Start, monitor, and evaluate debate sessions
- **Data Export**: Download session data and analytics reports

### 🎨 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Apple-Style Interface**: Modern glassmorphism design with smooth animations
- **Accessibility**: WCAG compliant interface with keyboard navigation support
- **Multi-Language Support**: Vietnamese and English language options

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (SQLite)      │
│   Port: 3001    │    │   Port: 5000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  Nginx Proxy    │              │
         └──────────────┤  SSL/HTTPS      ├──────────────┘
                        │  mlndebate.io.vn│
                        └─────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18.2.0 with Hooks and Context API
- **UI Library**: Material-UI (MUI) v5 with custom theming
- **Styling**: CSS-in-JS with styled-components and glassmorphism effects
- **HTTP Client**: Axios for API communication
- **Date Handling**: date-fns for timestamp management
- **Build Tool**: Create React App with Webpack optimization

### **Backend**
- **Framework**: FastAPI with automatic OpenAPI documentation
- **Language**: Python 3.9+ with type hints and async support
- **AI Integration**: LangChain with OpenAI GPT models
- **Database**: SQLite with SQLAlchemy ORM
- **Validation**: Pydantic models for request/response validation
- **CORS**: Configured for cross-origin resource sharing

### **Infrastructure**
- **Web Server**: Nginx 1.18+ as reverse proxy
- **SSL**: Let's Encrypt certificates with auto-renewal
- **Hosting**: DigitalOcean Droplet (Ubuntu 22.04 LTS)
- **Domain**: Custom domain with DNS configuration
- **Process Management**: systemd for service management

### **Development Tools**
- **Version Control**: Git with GitHub
- **Code Quality**: ESLint, Prettier for code formatting
- **Package Management**: npm/yarn for frontend, pip for backend
- **Documentation**: Markdown with Mermaid diagrams

---

## ⚡ Quick Start

### 🐳 **Using Docker (Recommended)**

```bash
# Clone the repository
git clone https://github.com/your-org/ai-debate-system.git
cd ai-debate-system

# Start with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:3001
```

### 🔧 **Manual Setup**

```bash
# Clone and setup
git clone https://github.com/your-org/ai-debate-system.git
cd ai-debate-system

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

---

## 📋 Prerequisites

### **System Requirements**
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows 10+
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 2GB free disk space
- **Network**: Stable internet connection for AI API calls

### **Software Dependencies**
- **Node.js**: Version 16.0+ with npm 7.0+
- **Python**: Version 3.9+ with pip
- **Git**: Latest version for repository management

### **API Keys**
- **OpenAI API Key**: Required for AI debate functionality
- **Optional**: Additional AI service API keys for extended functionality

---

## 🔧 Installation

### **1. Environment Setup**

```bash
# Backend environment variables
cd backend
cp .env.example .env
```

Edit `.env` file:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Database Configuration
DATABASE_URL=sqlite:///./debate_system.db

# Server Configuration
HOST=0.0.0.0
PORT=5000
DEBUG=True

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3001,https://mlndebate.io.vn
```

### **2. Backend Installation**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python -c "from database import init_db; init_db()"

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

### **3. Frontend Installation**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### **4. Verification**

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/api/health

---

## 🚀 Development

### **Development Workflow**

```bash
# Start backend with hot reload
cd backend
uvicorn main:app --reload --port 5000

# Start frontend with hot reload (separate terminal)
cd frontend
npm start

# Run tests
cd backend && python -m pytest
cd frontend && npm test
```

### **Code Quality**

```bash
# Frontend linting
cd frontend
npm run lint
npm run format

# Backend linting
cd backend
black .
flake8 .
mypy .
```

### **Development Commands**

```bash
# Create new React component
cd frontend/src/components
npx generate-react-cli component ComponentName

# Add new API endpoint
cd backend
# Edit routes.py and add your endpoint

# Database migrations
cd backend
# Modify models.py
python migrate.py
```

---

## 🌐 Production Deployment

### **Server Setup**

```bash
# 1. Server preparation
sudo apt update && sudo apt upgrade -y
sudo apt install nginx python3-pip nodejs npm -y

# 2. Clone repository
git clone https://github.com/your-org/ai-debate-system.git
cd ai-debate-system

# 3. Backend deployment
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Frontend build
cd ../frontend
npm install
npm run build

# 5. Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/mlndebate.io.vn
sudo ln -s /etc/nginx/sites-available/mlndebate.io.vn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 6. SSL setup
sudo certbot --nginx -d mlndebate.io.vn -d www.mlndebate.io.vn
```

### **Process Management**

```bash
# Create systemd service for backend
sudo tee /etc/systemd/system/debate-backend.service > /dev/null <<EOF
[Unit]
Description=AI Debate System Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/backend/venv/bin
ExecStart=/path/to/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 5000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable debate-backend.service
sudo systemctl start debate-backend.service
```

### **Monitoring Setup**

```bash
# System monitoring
sudo apt install htop iotop nethogs -y

# Log monitoring
sudo tail -f /var/log/nginx/access.log
sudo journalctl -u debate-backend.service -f
```

---

## 📊 Debate Flow

### **Phase Structure**

| Phase | Description | Duration | Points | Focus Area |
|-------|-------------|----------|--------|------------|
| **Phase 1** | Luận điểm ban đầu | 10 mins | 25 | Initial arguments and position establishment |
| **Phase 2A** | AI hỏi, SV trả lời | 15 mins | 25 | Response to AI challenges and questions |
| **Phase 2B** | SV hỏi, AI trả lời | 15 mins | 25 | Student-led questioning and critical analysis |
| **Phase 3** | Kết luận & Tổng hợp | 10 mins | 25 | Final arguments and comprehensive summary |

### **Detailed Flow**

```
Session Start → Topic Selection → Phase 1: Initial Arguments
     ↓
AI Evaluation → Phase 2A: AI Questions → Student Responses
     ↓
Phase 2B: Student Questions → AI Responses → Phase 3: Final Arguments
     ↓
Final Evaluation → Score Calculation → Session Complete
```

---

## 🎯 Scoring System

### **Evaluation Criteria**

#### **Phase 1: Initial Arguments (25 points)**
- **Logic and Reasoning** (8 points): Clarity of argumentation and logical flow
- **Evidence Quality** (7 points): Use of credible sources and supporting data
- **Presentation** (5 points): Structure, clarity, and communication effectiveness
- **Originality** (5 points): Creative approaches and unique perspectives

#### **Phase 2A: Response to AI (25 points)**
- **Comprehension** (8 points): Understanding of AI questions and challenges
- **Rebuttal Quality** (7 points): Effectiveness of counterarguments
- **Adaptability** (5 points): Ability to adjust arguments based on new information
- **Critical Thinking** (5 points): Depth of analysis and evaluation

#### **Phase 2B: Questioning AI (25 points)**
- **Question Quality** (8 points): Relevance and depth of questions posed
- **Strategic Thinking** (7 points): Tactical approach to challenging AI positions
- **Follow-up Skills** (5 points): Building upon AI responses effectively
- **Analytical Depth** (5 points): Probing beneath surface-level responses

#### **Phase 3: Final Arguments (25 points)**
- **Synthesis** (8 points): Integration of all debate elements
- **Persuasiveness** (7 points): Convincing final argumentation
- **Conclusion Quality** (5 points): Strong, memorable closing statements
- **Overall Impact** (5 points): Lasting impression and debate mastery

### **Ranking System**

| Tier | Score Range | Percentage | Description |
|------|-------------|------------|-------------|
| 🏆 **Platinum** | 90-100 | 90%+ | Exceptional debate mastery |
| 🥇 **Gold** | 80-89 | 80-89% | Strong argumentative skills |
| 🥈 **Silver** | 70-79 | 70-79% | Competent debate performance |
| 🥉 **Bronze** | 60-69 | 60-69% | Basic debate understanding |

---

## 🔗 API Documentation

### **Authentication**
```http
# No authentication required for student sessions
# Admin endpoints use session-based authentication
```

### **Core Endpoints**

#### **Debate Management**

```http
POST /api/debate/start
Content-Type: application/json

{
  "team_id": "string",
  "members": ["string"],
  "course_code": "string"
}
```

```http
GET /api/debate/{team_id}/status
Response: {
  "team_id": "string",
  "current_phase": "integer",
  "topic": "string",
  "started_at": "datetime",
  "status": "string"
}
```

```http
POST /api/debate/{team_id}/phase1
Content-Type: application/json

{
  "arguments": "string"
}
```

#### **Admin Endpoints**

```http
GET /api/admin/sessions
Response: {
  "active": [...],
  "completed": [...],
  "total_count": "integer"
}
```

```http
GET /api/admin/leaderboard
Response: {
  "leaderboard": [...],
  "statistics": {
    "total_teams": "integer",
    "average_score": "float",
    "highest_score": "integer"
  }
}
```

```http
GET /api/admin/live-scoring
Response: {
  "active_teams": [...],
  "statistics": {...}
}
```

### **WebSocket Events**

```javascript
// Real-time updates for live scoring
const ws = new WebSocket('ws://localhost:5000/ws/live-scoring');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time scoring updates
};
```

---

## 📱 Features Breakdown

### **Student Interface**

#### **Debate Session**
- **Topic Display**: Clear presentation of debate topic and context
- **Phase Navigation**: Intuitive progress tracking through debate phases
- **Real-time Feedback**: Immediate responses and scoring updates
- **Timer Management**: Visual countdown and phase time tracking

#### **Argument Input**
- **Rich Text Editor**: Formatted text input with markdown support
- **Auto-save**: Continuous saving to prevent data loss
- **Character Limits**: Guidance on argument length requirements
- **Submission Validation**: Ensures complete responses before proceeding

### **Admin Dashboard**

#### **Session Overview**
- **Active Sessions Grid**: Real-time view of ongoing debates
- **Session Details Modal**: Comprehensive session information
- **Quick Actions**: Start, pause, end, or force-complete sessions
- **Bulk Operations**: Multi-session management capabilities

#### **Analytics Panel**
- **Performance Metrics**: Detailed scoring breakdowns
- **Trend Analysis**: Historical performance patterns
- **Export Capabilities**: CSV/Excel export for further analysis
- **Custom Reports**: Tailored analytics for specific timeframes

### **Live Scoring Interface**

#### **Real-time Updates**
- **Auto-refresh**: 3-second interval updates
- **Live Statistics**: Dynamic calculation of averages and totals
- **Phase Progress**: Visual indicators of team progress
- **Concurrent Tracking**: Monitor multiple teams simultaneously

#### **Interactive Elements**
- **Drill-down Details**: Click for comprehensive team information
- **Sorting Options**: Multiple criteria for data organization
- **Filter Controls**: Focus on specific teams or phases
- **Responsive Design**: Optimized for various screen sizes

---

## 🎨 UI/UX Design

### **Design Philosophy**
The AI Debate System employs a modern, Apple-inspired design language that prioritizes clarity, accessibility, and user engagement. The interface combines glassmorphism effects with clean typography and intuitive navigation patterns.

### **Visual Elements**

#### **Color Palette**
```scss
// Primary Colors
$primary-blue: linear-gradient(135deg, #7ecbff 0%, #007AFF 100%);
$secondary-blue: #4682b4;
$accent-teal: #20b2aa;

// Status Colors
$success-green: #28a745;
$warning-orange: #ffc107;
$error-red: #dc3545;
$info-blue: #17a2b8;

// Glassmorphism
$glass-background: rgba(255, 255, 255, 0.1);
$backdrop-blur: blur(20px);
```

#### **Typography**
- **Primary Font**: Inter, system-ui, sans-serif
- **Headings**: 700 weight with proper hierarchy
- **Body Text**: 400-500 weight for optimal readability

#### **Glassmorphism Effects**
- **Backdrop Filter**: `blur(20px)` for modern glass effect
- **Transparent Backgrounds**: `rgba(255,255,255,0.1)` overlays
- **Smooth Animations**: CSS transitions for enhanced user experience

### **Responsive Breakpoints**
```scss
$breakpoints: (
  xs: 0px,      // Extra small devices
  sm: 600px,    // Small devices (tablets)
  md: 960px,    // Medium devices (small laptops)
  lg: 1280px,   // Large devices (desktops)
  xl: 1920px    // Extra large devices
);
```

### **Accessibility Features**
- **WCAG 2.1 AA Compliance**: Color contrast ratios of 4.5:1 or higher
- **Keyboard Navigation**: Full tab-based navigation support
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **Focus Management**: Clear visual focus indicators
- **Reduced Motion**: Respects user motion preferences

---

## 🔒 Security Features

### **Frontend Security**
- **Content Security Policy**: Strict CSP headers preventing XSS
- **HTTPS Enforcement**: SSL/TLS encryption for all communications
- **Input Sanitization**: Client-side validation and sanitization

### **Backend Security**
- **CORS Configuration**: Restricted origin policies
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Pydantic models for request validation
- **SQL Injection Prevention**: ORM-based database queries

### **Infrastructure Security**
- **SSL Certificate Management**: Auto-renewal with Let's Encrypt
- **Firewall Configuration**: UFW rules for port management
- **SSH Key Authentication**: Disabled password authentication

### **Data Privacy**
- **Minimal Data Collection**: Only necessary information stored
- **Session Isolation**: Complete separation between team sessions
- **Data Retention**: Configurable retention policies
- **Export Controls**: Secure admin-only data access

---

## 📈 Analytics & Monitoring

### **Performance Metrics**

#### **System Performance**
- **Response Times**: API endpoint latency monitoring
- **Throughput**: Requests per second capacity
- **Error Rates**: 4xx/5xx error tracking and analysis
- **Resource Utilization**: CPU, memory, and disk usage

#### **User Analytics**
- **Session Duration**: Average time spent in debates
- **Completion Rates**: Percentage of completed vs. abandoned sessions
- **Performance Trends**: Score improvements over time
- **Feature Usage**: Most/least used platform features

### **Monitoring Dashboard**

```bash
# System monitoring commands
htop                    # Real-time process monitoring
iotop                   # Disk I/O monitoring
nethogs                 # Network usage by process
df -h                   # Disk space usage

# Service monitoring
systemctl status nginx
systemctl status debate-backend
journalctl -u debate-backend -f
```

### **Log Management**

#### **Application Logs**
```python
# Backend logging configuration
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/debate-system/app.log'),
        logging.StreamHandler()
    ]
)
```

#### **Nginx Logs**
```bash
# Access logs
tail -f /var/log/nginx/mlndebate_access.log

# Error logs
tail -f /var/log/nginx/mlndebate_error.log

# Log analysis
goaccess /var/log/nginx/mlndebate_access.log --log-format=COMBINED
```

---

## 🧪 Testing

### **Frontend Testing**

#### **Unit Tests**
```bash
cd frontend
npm test                # Run all tests
npm test -- --coverage # Run with coverage report
npm test -- --watch    # Watch mode for development
```

#### **Component Testing**
```javascript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import DebateSession from '../components/DebateSession';

test('renders debate session correctly', () => {
  render(<DebateSession teamId="test-123" />);
  expect(screen.getByText('Phase 1: Initial Arguments')).toBeInTheDocument();
});
```

#### **Integration Tests**
```javascript
// Example integration test
import { render, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const server = setupServer(
  rest.get('/api/debate/test-123/status', (req, res, ctx) => {
    return res(ctx.json({ current_phase: 1, topic: 'Test Topic' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### **Backend Testing**

#### **API Tests**
```bash
cd backend
python -m pytest tests/              # Run all tests
python -m pytest --cov=. tests/      # Run with coverage
python -m pytest -v tests/           # Verbose output
```

#### **Test Structure**
```python
# tests/test_debate_routes.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_start_debate_session():
    response = client.post("/api/debate/start", json={
        "team_id": "test-team",
        "members": ["Student 1"],
        "course_code": "MLN111"
    })
    assert response.status_code == 200
    assert response.json()["team_id"] == "test-team"
```

### **End-to-End Testing**

#### **Cypress Configuration**
```javascript
// cypress/integration/debate_flow.spec.js
describe('Complete Debate Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete a full debate session', () => {
    // Start session
    cy.get('[data-testid=team-id-input]').type('e2e-test');
    cy.get('[data-testid=start-session]').click();
    
    // Phase 1
    cy.get('[data-testid=arguments-input]').type('Initial arguments...');
    cy.get('[data-testid=submit-phase1]').click();
    
    // Continue through all phases...
  });
});
```

### **Performance Testing**

#### **Load Testing with Artillery**
```yaml
# artillery-config.yml
config:
  target: 'https://mlndebate.io.vn'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Start debate session"
    requests:
      - post:
          url: "/api/debate/start"
          json:
            team_id: "load-test-{{ $randomString() }}"
            members: ["Test User"]
            course_code: "MLN111"
```

---

## 🤝 Contributing

### **Development Guidelines**

#### **Code Style**
- **Frontend**: Follow Airbnb React/JavaScript style guide
- **Backend**: Follow PEP 8 with Black formatter
- **Commit Messages**: Use Conventional Commits format
- **Documentation**: Update README and inline docs for new features

#### **Branch Strategy**
```bash
# Feature development
git checkout -b feature/new-debate-feature
git commit -m "feat: add new debate feature"

# Bug fixes
git checkout -b fix/scoring-calculation
git commit -m "fix: correct scoring calculation logic"

# Documentation
git checkout -b docs/api-documentation
git commit -m "docs: update API documentation"
```

#### **Pull Request Process**
1. **Fork** the repository and create your feature branch
2. **Implement** your changes with comprehensive tests
3. **Update** documentation and ensure all tests pass
4. **Submit** a pull request with detailed description
5. **Address** review feedback and iterate as needed

### **Issue Reporting**

#### **Bug Reports**
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Version: [e.g. 1.0.0]
```

#### **Feature Requests**
```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why this feature would be valuable

## Proposed Implementation
High-level approach to implementation

## Additional Context
Any other context or screenshots
```

---

## 👥 Development Team

### **🎓 Academic Supervisors**
- **Nguyễn Văn Bình** - *Lead Instructor & Project Supervisor*
- **Tô Hải Anh** - *Technical Advisor & Assessment Coordinator*

### **👨‍💻 Development Team** *(MLN111-MLN122, Class AI1804)*

| Name | Role | Specialization | GitHub |
|------|------|----------------|--------|
| **Ngô Quốc Anh Khoa** | *Team Lead & Full-Stack Developer* | System Architecture, AI Integration | [@anhkhoango](https://github.com/anhkhoango) |
| **Văn Hồng Bảo Trân** | *Frontend Lead & UI/UX Designer* | React Development, Design Systems | [@baotran](https://github.com/baotran) |
| **Trần Huy Anh** | *Backend Developer* | API Development, Database Design | [@huyanh](https://github.com/huyanh) |
| **Nguyễn Xuân An** | *DevOps Engineer* | Deployment, Infrastructure | [@xuanan](https://github.com/xuanan) |
| **Vũ Anh Khôi** | *AI Specialist* | Machine Learning, NLP Integration | [@anhkhoi](https://github.com/anhkhoi) |
| **Nguyễn Lê Hoàng Phúc** | *Frontend Developer* | Component Development, Testing | [@hoangphuc](https://github.com/hoangphuc) |
| **Nguyễn Song Châu Thịnh** | *Backend Developer* | API Security, Authentication | [@chauthinh](https://github.com/chauthinh) |
| **Nguyễn Hữu Dương** | *Quality Assurance* | Testing, Documentation | [@huuduong](https://github.com/huuduong) |
| **Trần Đình Gia Bảo** | *Data Analyst* | Analytics, Performance Monitoring | [@giabao](https://github.com/giabao) |

### **🏢 Institution**
**FPT University Ho Chi Minh City** - *Soft Skills Department*
- **Address**: 686 Nguyen Huu Tho, District 7, Ho Chi Minh City, Vietnam
- **Website**: [fpt.edu.vn](https://fpt.edu.vn)
- **Department**: [Soft Skills Center](https://www.facebook.com/SSC.FPTU.HCM)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 AI Debate System Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

### **Technology Partners**
- **OpenAI** for providing advanced language models that power our AI debate opponent
- **Material-UI Team** for the comprehensive React component library
- **FastAPI Community** for the modern, fast web framework
- **DigitalOcean** for reliable cloud infrastructure hosting

### **Educational Resources**
- **FPT University** for providing the academic framework and support
- **Soft Skills Department** for guidance on educational best practices
- **Machine Learning Community** for inspiration and technical guidance

### **Open Source Community**
- **React Team** for the powerful frontend framework
- **Python Software Foundation** for the robust backend language
- **Nginx Team** for the efficient reverse proxy solution
- **Let's Encrypt** for free SSL certificate automation

### **Special Thanks**
- **Students of MLN111-MLN122** for beta testing and valuable feedback
- **Academic Staff** for continuous support and guidance
- **Industry Mentors** who provided practical insights
- **Open Source Contributors** whose libraries made this project possible

---

<div align="center">

**🎯 [Visit AI Debate System](https://mlndebate.io.vn)**

*Built with ❤️ by FPT University Students*

![Footer Image](https://img.shields.io/badge/Made%20with-❤️-red.svg)
![University](https://img.shields.io/badge/FPT%20University-HCMC-blue.svg)
![Course](https://img.shields.io/badge/Course-MLN111--MLN122-green.svg)

</div>

---

*Last Updated: June 28, 2025*
*Version: 1.0.0*
*Status: Production Ready ✅* 