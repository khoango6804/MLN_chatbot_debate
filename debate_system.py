from typing import List, Dict, Optional
from pydantic import BaseModel
import openai
from datetime import datetime
import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
import re
import json

load_dotenv()

class DebateTopic(BaseModel):
    topic: str
    description: str
    subject: str  # MLN111 or MLN122
    preparation_time: int = 5  # minutes

class DebateTeam(BaseModel):
    team_id: str
    members: List[str]
    position: str  # "support" or "oppose"
    points: List[str] = []
    questions: List[str] = []
    responses: List[str] = []

class DebateSession(BaseModel):
    session_id: str
    topic: DebateTopic
    ai_team: DebateTeam
    student_team: DebateTeam
    current_phase: int = 0  # 0: preparation, 1: opening, 2: questioning, 3: closing
    start_time: datetime
    round_count: int = 0

class TeamArguments(BaseModel):
    team_arguments: List[str]

class TeamResponses(BaseModel):
    team_responses: List[str]

class DebateSystem:
    def __init__(self):
        # Load environment variables from backend/.env
        load_dotenv('backend/.env')
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
        genai.configure(api_key=self.api_key)
        
        # Initialize Gemini model
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.api_key,
            temperature=0.7
        )
        
        # Initialize embeddings
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=self.api_key
        )
        
        # Initialize vector store
        self.vector_store = None
        
    def create_debate_session(self, topic: DebateTopic, student_team: DebateTeam) -> DebateSession:
        session_id = f"debate_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create AI team with opposite position
        ai_position = "oppose" if student_team.position == "support" else "support"
        ai_team = DebateTeam(
            team_id="ai_team",
            members=["AI Debater"],
            position=ai_position
        )

        session = DebateSession(
            session_id=session_id,
            topic=topic,
            ai_team=ai_team,
            student_team=student_team,
            start_time=datetime.now()
        )
        
        self.active_sessions[session_id] = session
        return session

    def generate_ai_opening_points(self, session: DebateSession) -> List[str]:
        prompt = f"""
        Generate 3 strong debate points for the topic: {session.topic.topic}
        Subject: {session.topic.subject}
        Position: {session.ai_team.position}
        
        Requirements:
        - Points should be based on MLN111/MLN122 curriculum
        - Include practical applications relevant to Vietnamese context
        - Provide clear evidence and examples
        - Follow Socratic method of reasoning
        """
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        points = response.choices[0].message.content.split("\n")
        session.ai_team.points = points
        return points

    def generate_ai_questions(self, session: DebateSession) -> List[str]:
        prompt = f"""
        Generate 3 challenging questions based on the student team's points:
        {session.student_team.points}
        
        Topic: {session.topic.topic}
        Position: {session.ai_team.position}
        
        Requirements:
        - Questions should follow Socratic method
        - Focus on logical reasoning and evidence
        - Challenge assumptions and implications
        """
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )
        
        questions = response.choices[0].message.content.split("\n")
        session.ai_team.questions.extend(questions)
        return questions

    def generate_ai_closing_summary(self, session: DebateSession) -> str:
        prompt = f"""
        Generate a closing summary for the debate:
        Topic: {session.topic.topic}
        Position: {session.ai_team.position}
        AI Points: {session.ai_team.points}
        Student Points: {session.student_team.points}
        Questions and Responses: {session.ai_team.questions}
        
        Requirements:
        - Summarize key arguments
        - Highlight strengths of AI position
        - Address weaknesses in opposing arguments
        - Maintain academic rigor
        """
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content

    def evaluate_debate(self, team_arguments, ai_arguments, team_responses, ai_responses, student_summary=None, ai_summary=None):
        print("DEBUG - Chấm điểm với các dữ liệu:")
        print("Luận điểm AI:", ai_arguments)
        print("Luận điểm nhóm:", team_arguments)
        print("Hỏi đáp:", team_responses)
        print("Tóm tắt SV:", student_summary)
        print("Tóm tắt AI:", ai_summary)
        prompt = f"""
Bạn là giám khảo debate. Hãy chấm điểm cho hai bên (AI và Nhóm) dựa trên các tiêu chí sau, mỗi tiêu chí cho điểm từ 0 đến 10:

1. Kiến thức lý thuyết (theoretical_knowledge)
2. Ứng dụng thực tiễn (practical_application)
3. Sức mạnh lập luận (argument_strength)
4. Liên hệ văn hóa, xã hội, chính trị Việt Nam (cultural_relevance)
5. Chất lượng phản biện, trả lời (response_quality)

Dữ liệu debate:
- Luận điểm của AI: {ai_arguments}
- Luận điểm của Nhóm: {team_arguments}
- Phản biện/trả lời của AI: {ai_responses}
- Phản biện/trả lời của Nhóm: {team_responses}
- Tóm tắt của nhóm: {student_summary}
- Tóm tắt của AI: {ai_summary}

Yêu cầu:
- Chỉ trả về đúng format JSON như sau (không thêm bất kỳ ký tự nào ngoài JSON, không giải thích, không xuống dòng ngoài JSON):
{{
  "team_score": {{
    "theoretical_knowledge": 0-10,
    "practical_application": 0-10,
    "argument_strength": 0-10,
    "cultural_relevance": 0-10,
    "response_quality": 0-10
  }},
  "ai_score": {{
    "theoretical_knowledge": 0-10,
    "practical_application": 0-10,
    "argument_strength": 0-10,
    "cultural_relevance": 0-10,
    "response_quality": 0-10
  }},
  "winner": "team" hoặc "ai",
  "feedback": {{
    "team": "Nhận xét ngắn gọn về nhóm",
    "ai": "Nhận xét ngắn gọn về AI"
  }}
}}
- Nếu không đúng format JSON trên, bạn sẽ bị 0 điểm.
- Tất cả phải bằng tiếng Việt.
"""
        response = self.model.invoke(prompt)
        print("DEBUG - AI raw response:", response.content)
        def clean_json_content(content):
            import re
            # Loại bỏ ```json ở đầu và ``` ở cuối nếu có
            content = re.sub(r"^```json", "", content.strip())
            content = re.sub(r"```$", "", content.strip())
            return content.strip()
        try:
            cleaned = clean_json_content(response.content)
            result = json.loads(cleaned)
        except Exception:
            print("DEBUG - Không parse được JSON, content:", response.content)
            result = {
                "team_score": {
                    "theoretical_knowledge": 0,
                    "practical_application": 0,
                    "argument_strength": 0,
                    "cultural_relevance": 0,
                    "response_quality": 0
                },
                "ai_score": {
                    "theoretical_knowledge": 0,
                    "practical_application": 0,
                    "argument_strength": 0,
                    "cultural_relevance": 0,
                    "response_quality": 0
                },
                "winner": "undefined",
                "feedback": {
                    "team": "Không có nhận xét.",
                    "ai": "Không có nhận xét."
                }
            }
        return result

    def load_knowledge_base(self, course_content: str):
        """Load and process course content into vector store"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_text(course_content)
        
        self.vector_store = Chroma.from_texts(
            texts=texts,
            embedding=self.embeddings
        )
    
    def get_relevant_context(self, query: str, k: int = 3) -> List[str]:
        """Retrieve relevant context from knowledge base"""
        if not self.vector_store:
            return []
        
        docs = self.vector_store.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]
    
    def generate_debate_topic(self) -> str:
        """Generate a debate topic based on course content"""
        prompt = """
