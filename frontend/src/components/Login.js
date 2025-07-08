import './Login.css';
import { useRef, useState, useEffect } from "react";
import ReCAPTCHA from 'react-google-recaptcha'
let REACT_APP_SITE_KEY = process.env.REACT_APP_SITE_KEY;// Must be defined as an environment variable
let RECAPTCHA = false;

const Login = ({ userIcon, loginOpen, setLoginOpen, setLoggedIn, loggedIn, width, height, redirect}) => {
  const recaptcha = useRef();
  const [email, setEmail] = useState("");
  const [loginOrSignup, setLoginOrSignup] = useState("login");
  const [pwd, setPwd] = useState("");
  const [userMail, setUserMail] = useState("");
  const [sucessMsg, setSuccessMsg] = useState("");
  const [msgBoxOpen, setMsgBoxOpen] = useState(false);
  if(!width) width = "75px";
  if(!height) width = "75px";

  const loginBoxRef = useRef(null); // Create a reference
  const msgBoxRef = useRef(null); // Create a reference
  const logoutBoxRef = useRef(null); // Create a reference

  let signup_url = window.api + "/user/send_sign_up_mail";
  let login_url = window.api + "/user/login";
  let logout_url = window.api + "/user/logout";

  async function sendRegistrationLink(event) {
    event.preventDefault();
    let captchaValue;
    if(RECAPTCHA)captchaValue = recaptcha.current.getValue();
    //console.log(JSON.stringify({ captchaValue }));
    if (!captchaValue && RECAPTCHA) {
      setSuccessMsg("Please verify the reCAPTCHA!");
    } else {
      console.log("verifying via backend")
      let body = { captchaValue };
      body["email"] = email;
      const res = await fetch(signup_url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
        },
      });
      const success = await res.json();
        if (res.status === 401)setSuccessMsg("Invalid credentials!");
        else if (res.status === 429)setSuccessMsg("reCAPTCHA validation failed!");
        else if (res.status === 200)setSuccessMsg("A Mail was sent to your address. Check the inbox and follow the instructions to complete the registration.");
        else setSuccessMsg("Unexpected return value");
    }
  }

  async function sendLogin(event) {
    event.preventDefault();
    let captchaValue;
    if(RECAPTCHA)captchaValue = recaptcha.current.getValue();
    if (!captchaValue && RECAPTCHA) {
      sucessMsg("Please verify the reCAPTCHA!");
    } else {
      let body = { captchaValue };
      body["email"] = email;
      body['password'] = pwd;
      const res = await fetch(login_url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
        },
        credentials: "include"
      });
      if (res.status === 401)setSuccessMsg("Invalid credentials!");
      else if (res.status === 429)setSuccessMsg("reCAPTCHA validation failed!")
      else if (res.status === 200){
        setLoginOpen(false);
        setMsgBoxOpen(true);
        setLoggedIn(true);
        window.location.href = redirect;
    }
      else setSuccessMsg("Unexpected return value");
    } 
  }

  const getUserMail = async () => {
    try {
      const response = await fetch(window.api + "/user/details", {
        method: "GET",
        credentials: "include"
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      return data["email"];
    } catch (error) {
      console.error("Error fetching user details:", error);
      return "";
    }
  };

  const handleImageClick = async () => {
    const mail = await getUserMail();
    setUserMail(mail);
    setLoginOpen(true);
  };

  const handleOverlayClickLogin = (event) => {
    if (event.target !== loginBoxRef.current && !loginBoxRef.current.contains(event.target)) {
      setLoginOpen(false);
    }
  };

  const handleOverlayClickMsgBox = (event) => {
    if (event.target !== msgBoxRef.current && !msgBoxRef.current.contains(event.target)) {
      setMsgBoxOpen(false);
    }
  };

  const handleOverlayClickLogoutBox = (event) => {
    if (event.target !== logoutBoxRef.current && !logoutBoxRef.current.contains(event.target)) {
      setLoginOpen(false)
    }
  };

  const logout = async () => {
    const res = await fetch(logout_url, { method: "GET" });
    if (res.ok) {
      localStorage.clear();
      window.location.reload();
    }
  }
  
  if(loginOpen && loggedIn()){
    return <div className="overlay" onClick={handleOverlayClickLogoutBox}>
      <div className="centered-foreground-box" ref={logoutBoxRef}>
          You are logged in with your account {userMail}. <br/><br/> Click <span style={{color:"blue"}} onClick={logout}>here</span> to log out.
      </div></div>
  }

  return (
  <div>
  {userIcon && (
    <img
      src={userIcon}
      alt="User Icon"
      className="clickable-image"
      onClick={handleImageClick}
      style={{ width: width, height: height }}
    />
  )}

  {msgBoxOpen && (
    <div className="overlay" onClick={handleOverlayClickMsgBox}>
        <div className="centered-foreground-box" ref={msgBoxRef}>
             You have logged in successfully.
        </div>
    </div>
  )

  }

  {loginOpen && (
    <div className="overlay" onClick={handleOverlayClickLogin}>
      <form onSubmit={loginOrSignup === "login"?sendLogin:sendRegistrationLink}>
        <div className="centered-foreground-box" ref={loginBoxRef}>
        <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Login
            <span
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}>⟳</span>
        </h2>
          <input
            className="input-field"
            type="email"
            value={email}
            required
            placeholder="joe@example.com"
            onChange={(event) => setEmail(event.target.value)}
          />
          {loginOrSignup=="login"?
          <input
            className="input-field"
            type="password"
            required
            onChange={(event) => setPwd(event.target.value)}
          />:<div/>
          }

        {RECAPTCHA ? <ReCAPTCHA ref={recaptcha} sitekey={REACT_APP_SITE_KEY} />:<div/>}

        <button className="login-button">{loginOrSignup==="login"?"Login":"Sign Up"}</button>
        <div className='response-text'>{sucessMsg}</div>
        <div
            className="sign-up-or-login"
            onClick={() =>
              setLoginOrSignup(loginOrSignup === "login" ? "signUp" : "login")
            }
          >
            {loginOrSignup === "login" ? "Sign up" : "Login"}
      </div>
        </div>
      </form>
    </div>
  )}
</div>

  );
};

export default Login;
