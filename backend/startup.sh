#!/bin/bash
set -e

echo "============================================"
echo "Job Tracker API Startup"
echo "============================================"
echo "Time: $(date)"
echo "Working directory: $(pwd)"
echo "Python version: $(python --version)"
echo ""

# Check environment variables
echo "Environment Check:"
echo "  PORT: ${PORT:-8000}"
if [ -z "$DATABASE_URL" ]; then
    echo "  DATABASE_URL: ❌ NOT SET"
else
    # Print sanitized database URL (hide password)
    SANITIZED_URL=$(echo "$DATABASE_URL" | sed -E 's/(:\/\/[^:]+:)[^@]+(@)/\1***\2/')
    echo "  DATABASE_URL: ✓ Set ($SANITIZED_URL)"
fi
echo ""

# Wait for database to be ready
echo "============================================"
echo "Database Connection Check"
echo "============================================"
python -c "
import os
import sys
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

max_retries = 30
retry_interval = 2

database_url = os.getenv('DATABASE_URL')
if not database_url:
    print('❌ ERROR: DATABASE_URL environment variable is not set')
    print('Please set DATABASE_URL in Railway dashboard')
    sys.exit(1)

print(f'Attempting to connect to database...')
print(f'Max retries: {max_retries}, Interval: {retry_interval}s')
print('')

for i in range(max_retries):
    try:
        print(f'Attempt {i+1}/{max_retries}...', end=' ')
        engine = create_engine(database_url, pool_pre_ping=True, echo=False)
        with engine.connect() as conn:
            # Test actual query
            result = conn.execute(text('SELECT 1'))
            result.fetchone()
            print('✓ Success!')
            print('')
            print('Database connection established successfully!')
            break
    except OperationalError as e:
        print('✗ Failed')
        if i < max_retries - 1:
            print(f'  Reason: {str(e)[:100]}')
            print(f'  Retrying in {retry_interval}s...')
            print('')
            time.sleep(retry_interval)
        else:
            print('')
            print(f'❌ Failed to connect to database after {max_retries} attempts')
            print(f'Last error: {e}')
            print('')
            print('Troubleshooting:')
            print('1. Verify DATABASE_URL is set correctly in Railway')
            print('2. Check that the database service is running')
            print('3. Verify network connectivity between services')
            sys.exit(1)
    except Exception as e:
        print('✗ Unexpected error')
        print(f'❌ Unexpected error: {e}')
        sys.exit(1)
"

# Run database migrations
echo ""
echo "============================================"
echo "Database Migrations"
echo "============================================"
echo "Running: alembic upgrade head"
alembic upgrade head
echo "✓ Migrations completed successfully"

# Start the application
echo ""
echo "============================================"
echo "Starting Server"
echo "============================================"
echo "Host: 0.0.0.0"
echo "Port: ${PORT:-8000}"
echo "Health check: http://0.0.0.0:${PORT:-8000}/health"
echo ""
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info
