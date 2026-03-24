from fastapi import FastAPI

app = FastAPI(title="Users Service", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Users Service is running!"}
