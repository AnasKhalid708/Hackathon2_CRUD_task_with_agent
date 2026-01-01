# Tasks: Phase I Todo In-Memory Python Console Application

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: NOT REQUESTED - Phase I uses manual validation only

**Organization**: Tasks organized by functional area and dependencies for the 7 core features from plan.md

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure under `src/` at repository root
- Documentation at repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project structure and basic configuration

- [X] T001 Create project directory structure with src/, src/models/, src/services/, src/storage/, src/cli/ directories
- [X] T002 [P] Create __init__.py files in src/, src/models/, src/services/, src/storage/, src/cli/
- [X] T003 [P] Create requirements.txt with optional rich dependency
- [X] T004 [P] Create .gitignore with Python standard ignores (__pycache__, *.pyc, .env, venv/)

**Checkpoint**: Project structure ready for implementation

---

## Phase 2: Foundational (Core Data Layer)

**Purpose**: Data model and storage infrastructure that all features depend on

**⚠️ CRITICAL**: Must complete before any CLI or service layer work

### Feature 1: Task Model (Entity & Validation)

- [X] T005 Create Task dataclass in src/models/task.py with fields: id (str), title (str), description (str), completed (bool), created_at (str)
- [X] T006 Implement Task.create() factory method in src/models/task.py with UUID v4 generation and ISO 8601 timestamp
- [X] T007 Add Task.update() method in src/models/task.py with title/description validation (non-empty, max lengths)
- [X] T008 Add Task.toggle_completed() method in src/models/task.py to flip completed boolean
- [X] T009 Add Task.short_id() method in src/models/task.py to return first 8 characters of ID
- [X] T010 Add Task.to_dict() and Task.from_dict() methods in src/models/task.py for future serialization

### Feature 2: Memory Storage (In-Memory Persistence)

- [X] T011 Create MemoryStore class in src/storage/memory_store.py with _tasks: Dict[str, Task] attribute
- [X] T012 Implement MemoryStore.add() method in src/storage/memory_store.py for O(1) task insertion
- [X] T013 Implement MemoryStore.get() method in src/storage/memory_store.py for O(1) task lookup by ID
- [X] T014 Implement MemoryStore.get_all() method in src/storage/memory_store.py returning list of all tasks
- [X] T015 Implement MemoryStore.get_all_sorted() method in src/storage/memory_store.py with sort options A/B/C/D
- [X] T016 Implement MemoryStore.find_by_prefix() method in src/storage/memory_store.py for ID prefix matching
- [X] T017 Implement MemoryStore.check_duplicate_title() method in src/storage/memory_store.py for case-insensitive title comparison
- [X] T018 Implement MemoryStore.delete() method in src/storage/memory_store.py returning boolean success
- [X] T019 Implement MemoryStore.exists() and MemoryStore.count() utility methods in src/storage/memory_store.py

**Checkpoint**: Data layer complete - service and CLI layers can now be built

---

## Phase 3: Service Layer (Business Logic)

**Purpose**: Orchestration of CRUD operations with validation and ID prefix resolution

### Feature 3: Task Service (CRUD Operations)

- [X] T020 Create TaskService class in src/services/task_service.py with MemoryStore dependency injection
- [X] T021 Implement TaskService.add_task() in src/services/task_service.py with duplicate title check and user confirmation
- [X] T022 Implement TaskService.get_task() in src/services/task_service.py with ID prefix resolution (unique/ambiguous/not found)
- [X] T023 Implement TaskService.resolve_id_prefix() in src/services/task_service.py returning full ID or error if ambiguous/not found
- [X] T024 Implement TaskService.check_duplicate_title() in src/services/task_service.py delegating to MemoryStore
- [X] T025 Implement TaskService.update_task() in src/services/task_service.py with ID prefix support and validation
- [X] T026 Implement TaskService.delete_task() in src/services/task_service.py with ID prefix support
- [X] T027 Implement TaskService.toggle_task() in src/services/task_service.py with ID prefix support
- [X] T028 Implement TaskService.list_tasks() in src/services/task_service.py with configurable sort option

