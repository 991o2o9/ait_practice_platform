import traceback
from app.models.submission import SubmissionStatus

def evaluate_code(student_code: str, test_code: str) -> tuple[SubmissionStatus, str]:
    # Склеиваем код студента и код тестов
    combined_code = f"{student_code}\n\n{test_code}"
    
    # Создаем изолированное окружение
    # В рамках MVP используется exec()
    safe_globals = {
        "__builtins__": __builtins__
    }
    safe_locals = {}
    
    try:
        exec(combined_code, safe_globals, safe_locals)
        return SubmissionStatus.passed, "All tests passed successfully!"
    except Exception as e:
        # Ловим все ошибки выполнения (синтаксис, AssertionError и т.д.)
        error_logs = traceback.format_exc()
        return SubmissionStatus.failed, error_logs