Hãy tạo một chủ đề debate ngắn gọn (không quá 2 dòng), chỉ trả về đúng chủ đề debate (không giải thích thêm), liên quan đến MLN111 hoặc MLN122, phù hợp với văn hóa, xã hội, chính trị Việt Nam, có tính ứng dụng thực tiễn, và có thể tranh luận từ nhiều góc nhìn. Chủ đề phải bám sát nội dung môn học. 
Sau đó, hãy LIỆT KÊ các ý sau, mỗi ý trên 1 dòng, chỉ viết hoa chữ cái đầu tiên của mỗi ý, KHÔNG viết hoa toàn bộ, KHÔNG dùng dấu *, và PHẢI XUỐNG DÒNG bằng ký tự \\n:
Chủ đề: ...
Lý do chủ đề phù hợp:
- Tính ứng dụng: ...
- Ý nghĩa văn hóa: ...
- Khả năng tranh luận: ...
Tất cả phải viết bằng tiếng Việt, xuống dòng rõ ràng, không giải thích dài dòng, không viết hoa toàn bộ.
Ví dụ:
Chủ đề: Ứng dụng AI trong giáo dục Việt Nam: Lợi ích và thách thức
Lý do chủ đề phù hợp:
- Tính ứng dụng: AI giúp cá nhân hóa học tập, hỗ trợ giáo viên và học sinh.
- Ý nghĩa văn hóa: Góp phần giữ gìn và phát huy bản sắc dân tộc trong thời đại số.
- Khả năng tranh luận: Có nhiều ý kiến trái chiều về tác động của AI đến giáo dục truyền thống.
"""
        response = self.model.invoke(prompt)
        return response.content
    
    def generate_arguments(self, topic: str, side: str) -> List[str]:
        """Generate arguments for a specific side of the debate"""
        context = self.get_relevant_context(topic)
        prompt = f"""
