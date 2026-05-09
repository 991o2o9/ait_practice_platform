import json
import logging
import re
from app.integrations.ai.groq_client import generate_json_completion, generate_text_completion

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Phase 1 — Generate task skeletons (structure + hints, NO test_code yet)
# ──────────────────────────────────────────────────────────────────────────────

_PHASE1_SYSTEM_PROMPT = """
You are a Senior Python Software Architect and Educational Platform Creator.
Your task is to break down the provided technical specification into 10-15 progressive
coding micro-tasks for an auto-grader.

In THIS phase you output ONLY the task structure — no test_code yet.
Focus entirely on designing the correct learning progression and precise hints.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⛔ ABSOLUTE CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. TASK COUNT: Generate exactly 10–15 tasks. Fewer than 10 is FORBIDDEN.
2. NULL FIELDS: Every task MUST have non-null, non-empty strings for `description`,
   `learning_objective`, and `connections`. Any null = entire JSON rejected.
3. NO DUPLICATE TASKS: Every task must have a unique purpose.
   If two tasks cover the same method on the same class, merge them.
4. DEPENDENCY ORDER: Tasks must be ordered so every class is defined before it is used.
   Scan hints and solution_template — if Task B needs a class from Task A, Task A comes first.
5. NO PAST CLASS REDEFINITION: `solution_template` MUST ONLY contain BRAND NEW classes
   for this task. NEVER repeat classes from earlier tasks.
6. NO SOLUTION LEAKING: Every method body in `solution_template` MUST contain ONLY `pass`.
   No if/else, no assignments, no return values, no arithmetic — just `pass`.
   WRONG:  def process(self, x):
               if x > 0: return x * 2
   CORRECT: def process(self, x):
               pass
7. NO EXCEPTION-ONLY TASKS: Never create a standalone task just for `class X(Exception): pass`.
   Group ALL custom exceptions into ONE task titled "Implement Custom Exceptions",
   placed BEFORE any task that uses them. List every exception class in its solution_template.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 DIFFICULTY PROGRESSION (strict — no back-jumps)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
easy   → medium → hard. Never go backward.

- easy   : Data classes / entities with strict typing (UUID, Enum, datetime).
           MAX 3 easy tasks. Merge similar entities into one task.
           Hints: full step-by-step.

- medium : Relationships, validation, business logic, raising exceptions.
           Hints: describe WHAT to do, not HOW.

- hard   : Complex algorithms, design patterns, multi-component integration.
           Hints: method signature + return type ONLY. No step-by-step logic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 HINTS QUALITY RULES (critical for learning)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hints must describe the EXACT business logic the student needs to implement.
Be explicit about:
- Every state change (e.g. "set self.balance -= amount")
- Every condition to check (e.g. "if sender balance < amount, raise InsufficientFunds")
- Every return value (e.g. "return the created Transaction object")
- Every exception to raise and when

DO NOT write vague hints like "implement the logic" or "check for errors".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 OUTPUT FORMAT — output ONLY valid JSON, nothing else
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
    "project_title": "...",
    "project_description": "...",
    "tasks": [
        {
            "title": "Task Title",
            "description": "MANDATORY: One sentence on why this task exists. NEVER null.",
            "difficulty": "easy | medium | hard",
            "learning_objective": "MANDATORY: One sentence on what the student learns. NEVER null.",
            "connections": "MANDATORY: 'Used in: Task X, Task Y'. NEVER null.",
            "solution_template": "Skeleton with ONLY new classes. All method bodies = pass.",
            "hints": "Exact business logic description. No vague language."
        }
    ]
}
"""


# ──────────────────────────────────────────────────────────────────────────────
# Phase 2 — Generate test_code from hints + solution_template
# ──────────────────────────────────────────────────────────────────────────────

