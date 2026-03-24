from fastapi import FastAPI

app = FastAPI(title="Orders Service", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Orders Service is running!"}
