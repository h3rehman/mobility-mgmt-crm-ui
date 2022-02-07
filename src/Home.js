import React, { Component } from "react";
import { withCookies } from "react-cookie";
import "./App.css";
import AppNavbar from "./AppNavbar";
import { Jumbotron, Button, Container } from "reactstrap";
import localConfig from "./localConfig.json";

class Home extends Component {
  state = {
    isLoading: true,
    isAuthenticated: false,
    user: undefined,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      managerNav: "none",
      csrfToken: cookies.get("XSRF-TOKEN"),
    }
    this.login = this.login.bind(this);
  }

  async componentDidMount() {
    const response = await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        "/api/user",
      { credentials: "include" }
    );
    // let authCookieIndex = document.cookie.indexOf("isAuth");
    const body = await response.text();
    if (body === "") {
      this.setState({ isAuthenticated: false });
    }
    // else if (authCookieIndex > -1) {
    //   let isAuth = this.props.cookies.get("isAuth");
    //   if (isAuth) {
    //     this.setState({ isAuthenticated: true });
    //   } else {
    //     this.setState({ isAuthenticated: false });
    //   }
    // }
    else {
      this.setState({ isAuthenticated: true, user: JSON.parse(body) });
      let props = this.props;
      props.cookies.set("firstName", this.state.user.firstName, { path: "/" });
      props.cookies.set("isAuth", true, { path: "/" });
      const managerCheck = await (
        await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          "/api/checkUserManagerialAccess",
        { credentials: "include" }
        )
      ).json();
      if (managerCheck === true){
        this.setState({managerNav: "block"});
      }
    }
  }

  login() {
    let port = window.location.port ? ":" + window.location.port : "";
    if (port === ":443" || port === "" || port === ":3000") {
      port = localConfig.SERVICE.PORT;
    }
    window.location.href =
      "https://" + localConfig.SERVICE.URL + ":" + port + "/login";
  }

  render() {
    const cooks = document.cookie;
    const { managerNav } = this.state; 
    // let authCookieIndex = document.cookie.indexOf("isAuth");
    // if (authCookieIndex > -1) {
    //   let isAuth = this.props.cookies.get("isAuth");
    //   if (isAuth) {
    //     this.setState({ isAuthenticated: true });
    //   } else {
    //     this.setState({ isAuthenticated: false });
    //   }
    // }
    const welcome_page_body = this.state.isAuthenticated ? (
      <div>
        <AppNavbar managerReports = {managerNav}  />
        <Container style={{ float: "left" }}>
          <Jumbotron>
            <h3 className="display-4">Mobility Management</h3>
            <h3 className="display-5">Outreach Tracking</h3>
            <p className="lead">
              MOCs can find and track their organizations and contacts, track
              their outreach events, presentations, project milestones, complete
              QA tasks, etc.
            </p>
            <hr className="my-2" />
            <p>
              See your schedule by clicking below button or see all your
              appointments in the Events tab above.
            </p>
            <p className="headLineSpace lead">
              <Button color="primary" href="/myoutreach">
                My Outreach Schedule
              </Button>
              <Button style={{"margin-left": "2rem"}} color="primary" href="/callLogs/myLogs">
                My Call-Logs
              </Button>
            </p>
            <p>
            <span style={{"float": "right"}} className="petite-font">Version {localConfig.version}</span>
            </p>

          </Jumbotron>
        </Container>
      </div>
    ) : (
      <div className="cover-image">
        <div className="login-box">
          <img
            alt="Mobilty Services Logo"
            className="ms-logo"
            src="/ms-logo.svg"
          ></img>

          <h4 className="login-title">
            <span className="mmTitle">Mobility Management</span> <br></br>{" "}
            <span className="mmSubTitle">Outreach Tracking</span>
          </h4>
      <Button color="primary" onClick={this.login}>
            <b>RTA Employee Login</b>
          </Button>
          <br></br>
          <br></br>
          <span className="petite-font">Version {localConfig.version}</span>
        </div>
      </div>
    );
    // const cookie = document.cookie;
    return (
      <React.Fragment>
        {welcome_page_body}
        {/* <ul>
          <li>{cooks}</li>
        </ul> */}
      </React.Fragment>
    );
  }
}

export default withCookies(Home);
