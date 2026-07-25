import sys
import os

# Insert backend directory FIRST in sys.path so Python imports backend/app/ instead of root app/
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
if backend_dir in sys.path:
    sys.path.remove(backend_dir)
sys.path.insert(0, backend_dir)

try:
    from app.main import app
except ImportError:
    from backend.app.main import app
