import json
from app.integrations.ai.groq_client import generate_json_completion, generate_text_completion

def generate_project_draft(prompt: str) -> dict:
    system_prompt = """
    You are a Senior Python Software Architect and Educational Platform Creator.
    Your task is to break down the provided technical specification STRICTLY into 10-15 progressive coding micro-tasks for an auto-grader.
    Generating fewer than 10 tasks is STRICTLY FORBIDDEN.
    Do not duplicate tasks. Each task must represent a unique, logical step in building the project.
    
    The `difficulty` level must reflect the task's technical depth, not just the hints:
    - 'easy': Creation of basic Data classes and Models (Entities) with strict typing (UUID, Enum, Timestamp). Provide detailed hints.
    - 'medium': Implementation of entity relationships and business logic (raising exceptions, validation). Provide subtle hints.
    - 'hard': Implementation of complex algorithms, integration, and design patterns. hints: null.
    
    You must output ONLY valid JSON using the following structure:
    {
        "project_title": "Project Title",
        "project_description": "Detailed description of the final system",
        "tasks": [
            {
                "title": "Task Title",
                "difficulty": "easy, medium, or hard",
                "test_code": "Strict test code",
                "solution_template": "Starter code template for the student",
                "hints": "String or null"
            }
        ]
    }
    
    CRITICAL INSTRUCTIONS FOR CODE GENERATION:
    1. The `test_code` and `solution_template` fields MUST NEVER be empty strings! You MUST write actual, runnable Python code in them!
    2. `solution_template`: Must contain boilerplate classes/methods (using `pass` or `TODO`) that the student needs to complete. IMPORTS: Place all required imports (e.g., import uuid, from datetime import datetime) at the very top of the `solution_template`.
    3. `test_code`: Must contain ready-to-run `assert` statements for automatic evaluation. It must invoke methods from the `solution_template`, check edge cases, and verify that expected exceptions are raised (e.g., `try: ... except CapacityExceeded: pass`).
    4. If you leave `test_code` or `solution_template` empty, the system will crash. You MUST write real code for every single task!
    5. CODE FORMATTING: It is STRICTLY FORBIDDEN to use semicolons (;) to combine lines of Python code. You MUST use double-escaped newline characters (\\n) and 4 spaces for indentation inside the JSON strings. Example: "class Student:\\n    def __init__(self):\\n        pass". The code must be highly readable and PEP8 compliant.
    6. STRICT DEPENDENCY CHRONOLOGY (CRITICAL): The tasks will be executed sequentially, and the student's code from previous tasks is carried over to the next ones. You MUST respect chronology. NEVER ask to implement a method that uses classes or variables that will only be created in future tasks. Force the creation of Data Models first, and only at the end ask for complex facade logic connecting them.
    7. EXECUTION ENVIRONMENT: Your `test_code` will simply be appended to the bottom of the student's accumulated code file. Do NOT write import statements in `test_code` to import the student's classes (e.g., do not write `from module import Class`) — just call the classes directly, as they are already in the global scope. Crucially, previous `test_code` blocks are NOT carried over, only the student's class definitions are. Therefore, in your `test_code`, you MUST instantiate any mock objects (e.g., student = Student(...)) needed for that specific test. Do not use variables created in previous tests.
    """
    return generate_json_completion(system_prompt, prompt)

def refine_project_draft(current_draft: dict, feedback: str) -> dict:
    system_prompt = """
    You are an AI teacher modifying a comprehensive progressive Python programming project draft based on user feedback.
    You will be provided with the current draft (JSON) and the user's feedback.
    You must output ONLY the updated valid JSON using the same exact structure as the current draft.
    Keep the progressive sequence rule: tasks must go from 'easy' (with detailed hints) to 'medium' (subtle hints) to 'hard' (null hints), building up a single cohesive system.
    """
    user_prompt = f"Current Draft:\n{json.dumps(current_draft, indent=2)}\n\nUser Feedback:\n{feedback}"
    return generate_json_completion(system_prompt, user_prompt)

def explain_code_failure(student_code: str, test_code: str, error_logs: str, past_code: str = "") -> str:
    system_prompt = """
    You are an AI assistant helping a student learn Python on a progressive coding platform. 
    The student submitted code that failed the tests.
    Your job is to provide a helpful hint to guide the student towards the correct answer.
    DO NOT provide the exact code solution. Just explain what went wrong and give a hint in English.
    """
    user_prompt = f"""
    Previous Code (Written in earlier tasks, successfully passed):
    {past_code}
    
    Current Student Code (Just submitted, failed):
    {student_code}
    
    Test Code:
    {test_code}
    
    Error Logs / Traceback:
    {error_logs}
    
    Analyze the Error Logs. The issue might be in the Current Student Code, or it might be a conflict with the Previous Code. Provide a concise, targeted hint explaining the exact nature of the error without giving away the direct code.
    """
    
    return generate_text_completion(system_prompt, user_prompt)