**Checkpoint**: Business logic complete - CLI can now be implemented

---

## Phase 4: CLI Layer (User Interface)

**Purpose**: User interaction, command handling, and output formatting

### Feature 5: Display Formatter (Output Presentation)

- [X] T029 Create Display class in src/cli/display.py with methods for formatting output
- [X] T030 Implement Display.format_task_list() in src/cli/display.py with table layout (ID, title, description, status, timestamp)
- [X] T031 Implement Display.format_status() in src/cli/display.py with ✓/✗ indicators for completion
- [X] T032 Implement Display.show_success() in src/cli/display.py with green formatting (if rich available)
- [X] T033 Implement Display.show_error() in src/cli/display.py with red formatting showing error type + reason
- [X] T034 Implement Display.show_ambiguous_id_error() in src/cli/display.py listing matching IDs
- [X] T035 Implement Display.show_duplicate_warning() in src/cli/display.py for duplicate title detection
- [X] T036 Add Display.show_empty_list() in src/cli/display.py for "No tasks found" message
- [X] T037 Add fallback to plain text formatting in src/cli/display.py if rich library unavailable

### Feature 8: Sort Manager (User Preference Management)

- [X] T038 Create SortManager class in src/cli/sort_manager.py with _current_sort attribute defaulting to 'D'
- [X] T039 Implement SortManager.get_sort() in src/cli/sort_manager.py returning current sort preference
- [X] T040 Implement SortManager.set_sort() in src/cli/sort_manager.py with validation for A/B/C/D options
- [X] T041 Add SortManager.get_sort_description() in src/cli/sort_manager.py returning human-readable sort option names

### Feature 4: Command Handler (Command Dispatch & Interactive Prompts)

- [X] T042 Create CommandHandler class in src/cli/command_handler.py with TaskService, Display, and SortManager dependencies
- [X] T043 Implement command dictionary in src/cli/command_handler.py mapping command names to handler methods
- [X] T044 Implement CommandHandler.dispatch() in src/cli/command_handler.py with command routing and error handling
- [X] T045 Implement CommandHandler.handle_add() in src/cli/command_handler.py with interactive prompts for title and description
- [X] T046 Add duplicate title confirmation prompt in CommandHandler.handle_add() in src/cli/command_handler.py
- [X] T047 Implement CommandHandler.handle_list() in src/cli/command_handler.py using current sort preference from SortManager
- [X] T048 Implement CommandHandler.handle_update() in src/cli/command_handler.py with interactive prompts for ID, title, description
- [X] T049 Implement CommandHandler.handle_delete() in src/cli/command_handler.py with interactive prompt for ID
- [X] T050 Implement CommandHandler.handle_toggle() in src/cli/command_handler.py with interactive prompt for ID
- [X] T051 Implement CommandHandler.handle_sort() in src/cli/command_handler.py with interactive prompt for sort option (A/B/C/D)
- [X] T052 Implement CommandHandler.handle_help() in src/cli/command_handler.py displaying all available commands
- [X] T053 Implement CommandHandler.handle_exit() in src/cli/command_handler.py returning exit signal
- [X] T054 Add ID prefix validation with ambiguous/not found error handling in command handlers in src/cli/command_handler.py
- [X] T055 Add moderate error messages (error type + reason) for all error cases in src/cli/command_handler.py

**Checkpoint**: CLI complete - application can now be assembled

---

## Phase 5: Application Entry Point & Documentation

**Purpose**: Application initialization, REPL loop, and user documentation

### Feature 6: Entry Point (Application Runner)

