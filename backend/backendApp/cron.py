import requests

def ping_server():
    try:
        # Assuming localhost for cron; in production this might need the full domain
        # Ideally, we read the domain from env or settings
        # For this setup, we'll try localhost:8000
        url = "http://127.0.0.1:8000/api/ping/"
        response = requests.get(url)  
        print(f"Ping server status: {response.status_code}")
    except Exception as e:
        print(f"Ping server failed: {str(e)}")
