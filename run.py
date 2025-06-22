import subprocess
import os

# Get the absolute path of the directory containing this script
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(script_dir, 'backend')

def run_backend():
    """
    Changes the current directory to the backend directory and starts the uvicorn server.
    """
    print(f"Changing directory to: {backend_dir}")
    os.chdir(backend_dir)
    
    print("Starting backend server with uvicorn...")
    # It's generally safer to pass command line arguments as a list
    # and avoid shell=True unless necessary.
    # For Windows, shell=True might be required if 'uvicorn' is a .cmd or .bat file
    # and not directly in PATH. If uvicorn is installed in a virtualenv,
    # it should be directly executable.
    command = ['uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '5000', '--reload']
    
    try:
        subprocess.run(command, check=True)
    except FileNotFoundError:
        print("Error: 'uvicorn' command not found.")
        print("Please make sure uvicorn is installed and accessible from your PATH.")
        print("You can install it with: pip install uvicorn")
    except subprocess.CalledProcessError as e:
        print(f"Backend server failed to start with error: {e}")

if __name__ == '__main__':
    run_backend() 