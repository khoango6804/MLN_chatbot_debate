# AI Debate System for MLN Courses

This system implements an AI-powered debate platform for MLN111 and MLN122 courses using Gemini API and RAG (Retrieval-Augmented Generation) technology.

## Features

- Debate topic generation based on course content
- RAG-based context retrieval for relevant course materials
- Three-phase debate structure:
  1. Initial arguments
  2. Questions and responses
  3. Final summaries
- Evaluation system based on multiple criteria
- Support for Vietnamese cultural and social context

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your Google API key:
```
GOOGLE_API_KEY=your_api_key_here
```

3. Add course content:
   - Edit `course_content.py` to include the relevant course materials
   - The system will use this content for RAG-based context retrieval

## Usage

1. Initialize the debate system:
```python
from debate_system import DebateSession

session = DebateSession()
```

2. Start a debate:
```python
topic = session.start_debate()
```

3. Follow the three-phase debate structure:
   - Phase 1: Initial arguments
   - Phase 2: Questions and responses
   - Phase 3: Final summaries

## Debate Structure

1. **Opening Phase (5 minutes)**
   - AI presents the debate topic
   - Team has 5 minutes to prepare

2. **Phase 1: Initial Arguments**
   - AI presents 3 arguments
   - Team presents 3 arguments
   - Each argument should be supported by course content

3. **Phase 2: Questions and Responses**
   - AI and team alternate asking questions
   - Minimum 15 rounds of Q&A
   - Questions should test argument consistency

4. **Phase 3: Final Summaries**
   - Both sides present closing arguments
   - System evaluates based on criteria:
     - Theoretical knowledge (30%)
     - Practical application (20%)
     - Argument strength (20%)
     - Cultural relevance (15%)
     - Response quality (15%)

## Requirements

- Python 3.8+
- Google API key for Gemini
- Course content for MLN111 and MLN122 