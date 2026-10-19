FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
PYTHONUNBUFFERED=1

WORKDIR /app/src

RUN apt-get update && apt-get install -y \
    curl \
    iputils-ping && rm -rf /var/lib/apt/lists/*

# new pip
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Python
COPY src/requirements.txt .
RUN uv pip install -r requirements.txt --system --prerelease=allow 

COPY src/ .

# Copy the compiled Vite assets to a separate directory
COPY frontend/assets/ /app/frontend/assets

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]