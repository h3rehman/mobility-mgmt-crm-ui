import React, { Component } from "react";
import { withCookies } from "react-cookie";
import "./App.css";
import AppNavbar from "./AppNavbar";
import { Jumbotron, Button, Container } from "reactstrap";

class Home extends Component {
  state = {
    isLoading: true,
    isAuthenticated: false,
    user: undefined,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state.csrfToken = cookies.get("XSRF-TOKEN");
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async componentDidMount() {
    const response = await fetch("/api/user", { credentials: "include" });
    const body = await response.text();
    if (body === "") {
      this.setState({ isAuthenticated: false });
    } else {
      this.setState({ isAuthenticated: true, user: JSON.parse(body) });
    }
  }

  login() {
    let port = window.location.port ? ":" + window.location.port : "";
    if (port === ":3000") {
      port = ":9000";
    }
    window.location.href = "//" + window.location.hostname + port + "/login";
  }

  logout() {
    let port = ":9000";
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
      headers: { "X-XSRF-TOKEN": this.state.csrfToken },
    })
      .then((res) => res.json())
      .then((response) => {
        window.location.href =
          "//" +
          window.location.hostname +
          port +
          response.logoutUrl +
          // "?id_token_hint=" +
          // response.idToken +
          "&post_logout_redirect_uri=" +
          "http://localhost:3000";
        // window.location.origin;
      });
  }

  render() {
    const message = this.state.user ? (
      <h4>Hello {this.state.user.firstName}!</h4>
    ) : (
      <h3>Mobility Management CRM</h3>
    );

    const button = this.state.isAuthenticated ? (
      <div>
        <Jumbotron>
          <h3 className="display-4">Mobility Management CRM</h3>
          <h3 className="display-4">Home</h3>
          <p className="lead">
            Book an Appointment or reach out to an Organization.
          </p>
          <hr className="my-2" />
          <p>
            See your future appointments by clicking below button or see all
            your appointments in the Events tab above.
          </p>
          <p className="lead">
            <Button color="primary">My Appointments</Button>
          </p>
          <Button color="info" onClick={this.logout}>
            Logout
          </Button>
        </Jumbotron>
      </div>
    ) : (
      <Button color="primary" onClick={this.login}>
        RTA Employee Login
      </Button>
    );

    return (
      <div>
        <AppNavbar />
        <div>
          <Container style={{ float: "left" }}>
            {message}
            {button}
          </Container>
        </div>
      </div>
    );
  }
}

export default withCookies(Home);