_PHASE2_SYSTEM_PROMPT = """
You are a senior Python test engineer for an educational auto-grader platform.
You will receive a single coding task — its title, difficulty, hints, and solution_template.
Your ONLY job is to write the `test_code` for it.

The hints describe EXACTLY what the student's implementation must do.
Write tests that verify that exact behaviour — not just that the code runs without crashing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TEST CODE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SELF-CONTAINED: Instantiate ALL required objects inside the test. Never assume
   variables from previous tests exist. Redefine any needed classes inline.

2. MINIMUM 3 MEANINGFUL ASSERTIONS — each must verify a different aspect:
   a) Type check    — assert isinstance(obj.id, uuid.UUID)
   b) Value/state   — assert wallet.balance == Decimal('50.00') after a transfer
   c) Behaviour     — assert transaction in processor.history

   ⛔ FORBIDDEN assertions (they prove nothing):
   - assert not raised  (only checks code doesn't crash — a `pass` method passes this)
   - type(obj) == ClassName  (not an assert statement — has no effect)
   - assert True
   The test MUST verify the actual output or state change described in the hints.

3. SAFE EXCEPTION TESTING — NEVER `except SomeError: assert True`.
   Always use:
       raised = False
       try:
           <trigger the error>
       except SomeError:
           raised = True
       assert raised, "SomeError must be raised when ..."

4. TEST REAL BEHAVIOUR from hints — if hints say "subtract amount from sender balance",
   check sender.balance AFTER the call. If hints say "return a Transaction", assert
   isinstance(result, Transaction). Test the RESULT, not just the absence of errors.

5. NO DIRECT UUID COMPARISON: assert isinstance(obj.id, uuid.UUID), never == uuid.uuid4().

6. IMPORTS FIRST: All imports at the top of test_code.

7. NO SEMICOLONS: Use \\n and 4-space indentation only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 OUTPUT FORMAT — output ONLY valid JSON, nothing else
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{ "test_code": "...full self-contained test code as a single string..." }
"""


def _generate_test_for_task(task: dict) -> str:
    """
    Phase 2: Given a task skeleton (hints + solution_template), generate
    a meaningful test_code that verifies the exact behaviour described in hints.
    Returns the test_code string, or empty string on failure.
    """
    user_prompt = json.dumps(
        {
            "title": task.get("title"),
            "difficulty": task.get("difficulty"),
            "hints": task.get("hints"),
            "solution_template": task.get("solution_template"),
        },
        indent=2,
    )
    response = generate_json_completion(_PHASE2_SYSTEM_PROMPT, user_prompt)

    if "error" in response:
        logger.warning(
            "Phase 2 test generation failed for task '%s': %s",
            task.get("title"),
            response.get("error"),
        )
        return ""

    test_code = response.get("test_code", "")
    if not isinstance(test_code, str) or not test_code.strip():
        logger.warning("Phase 2 returned empty test_code for task '%s'", task.get("title"))
        return ""

    return test_code


def _inject_tests(tasks: list) -> list:
    """
    Phase 2 driver: iterate over tasks and inject generated test_code into each.
    Tasks that already have a non-empty test_code are skipped.
    """
    enriched = []
    for i, task in enumerate(tasks):
        if task.get("test_code", "").strip():
            # Already has test_code (shouldn't happen in phase 2, but be safe)
            enriched.append(task)
            continue

        logger.info("Generating test for task %d: %s", i + 1, task.get("title"))
        test_code = _generate_test_for_task(task)
        enriched.append({**task, "test_code": test_code})

    return enriched


# ──────────────────────────────────────────────────────────────────────────────
# Main entry point
# ──────────────────────────────────────────────────────────────────────────────

def generate_project_draft(prompt: str) -> dict:
    # ── Phase 1: Generate task skeletons (structure + hints, no tests) ──
    logger.info("Phase 1: generating task skeletons...")
    draft = generate_json_completion(_PHASE1_SYSTEM_PROMPT, prompt)

    if "error" in draft:
        logger.error("Phase 1 failed: %s", draft.get("error"))
        return draft

    tasks = draft.get("tasks", [])
    if not tasks:
        logger.error("Phase 1 returned no tasks.")
        return {"error": "No tasks generated in Phase 1"}

    # ── Phase 2: Generate test_code for each task from its hints ──
    logger.info("Phase 2: generating test_code for %d tasks...", len(tasks))
    tasks = _inject_tests(tasks)

    # ── Phase 3: Validate and fix the full task list in batches ──
    logger.info("Phase 3: validating tasks in batches...")
    tasks = validate_and_fix_tasks(tasks)

    draft["tasks"] = tasks
    return draft


# ──────────────────────────────────────────────────────────────────────────────
# Validator — batched so the LLM never loses context on large task lists
# ──────────────────────────────────────────────────────────────────────────────

