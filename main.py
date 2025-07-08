import uvicorn
import shutil
from dotenv import load_dotenv
load_dotenv(".env")

if __name__ == "__main__":
    shutil.copy('.env', './frontend/.env')
    uvicorn.run("backend.api:app", host="0.0.0.0", port=8002, reload=True)