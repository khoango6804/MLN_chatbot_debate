from typing import List, Dict, Optional, Any, Set
import os
import json
import random
import re
import time
import logging
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.pydantic_v1 import BaseModel, Field
from course_content import MLN111_TOPICS, MLN122_TOPICS, MLN111_MLN122_TOPICS

# Construct the absolute path to the .env file inside the backend directory
script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

# Setup logging for API key tracking
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEBATE_CRITERIA = {
    "phase1": [
        {"id": "1.1", "name": "Hiểu biết & nhận thức", "max_score": 6},
        {"id": "1.2", "name": "Tư duy phản biện", "max_score": 4},
        {"id": "1.3", "name": "Nhận diện văn hóa – xã hội", "max_score": 3},
        {"id": "1.4", "name": "Bản sắc & chiến lược", "max_score": 4},
        {"id": "1.5", "name": "Sáng tạo học thuật", "max_score": 4},
        {"id": "1.6", "name": "Đạo đức học thuật", "max_score": 4},
    ],
    "phase2": [
        {"id": "2.1", "name": "Hiểu biết & nhận thức", "max_score": 5},
        {"id": "2.2", "name": "Tư duy phản biện", "max_score": 5},
        {"id": "2.3", "name": "Ngôn ngữ & thuật ngữ", "max_score": 5},
        {"id": "2.4", "name": "Chiến lược & điều hướng", "max_score": 5},
        {"id": "2.5", "name": "Văn hóa – xã hội", "max_score": 5},
    ],
    "phase3": [
        {"id": "3.1", "name": "Hiểu biết & nhận thức", "max_score": 5},
        {"id": "3.2", "name": "Tư duy phản biện", "max_score": 6},
        {"id": "3.3", "name": "Ngôn ngữ & thuật ngữ", "max_score": 4},
        {"id": "3.4", "name": "Chiến lược & điều hướng", "max_score": 4},
        {"id": "3.5", "name": "Văn hóa – xã hội", "max_score": 3},
        {"id": "3.6", "name": "Đạo đức & đối thoại", "max_score": 3},
    ],
    "phase4": [
        {"id": "4.1", "name": "Hiểu biết & hệ thống", "max_score": 5},
        {"id": "4.2", "name": "Tư duy phân biện", "max_score": 5},
        {"id": "4.3", "name": "Ngôn ngữ lập luận", "max_score": 4},
        {"id": "4.4", "name": "Sáng tạo & thuyết phục", "max_score": 4},
        {"id": "4.5", "name": "Văn hóa - xã hội", "max_score": 3},
        {"id": "4.6", "name": "Đạo đức & trách nhiệm", "max_score": 4},
    ]
}

# Define the structured output model using Pydantic
class EvaluationScores(BaseModel):
    phase1: Dict[str, int] = Field(description="Scores for phase 1 based on criteria")
    phase2: Dict[str, int] = Field(description="Scores for phase 2 based on criteria")
    phase3: Dict[str, int] = Field(description="Scores for phase 3 based on criteria")
    phase4: Dict[str, int] = Field(description="Scores for phase 4 (final conclusion) based on criteria")
    phase5: Dict[str, int] = Field(description="Scores for phase 5 (evaluation) - typically empty as this is the evaluation phase")

class DebateEvaluation(BaseModel):
    scores: EvaluationScores = Field(description="The detailed scores for each phase.")
    feedback: str = Field(description="Detailed, constructive feedback for the student team.")

