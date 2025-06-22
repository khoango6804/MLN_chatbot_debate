MLN111_CONTENT = """
# MLN111 - Những nguyên lý cơ bản của chủ nghĩa Mác-Lênin
[Course content will be added here]
"""

MLN122_CONTENT = """
# MLN122 - Tư tưởng Hồ Chí Minh
[Course content will be added here]
"""

# --- KHO ĐỀ TÀI DEBATE ---
# Thêm các chủ đề debate cho từng môn học vào đây
# Mỗi chủ đề là một chuỗi (string) trong danh sách

MLN111_TOPICS = [
    "Nếu một cái cây đổ trong rừng và không có ai ở đó để lắng nghe, liệu cái cây đó có thực sự tạo ra tiếng động khi đổ không?",
    "Bản sắc/danh tính cá nhân (personal identity) là cái không bao giờ thay đổi",
    "Con người không bao giờ đạt tới được chân lý khách quan tuyệt đối về thế giới",
    "Đấu tranh giai cấp không còn là động lực cho sự phát triển xã hội",
    "Toàn cầu hoá có nguy cơ xóa bỏ bản sắc văn hoá dân tộc",
    "AI có nguy cơ làm trầm trọng hơn tình trạng tha hoá của con người",
    "Thực tế đã chứng minh quan hệ sản xuất tư bản chủ nghĩa vẫn còn phù hợp với xã hội hiện nay",
    'Xã hội Cộng sản chủ nghĩa là "sự cáo chung" của lịch sử, một "định mệnh lịch sử" không thể tránh khỏi'
]

MLN122_TOPICS = [
    "Tiền số sẽ là tiền tệ được sử dụng phổ biến trong tương lai",
    "Lao động số của AI đã phá vỡ quan niệm bóc lột lao động",
    "Nền kinh tế thị trường tốt nhất phải được vận hành bởi bàn tay vô hình",
    "Tích lũy tư bản là nguồn gốc của bất bình đẳng kinh tế trong xã hội tư bản",
    "Nên du nhập ngày càng nhiều công nghệ cao vào Việt Nam càng tốt",
    "Hội nhập kinh tế quốc tế làm giảm khả năng tự chủ của nền kinh tế Việt Nam",
    "Chủ nghĩa tư bản càng phát triển bao nhiêu thì phải càng tiến dần đến tự diệt vong bấy nhiêu",
    "Thế hệ Gen Z sẽ làm thay đổi bản chất mối quan hệ giữa tư bản và lao động",
    "Người lao động tự do (freelancer) không bị bóc lột vì họ tự định giá công việc của mình",
    "Sinh viên khởi nghiệp là con đường tất yếu để Gen Z thoát khỏi mâu thuẫn lao động – tư bản"
]

def get_course_content(course_code: str) -> str:
    """Get course content based on course code"""
    if course_code == "MLN111":
        return MLN111_CONTENT
    elif course_code == "MLN122":
        return MLN122_CONTENT
    else:
        raise ValueError(f"Invalid course code: {course_code}") 