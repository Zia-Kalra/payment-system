from fastapi import FastAPI

app = FastAPI(
    title="Cloud-Based Payment System",
    version="0.1.0"
)

@app.get("/")
def root():
    return {"message": "Payment System Backend is running successfully 🚀"}