_VALIDATOR_SYSTEM_PROMPT = """
You are a strict QA Engineer reviewing auto-generated coding tasks for an educational platform.
You receive a small batch of tasks (up to 4) PLUS a read-only list of classes already defined
in previous batches (`already_defined_classes`).

Check every task in the batch against the 7 rules below, FIX any violations,
and output ONLY valid JSON: {"tasks": [ ...fixed tasks... ]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ 7 MANDATORY QA RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. DEPENDENCY ORDER: If a task uses a class NOT in `already_defined_classes` and NOT
   introduced by an earlier task in this batch, reorder so the dependency comes first.

2. MINIMUM 3 MEANINGFUL ASSERTIONS: Every `test_code` must have at least 3 assertions
   that verify real behaviour — type checks, value/state checks, integration checks.
   ⛔ Remove or rewrite any assertion that is always true regardless of implementation:
      - `assert not raised` after a method that has `pass` body — REMOVE IT
      - `type(obj) == ClassName` without `assert` keyword — REMOVE IT
      - `assert True` — REMOVE IT
   Replace removed assertions with ones that check actual state or return values.

3. SAFE EXCEPTION TESTING: NEVER bare `except SomeError: assert True`.
   Rewrite with the safe pattern:
       raised = False
       try:
           <trigger>
       except SomeError:
           raised = True
       assert raised, "SomeError must be raised"

4. NO NULL FIELDS: `description`, `learning_objective`, `connections` must be
   non-empty strings. Generate meaningful values if any are null or empty.

5. NO REDEFINING PAST CLASSES: If a class name appears in `already_defined_classes`,
   REMOVE it from the current task's `solution_template`.

6. NO SOLUTION LEAKING: Every method body in `solution_template` must contain
   ONLY `pass`. If any method has logic (if/else, assignments, return with value,
   arithmetic), replace its entire body with `pass`.

7. NO EXCEPTION-ONLY TASKS: A task whose only content is `class X(Exception): pass`
   is FORBIDDEN as a standalone task. Merge all such tasks in this batch into one
   "Implement Custom Exceptions" task with a combined test verifying each can be raised.
"""


def _validate_batch(batch: list, already_defined: list) -> list:
    """Validate and fix a small batch of tasks with context of prior defined classes."""
    user_prompt = json.dumps(
        {"already_defined_classes": already_defined, "tasks_to_review": batch},
        indent=2,
    )
    response = generate_json_completion(
        _VALIDATOR_SYSTEM_PROMPT,
        user_prompt,
        use_validator=True,
    )

    if "error" in response:
        logger.warning(
            "Batch validator failed: %s — keeping original batch.",
            response.get("error"),
        )
        return batch

    fixed = response.get("tasks")
    if not isinstance(fixed, list) or len(fixed) == 0:
        logger.warning("Batch validator returned unexpected structure — keeping original batch.")
        return batch

    return fixed


def _extract_class_names(tasks: list) -> list:
    """
    Scan solution_template fields of already-validated tasks and return all class
    names introduced so far. Passed as dependency context to each validation batch.
    """
    names = []
    for task in tasks:
        template = task.get("solution_template") or ""
        names.extend(re.findall(r"^class\s+(\w+)", template, re.MULTILINE))
    return names


def validate_and_fix_tasks(tasks: list) -> list:
    """
    Validates and fixes generated tasks in batches of 4.
    Each batch receives the class names already introduced in prior batches
    so the validator can catch cross-batch dependency violations.
    """
    BATCH_SIZE = 4
    validated: list = []

    for i in range(0, len(tasks), BATCH_SIZE):
        batch = tasks[i : i + BATCH_SIZE]
        already_defined = _extract_class_names(validated)

        logger.info(
            "Validating tasks %d–%d | already defined: %s",
            i + 1,
            i + len(batch),
            already_defined,
        )

        fixed_batch = _validate_batch(batch, already_defined)
        validated.extend(fixed_batch)

    return validated


# ──────────────────────────────────────────────────────────────────────────────
# Refinement & explanation
# ──────────────────────────────────────────────────────────────────────────────

def refine_project_draft(current_draft: dict, feedback: str) -> dict:
    system_prompt = """
You are an AI teacher modifying a progressive Python programming project draft based on user feedback.
You will receive the current draft (JSON) and the user's feedback.
Output ONLY the updated valid JSON using the exact same structure as the input draft.

Rules to preserve during refinement:
- Smooth difficulty progression: easy → medium → hard, no back-jumps.
- Every task must have non-null description, learning_objective, and connections.
- test_code must verify real behaviour — no `assert not raised` on pass-body methods.
- Exception tests must use the `raised = False / assert raised` safety pattern.
- solution_template must only contain NEW classes for that specific task.
- Task order must respect class dependency order.
- All custom exceptions must be in ONE grouped task, not separate tasks.
- Every method body in solution_template must contain ONLY `pass`.
"""
    user_prompt = (
        f"Current Draft:\n{json.dumps(current_draft, indent=2)}\n\nUser Feedback:\n{feedback}"
    )
    return generate_json_completion(system_prompt, user_prompt)


def explain_code_failure(
    student_code: str,
    test_code: str,
    error_logs: str,
    past_code: str = "",
) -> str:
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