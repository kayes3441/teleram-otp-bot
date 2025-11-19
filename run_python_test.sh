#!/bin/bash
# Quick script to run Python login test

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Run the test
python login_test.py

# Deactivate virtual environment
deactivate

