import json
import os
import re
from datetime import datetime, timezone

import requests


AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama").strip().lower()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TIMEOUT = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "12"))

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "25"))


def _normalize_priority(value: str) -> str:
    normalized = (value or "").strip().upper()
    mapping = {
        "ALTA": "ALTA",
        "HIGH": "ALTA",
        "MEDIA": "MEDIA",
        "MEDIUM": "MEDIA",
        "MÉDIA": "MEDIA",
        "BAIXA": "BAIXA",
        "LOW": "BAIXA",
    }
    return mapping.get(normalized, "MEDIA")


def _parse_json_from_text(content: str) -> dict:
    text = (content or "").strip()
    if not text:
        raise ValueError("Resposta vazia do modelo")

    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text).strip()

    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("Nao foi possivel extrair JSON da resposta do modelo")
    return json.loads(match.group(0))


def _build_order_payload(order) -> dict:
    return {
        "order_id": order.id,
        "user_id": order.user_id,
        "status": order.status,
        "created_at": str(order.created_at),
        "total_price": float(order.total_price or 0),
        "items": [
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price or 0),
            }
            for item in order.items
        ],
    }


def _heuristic_priority(order) -> dict:
    status = getattr(order, "status", "").upper()
    if status == "ENTREGUE":
        return {
            "priority": "BAIXA",
            "justification": "Pedido ja entregue. Nao ha atividade logistica pendente.",
            "recommended_action": "Sem acao de expedicao; somente monitorar pos-venda quando necessario.",
            "source": "heuristic",
        }

    score = 0
    total_price = float(order.total_price or 0)
    total_items = sum(int(item.quantity or 0) for item in order.items)

    if total_price >= 1000:
        score += 2
    elif total_price >= 400:
        score += 1

    if total_items >= 6:
        score += 2
    elif total_items >= 3:
        score += 1

    if status == "PENDENTE":
        score += 1

    age_hours = 0.0
    created_at = getattr(order, "created_at", None)
    if isinstance(created_at, datetime):
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        age_hours = (datetime.now(timezone.utc) - created_at).total_seconds() / 3600
        if age_hours >= 24:
            score += 2
        elif age_hours >= 4:
            score += 1

    if score >= 5:
        priority = "ALTA"
    elif score >= 3:
        priority = "MEDIA"
    else:
        priority = "BAIXA"

    recommended_action = "Priorizar separacao e expedicao conforme capacidade do time."
    if status == "ENVIADO":
        if priority == "ALTA":
            priority = "MEDIA"
        recommended_action = "Acompanhar transporte e atuar proativamente em risco de atraso."

    return {
        "priority": priority,
        "justification": (
            f"Prioridade sugerida por regra local com base em valor (R${total_price:.2f}), "
            f"quantidade de itens ({total_items}), status ({order.status}) e idade ({age_hours:.1f}h)."
        ),
        "recommended_action": recommended_action,
        "source": "heuristic",
    }


def _openai_priority(order) -> dict:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY nao configurada")

    prompt_data = _build_order_payload(order)
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENAI_MODEL,
            "temperature": 0.2,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Voce e um analista operacional de e-commerce. "
                        "Responda em JSON valido com: priority, justification, recommended_action. "
                        "priority deve ser ALTA, MEDIA ou BAIXA."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        "Analise o pedido e sugira prioridade operacional.\n"
                        f"Pedido: {json.dumps(prompt_data, ensure_ascii=False)}"
                    ),
                },
            ],
        },
        timeout=OPENAI_TIMEOUT,
    )
    response.raise_for_status()
    payload = response.json()
    content = payload["choices"][0]["message"]["content"]
    parsed = _parse_json_from_text(content)
    return {
        "priority": _normalize_priority(parsed.get("priority", "MEDIA")),
        "justification": parsed.get("justification", "Sem justificativa retornada pelo modelo."),
        "recommended_action": parsed.get(
            "recommended_action",
            "Avaliar capacidade do time e priorizar despacho conforme SLA.",
        ),
        "source": "openai",
    }


def _ollama_priority(order) -> dict:
    prompt_data = _build_order_payload(order)
    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/chat",
        json={
            "model": OLLAMA_MODEL,
            "stream": False,
            "format": "json",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Voce é um analista operacional de e-commerce. "
                        "Responda SOMENTE JSON válido com as chaves "
                        "priority, justification, recommended_action. "
                        "priority deve ser ALTA, MEDIA ou BAIXA."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        "Analise o pedido e sugira prioridade operacional.\n"
                        f"Pedido: {json.dumps(prompt_data, ensure_ascii=False)}"
                    ),
                },
            ],
        },
        timeout=OLLAMA_TIMEOUT,
    )
    response.raise_for_status()
    payload = response.json()
    content = (payload.get("message") or {}).get("content", "")
    parsed = _parse_json_from_text(content)
    return {
        "priority": _normalize_priority(parsed.get("priority", "MEDIA")),
        "justification": parsed.get("justification", "Sem justificativa retornada pelo modelo local."),
        "recommended_action": parsed.get(
            "recommended_action",
            "Avaliar capacidade do time e priorizar despacho conforme SLA.",
        ),
        "source": "ollama",
    }


def _enforce_status_consistency(order, suggestion: dict) -> dict:
    status = getattr(order, "status", "").upper()
    if status == "ENTREGUE":
        suggestion["priority"] = "BAIXA"
        suggestion["recommended_action"] = "Sem acao de expedicao; somente monitorar pos-venda quando necessario."
    elif status == "ENVIADO":
        if suggestion.get("priority") == "ALTA":
            suggestion["priority"] = "MEDIA"
        suggestion["recommended_action"] = "Acompanhar transporte e atuar proativamente em risco de atraso."
    return suggestion


def suggest_order_priority(order) -> dict:
    try:
        if AI_PROVIDER == "openai":
            suggestion = _openai_priority(order)
        elif AI_PROVIDER == "ollama":
            suggestion = _ollama_priority(order)
        elif AI_PROVIDER == "heuristic":
            suggestion = _heuristic_priority(order)
        else:
            suggestion = _heuristic_priority(order)
    except Exception:
        suggestion = _heuristic_priority(order)

    return _enforce_status_consistency(order, suggestion)
