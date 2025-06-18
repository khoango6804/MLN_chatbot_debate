import subprocess
import sys
import os
from threading import Thread

def run_backend():
    os.chdir('backend')
    subprocess.run([sys.executable, 'main.py'])

def run_frontend():
    os.chdir('frontend')
    subprocess.run(['npm', 'start'])

if __name__ == '__main__':
    # Start backend
    backend_thread = Thread(target=run_backend)
    backend_thread.start()

    # Start frontend
    frontend_thread = Thread(target=run_frontend)
    frontend_thread.start()

    # Wait for both threads to complete
    backend_thread.join()
    frontend_thread.join() 