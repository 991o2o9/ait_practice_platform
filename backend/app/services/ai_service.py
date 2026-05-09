import json
from app.integrations.ai.groq_client import generate_json_completion, generate_text_completion


def generate_project_draft(prompt: str) -> dict:
    system_prompt = """
You are a Senior Python Software Architect and Educational Platform Creator.
Your task is to break down the provided technical specification into 10-15 progressive coding micro-tasks for an auto-grader.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⛔ ABSOLUTE CONSTRAINTS (violation = entire output rejected)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. TASK COUNT: Generate exactly 10–15 tasks. Fewer than 10 is FORBIDDEN.
2. NULL FIELDS: Every task MUST have non-null, non-empty strings for `description`,
   `learning_objective`, and `connections`. Any null = entire JSON rejected.
3. NO DUPLICATE TASKS: Every task must have a unique purpose and unique test logic.
   If two tasks test the same method on the same class, merge them.
4. DEPENDENCY ORDER: If Task B uses a class from Task A, Task A MUST appear first.
   Before finalising order, scan all test_code for class instantiations and verify
   they only reference classes introduced in prior tasks.
5. NO PAST CLASS REDEFINITION: `solution_template` MUST ONLY contain declarations
   for BRAND NEW classes introduced in this specific task. NEVER redefine classes
   from earlier tasks — doing so overwrites the student's implementations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 DIFFICULTY LEVELS & PROGRESSION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tasks MUST follow a smooth progression: easy tasks first, then medium, then hard.
Do NOT scatter difficulties — no jumping from hard back to easy.

- easy   : Creation of data classes / entities with strict typing (UUID, Enum, datetime).
           Hints must be detailed and step-by-step.
           MAX 3 easy tasks. Merge similar entity tasks (e.g. User + Home into one task).

- medium : Entity relationships, validation, and business logic (raising exceptions,
           managing collections). Hints are subtle — describe WHAT to do, not HOW.

- hard   : Complex algorithms, design patterns, multi-component integration.
           Hints contain ONLY the method signature and expected return type.
           No step-by-step logic in hints.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TEST CODE RULES (critical for auto-grader correctness)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SELF-CONTAINED: Every test_code MUST be entirely self-contained.
   Instantiate ALL required mock objects inside the current test_code.
   NEVER assume variables from previous tests exist.

2. MINIMUM 3 ASSERTIONS: Every test_code MUST contain at least 3 assertions:
   a) Type check  (e.g. assert isinstance(obj.id, uuid.UUID))
   b) Value check (e.g. assert obj.status == DeviceStatus.ONLINE)
   c) Behaviour / integration check (e.g. assert device in home.devices)

3. SAFE EXCEPTION TESTING: Never use a bare `except SomeError: assert True`.
   Always use the pattern below so a silent non-raise is caught:
       raised = False
       try:
           ...trigger the error...
       except SomeError:
           raised = True
       assert raised, "SomeError must be raised"

4. NO DIRECT UUID COMPARISON: NEVER assert obj.id == uuid.uuid4().
   Always check type: assert isinstance(obj.id, uuid.UUID).

5. REAL-WORLD SCENARIO: The final assertion in every test must simulate actual
   usage by another component, not just object creation.

6. ATTRIBUTE CONSISTENCY: NEVER test an attribute (e.g. home.devices) unless
   you explicitly instructed the student to create that exact attribute in the
   current or a previous task's hints/description.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 CODE FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. NO SEMICOLONS: Never combine Python lines with (;). Use \\n and 4-space indentation.
2. IMPORTS FIRST: Place all required imports at the top of solution_template and test_code.
3. CLASS EXTENSIONS: When adding a method to a class from a previous task,
   leave solution_template completely empty and write in hints:
   "Copy your entire [ClassName] implementation from the Past Context tab and add the new method."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 OUTPUT FORMAT (output ONLY valid JSON, nothing else)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
    "project_title": "Project Title",
    "project_description": "Detailed description of the final system",
    "tasks": [
        {
            "title": "Task Title",
            "description": "MANDATORY: One sentence on why this task exists in the overall system. NEVER null.",
            "difficulty": "easy | medium | hard",
            "learning_objective": "MANDATORY: One sentence on what concept the student learns. NEVER null.",
            "connections": "MANDATORY: 'Used in: Task X, Task Y' format. NEVER null.",
            "test_code": "Self-contained test with 3+ assertions using the safety patterns above.",
            "solution_template": "Starter code — ONLY new classes for THIS task. Never redefine past classes.",
            "hints": "For easy: full step-by-step guide. For medium: what to do, not how. For hard: method signature + return type only."
        }
    ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔁 PRE-OUTPUT SELF-CHECK (run mentally before responding)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before finalising your JSON, verify each task against this checklist:
[ ] description, learning_objective, connections are non-null strings
[ ] test_code is self-contained and has 3+ assertions
[ ] Exception tests use the `raised = False / assert raised` pattern
[ ] solution_template contains only NEW classes for this task
[ ] No class from a previous task is redefined in solution_template
[ ] Difficulty flows easy → medium → hard without back-jumps
[ ] Task order respects all class dependencies
[ ] No two tasks test the same method on the same class
[ ] No semicolons used in any code field
"""
    return generate_json_completion(system_prompt, prompt)


def refine_project_draft(current_draft: dict, feedback: str) -> dict:
    system_prompt = """
You are an AI teacher modifying a progressive Python programming project draft based on user feedback.
You will receive the current draft (JSON) and the user's feedback.
Output ONLY the updated valid JSON using the exact same structure as the input draft.

Rules to preserve during refinement:
- Smooth difficulty progression: easy → medium → hard, no back-jumps.
- Every task must have non-null description, learning_objective, and connections.
- Test code must be self-contained with 3+ assertions.
- Exception tests must use the `raised = False / assert raised` safety pattern.
- solution_template must only contain NEW classes for that specific task.
- Task order must respect class dependency order.
"""
    user_prompt = f"Current Draft:\n{json.dumps(current_draft, indent=2)}\n\nUser Feedback:\n{feedback}"
    return generate_json_completion(system_prompt, user_prompt)


def explain_code_failure(student_code: str, test_code: str, error_logs: str, past_code: str = "") -> str:
    system_prompt = """
You are an AI assistant helping a student learn Python on a progressive coding platform.
The student submitted code that failed the auto-grader tests.

Your job:
1. Identify the ROOT CAUSE of the failure from the error logs.
2. Check if the issue is in the student's current code OR a conflict with their past code.
3. Give a concise, targeted hint that guides them toward the fix WITHOUT giving away the solution.

Rules:
- DO NOT provide the exact corrected code.
- DO NOT restate the error logs verbatim — explain what they mean in plain language.
- If the issue is a missing attribute, tell them WHICH attribute and on WHICH class.
- If the issue is a wrong type, tell them WHAT type is expected.
- Keep the hint to 3–5 sentences maximum.
"""
    user_prompt = f"""
Previous Code (earlier tasks, already passed):
{past_code}

Current Student Code (just submitted, failed):
{student_code}

Test Code:
{test_code}

Error Logs / Traceback:
{error_logs}

Provide a concise hint explaining the root cause and how to approach fixing it.
"""
    return generate_text_completion(system_prompt, user_prompt)