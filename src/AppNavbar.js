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

class AppNavbar extends Component {
  state = {
    isAuthenticated: false,
    firstName: "",
  };

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.state = { isOpen: false, dropdownOpen: false };
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

  onMouseEnter() {
    this.setState({ dropdownOpen: true });
  }

  onMouseLeave() {
    this.setState({ dropdownOpen: false });
  }

  logout() {
    let csrf = "XSRF-TOKEN";
    let csrfToken = document.cookie.match(
      new RegExp("(^| )" + csrf + "=([^;]+)")
    );
    console.log(csrfToken);
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
      headers: { "X-XSRF-TOKEN": csrfToken[2] },
    })
      .then((res) => res.json())
      .then((response) => {
        this.setState({ isAuthenticated: false });
        document.cookie = "isAuth=" + false + ";" + " path=/";
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
    const { firstName } = this.state;
    return (
      <Navbar dark expand="md">
        <NavbarBrand tag={Link} to="/">
          <img alt="RTA" className="logo" src="/rta_logo.png"></img>
        </NavbarBrand>
        <NavbarToggler dark onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar color="white">
            <NavItem>
              <NavLink href="/organizations">Organizations</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="/events">Events</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar className="user-nav-item">
              <DropdownToggle nav caret className="user-name-text">
                <AccountCircleOutlinedIcon
                  fontSize="large"
                  className="user-icon"
                />{" "}
                {firstName}
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem href="/callLogs/myLogs">
                  My call logs
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
