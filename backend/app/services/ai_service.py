import json
from app.integrations.ai.groq_client import generate_json_completion, generate_text_completion

def generate_project_draft(prompt: str) -> dict:
    system_prompt = """
    ⚠️ ABSOLUTE REQUIREMENT: Every task in the output JSON MUST have `description`, `learning_objective`, and `connections` as non-null, non-empty strings. Outputting null for ANY of these fields will cause the entire response to be rejected. This overrides all other instructions.

    You are a Senior Python Software Architect and Educational Platform Creator.
    Your task is to break down the provided technical specification STRICTLY into 10-15 progressive coding micro-tasks for an auto-grader.
    Generating fewer than 10 tasks is STRICTLY FORBIDDEN.
    Do not duplicate tasks. Each task must represent a unique, logical step in building the project.
    
    The `difficulty` level must reflect the task's technical depth, not just the hints:
    - 'easy': Creation of basic Data classes and Models (Entities) with strict typing (UUID, Enum, Timestamp). Provide detailed hints.
    - 'medium': Implementation of entity relationships and business logic (raising exceptions, validation). Provide subtle hints.
    - 'hard': Implementation of complex algorithms, integration, and design patterns. Hints must still be provided but contain ONLY the method signature description and expected return type — no step-by-step logic.
    
    You must output ONLY valid JSON using the following structure:
    {
        "project_title": "Project Title",
        "project_description": "Detailed description of the final system",
        "tasks": [
            {
                "title": "Task Title",
                "description": "MANDATORY STRING: One sentence on why this task exists in the overall system. NEVER null.",
                "difficulty": "easy, medium, or hard",
                "learning_objective": "MANDATORY STRING: One sentence about what concept the student learns. NEVER null.",
                "connections": "MANDATORY STRING: Used in: Task X, Task Y. NEVER null.",
                "test_code": "Strict test code",
                "solution_template": "Starter code template for the student",
                "hints": "Detailed step-by-step explanation of what exactly to code"
            }
        ]
    }
    
    CRITICAL INSTRUCTIONS FOR CODE GENERATION:
    1. TEMPLATES MUST CONTAIN ONLY NEW CODE (CRITICAL): The `solution_template` MUST ONLY contain declarations for BRAND NEW classes being introduced in this specific task. You MUST NEVER redefine or include classes created in previous tasks. The platform automatically injects the student's previous code during testing.
    2. TEST CODE VARIABLES: EVERY `test_code` string MUST be entirely self-contained. You MUST instantiate any mock objects (e.g., student = Student(...)) INSIDE the current `test_code` before using them. NEVER assume variables from previous tests exist.
    3. UUID ASSERTIONS: NEVER assert an object's ID directly against a new uuid4() call (e.g., `assert obj.id == uuid.uuid4()` is FORBIDDEN). You must check the type: `assert isinstance(obj.id, uuid.UUID)`.
    4. CLASS EXTENSIONS: When asking a student to add a new method to a class created in a previous task, leave the `solution_template` completely empty and explicitly write in the `hints`: "Copy your entire class implementation from the Past Context tab and add the new method to it."
    5. ATTRIBUTE CONSISTENCY: NEVER test an attribute in `test_code` (e.g., `student.sections`) unless you explicitly asked the student to create that exact attribute in the current or previous task's hints or description.
    6. CODE FORMATTING: It is STRICTLY FORBIDDEN to use semicolons (;) to combine lines of Python code. You MUST use double-escaped newline characters (\\n) and 4 spaces for indentation inside the JSON strings.
    7. IMPORTS: Place all required global imports (e.g., import uuid) at the very top of the `solution_template` and `test_code`.
    8. EXPLICIT BUSINESS LOGIC IN HINTS (CRITICAL): The `hints` field is the ONLY place the student reads what to do. You MUST explicitly describe the business logic, state changes, and attributes required inside the `pass` blocks. Example for Medium/Hard: "In the enroll_student method, first check if section.capacity is full. If yes, raise CapacityExceeded. If not, append the student to section.students array."
    9. NULL FIELDS CAUSE IMMEDIATE FAILURE: If ANY task contains `description: null`, `learning_objective: null`, or `connections: null`, the entire JSON output is INVALID and will be rejected by the system. You MUST write meaningful strings for ALL three fields in EVERY task before outputting anything.
    10. DUPLICATE TASKS ARE FORBIDDEN: Every task must have a unique purpose and unique test_code. If two tasks test the same method on the same class, merge them into one task.
    11. DO NOT REDEFINE PAST ENTITIES: If a task asks the student to create a `BookingManager` that uses `User` and `Seat`, your `solution_template` MUST ONLY contain `class BookingManager:`. It MUST NOT contain `class User: pass` or `class Seat: pass`. Doing so will overwrite the student's actual implementations!
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