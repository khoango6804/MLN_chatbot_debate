from typing import List, Dict, Optional, Any
import os
import json
import random
import re
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.pydantic_v1 import BaseModel, Field
from course_content import MLN111_TOPICS, MLN122_TOPICS

# Construct the absolute path to the .env file inside the backend directory
script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

DEBATE_CRITERIA = {
    "phase1": [
        {"id": "1.1", "name": "Hiểu biết & nhận thức", "max_score": 6},
        {"id": "1.2", "name": "Tư duy phản biện", "max_score": 4},
        {"id": "1.3", "name": "Nhận diện văn hóa – xã hội", "max_score": 3},
        {"id": "1.4", "name": "Bản sắc & chiến lược", "max_score": 4},
        {"id": "1.5", "name": "Sáng tạo học thuật", "max_score": 4},
        {"id": "1.6", "name": "Đạo đức học thuật", "max_score": 4},
    ],
    "phase2A": [
        {"id": "2A.1", "name": "Hiểu biết & nhận thức", "max_score": 5},
        {"id": "2A.2", "name": "Tư duy phản biện", "max_score": 5},
        {"id": "2A.3", "name": "Ngôn ngữ & thuật ngữ", "max_score": 4},
        {"id": "2A.4", "name": "Chiến lược & điều hướng", "max_score": 4},
        {"id": "2A.5", "name": "Văn hóa – xã hội", "max_score": 3},
        {"id": "2A.6", "name": "Đạo đức & trung thực", "max_score": 4},
    ],
    "phase2B": [
        {"id": "2B.1", "name": "Hiểu biết & nhận thức", "max_score": 5},
        {"id": "2B.2", "name": "Tư duy phản biện", "max_score": 6},
        {"id": "2B.3", "name": "Ngôn ngữ & thuật ngữ", "max_score": 4},
        {"id": "2B.4", "name": "Chiến lược & điều hướng", "max_score": 4},
        {"id": "2B.5", "name": "Văn hóa – xã hội", "max_score": 3},
        {"id": "2B.6", "name": "Đạo đức & đối thoại", "max_score": 3},
    ],
    "phase3": [
        {"id": "3.1", "name": "Hiểu biết & tổng hợp", "max_score": 5},
        {"id": "3.2", "name": "Tư duy phản biện", "max_score": 5},
        {"id": "3.3", "name": "Ngôn ngữ lập luận", "max_score": 4},
        {"id": "3.4", "name": "Sáng tạo & thuyết phục", "max_score": 4},
        {"id": "3.5", "name": "Vận hóa – xã hội", "max_score": 3},
        {"id": "3.6", "name": "Đạo đức & trách nhiệm", "max_score": 4},
    ]
}

# Define the structured output model using Pydantic
class EvaluationScores(BaseModel):
    phase1: Dict[str, int] = Field(description="Scores for phase 1 based on criteria")
    phase2A: Dict[str, int] = Field(description="Scores for phase 2A based on criteria")
    phase2B: Dict[str, int] = Field(description="Scores for phase 2B based on criteria")
    phase3: Dict[str, int] = Field(description="Scores for phase 3 (conclusion) based on criteria")

class DebateEvaluation(BaseModel):
    scores: EvaluationScores = Field(description="The detailed scores for each phase.")
    feedback: str = Field(description="Detailed, constructive feedback for the student team.")

