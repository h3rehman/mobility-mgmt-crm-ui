import React, { Component } from "react";
import {
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
} from "reactstrap";
import { Link } from "react-router-dom";
import { withCookies } from "react-cookie";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import PowerSettingsNewOutlinedIcon from "@material-ui/icons/PowerSettingsNewOutlined";
import localConfig from "./localConfig.json";

class AppNavbar extends Component {
  state = {
    isAuthenticated: false,
    firstName: "",
  };

  constructor(props) {
    super(props);
    this.state = { isOpen: false, dropdownOpen: false, orgDropdownOpen: false };
    this.toggle = this.toggle.bind(this);
    this.orgToggle = this.orgToggle.bind(this);
    this.eventToggle = this.eventToggle.bind(this);
    this.logout = this.logout.bind(this);
  }

  async componentDidMount() {
    let nameIndex = document.cookie.indexOf("firstName");
    if (nameIndex > -1) {
      let firstName = "firstName";
      let name = document.cookie.match(
        new RegExp("(^| )" + firstName + "=([^;]+)")
      );
      this.setState({ isAuthenticated: true, firstName: name[2] });
    }
  }

  toggle() {
    this.setState((prevState) => ({
      isOpen: !this.state.isOpen,
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  orgToggle() {
    this.setState((prevState) => ({
      orgDropdownOpen: !prevState.orgDropdownOpen,
    }));
  }

  eventToggle() {
    this.setState((prevState) => ({
      eventDropdownOpen: !prevState.eventDropdownOpen,
    }));
  }

  // onMouseEnter() {
  //   this.setState({ dropdownOpen: true });
  // }

  // onMouseLeave() {
  //   this.setState({ dropdownOpen: false });
  // }

  logout() {
    let csrf = "XSRF-TOKEN";
    let csrfToken = document.cookie.match(
      new RegExp("(^| )" + csrf + "=([^;]+)")
    );
    console.log(csrfToken);
    fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        "/api/logout",
      {
        method: "POST",
        credentials: "include",
        headers: { "X-XSRF-TOKEN": csrfToken[2] },
      }
    )
      .then((res) => res.json())
      .then((response) => {
        this.setState({ isAuthenticated: false });
        // document.cookie = "isAuth=" + false + ";" + " path=/";
        document.cookie = "isAuth=false; path=/";
        window.location.href =
          "//" + window.location.hostname + response.port + response.logoutUrl;
        // "?id_token_hint=" +
        // response.idToken +
        // "&post_logout_redirect_uri=" +
        // "http://localhost:3000";
        // window.location.origin;
      });
    // window.location.href = "/";
  }

  render() {
    const { firstName, orgDropdownOpen, eventDropdownOpen } = this.state;
    return (
      <Navbar dark expand="md">
        <NavbarBrand tag={Link} to="/">
          <img alt="RTA" className="logo" src="/rta_logo.png"></img>
        </NavbarBrand>
        <NavbarToggler dark onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto " navbar color="white">
            <Dropdown
              nav
              isOpen={orgDropdownOpen}
              onMouseEnter={this.orgToggle}
              onMouseLeave={this.orgToggle}
            >
              <NavLink className="topSpace" href="/organizations">
                Organizations
              </NavLink>
              <DropdownToggle nav></DropdownToggle>
              <DropdownMenu>
                <DropdownItem href="/organizations/new">
                  Create Org.
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem href="/contacts">
                  <b>Contacts</b>
                </DropdownItem>
                <DropdownItem href="/contact/new">Create contact</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown
              nav
              isOpen={eventDropdownOpen}
              onMouseEnter={this.eventToggle}
              onMouseLeave={this.eventToggle}
            >
              <NavLink className="topSpace" href="/events">
                Events
              </NavLink>
              <DropdownToggle nav></DropdownToggle>
              <DropdownMenu>
                <DropdownItem href="/events/new">Create event</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <UncontrolledDropdown
              nav
              inNavbar
              className="user-nav-item topSpace"
            >
              <DropdownToggle nav caret className="user-name-text">
                <AccountCircleOutlinedIcon
                  fontSize="large"
                  className="user-icon"
                />{" "}
                {firstName}
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem href="/callLogs/myLogs">
                  My Call Logs
                </DropdownItem>
                <DropdownItem href="/myoutreach">
                  Outreach Schedule
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={this.logout}>
                  <PowerSettingsNewOutlinedIcon fontSize="small" /> Logout
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default withCookies(AppNavbar);
