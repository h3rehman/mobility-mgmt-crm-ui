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
} from "reactstrap";
import { Link } from "react-router-dom";

export default class AppNavbar extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.state = { isOpen: false, dropdownOpen: false };
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

  render() {
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
              <Dropdown
                className="d-inline-block"
                onMouseOver={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                isOpen={this.state.dropdownOpen}
                toggle={this.toggle}
              >
                <DropdownToggle href="/events">Events</DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem href="/appointments/1">
                    My Appointments
                  </DropdownItem>
                  <DropdownItem href="/events">Search Events</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}
