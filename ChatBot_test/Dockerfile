FROM python:3.11-slim

# Set working directory to / so that 'app' is treated as a package
WORKDIR /

# Copy the backend/app directory to /app
COPY backend/app /app

# Install dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Expose port 8000
EXPOSE 8000

# Start FastAPI using app.main:app to support relative imports
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