- [X] T056 Create main.py in src/ with main() function
- [X] T057 Implement component initialization in src/main.py (MemoryStore, TaskService, SortManager, Display, CommandHandler)
- [X] T058 Implement REPL loop in src/main.py reading user input and dispatching commands
- [X] T059 Add welcome message and instructions in src/main.py
- [X] T060 Add graceful exit handling (Ctrl+C, Ctrl+D, EOF) in src/main.py
- [X] T061 Add exit message in src/main.py
- [X] T062 Implement if __name__ == "__main__" pattern in src/main.py

### Feature 7: Documentation

- [X] T063 [P] Create README.md at repository root with project description and Python 3.12.4 requirement
- [X] T064 [P] Add setup instructions to README.md (optional rich installation)
- [X] T065 [P] Add "How to Run" section to README.md with python src/main.py command
- [X] T066 [P] Add example usage for all 7 commands to README.md (add, list, update, delete, toggle, sort, exit)
- [X] T067 [P] Document interactive prompt workflow in README.md (no command-line arguments)
- [X] T068 [P] Document ID prefix matching feature in README.md
- [X] T069 [P] Document duplicate title warning behavior in README.md
- [X] T070 [P] Document sorting options (A/B/C/D) with default (D) in README.md
- [X] T071 [P] Document moderate error message format in README.md
- [X] T072 [P] Add Phase I scope clarification to README.md (no persistence, console-only)

**Checkpoint**: Application complete and documented

---

## Phase 6: Validation & Polish

**Purpose**: Manual testing and final validation against acceptance criteria

- [X] T073 Run application and verify welcome message displays correctly
- [X] T074 Test add command with title only via interactive prompt
- [X] T075 Test add command with title and description via interactive prompts
- [X] T076 Test add command with empty title (expect validation error)
- [X] T077 Test add command with duplicate title (expect warning and confirmation prompt)
- [X] T078 Test list command with empty task list (expect "No tasks found")
- [X] T079 Test list command with 3+ tasks (verify all display with correct formatting)
- [X] T080 Test update command with ID prefix (title only)
- [X] T081 Test update command with ID prefix (description only)
- [X] T082 Test update command with ID prefix (both fields)
- [X] T083 Test update command with invalid/ambiguous ID prefix (expect error with matching IDs)
- [X] T084 Test delete command with valid ID prefix
- [X] T085 Test delete command with invalid/ambiguous ID prefix (expect error)
- [X] T086 Test toggle command marking task complete
- [X] T087 Test toggle command marking task incomplete
- [X] T088 Test toggle command with invalid/ambiguous ID prefix (expect error)
- [X] T089 Test sort command changing display order to Option A (insertion order)
- [X] T090 Test sort command changing display order to Option B (oldest first)
- [X] T091 Test sort command changing display order to Option C (newest first)
- [X] T092 Test sort command with default Option D (incomplete first, then creation time)
- [X] T093 Test help command displays all available commands
- [X] T094 Test exit command terminates application
- [X] T095 Test Ctrl+C exits gracefully with message
- [X] T096 Test invalid command shows "Unknown command" error
- [X] T097 Verify task IDs displayed as 8 characters minimum in list output
- [X] T098 Verify status indicators (✓/✗) display correctly
- [X] T099 Verify timestamps in ISO 8601 format
- [X] T100 Verify moderate error messages (error type + reason, no stack traces)
- [X] T101 Verify all data lost after application exit (expected behavior)
- [X] T102 Verify quickstart.md manual validation checklist completed
- [X] T103 [P] Code review for PEP 8 compliance and type hints
- [X] T104 [P] Verify all __init__.py files present
- [X] T105 Final validation against spec.md acceptance criteria

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: No dependencies - start immediately
2. **Foundational (Phase 2)**: Depends on Setup - BLOCKS all other phases
   - T005-T019 must complete before Phase 3
3. **Service Layer (Phase 3)**: Depends on Foundational
   - T020-T028 must complete before Phase 4
4. **CLI Layer (Phase 4)**: Depends on Service Layer
   - T029-T055 must complete before Phase 5
5. **Entry Point (Phase 5)**: Depends on CLI Layer
   - T056-T072 must complete before Phase 6
