import requests
import random

API_URL = "http://localhost:8000/catalog/"

products = [
    "Teclado Mecânico", "Mouse Gamer", "Monitor 4K", "Headset Bluetooth", 
    "Cadeira Ergonômica", "Webcam HD", "Microfone Condensador", "SSD 1TB",
    "Placa de Vídeo RTX", "Processador i9", "Memória RAM 16GB", "Fonte 750W",
    "Gabinete RGB", "Cooler Air", "Mousepad Extra Large", "Notebook Pro",
    "Tablet 10\"", "Smartphone 5G", "Smartwatch", "Hub USB-C",
    "Cabo HDMI 2.1", "Adaptador Wi-Fi", "HD Externo 2TB", "Roteador Mesh",
    "Impressora Laser", "Scanner de Mesa", "Suporte para Monitor", "Base para Notebook",
    "Ring Light", "Lâmpada Inteligente", "Tomada Smart", "Caixa de Som Echo",
    "Kindle Paperwhite", "Drone 4K", "Câmera DSLR", "Tripé Profissional",
    "Mochila para Laptop", "Carregador Portátil", "Fone de Ouvido TWS", "Console de Jogos",
    "Controle Sem Fio", "Volante para Simulador", "Óculos VR", "Placa-Mãe ATX",
    "Water Cooler", "Fita LED RGB", "Pilha Recarregável", "Carregador de Pilha",
    "Mini PC", "Servidor NAS"
]

def seed():
    print(f"Iniciando população de {len(products)} itens no catálogo...")
    for name in products:
        payload = {
            "name": name,
            "price": round(random.uniform(50, 5000), 2),
            "description": f"Descrição detalhada para {name}. Um produto de alta qualidade para seu setup.",
            "stock": random.randint(10, 100)
        }
        try:
            res = requests.post(API_URL, json=payload)
            if res.status_code == 200:
                print(f"✅ Adicionado: {name}")
            else:
                print(f"❌ Erro ao adicionar {name}: {res.status_code}")
        except Exception as e:
            print(f"💥 Falha de conexão: {e}")
            break
    print("População concluída!")

if __name__ == "__main__":
    seed()
