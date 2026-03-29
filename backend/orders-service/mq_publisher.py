import pika
import json
import os
import logging
import time

log = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
EXCHANGE = "order.events"
ROUTING_KEY = "order.created"


def publish_order_created(order_data: dict, correlation_id: str):
    """
    Publica um evento de pedido criado na exchange do RabbitMQ.
    order_data deve conter: order_id, user_id, username, total_price, items
    """
    for attempt in range(1, 4):
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

            message = json.dumps(order_data)
            channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=ROUTING_KEY,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2  # mensagem persistente
                )
            )
            connection.close()
            log.info(f"Evento order.created publicado — Pedido #{order_data.get('order_id')}")
            return
        except Exception as e:
            log.warning(f"Tentativa {attempt}/3 — Falha ao publicar no RabbitMQ: {e}")
            time.sleep(2)

    # Se falhar nas 3 tentativas, apenas loga — não bloqueia o checkout
    log.error("Não foi possível publicar evento no RabbitMQ após 3 tentativas. Pedido salvo normalmente.")