6. **Validation (Phase 6)**: Depends on Entry Point completion

### Critical Path

```
Setup → Foundational → Service → CLI → Entry Point → Validation
T001-T004 → T005-T019 → T020-T028 → T029-T055 → T056-T072 → T073-T105
```

### Parallel Opportunities Within Phases

**Phase 1 (Setup)**:
- T002, T003, T004 can run in parallel after T001

**Phase 2 (Foundational)**:
- Task Model (T005-T010) and Memory Storage (T011-T019) are independent
- Can work on both features simultaneously

**Phase 4 (CLI Layer)**:
- Display (T029-T037) and SortManager (T038-T041) can be built in parallel
- CommandHandler (T042-T055) depends on both

**Phase 5 (Documentation)**:
- T063-T072 can all run in parallel (different sections of README.md)

**Phase 6 (Validation)**:
- All tests must run sequentially to verify application state

---

## Implementation Strategy

### Recommended Execution Order

1. **Complete Setup**: T001-T004 (30 minutes)
2. **Build Foundation**: T005-T019 (2-3 hours)
   - Start with Task model (T005-T010)
   - Then MemoryStore (T011-T019)
3. **Build Service Layer**: T020-T028 (1-2 hours)
4. **Build CLI Layer**: T029-T055 (3-4 hours)
   - Start with Display and SortManager in parallel
   - Then CommandHandler
5. **Create Entry Point**: T056-T062 (1 hour)
6. **Write Documentation**: T063-T072 (1-2 hours)
7. **Validate Everything**: T073-T105 (2-3 hours)

**Total Estimated Time**: 10-15 hours

### Minimal Viable Product (MVP)

To get a working application fastest:

1. T001-T004 (Setup)
2. T005-T010 (Task Model only)
3. T011-T014 (Basic MemoryStore - add, get, get_all only)
4. T020, T021, T028 (TaskService - add and list only)
5. T029-T032, T036, T037 (Display - basic formatting)
6. T042-T047, T052-T053 (CommandHandler - add, list, help, exit only)
7. T056-T062 (Entry Point)
8. T063-T065, T072 (Minimal README)

This gives you a working "add task" and "list tasks" application in ~4-5 hours.

### Feature-by-Feature Approach

Build one complete feature at a time:

1. **Feature 1 (Add Task)**: T001-T010, T011-T013, T020-T021, T042-T046, T056-T062
2. **Feature 2 (List Tasks)**: T014-T015, T028-T032, T038-T041, T047
3. **Feature 3 (Update Task)**: T007, T022-T023, T025, T048
4. **Feature 4 (Delete Task)**: T018, T026, T049
5. **Feature 5 (Toggle Complete)**: T008, T027, T050
6. **Feature 6 (Sort)**: T015, T041, T051
7. **Feature 7 (Error Handling)**: T016-T017, T033-T035, T054-T055
8. **Documentation**: T063-T072

---

## Notes

- **[P]** tasks have no dependencies within their phase and can run in parallel
- **ID prefix matching** (Feature 3) is implemented in service layer (T022-T023) and used by all CLI commands
- **Duplicate title detection** (Feature 3) is implemented in storage (T017), service (T024), and CLI (T046)
- **Sorting** (Feature 8) is implemented in storage (T015), managed by SortManager (T038-T041), and used by list command (T047)
- All validation tasks (T073-T105) must run against the complete application
- Commit after each completed task or logical group
- **Tests are NOT included** - Phase I uses manual validation only (per spec.md)
- All file paths assume single project structure under `src/` at repository root
- Python version: 3.12.4 (exact) - must be documented in README.md
- Optional dependency: rich library for enhanced CLI output (with plain text fallback)

---

**Task Breakdown Complete**: 2026-01-01  
**Total Tasks**: 105  
**Estimated Time**: 10-15 hours (full implementation) | 4-5 hours (MVP)  
**Ready for Implementation**: ✅
