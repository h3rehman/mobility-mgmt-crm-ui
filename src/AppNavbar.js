import React, { Component } from "react";
import {
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  FormGroup,
  Form, 
  Input,
  Container,
} from "reactstrap";
import { Link } from "react-router-dom";
import { withCookies } from "react-cookie";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import PowerSettingsNewOutlinedIcon from "@material-ui/icons/PowerSettingsNewOutlined";
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import localConfig from "./localConfig.json";

class AppNavbar extends Component {
  state = {
    isAuthenticated: false,
    firstName: "",
  };

  constructor(props) {
    super(props);
    this.state = { isOpen: false, dropdownOpen: false, orgDropdownOpen: false, queryString: "", searchBarDisplay: "none", searchIconDisplay: "block", closeIconDisplay: "none", searchHits: null, searchResultBlockDisplay: "none" };
    this.toggle = this.toggle.bind(this);
    this.orgToggle = this.orgToggle.bind(this);
    this.eventToggle = this.eventToggle.bind(this);
    this.logout = this.logout.bind(this);
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
    this.handleElasticSearch = this.handleElasticSearch.bind(this);
    this.showSearchBar = this.showSearchBar.bind(this);
    this.closeSearchBar = this.closeSearchBar.bind(this);
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

  showSearchBar(){
    this.setState({searchIconDisplay: "none", searchBarDisplay: "block", closeIconDisplay: "block"});
  }

  closeSearchBar(){
    this.setState({searchIconDisplay: "block", searchBarDisplay: "none", closeIconDisplay: "none", searchResultBlockDisplay: "none"});
  }

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

 async handleSearchBarChange(event){
    event.preventDefault();
    const val = event.target.value;
    this.setState({queryString: val});
    if (val.length > 2){
    fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/elasticsearch/multi-field-index/${val}`,
      { credentials: "include" }
    )
      .then((response) => response.json())
      .then((data) => this.setState({ searchHits: data }))
      this.setState({searchResultBlockDisplay: "block"});
      }
      else {
        this.setState({searchResultBlockDisplay: "none"});
      }
  }

  async handleElasticSearch(event) {
    event.preventDefault();
    const val = event.target.value;
    console.log("Key press: " + val);
  }

  render() {
    const { firstName, orgDropdownOpen, eventDropdownOpen, queryString, searchBarDisplay, searchIconDisplay, closeIconDisplay, searchHits, searchResultBlockDisplay } = this.state;

    const elasticSearch =  (
      <Form>
    <FormGroup>
    <Input
      type="search"
      name="elasticsearch"
      id="elasticsearch"
      value={ queryString }
      placeholder="Search for Orgs., events or contacts..."
    //  onKeyPress={this.handleElasticSearch}
      onChange={this.handleSearchBarChange}
    />
  </FormGroup>
  </Form>
  );

  let hits = null;
  if (searchHits !== null && searchHits.totalHits.value > 0){
    hits = searchHits.hits.map((hit) => {
         if (hit.index === "events"){
           return <li key={hit.sourceAsMap.id}><a href={"/event/read/" + hit.sourceAsMap.id}>{"Event | " + hit.sourceAsMap.eventName + " | " + hit.sourceAsMap.location}</a></li>
         }
         else if (hit.index === "organizations"){
          return <li key={hit.sourceAsMap.id}><a href={"/organization/read/" + hit.sourceAsMap.id}>{"Org. | " + hit.sourceAsMap.orgname }</a></li>
         }
         else if (hit.index === "contacts"){
          return <li key={hit.sourceAsMap.id}><a href={"/contact/read/" + hit.sourceAsMap.id}>{"Contact | " + hit.sourceAsMap.firstName + " " + hit.sourceAsMap.lastName }</a></li> 
         }
         else {
           return null;
         }
      }
        )
  }
  else if (queryString.length > 0){
    hits = <span>No search results found...</span>
  }
  const searchResults = (
    <ul>{hits}</ul>
  );

    return (
    <div>
      <Navbar dark expand="md">
        <NavbarBrand tag={Link} to="/">
          <img alt="RTA" className="logo" src="/rta_logo.png"></img>
        </NavbarBrand>
        <NavbarToggler dark onClick={this.toggle} />
        <CloseIcon className="closeIcon link" style={{display: closeIconDisplay}} onClick={this.closeSearchBar} />
        <Container className="elasticSearchBar" style={{display: searchBarDisplay}}>{elasticSearch}</Container>
       <Collapse isOpen={this.state.isOpen} navbar>
        <Nav className="ml-auto " navbar color="white">
          <SearchIcon className="searchIcon topSpace link" style={{display: searchIconDisplay}} onClick={this.showSearchBar} />
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
        <div  className="searchResultBlock" style={{display: searchResultBlockDisplay}}>{searchResults}</div>
        </div>
    );
  }
}

export default withCookies(AppNavbar);
