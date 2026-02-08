"""Entry point for Todo In-Memory Python Console Application"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.storage.memory_store import MemoryStore
from src.services.task_service import TaskService
from src.cli.display import Display
from src.cli.sort_manager import SortManager
from src.cli.command_handler import CommandHandler
  

def main():
    """
    Main entry point for the Todo application.
    Initializes components and runs the REPL loop.
    """
    store = MemoryStore()
    service = TaskService(store)
    display = Display()
    sort_manager = SortManager()
    handler = CommandHandler(service, display, sort_manager)
    
    print("=" * 60)
    print("Todo Application - Phase I (In-Memory Console)")
    print("=" * 60)
    print("\nWelcome! This is an in-memory task management application.")
    print("All data will be lost when you exit the application.")
    print("\nType 'help' for available commands, or 'exit' to quit.")
    print("=" * 60)
    
    while True:
        try:
            command = input("\ntodo> ").strip()
            
            if not command:
                continue
            
            should_continue = handler.dispatch(command)
            
            if not should_continue:
                break
        
        except KeyboardInterrupt:
            print("\n\nInterrupted by user (Ctrl+C)")
            break
        except EOFError:
            print("\n\nEnd of input (Ctrl+D)")
            break
        except Exception as e:
            display.show_error("Unexpected Error", str(e))
    
    print("\nGoodbye! All tasks have been cleared from memory.")


if __name__ == "__main__":
    main()