class DebateSystem:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
            convert_system_message_to_human=True # Helps with some prompt structures
        )

    def generate_debate_topic(self, course_code: str) -> str:
        topics = []
        if course_code == "MLN111":
            topics = MLN111_TOPICS
        elif course_code == "MLN122":
            topics = MLN122_TOPICS

        if topics:
            return random.choice(topics)
        
        prompt = "..." # Fallback prompt
        response = self.model.invoke(prompt)
        return str(response.content)

    def generate_arguments(self, topic: str, side: str) -> List[str]:
        import traceback
        prompt = f"""
Bạn là một AI chuyên gia về tranh luận, hãy tạo ra 3 luận điểm sắc bén về chủ đề: "{topic}".

**YÊU CẦU ĐỊNH DẠNG (BẮT BUỘC):**
- **KHÔNG GIỚI THIỆU:** Không viết bất kỳ câu mở đầu hay giải thích nào. Bắt đầu ngay với luận điểm đầu tiên.
- **CẤU TRÚC:** Mỗi luận điểm phải có đủ 3 phần: "**Lập luận:**", "**Dẫn chứng lý thuyết:**", "**Ví dụ thực tiễn:**".
- **PHÂN TÁCH:** Bắt đầu mỗi luận điểm bằng một dấu gạch ngang theo sau là một khoảng trắng (ví dụ: "- **Lập luận:**...").

Chỉ trả về 3 luận điểm, không có gì khác.
"""
        try:
            response = self.model.invoke(prompt)
            content = str(response.content).strip()
            argument_parts = re.split(r'\n\s*-\s*', content)
            final_arguments = [
                part.strip() for part in argument_parts 
                if 'Lập luận' in part and 'Dẫn chứng lý thuyết' in part
            ]
            if not final_arguments:
                return [content]
            return final_arguments
        except Exception as e:
            print("[ERROR] generate_arguments exception:", str(e))
            traceback.print_exc()
            return [f"[LỖI AI] Không thể sinh luận điểm: {str(e)}"]

    def generate_questions(self, arguments: List[str], topic: str) -> List[str]:
        student_args_str = "\n".join(f"- {arg}" for arg in arguments)
        prompt = f"""
Bạn là một AI sử dụng phương pháp triết học Socrates, chuyên đặt ra những câu hỏi sâu sắc để thử thách và khám phá một quan điểm.
Chủ đề tranh luận là: "{topic}"
Các luận điểm của đối phương là:
{student_args_str}

--- HƯỚNG DẪN PHƯƠNG PHÁP SOCRATIC (BẮT BUỘC TUÂN THỦ) ---
1. Hướng dẫn, không bác bỏ: AI giống như bà đỡ ý tưởng (midwife of ideas), vai trò chính của AI là hỗ trợ nhóm sinh viên khám lỗ hổng trong lập luận của họ để tiến gần hơn với tri thức đúng, chứ không chỉ đơn giản là khẳng định hay phủ nhận chừng.
2. Trung lập: AI phải duy trì sự trung lập tuyệt đối đối với nội dung và các lập luận trong cuộc tranh biện. Không bao giờ thiên vị kết luận của mình hay nhóm sinh viên, ngay cả khi nó có vẻ \"đúng\".
3. Khuyến khích sinh viên tương tác với ý tưởng một cách tôn trọng. Đặt ra các câu hỏi dựa trên những điểm trước đó và kết nối các lập luận.
4. Coi trọng việc khám phá kỹ lưỡng mọi mặt và luận điểm điểm chính hơn là liệt kê hỏi thật nhiều luận điểm điểm, tập trung phân tích một lỗ hổng hoặc điểm mờ hơn là hỏi nhiều luận điểm của sinh viên.
5. Công cụ chính của AI là những câu hỏi gợi mở, sử dụng câu hỏi để dẫn dắt tư duy, không phải để \"bẫy\" nhóm sinh viên. Câu hỏi phải có tính xây dựng, không mang tính công kích.
6. Không trực tiếp đưa ra câu trả lời hoặc giải pháp cho nhóm sinh viên, không bày tỏ định kiến.
7. Bám sát Tài liệu Được Cung cấp: AI phải được đào tạo dựa trên các chủ đề tranh biện cụ thể, tài liệu được nền tảng, nghiên cứu tình huống và quy tắc được cung cấp cho học sinh. Các câu hỏi của nó phải thể hiện sự hiểu biết về bối cảnh này.
8. AI phải có khả năng xác định các khái niệm nền tảng, các lập luận tiềm ẩn và các điểm xung đột có khả năng xảy ra trong chủ đề, các tài liệu đã cho.
9. Áp dụng đúng điều tỏ tỏ, không đoán, hỏi đầu. Sử dụng các cụm từ như \"Giúp tôi hiểu...\", \"Bạn có thể giải thích rõ hơn về...\", \"Có cách nào khác để nhìn nhận...\", \"Tôi đang tự hỏi liệu...\"
10. Ngôn ngữ chính xác & rõ ràng: Đặt câu hỏi ngắn gọn, rõ ràng. Tránh những cụm từ tối nghĩa, biết ngữ trị khi nó đã được định nghĩa rõ ràng và sử dụng trong tài liệu/đào tạo topic.
11. Cùng có tính cực: Ghi nhận lập luận tốt hoặc câu hỏi sâu sắc từ sinh viên
12. Tránh ám chỉ một câu trả lời nào là đúng. Thay vì hỏi \"Bạn không nghĩ X rõ ràng là đúng?\", hãy hỏi \"Những lập luận nào ủng hộ X, và những lập luận nào thách thức nó?\".
--- HẾT HƯỚNG DẪN ---

Dựa trên các luận điểm trên, hãy đặt ra 3 câu hỏi Socratic sắc bén.
- Câu hỏi phải mang tính mở, khơi gợi suy nghĩ và phản biện.
- Câu hỏi không nên là câu hỏi có/không.
- Câu hỏi phải trực tiếp thách thức các giả định hoặc logic trong luận điểm của đối phương.

Chỉ trả về 3 câu hỏi, mỗi câu hỏi trên một dòng, bắt đầu bằng một số và dấu chấm (ví dụ: "1. ..."). Không thêm bất kỳ lời giải thích nào khác.
"""
        response = self.model.invoke(prompt)
        content_str = str(response.content)
        print("[DEBUG] Gemini raw response:", content_str)
        # Sử dụng regex để tìm các dòng bắt đầu bằng số và dấu chấm
        questions = re.findall(r'^\d+\.\s*(.*)', content_str, re.MULTILINE)
        if not questions:
            # Nếu không match regex cũ, thử lấy các dòng có dấu hỏi
            questions = re.findall(r'^(.*\?)', content_str, re.MULTILINE)
        if not questions:
            # Nếu vẫn không có, lấy tất cả các dòng không rỗng
            questions = [line.strip() for line in content_str.split('\n') if line.strip()]
        return [q.strip() for q in questions if q.strip()]

    def generate_socratic_answer(self, student_question: str, topic: str, previous_context: str = "") -> str:
        """
        AI trả lời câu hỏi của sinh viên theo phương pháp Socratic trong Phiên 2B
        """
        prompt = f"""
Bạn là một AI sử dụng phương pháp triết học Socrates. Sinh viên đã hỏi bạn một câu hỏi và bạn cần trả lời theo phương pháp Socratic thuần túy.

Chủ đề tranh luận: "{topic}"
Câu hỏi của sinh viên: "{student_question}"
Bối cảnh trước đó: {previous_context}

--- HƯỚNG DẪN PHƯƠNG PHÁP SOCRATIC CHO PHIÊN 2B (BẮT BUỘC TUÂN THỦ) ---
1. **Hướng dẫn, không bác bỏ:** AI giống như bà đỡ ý tưởng (midwife of ideas), hỗ trợ sinh viên khám phá vấn đề sâu hơn thay vì đưa ra câu trả lời trực tiếp.

2. **Trung lập tuyệt đối:** AI phải duy trì sự trung lập hoàn toàn. Không thiên vị bất kỳ quan điểm nào, ngay cả khi có vẻ "đúng".

3. **Tôn trọng và xây dựng:** Ghi nhận câu hỏi tốt của sinh viên, khuyến khích tư duy phản biện một cách tôn trọng.

4. **Tập trung khám phá sâu:** Thay vì trả lời rộng, hãy tập trung vào một khía cạnh cốt lõi của câu hỏi để khám phá kỹ lưỡng.

5. **Sử dụng câu hỏi ngược:** Đây là cốt lõi của phương pháp Socratic - trả lời câu hỏi bằng những câu hỏi sâu sắc khác để dẫn dắt tư duy.

6. **Không đưa ra giải pháp:** Tuyệt đối không đưa ra câu trả lời hoặc kết luận cuối cùng. Vai trò của AI là làm "người đỡ sinh tư tưởng".

7. **Khám phá các giả định tiềm ẩn:** Giúp sinh viên nhận ra những giả định không được nói ra trong câu hỏi của họ.

8. **Ngôn ngữ khiêm tốn:** Sử dụng các cụm từ như "Tôi tò mò về...", "Điều gì khiến bạn nghĩ rằng...", "Liệu có cách nào khác để xem xét...", "Bạn có thể giúp tôi hiểu..."

9. **Kết nối với bối cảnh:** Liên kết câu trả lời với chủ đề tranh luận và bối cảnh MLN (văn hóa, xã hội, đạo đức).

10. **Khuyến khích tự khám phá:** Thúc đẩy sinh viên tự đi đến kết luận thay vì được "cho" câu trả lời.
--- HẾT HƯỚNG DẪN ---

**NHIỆM VỤ:** Trả lời câu hỏi của sinh viên theo phương pháp Socratic. Câu trả lời phải:
- Bắt đầu bằng việc ghi nhận câu hỏi (nếu hay)
- Sử dụng 2-3 câu hỏi ngược để dẫn dắt tư duy
- Khuyến khích sinh viên khám phá sâu hơn
- Duy trì sự trung lập và không đưa ra kết luận

Chỉ trả về câu trả lời Socratic, không giải thích thêm.
"""
        response = self.model.invoke(prompt)
        return str(response.content).strip()

    def evaluate_debate_detailed(self, debate_data: Dict[str, Any]) -> Dict[str, Any]:
        def clean_and_parse_json(content: str) -> Dict[str, Any]:
            content = content.strip().replace('```json', '').replace('```', '').strip()
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                print(f"--- DEBUG: FAILED TO PARSE JSON ---\n{content}\n------------------------------------")
                # Trả về một cấu trúc rỗng nhưng đầy đủ để không làm lỗi UI
                return {
                    "scores": {
                        "phase1": {criterion['id']: 0 for criterion in DEBATE_CRITERIA.get('phase1', [])},
                        "phase2A": {criterion['id']: 0 for criterion in DEBATE_CRITERIA.get('phase2A', [])},
                        "phase2B": {criterion['id']: 0 for criterion in DEBATE_CRITERIA.get('phase2B', [])},
                        "phase3": {criterion['id']: 0 for criterion in DEBATE_CRITERIA.get('phase3', [])}
                    },
                    "feedback": "Lỗi hệ thống: Không thể phân tích phản hồi từ AI."
                }

        # Định dạng lại lịch sử debate cho dễ đọc
        turns_history = "\n".join([
            f"- Lượt {t.get('turn', '')}: AI hỏi \"{t.get('question', '')}\" | SV trả lời \"{t.get('answer', '')}\""
            for t in debate_data.get('turns', [])
        ])

        # Xây dựng prompt có cấu trúc rõ ràng
        student_args_str = "- " + "\n- ".join(debate_data.get('team_arguments', []))
        ai_args_str = "- " + "\n- ".join(debate_data.get('ai_arguments', []))
        
        prompt = f"""
Bạn là một giám khảo AI cực kỳ nghiêm khắc và công tâm. Công việc của bạn là chấm điểm và nhận xét một phiên debate.
BẠN PHẢI TRẢ LỜI BẰNG MỘT ĐỐI TƯỢNG JSON. KHÔNG GIẢI THÍCH. KHÔNG DÙNG MARKDOWN.

**QUY TẮC CHẤM ĐIỂM NGHIÊM NGẶT:**
- **Phát hiện câu trả lời kém chất lượng:** Hãy đặc biệt chú ý đến các câu trả lời của sinh viên. Nếu câu trả lời chỉ là một ký tự (ví dụ: 'a', 'b'), một từ vô nghĩa, hoặc rõ ràng là không liên quan đến câu hỏi, hãy cho điểm 0 cho tiêu chí tương ứng.
- **Không có sự nỗ lực:** Nếu nội dung của sinh viên (luận điểm, câu trả lời, tóm tắt) thể hiện sự thiếu đầu tư nghiêm trọng, điểm số phải phản ánh điều đó (tiệm cận 0).
- **Chấm điểm dựa trên chất lượng:** Điểm số phải tương xứng với chiều sâu, sự logic, và bằng chứng được cung cấp trong câu trả lời, không chỉ dựa vào việc có trả lời hay không.

Đây là dữ liệu phiên debate:
--- DEBATE DATA ---
Topic: {debate_data.get('topic', 'N/A')}
Student Arguments: {student_args_str}
AI Arguments: {ai_args_str}
Debate History: {turns_history}
Student Summary: {debate_data.get('student_summary', 'N/A')}
--- END DEBATE DATA ---

Đây là các tiêu chí chấm điểm:
--- CRITERIA ---
{json.dumps(DEBATE_CRITERIA, ensure_ascii=False, indent=2)}
--- END CRITERIA ---

Hãy trả về một đối tượng JSON duy nhất có cấu trúc sau:
{{
  "scores": {{
    "phase1": {{ "1.1": <điểm>, "1.2": <điểm>, ... }},
    "phase2A": {{ "2A.1": <điểm>, "2A.2": <điểm>, ... }},
    "phase2B": {{ "2B.1": <điểm>, "2B.2": <điểm>, ... }},
    "phase3": {{ "3.1": <điểm>, "3.2": <điểm>, ... }}
  }},
  "feedback": "<Nhận xét chi tiết của bạn về lý do tại sao điểm số lại như vậy, chỉ ra các điểm yếu và mạnh một cách cụ thể>"
}}
"""
        response = self.model.invoke(prompt)
        return clean_and_parse_json(str(response.content))

