import React from "react";
import './Main.css';
import Registration from './components/Registration.js'
import ListPage from './components/ListPage.js'
import MapPage from './components/MapPage.js'
import InfoPage from './components/InfoPage.js'

import Login from "./components/Login.js";
import user from './icons/user.svg';
import map from './icons/map.svg';
import star from './icons/star.svg';
import list from './icons/list.svg';
import logo from './icons/logo.jpg';

let DEBUG = true;

class Main extends React.Component {
    constructor(props) {
      super(props)
      this.default_page = ""//SET THIS PAGE
      this.state = { page: this.default_page, loginOpen: false, loggedIn: false }
      this.loginOrRedirect = this.loginOrRedirect.bind(this);

      if(DEBUG)this.setLoggedIn(true);
    }
  
    componentDidMount() {
      let page = new URL(window.location.href).pathname.slice(1)
      this.setState({ page: page });
      this.mapLinksToState();
    }

    componentDidUpdate() {
      this.mapLinksToState();
    }

    handleLinkClick = (event) => {
      event.preventDefault();
      const new_slug = new URL(event.currentTarget.href).pathname;
      window.history.pushState(null, '', new_slug);
      this.setState({page: new_slug.slice(1)});
    }

    mapLinksToState(){
      document.querySelectorAll('a').forEach(link => {
        link.removeEventListener('click', this.handleLinkClick);
        link.addEventListener('click', this.handleLinkClick);
      })
      window.addEventListener('popstate', ()=>{
        const new_slug = window.location.pathname;
        this.setState({page: new_slug.slice(1)});
      })
    }

    setLoggedIn(isLoggedIn, hoursUntilExpiration = 48) {
      const expirationTime = Date.now() + hoursUntilExpiration * 60 * 60 * 1000; // Convert hours to milliseconds
      localStorage.setItem('isLoggedIn', isLoggedIn);
      localStorage.setItem('expirationTime', expirationTime); // Store expiration time
    }
  
    // Check if user is logged in and if the session has expired
    loggedIn() {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const expirationTime = localStorage.getItem('expirationTime');
  
      if (!isLoggedIn || !expirationTime) {
        return false; // Not logged in or no expiration time
      }
  
      // Check if the current time is past the expiration time
      const currentTime = Date.now();
      return currentTime < expirationTime; // Returns true if still logged in
    }

    loginOrRedirect(e){
        if(!this.loggedIn()){
            e.preventDefault();
            this.setState({ loginOpen: true});
        };
    }
  
    mobile_version() {
        return (
          <div className="container">
            <div className="Header"></div>
            <div className="Content">
              {this.state.page === "" ? <InfoPage /> : <div/>}
              {this.state.page === "registration" ? <Registration /> : <div/>}
              {this.state.page === "list" ? <ListPage /> : <div/>}
              {this.state.page === "map" ? <MapPage /> : <div/>}
              {this.state.page === "info" ? <InfoPage /> : <div/>}
            </div>
            <div className="UserIcon">
              <Login
                userIcon={user}
                loginOpen={this.state.loginOpen}
                setLoginOpen={(x) => this.setState({ loginOpen: x })}
                setLoggedIn={this.setLoggedIn}
                loggedIn={this.loggedIn}
                redirect="/"
              />
            </div>
            <div className="AppIcon">
              <a href="/">
                <img src={logo} alt="Logo Icon" />
              </a>
            </div>
            <div className="AppIconLarge">
              <div>Yummy</div>
            </div>
            <div className="Menu2">
              <div onClick={this.loginOrRedirect}>
                <a href="/map">
                  <img src={map} alt="Map Icon" />
                </a>
                <div>Map</div>
              </div>
            </div>
            <div className="Menu3">
              <div onClick={this.loginOrRedirect}>
                <a href="/list">
                  <img src={list} alt="List Icon" />
                </a>
                <div>List</div>
              </div>
            </div>
            <div className="Menu4">
              <div onClick={this.loginOrRedirect}>
                <a href="/">
                  <img src={star} alt="Info" />
                </a>
                <div>About</div>
              </div>
            </div>

          </div>
        );
      }
      
      desktop_version(){
        document.clientWidth = document.documentElement.clientWidth * 0.3;
        return <div className="centered-div">{this.mobile_version()}</div>
        }
    
      render() {
        if(window.mobile){
          document.clientWidth = document.documentElement.clientWidth;
          document.clientHeight = document.documentElement.clientHeight;
          return <div className="mobile-div">{this.mobile_version()}</div>}
        else{
          document.clientWidth = document.documentElement.clientWidth * .3;
          document.clientHeight = document.documentElement.clientHeight;
          return this.desktop_version();
        }
      }
}

export default Main;
