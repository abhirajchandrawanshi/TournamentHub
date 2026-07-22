import sys
import os

# Add the root and backend directory to sys.path to allow correct imports
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../backend'))

from backend.app.main import app
