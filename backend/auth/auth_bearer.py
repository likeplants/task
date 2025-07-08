from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import numpy as np
from .auth_handler import decodeJWT, verifyJWT

import os, socket

#Disable auth when not running on server with ip from .env
DISABLE_AUTH = os.getenv('SERVER_IP') != socket.gethostbyname(socket.gethostname())# WARNING: ONLY FOR DEBUGGING. ALLOWS ACCESS WITHOUT JWT TOKEN.
class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True,  conditions = [{}], credentials_in_header = False):
        self.conditions = conditions
        self.credentials_in_header = credentials_in_header#otherwise expected to be in http only cookie
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def check_credentials_header(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
        res = [verifyJWT(credentials.credentials, condition = condition, ignore_expiration=True) for condition in self.conditions]#todo dont ignore expiration time
        if not np.any(res):#at least one of the conditions must be met (e.g. "role"=="user")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def check_credentials_http_cookie(self, request: Request):
        if DISABLE_AUTH:
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJleHBpcmVzIjoxNzMxOTQ3NjA4LjYwNTkxNzV9.WtVlt4nfa7PNMi95d8H1kXWNCdR-38vTGsfI26B4DE0"
        access_token = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=403, detail="Invalid token or expired token. Cookie missing.")
        #access_token = json.loads(request.cookies.get("access_token").replace("'",'"'))["access_token"]#changed to accept access token from httpOnly Cookie
        res = [verifyJWT(access_token, condition = condition, ignore_expiration=True) for condition in self.conditions]#todo dont ignore expiration time
        if not np.any(res):#at least one of the conditions must be met (e.g. "role"=="user")
            raise HTTPException(status_code=403, detail="Invalid token or expired token. At least one of the conditions must be met.")
        return access_token

    async def __call__(self, request: Request):
        if self.credentials_in_header:
            return await self.check_credentials_header(request)
        else:
            return self.check_credentials_http_cookie(request)