class DebateSession:
    def __init__(self):
        self.debate_system = DebateSystem()
        self.team_id: str = ""
        self.topic: str = ""
        self.members: List[str] = []
        self.course_code: str = ""
        self.current_phase: str = "Not Started"
        self.team_arguments: List[str] = []
        self.ai_arguments: List[str] = []
        self.questions: List[str] = []
        self.responses: List[str] = []
        self.turns: List[Dict[str, Any]] = []
        self.chat_history: List[Dict[str, Any]] = []
        self.student_summary: str = ""
        self.ai_summary: str = ""
        self.evaluation: Optional[Dict[str, Any]] = None

    def add_turn(self, asker: str, question: str, answer: Optional[str] = None):
        turn_data = {"turn": len(self.turns) + 1, "asker": asker, "question": question, "answer": answer}
        self.turns.append(turn_data)
        self.chat_history.append({"phase": 2, "role": asker, "content": f"Q: {question}\nA: {answer if answer else ''}"})

    def start_debate(self, course_code: str, members: List[str]) -> str:
        self.topic = self.debate_system.generate_debate_topic(course_code=course_code)
        self.course_code = course_code
        self.members = members
        self.current_phase = "Phase 0: Preparation"
        print("team_id:", self.team_id)
        print("session.team_arguments:", self.team_arguments)
        print("session.turns:", self.turns)
        return self.topic

    def phase1_arguments(self) -> List[str]:
        self.ai_arguments = self.debate_system.generate_arguments(self.topic, "AI")
        return self.ai_arguments

    def phase2_questions(self) -> List[str]:
        self.questions = self.debate_system.generate_questions(self.team_arguments, self.topic)
        return self.questions

    def evaluate_debate(self) -> Dict[str, Any]:
        """
        Gathers all debate data and calls the evaluation system.
        """
        debate_data = {
            "topic": self.topic,
            "team_arguments": self.team_arguments,
            "ai_arguments": self.ai_arguments,
            "turns": self.turns,
            "student_summary": self.student_summary,
            "ai_summary": self.ai_summary
        }
        
        self.evaluation = self.debate_system.evaluate_debate_detailed(debate_data)
        return self.evaluation 