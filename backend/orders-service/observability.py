import logging
import json
import uuid
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import contextvars
import base64

# Contexto para armazenar dados da requisição atual
correlation_id_ctx = contextvars.ContextVar("correlation_id", default=None)
user_id_ctx = contextvars.ContextVar("user_id", default="anonymous")

class JSONFormatter(logging.Formatter):
    """Formatador de logs em JSON para facilitar a observabilidade."""
    def format(self, record):
        log_obj = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "correlation_id": correlation_id_ctx.get(),
            "user": user_id_ctx.get()
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

def setup_logging():
    """Configura o logger padrão da aplicação para usar JSON."""
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    
    # Remove handlers padrões e adiciona o nosso
    root_logger = logging.getLogger()
    for h in root_logger.handlers:
        root_logger.removeHandler(h)
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Middleware para injetar e propagar o X-Correlation-ID."""
    async def dispatch(self, request: Request, call_next):
        # 1. Tenta pegar o ID do header ou gera um novo
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        
        # 2. Tenta extrair o User ID do Token JWT (se presente)
        user_id = "anonymous"
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token_str = auth_header.split(" ")[1]
                payload_b64 = token_str.split(".")[1]
                payload_b64 += "=" * (-len(payload_b64) % 4)
                payload = json.loads(base64.b64decode(payload_b64).decode())
                user_id = payload.get("sub", "anonymous")
            except Exception:
                user_id = "anonymous"

        # 3. Define no contexto para o logger usar
        c_token = correlation_id_ctx.set(correlation_id)
        u_token = user_id_ctx.set(user_id)
        
        start_time = time.time()
        try:
            response: Response = await call_next(request)
            process_time = time.time() - start_time
            
            # 3. Retorna o ID no header da resposta para o cliente
            response.headers["X-Correlation-ID"] = correlation_id
            response.headers["X-Process-Time"] = str(process_time)
            
            # Log da requisição finalizada
            logging.info(f"Request: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
            
            return response
        finally:
            # Limpa o contexto
            correlation_id_ctx.reset(c_token)
            user_id_ctx.reset(u_token)

def get_correlation_id():
    """Retorna o ID atual para ser passado em chamadas inter-serviços."""
    return correlation_id_ctx.get()
