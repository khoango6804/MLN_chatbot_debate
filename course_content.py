MLN111_CONTENT = """
# MLN111 - Những nguyên lý cơ bản của chủ nghĩa Mác-Lênin
[Course content will be added here]
"""

MLN122_CONTENT = """
# MLN122 - Tư tưởng Hồ Chí Minh
[Course content will be added here]
"""

def get_course_content(course_code: str) -> str:
    """Get course content based on course code"""
    if course_code == "MLN111":
        return MLN111_CONTENT
    elif course_code == "MLN122":
        return MLN122_CONTENT
    else:
        raise ValueError(f"Invalid course code: {course_code}") 