import pika
import json
import smtplib
import os
import time
import requests
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
USERS_SERVICE_URL = os.getenv("USERS_SERVICE_URL", "http://users-service:8000")

EXCHANGE = "order.events"
QUEUE = "order.notifications"
ROUTING_KEY = "order.created"


def get_user_email(user_id: int, headers: dict) -> str | None:
    """Busca o e-mail do usuário no users-service."""
    try:
        resp = requests.get(f"{USERS_SERVICE_URL}/users/{user_id}", timeout=5, headers=headers)
        if resp.status_code == 200:
            return resp.json().get("email")
    except Exception as e:
        log.warning(f"Não foi possível buscar e-mail do usuário {user_id}: {e}")
    return None


def send_email(to_email: str, order_data: dict):
    """Envia e-mail de confirmação de pedido via Gmail SMTP."""
    order_id = order_data.get("order_id")
    user_name = order_data.get("user_name", "Cliente")
    total = order_data.get("total_price", 0)
    items = order_data.get("items", [])

    items_html = "".join([
        f"<tr><td>{item['product_name']}</td><td>{item['quantity']}</td><td>R$ {item['unit_price']:.2f}</td></tr>"
        for item in items
    ])

    html = f"""
    <html><body>
    <h2>✅ Pedido #{order_id} confirmado!</h2>
    <p>Olá, <strong>{user_name}</strong>! Seu pedido foi recebido com sucesso.</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th></tr></thead>
      <tbody>{items_html}</tbody>
    </table>
    <br>
    <p><strong>Total: R$ {total:.2f}</strong></p>
    <p>Obrigado pela preferência! 🛍️</p>
    </body></html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"✅ Pedido #{order_id} confirmado — E-Commerce"
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())

    log.info(f"E-mail de confirmação enviado para {to_email} — Pedido #{order_id}")


def on_message(ch, method, properties, body):
    """Callback chamado quando uma mensagem chega na fila."""
    try:
        order_data = json.loads(body)
        headers = properties.headers
        log.info(f"Evento recebido: pedido #{order_data.get('order_id')} do usuário {order_data.get('username')}")

        user_id = order_data.get("user_id")
        to_email = get_user_email(user_id, headers) if user_id else None

        if to_email:
            send_email(to_email, order_data)
        else:
            log.warning(f"E-mail não encontrado para user_id={user_id}. Notificação não enviada.")

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        log.error(f"Erro ao processar mensagem: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def connect_with_retry(max_retries=10, delay=5):
    """Tenta conectar ao RabbitMQ com retry exponencial."""
    for attempt in range(1, max_retries + 1):
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            log.info("Conectado ao RabbitMQ!")
            return connection
        except Exception as e:
            log.warning(f"Tentativa {attempt}/{max_retries} — RabbitMQ indisponível: {e}")
            time.sleep(delay)
    raise RuntimeError("Não foi possível conectar ao RabbitMQ após várias tentativas.")


def main():
    log.info("Notification Service iniciando...")
    connection = connect_with_retry()
    channel = connection.channel()

    # Declara a exchange do tipo topic
    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

    # Declara a fila
    channel.queue_declare(queue=QUEUE, durable=True)

    # Faz o bind da fila à exchange
    channel.queue_bind(exchange=EXCHANGE, queue=QUEUE, routing_key=ROUTING_KEY)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE, on_message_callback=on_message)

    log.info(f"Aguardando mensagens na fila '{QUEUE}'...")
    channel.start_consuming()


if __name__ == "__main__":
    main()