class DebateSystem:
    def __init__(self):
        # Load multiple API keys from environment
        self.api_keys = self._load_multiple_api_keys()
        self.current_key_index = 0
        self.failed_keys: Set[int] = set()
        self.last_reset_time = time.time()
        self.reset_interval = 3600  # Reset failed keys after 1 hour
        
        # Initialize with the first working API key
        self.model = self._create_model_with_failover()
        
        logger.info(f"🔑 Initialized DebateSystem with {len(self.api_keys)} API keys")

    def _load_multiple_api_keys(self) -> List[str]:
        """Load API keys from environment variables"""
        api_keys = []
        
        # Try to load from GEMINI_API_KEY_1 to GEMINI_API_KEY_10
        for i in range(1, 11):
            key = os.getenv(f"GEMINI_API_KEY_{i}")
            if key and key != f"your_gemini_api_key_{i}_here":  # Skip placeholder values
                api_keys.append(key)
                
        # Fallback to single GEMINI_API_KEY for backward compatibility
        if not api_keys:
            single_key = os.getenv("GEMINI_API_KEY")
            if single_key and single_key != "your_gemini_api_key_primary_here":
                api_keys.append(single_key)
        
        if not api_keys:
            raise ValueError("❌ No valid GEMINI API keys found! Please check your .env file")
            
        logger.info(f"✅ Loaded {len(api_keys)} valid API keys")
        return api_keys

    def _create_model_with_failover(self) -> ChatGoogleGenerativeAI:
        """Create a ChatGoogleGenerativeAI model with the current working API key"""
        if not self.api_keys:
            raise ValueError("No API keys available")
            
        # Reset failed keys if enough time has passed
        if time.time() - self.last_reset_time > self.reset_interval:
            self.failed_keys.clear()
            self.last_reset_time = time.time()
            logger.info("🔄 Reset failed keys after timeout")
        
        # Find next working key
        attempts = 0
        while attempts < len(self.api_keys):
            if self.current_key_index not in self.failed_keys:
                try:
                    current_key = self.api_keys[self.current_key_index]
                    model = ChatGoogleGenerativeAI(
                        model="gemini-2.0-flash",
                        temperature=0.7,
                        api_key=current_key,
                        convert_system_message_to_human=True
                    )
                    logger.info(f"🎯 Using API key #{self.current_key_index + 1}")
                    return model
                except Exception as e:
                    logger.warning(f"⚠️ API key #{self.current_key_index + 1} failed: {str(e)}")
                    self.failed_keys.add(self.current_key_index)
            
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            attempts += 1
        
        raise ValueError("❌ All API keys have failed! Please check your keys or wait for quota reset")

    def _invoke_with_failover(self, prompt: str) -> Any:
        """Invoke the model with automatic failover to next API key on error"""
        max_retries = len(self.api_keys)
        
        for attempt in range(max_retries):
            try:
                response = self.model.invoke(prompt)
                return response
                
            except Exception as e:
                error_msg = str(e).lower()
                
                # Check if this is a quota/rate limit error
                if any(keyword in error_msg for keyword in ['quota', 'rate limit', 'resource_exhausted', 'too many requests']):
                    logger.warning(f"⏰ API key #{self.current_key_index + 1} quota exhausted, switching to next key...")
                    self.failed_keys.add(self.current_key_index)
                    
                    # Try next key
                    self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
                    
                    # Skip already failed keys
                    retries = 0
                    while self.current_key_index in self.failed_keys and retries < len(self.api_keys):
                        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
                        retries += 1
                    
                    if retries >= len(self.api_keys):
                        raise ValueError("❌ All API keys exhausted! Please wait for quota reset")
                    
                    # Create new model with next key
                    self.model = self._create_model_with_failover()
                    logger.info(f"🔄 Switched to API key #{self.current_key_index + 1}")
                    
                else:
                    # For non-quota errors, don't switch keys
                    logger.error(f"❌ API error (not quota): {str(e)}")
                    raise e
        
        raise ValueError("❌ All API key retry attempts failed!")

    def generate_debate_topic(self, course_code: str) -> str:
        topics = []
        if course_code == "MLN111":
            topics = MLN111_TOPICS
        elif course_code == "MLN122":
            topics = MLN122_TOPICS
        elif course_code == "MLN111+MLN122":
            topics = MLN111_MLN122_TOPICS

        if topics:
            return random.choice(topics)
        
        prompt = "..." # Fallback prompt
        response = self._invoke_with_failover(prompt)
        return str(response.content)

    def generate_arguments(self, topic: str, side: str) -> List[str]:
        import traceback
        
        # Determine if this is a counter-argument request
        is_counter = "Phản bác" in topic or "phản bác" in topic
        
        # Determine stance-based prompt
        if side == "supporting":
            stance_text = "ủng hộ và đồng tình với"
            stance_type = "đồng tình"
        else:  # opposing
            stance_text = "phản đối và không đồng tình với"
            stance_type = "phản đối"
        
        if is_counter:
            # This is a counter-argument request
            prompt = f"""
Bạn là một AI chuyên gia về tranh luận, nhiệm vụ của bạn là tạo ra 3 luận điểm phản bác sắc bén và logic về: "{topic}".

**YÊU CẦU PHẢN BÁC:**
- Tìm điểm yếu, lỗ hổng logic trong luận điểm được đưa ra
- Đưa ra bằng chứng, dữ liệu thực tiễn để phản bác
- Sử dụng các góc nhìn đa chiều (kinh tế, xã hội, đạo đức, pháp lý...)
- Phản bác một cách xây dựng, không công kích cá nhân

**YÊU CẦU ĐỊNH DẠNG (BẮT BUỘC):**
- **KHÔNG GIỚI THIỆU:** Không viết bất kỳ câu mở đầu hay giải thích nào. Bắt đầu ngay với "Luận điểm phản bác 1:".
- **CẤU TRÚC:** Mỗi luận điểm phải có tiêu đề "Luận điểm phản bác X:" rồi xuống dòng và có đủ 3 phần:
  "- Lập luận phản bác: [phân tích điểm yếu, lỗ hổng logic]"
  "- Dẫn chứng thực tiễn: [bằng chứng, dữ liệu, ví dụ thực tế để phản bác]"
  "- Hệ quả của lỗ hổng: [hệ quả khi áp dụng logic sai này]"
- **PHÂN TÁCH:** Mỗi luận điểm cách nhau bằng 2 dòng trống.

**VÍ DỤ FORMAT:**
Luận điểm phản bác 1:
- Lập luận phản bác: [nội dung]
- Dẫn chứng thực tiễn: [bằng chứng]
- Hệ quả của lỗ hổng: [hệ quả]

Chỉ trả về 3 luận điểm phản bác theo format trên, không có gì khác.
"""
        else:
            # This is a regular argument request with stance
            prompt = f"""
Bạn là một AI chuyên gia về tranh luận, hãy tạo ra ĐÚNG 3 luận điểm sắc bén để {stance_text} chủ đề: "{topic}".

**YÊU CẦU ĐỊNH DẠNG (BẮT BUỘC):**
- **KHÔNG GIỚI THIỆU:** Không viết bất kỳ câu mở đầu hay giải thích nào. Bắt đầu ngay với "Luận điểm {stance_type} 1:".
- **CẤU TRÚC:** Mỗi luận điểm phải có tiêu đề "Luận điểm {stance_type} X:" rồi xuống dòng và có đủ 3 phần:
  "- Lập luận: [nội dung lập luận]"
  "- Dẫn chứng lý thuyết: [trích dẫn lý thuyết, học thuyết, quan điểm của các nhà tư tưởng]"  
  "- Ví dụ: [ví dụ cụ thể, thực tiễn để minh họa]"
- **PHÂN TÁCH:** Mỗi luận điểm cách nhau bằng 2 dòng trống.
- **BẮT BUỘC:** Phải có đúng 3 luận điểm, không ít hơn, không nhiều hơn.

**VÍ DỤ FORMAT:**
Luận điểm {stance_type} 1:
- Lập luận: [nội dung]
- Dẫn chứng lý thuyết: [lý thuyết]
- Ví dụ: [ví dụ thực tiễn]


Luận điểm {stance_type} 2:
- Lập luận: [nội dung]
- Dẫn chứng lý thuyết: [lý thuyết]
- Ví dụ: [ví dụ thực tiễn]


Luận điểm {stance_type} 3:
- Lập luận: [nội dung]
- Dẫn chứng lý thuyết: [lý thuyết]
- Ví dụ: [ví dụ thực tiễn]

Chỉ trả về ĐÚNG 3 luận điểm theo format trên, không có gì khác.
"""
        
        try:
            response = self._invoke_with_failover(prompt)
            content = str(response.content).strip()
            
            # Parse based on prompt type
            if is_counter:
                # For counter-arguments, parse using "Luận điểm phản bác X:"
                argument_blocks = re.split(r'\n\s*Luận điểm phản bác \d+:', content)
                final_arguments = []
                
                for i, block in enumerate(argument_blocks):
                    if i == 0:  # Skip first empty block
                        continue
                    
                    # Check block has all required parts
                    if ('- Lập luận phản bác:' in block and 
                        '- Dẫn chứng thực tiễn:' in block and 
                        '- Hệ quả của lỗ hổng:' in block):
                        formatted_arg = f"Luận điểm phản bác {len(final_arguments) + 1}:\n{block.strip()}"
                        final_arguments.append(formatted_arg)
            else:
                # For stance-based arguments, parse using "Luận điểm {stance_type} X:"
                argument_pattern = f'Luận điểm {stance_type} \\d+:(.*?)(?=Luận điểm {stance_type} \\d+:|$)'
                matches = re.findall(argument_pattern, content, re.DOTALL)
                
                final_arguments = []
                for i, match in enumerate(matches):
                    argument_content = match.strip()
                    
                    # Check block has all required parts
                    if ('- Lập luận:' in argument_content and 
                        '- Dẫn chứng lý thuyết:' in argument_content and 
                        '- Ví dụ:' in argument_content):
                        formatted_arg = f"Luận điểm {stance_type} {i+1}:\n{argument_content}"
                        final_arguments.append(formatted_arg)
            
            # Fallback to simple parsing if structured parsing fails
            if not final_arguments:
                argument_parts = re.split(r'\n\s*-\s*', content)
                final_arguments = [
                    part.strip() for part in argument_parts 
                    if 'Lập luận' in part and ('Dẫn chứng lý thuyết' in part or 'Dẫn chứng thực tiễn' in part)
                ]
            
            if not final_arguments:
                return [content]
            return final_arguments
        except Exception as e:
            print("[ERROR] generate_arguments exception:", str(e))
            traceback.print_exc()
            return [f"[LỖI AI] Không thể sinh luận điểm: {str(e)}"]

    def generate_questions(self, arguments: List[str], topic: str) -> List[str]:
        # 🔧 RELAXED VALIDATION: More forgiving for test mode
        meaningful_arguments = []
        for arg in arguments:
            arg_clean = arg.strip()
            # Only filter out extremely obvious nonsense
            if (len(arg_clean) > 5 and  # Reduced from 15
                not any(pattern in arg_clean.lower() for pattern in ['ádfasd', 'asdf', 'ấd', 'ád']) and  # Only severe patterns
                not re.match(r'^[0-9\s]+$', arg_clean)):  # Not just numbers and spaces
                meaningful_arguments.append(arg_clean)
        
        # If no meaningful arguments, return generic contextual question
        if not meaningful_arguments:
            return [f"Bạn có thể trình bày rõ hơn quan điểm của mình về chủ đề '{topic}' không?"]
        
        student_args_str = "\n".join(f"- {arg}" for arg in meaningful_arguments)
        prompt = f"""
Bạn là AI chuyên gia Socratic questioning. Tạo 1 câu hỏi thông minh, sáng tạo và thách thức dựa trên phản hồi của sinh viên.

CHỦ ĐỀ: "{topic}"
PHẢN HỒI SINH VIÊN:
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

Dựa trên các luận điểm trên, hãy đặt ra 1 câu hỏi Socratic sắc bén nhất.
- Câu hỏi phải mang tính mở, khơi gợi suy nghĩ và phản biện sâu sắc.
- Câu hỏi không nên là câu hỏi có/không.
- Câu hỏi phải trực tiếp thách thức giả định hoặc logic cốt lõi nhất trong luận điểm.

Chỉ trả về 1 câu hỏi duy nhất, bắt đầu bằng "1. ". Không thêm bất kỳ lời giải thích nào khác.
"""
        response = self._invoke_with_failover(prompt)
        content_str = str(response.content)
        print("[DEBUG] Gemini raw response:", content_str)
        
        # 🔧 ENHANCED VALIDATION: Multiple extraction methods with validation
        questions = []
        
        # Method 1: Find questions starting with number and dot
        numbered_questions = re.findall(r'^\d+\.\s*(.*)', content_str, re.MULTILINE)
        if numbered_questions:
            questions.extend(numbered_questions)
        
        # Method 2: Find lines ending with question marks
        if not questions:
            question_lines = re.findall(r'^(.*\?)', content_str, re.MULTILINE)
            if question_lines:
                questions.extend(question_lines)
        
        # Method 3: Fallback to non-empty lines
        if not questions:
            lines = [line.strip() for line in content_str.split('\n') if line.strip()]
            if lines:
                questions.extend(lines)
        
        # 🔧 RELAXED QUESTION VALIDATION: More forgiving
        valid_questions = []
        for q in questions:
            q_clean = q.strip()
            # Only ensure basic question format
            if (len(q_clean) > 10 and  # Reduced from 20
                '?' in q_clean and
                not any(pattern in q_clean.lower() for pattern in ['ádfasd', 'asdf', 'ấd', 'ád']) and  # Only severe patterns
                not re.match(r'^[0-9\s\?\.\-]+$', q_clean)):  # Not just numbers, spaces and punctuation
                valid_questions.append(q_clean)
        
        # Return the first valid question or fallback
        if valid_questions:
            return [valid_questions[0]]
        else:
            # Ultimate fallback if AI generates nonsense
            return [f"Bạn có thể giải thích rõ hơn về lập luận cốt lõi của mình trong bối cảnh '{topic}' không?"]

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
        response = self._invoke_with_failover(prompt)
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
                        "phase2": {criterion['id']: 0 for criterion in DEBATE_CRITERIA.get('phase2', [])},
                        "phase3": {criterion['id']: 0 for criterion in DEBATE_CRITERIA.get('phase3', [])},
                        "phase4": {criterion['id']: 0 for criterion in DEBATE_CRITERIA.get('phase4', [])},
                        "phase5": {}
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
        conclusion_str = "- " + "\n- ".join(debate_data.get('conclusion', []))
        ai_counter_str = "- " + "\n- ".join(debate_data.get('ai_counter_arguments', []))
        
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
Student Arguments (Phase 1): {student_args_str}
AI Arguments (Phase 1): {ai_args_str}
Debate History (Phase 2-3): {turns_history}
Student Conclusion (Phase 4): {conclusion_str}
AI Counter-Arguments (Phase 4): {ai_counter_str}
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
    "phase2": {{ "2.1": <điểm>, "2.2": <điểm>, ... }},
    "phase3": {{ "3.1": <điểm>, "3.2": <điểm>, ... }},
    "phase4": {{ "4.1": <điểm>, "4.2": <điểm>, ... }},
    "phase5": {{}}
  }},
  "feedback": "<Nhận xét chi tiết của bạn về lý do tại sao điểm số lại như vậy, chỉ ra các điểm yếu và mạnh một cách cụ thể>"
}}
"""
        response = self._invoke_with_failover(prompt)
        return clean_and_parse_json(str(response.content))

class DebateSession:
    def __init__(self, debate_system: DebateSystem = None):
        self.debate_system = debate_system or DebateSystem()
        self.team_id: str = ""
        self.topic: str = ""
        self.members: List[str] = []
        self.course_code: str = ""
        self.current_phase: str = "Not Started"
        self.team_arguments: List[str] = []
        self.ai_arguments: List[str] = []
        self.questions: List[str] = []
        self.responses: List[str] = []
        self.turns: List[Dict[str, Any]] = []  # Phase 2 turns (AI asks, Student answers)
        self.phase3_turns: List[Dict[str, Any]] = []  # Phase 3 turns (Student asks, AI answers)
        self.chat_history: List[Dict[str, Any]] = []
        self.student_summary: str = ""
        self.ai_summary: str = ""
        self.conclusion: List[str] = []  # Phase 4: Student conclusion
        self.ai_counter_arguments: List[str] = []  # Phase 4: AI counter-arguments
        self.evaluation: Optional[Dict[str, Any]] = None

    def add_turn(self, asker: str, question: str, answer: Optional[str] = None):
        """Add turn to Phase 2 (AI asks, Student answers)"""
        turn_data = {"turn": len(self.turns) + 1, "asker": asker, "question": question, "answer": answer}
        self.turns.append(turn_data)
        
        # 🔧 DEBUG: Log turn data to track saving
        print(f"🔧 DEBUG add_turn: Added {asker} turn #{turn_data['turn']}")
        print(f"   Question: {question[:50]}{'...' if len(question) > 50 else ''}")
        print(f"   Answer: {answer[:50] if answer else 'None'}{'...' if answer and len(answer) > 50 else ''}")
        print(f"   Total turns now: {len(self.turns)}")
        
        # 🚫 REMOVED: chat_history to prevent data mixing
        # self.chat_history.append({"phase": 2, "role": asker, "content": f"Q: {question}\nA: {answer if answer else ''}"})

    def add_phase3_turn(self, asker: str, question: str, answer: Optional[str] = None):
        """Add turn to Phase 3 (Student asks, AI answers)"""
        turn_data = {"turn": len(self.phase3_turns) + 1, "asker": asker, "question": question, "answer": answer}
        self.phase3_turns.append(turn_data)
        # 🚫 REMOVED: chat_history to prevent data mixing
        # self.chat_history.append({"phase": 3, "role": asker, "content": f"Q: {question}\nA: {answer if answer else ''}"})

    def start_debate(self, course_code: str, members: List[str]) -> str:
        self.topic = self.debate_system.generate_debate_topic(course_code=course_code)
        self.course_code = course_code
        self.members = members
        self.current_phase = "Phase 1: Arguments"
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
            "ai_summary": self.ai_summary,
            "conclusion": self.conclusion,
            "ai_counter_arguments": self.ai_counter_arguments
        }
        
        self.evaluation = self.debate_system.evaluate_debate_detailed(debate_data)
        return self.evaluation 