Dựa trên các thông tin sau và tài liệu môn học, hãy tạo 3 luận điểm mạnh để bảo vệ phe {side} cho chủ đề debate: {topic}

Context:
{' '.join(context)}

Yêu cầu:
1. Mỗi luận điểm phải có dẫn chứng lý thuyết
2. Có ví dụ thực tiễn liên quan đến Việt Nam
3. Lập luận rõ ràng, thuyết phục
4. **Tất cả phải viết bằng tiếng Việt**
"""
        response = self.model.invoke(prompt)
        return response.content.split('\n')
    
    def generate_questions(self, arguments: List[str], topic: str) -> List[str]:
        """Generate challenging questions based on opponent's arguments"""
        context = self.get_relevant_context(topic)
        prompt = f"""
Dựa trên các luận điểm sau:
{' '.join(arguments)}

Hãy tạo 3 câu hỏi phản biện sắc bén, kiểm tra tính logic, phát hiện điểm yếu, và liên hệ thực tiễn Việt Nam.
Tất cả phải viết bằng tiếng Việt, mỗi câu hỏi trên 1 dòng, đánh số thứ tự rõ ràng (1., 2., 3.), không để dòng trống, không có phần giới thiệu.

Context:
{' '.join(context)}
"""
        response = self.model.invoke(prompt)
        # Lọc chỉ lấy các dòng bắt đầu bằng số thứ tự (1., 2., 3.)
        questions = [line.strip() for line in response.content.split('\n') if re.match(r'^[0-9]+\.', line.strip())]
        print("DEBUG - AI raw response:", response.content)
        print("DEBUG - Generated questions:", questions)
        return questions
    

class DebateSession:
    def __init__(self):
        self.debate_system = DebateSystem()
        self.current_phase = 0
        self.topic = ""
        self.team_arguments = []
        self.ai_arguments = []
        self.questions = []
        self.responses = []
        self.turns = []  # Danh sách các lượt hỏi đáp, mỗi lượt là dict: {turn, asker, question, answer}
        self.chat_history = []  # Lưu toàn bộ nội dung chat các phase

    def add_turn(self, asker, question, answer=None):
        self.turns.append({
            "turn": len(self.turns) + 1,
            "asker": asker,
            "question": question,
            "answer": answer
        })
        # Lưu vào chat_history
        self.chat_history.append({
            "phase": 2,
            "role": asker,
            "content": f"Q: {question}\nA: {answer if answer else ''}"
        })

    def get_current_turn(self):
        if self.turns:
            return self.turns[-1]
        return None

    def reset_turns(self):
        self.turns = []

    def start_debate(self):
        """Initialize a new debate session"""
        self.topic = self.debate_system.generate_debate_topic()
        # Lưu vào chat_history
        self.chat_history.append({
            "phase": 0,
            "role": "system",
            "content": f"Chủ đề debate: {self.topic}"
        })
        return self.topic
    
    def phase1_arguments(self):
        """Handle Phase 1: Initial arguments"""
        self.ai_arguments = self.debate_system.generate_arguments(self.topic, "AI")
        # Lưu luận điểm AI
        for arg in self.ai_arguments:
            self.chat_history.append({
                "phase": 1,
                "role": "ai",
                "content": arg
            })
        return self.ai_arguments
    
    def save_student_arguments(self, student_args):
        self.team_arguments = student_args
        for arg in student_args:
            self.chat_history.append({
                "phase": 1,
                "role": "student",
                "content": arg
            })

    def phase2_questions(self):
        """Handle Phase 2: Questions and responses"""
        print("Received data:", self.team_arguments)
        self.questions = self.debate_system.generate_questions(self.team_arguments, self.topic)
        print("Generated questions:", self.questions)
        return self.questions
    
    def phase3_summary(self, student_summary=None, ai_summary=None):
        # Lưu tóm tắt phase 3
        if student_summary:
            self.chat_history.append({
                "phase": 3,
                "role": "student",
                "content": student_summary
            })
        if ai_summary:
            self.chat_history.append({
                "phase": 3,
                "role": "ai",
                "content": ai_summary
            })
        # Gọi hàm evaluate_debate với đầy đủ tham số
        evaluation = self.debate_system.evaluate_debate(
            team_arguments=self.team_arguments,
            ai_arguments=self.ai_arguments,
            team_responses=self.responses,
            ai_responses=self.questions,
            student_summary=student_summary,
            ai_summary=ai_summary
        )
        return evaluation

def safe_json_parse(content):
    # Loại bỏ ```json và ```
    content = re.sub(r"^```json|```$", "", content.strip())
    # Loại bỏ các ký tự thừa đầu/cuối
    content = content.strip()
    return json.loads(content) 