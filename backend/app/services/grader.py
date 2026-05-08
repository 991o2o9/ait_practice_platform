import traceback
import multiprocessing
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

# Убедись, что импорты соответствуют твоей структуре
from app.models.submission import SubmissionStatus
from app.crud.submission import get_passed_submissions_for_context

def _execute_code_worker(combined_code: str, result_dict: dict):
    """
    Изолированный воркер, который запускается в отдельном процессе.
    """
    safe_globals = {
        "__builtins__": __builtins__
    }
    try:
        exec(combined_code, safe_globals)
        result_dict["status"] = SubmissionStatus.passed
        result_dict["logs"] = "All tests passed successfully!"
    except Exception as e:
        result_dict["status"] = SubmissionStatus.failed
        result_dict["logs"] = traceback.format_exc()

async def build_execution_context(
    db: AsyncSession, user_id: uuid.UUID, project_id: uuid.UUID, max_order_index: int, current_code: str, test_code: str
) -> str:
    """
    Собирает 'Франкенштейна' из прошлых сабмишенов, текущего кода и тестов.
    """
    past_submissions = await get_passed_submissions_for_context(db, user_id, project_id, max_order_index)
    
    context_code = ""
    for sub in past_submissions:
        # Перевел комментарии на английский для консистентности
        context_code += f"# --- Code from task: {sub.task.title} ---\n{sub.code}\n\n"
        
    combined_code = f"{context_code}# --- Current Submission ---\n{current_code}\n\n# --- Unit Tests ---\n{test_code}"
    return combined_code

def _run_blocking_eval(combined_code: str) -> tuple[SubmissionStatus, str]:
    """
    Синхронная функция, управляющая процессами.
    """
    manager = multiprocessing.Manager()
    result_dict = manager.dict()
    
    process = multiprocessing.Process(target=_execute_code_worker, args=(combined_code, result_dict))
    process.start()
    
    # Ждем максимум 5 секунд
    process.join(timeout=5.0)
    
    if process.is_alive():
        # Если процесс всё ещё жив, значит он завис (например, while True)
        process.terminate()
        process.join()
        return SubmissionStatus.failed, "Execution Error: Time Limit Exceeded (5 seconds)"
        
    if "status" in result_dict:
        return result_dict["status"], result_dict["logs"]
    else:
        return SubmissionStatus.failed, "Unknown Error: Process terminated unexpectedly"

async def evaluate_code(combined_code: str) -> tuple[SubmissionStatus, str]:
    """
    Асинхронная обертка для FastAPI, чтобы не блокировать Event Loop
    во время 5-секундного ожидания выполнения студенческого кода.
    """
    return await asyncio.to_thread(_run_blocking_eval, combined_code)