import React, { Component } from "react";
import {
  Button,
  ButtonGroup,
  Container,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";
import { instanceOf } from "prop-types";
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/styles/rsuite-default.css";
import localConfig from "./localConfig.json";
import { withCookies, Cookies } from "react-cookie";

class ContactList extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      orgs: [],
      csrfToken: cookies.get("XSRF-TOKEN"),
      isLoading: true,
      pagedContacts: {},
      pages: [],
      currentPage: 0,
      currentPaginationHop: 1,
      maxPaginationHops: 1,
      pageSelectionCount: 10,
      sortedField: null,
      sortOrder: null,
      dropdownOpen: false,
      dateRange: [],
      fromDate: null,
      toDate: null,
    };
    this.createPageArray = this.createPageArray.bind(this);
    this.createCustomPageArray = this.createCustomPageArray.bind(this);
    this.pageLink = this.pageLink.bind(this);
    this.pageSizeLink = this.pageSizeLink.bind(this);
    this.getSortedField = this.getSortedField.bind(this);
    this.setDateRange = this.setDateRange.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        "/api/contacts-sorted-default",
      { credentials: "include" }
    )
      .then((response) => response.json())
      .then((data) => this.setState({ pagedContacts: data, isLoading: false }))
      .then(() => this.createPageArray());
  }

  toggle() {
    this.setState((prevState) => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  async createPageArray() {
    const { pagedContacts } = this.state;
    let { maxPaginationHops, pageSelectionCount } = this.state;
    let pages = [];
    let totalPages = pagedContacts.totalPages;
    maxPaginationHops = Math.ceil(totalPages/pageSelectionCount);

    if (totalPages <= pageSelectionCount){
      for(let i=0; i<totalPages; i++){
        pages.push(i + 1);
      }
    }
    else {
      for (let i=0; i<pageSelectionCount; i++){
        pages.push(i + 1);
      }
    }
    this.setState({ pages: pages, maxPaginationHops });
  }

  async createCustomPageArray(hop) {
    const { pagedContacts } = this.state;
    let { maxPaginationHops, pageSelectionCount } = this.state;
    let pages = [];
    let totalPages = pagedContacts.totalPages;
    let start = (hop - 1) * 10;    
  
    if (totalPages > 0){
      if (hop === maxPaginationHops){ //If last hop is reached use the remainder in modulus
        let modulus = totalPages%pageSelectionCount; 
        if (modulus > 0){
          for (let i=start; i<start+modulus; i++){
            pages.push(i+1);
          }
        }
        else {
          for (let i=start; i<start+pageSelectionCount; i++){
            pages.push(i+1);   
        }
      }
      }
      else {
        for (let i=start; i<start+pageSelectionCount; i++){
          pages.push(i+1);
        }
      }
    }

    this.setState({ pages: pages, currentPaginationHop: hop });
  }

  async pageLink(page) {
    const {
      pagedContacts,
      sortedField,
      sortOrder,
      fromDate,
      toDate,
    } = this.state;
    const pageSize = pagedContacts.pageable.pageSize;

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/contacts-filtered-sorted/${page}/${pageSize}/${sortedField}/${sortOrder}/${fromDate}/${toDate}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedContacts: fetchedPage, currentPage: page });
  }

  async pageSizeLink(size) {
    const { sortedField, sortOrder, fromDate, toDate } = this.state;

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/contacts-filtered-sorted/0/${size}/${sortedField}/${sortOrder}/${fromDate}/${toDate}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedContacts: fetchedPage, currentPage: 0, currentPaginationHop: 1 });
    this.createPageArray();
  }

  async getSortedField(fieldName) {
    const { sortedField, pagedContacts, fromDate, toDate } = this.state;
    let { sortOrder } = this.state;

    const pageSize = pagedContacts.pageable.pageSize;
    if (fieldName === sortedField) {
      if (sortOrder === "asce") {
        sortOrder = "desc";
      } else if (sortOrder === "desc") {
        sortOrder = "asce";
      } else {
        sortOrder = "asce";
      }
    } else {
      sortOrder = "asce";
    }
    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/contacts-filtered-sorted/0/${pageSize}/${fieldName}/${sortOrder}/${fromDate}/${toDate}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({
      pagedContacts: fetchedPage,
      currentPage: 0,
      currentPaginationHop: 1,
      sortedField: fieldName,
      sortOrder,
    });
    this.createPageArray();
  }

  async applyDateFilter() {
    const {
      pagedContacts,
      sortedField,
      sortOrder,
      fromDate,
      toDate,
    } = this.state;
    const pageSize = pagedContacts.pageable.pageSize;

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/contacts-filtered-sorted/0/${pageSize}/${sortedField}/${sortOrder}/${fromDate}/${toDate}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedContacts: fetchedPage, currentPage: 0, currentPaginationHop: 1 });
    this.createPageArray();
  }

  async setDateRange(newRange) {
    if (newRange.length === 2) {
      let formattedFromDate = null;
      let formattedToDate = null;
      let from = newRange[0];
      let to = newRange[1];
      //from date formatting
      let month =
        parseInt(from.getMonth() + 1) > 9
          ? from.getMonth() + 1
          : "0" + (from.getMonth() + 1);
      let date =
        parseInt(from.getDate()) > 9 ? from.getDate() : "0" + from.getDate();
      formattedFromDate =
        from.getFullYear() + "-" + month + "-" + date + " 00:00:00";
      //to date formatting
      let tMonth =
        parseInt(to.getMonth() + 1) > 9
          ? to.getMonth() + 1
          : "0" + (to.getMonth() + 1);
      let tDate =
        parseInt(to.getDate()) > 9 ? to.getDate() : "0" + to.getDate();
      formattedToDate =
        to.getFullYear() + "-" + tMonth + "-" + tDate + " 23:59:00";    //Set last hour to get the complete selected day

      this.setState({
        dateRange: newRange,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      });
    } else {
      this.setState({ dateRange: newRange, fromDate: null, toDate: null });
    }
  }

  render() {
    const {
      isLoading,
      pagedContacts,
      pages,
      currentPage,
      currentPaginationHop,
      maxPaginationHops,
      sortedField,
      sortOrder,
      dropdownOpen,
      dateRange,
    } = this.state;

    const firstPageHopCheck = currentPaginationHop > 1 ? "" : "disabled";
    const lastPageHopCheck =
      currentPaginationHop === maxPaginationHops ? "disabled" : "";

    if (isLoading) {
      return (
        <div>
          <img className="loading" src="/loading.gif" alt="Loading..." />
        </div>
      );
    }


    const pageNumbers = pages.map((number) => {
      const activeCheck = currentPage === number - 1 ? "active" : "";
      return (
        <PaginationItem className={activeCheck}>
          <PaginationLink onClick={() => this.pageLink(number - 1)}>
            {number}
          </PaginationLink>
        </PaginationItem>
      );
    });

    const pageSizeArray = [10, 20, 50, 100, 200];
    const pageSizesDropDown = pageSizeArray.map((size) => {
      const sizeCheck =
        size === pagedContacts.pageable.pageSize ? "disabled" : "";
      return (
        <DropdownItem
          className={sizeCheck}
          onClick={() => this.pageSizeLink(size)}
        >
          {size}
        </DropdownItem>
      );
    });

    const pagination = (
      <Pagination aria-label="Navigate pages">
        <PaginationItem className={firstPageHopCheck}>
          <PaginationLink
            aria-label="First"
            onClick={() => this.createCustomPageArray(1)}
          >
          <FirstPageIcon fontSize="small" />
        </PaginationLink>
        </PaginationItem>
        <PaginationItem className={firstPageHopCheck}>
          <PaginationLink
            aria-label="Previous"
            onClick={() => this.createCustomPageArray(currentPaginationHop - 1)}
          >
            {"<"}
          </PaginationLink>
        </PaginationItem>
        {pageNumbers}
        <PaginationItem className={lastPageHopCheck}>
          <PaginationLink
            aria-label="Next"
            onClick={() => this.createCustomPageArray(currentPaginationHop + 1)}
          >
            {">"}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem className={lastPageHopCheck}>
          <PaginationLink
            aria-label="Last"
            onClick={() => this.createCustomPageArray(maxPaginationHops)}
          >
            <LastPageIcon fontSize="small" />
            </PaginationLink>
        </PaginationItem>
      </Pagination>
    );

    const pagesDropdown = (
      <Dropdown size="sm" isOpen={dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>{pagedContacts.pageable.pageSize}</DropdownToggle>
        <DropdownMenu>{pageSizesDropDown}</DropdownMenu>
      </Dropdown>
    );

    //Sort Order arrows
    let fnArrow = null;
    let lnArrow = null;
    let lcdArrow = null;
    let titleArrow = null;
    let emailArrow = null;

    if (sortOrder !== null) {
      if (sortOrder === "asce") {
        if (sortedField === "lastContactDate") {
          lcdArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "lastName") {
          lnArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "firstName") {
          fnArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "title") {
          titleArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "email") {
          emailArrow = <ArrowUpwardIcon />;
        }
      } else if (sortOrder === "desc") {
        if (sortedField === "contactOrgs.organization.orgname") {
          lcdArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "lastName") {
          lnArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "firstName") {
          fnArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "title") {
          titleArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "email") {
          emailArrow = <ArrowDownwardIcon />;
        }
      }
    } else {
      fnArrow = <ArrowUpwardIcon />;
    }

    const dateRangePicker = (
      <DateRangePicker
        placeholder={"Select date range..."}
        value={dateRange}
        onChange={this.setDateRange}
      />
    );

    const filterAccordion = (
      <Accordion>
        <AccordionSummary
          expandIcon={<FilterListIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Filter</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="paraSpace">{dateRangePicker}</div>
          <div>
            <Button onClick={() => this.applyDateFilter()}>Apply Filter</Button>
          </div>
        </AccordionDetails>
      </Accordion>
    );

    const contactList = pagedContacts.content.map((contact) => {
      let lastContactDate = null;
      if (contact.lastContactDate != null) {
        let lc = new Date(contact.lastContactDate);
        lastContactDate =
          lc.toLocaleDateString() +
          " " +
          lc.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
      }

      return (
        <tr className="small-font" key={contact.contactId}>
          <td style={{ whiteSpace: "nowrap" }}>
            <Link to={"/contact/read/" + contact.contactId}>
              {contact.firstName}
            </Link>
          </td>
          <td>
            <Link to={"/contact/read/" + contact.contactId}>
              {contact.lastName}
            </Link>
          </td>
          <td>
            {Object.entries(contact.contactOrgs).map(([key, value]) => {
              return (
                <div id={key}>
                  <Link target="_blank" to={"/organization/read/" + key}>
                    {value}
                  </Link>{" "}
                  <br></br>
                </div>
              );
            })}
          </td>
          <td>{contact.title}</td>
          <td>{contact.email}</td>
          <td>{contact.phone}</td>
          <td>{lastContactDate}</td>
          <td>
            <ButtonGroup>
              <Button
                size="sm"
                color="primary"
                tag={Link}
                to={"/contact/" + contact.contactId}
              >
                Edit
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      );
    });

    return (
      <div>
        <AppNavbar />
        <Container>
          <div className="float-right">
            <Button color="success" tag={Link} to="/contact/new">
              Create Contact
            </Button>
          </div>
          <h3 className="headLineSpace">Contacts</h3>
          <div className="float-left">{filterAccordion}</div>
          <Table className="mt-4" responsive bordered hover>
            <thead>
              <tr>
                <th
                  className="link small-font"
                  width="10%"
                  onClick={() => this.getSortedField("firstName")}
                >
                  First Name {fnArrow}
                </th>
                <th
                  className="link small-font"
                  width="10%"
                  onClick={() => this.getSortedField("lastName")}
                >
                  Last Name {lnArrow}
                </th>
                <th
                  className="small-font"
                  width="20%"
                  // onClick={() =>
                  //   this.getSortedField("contactOrgs.organization.orgname")
                  // }
                >
                  Org(s) Associated
                </th>
                <th
                  className="link small-font"
                  width="10%"
                  onClick={() => this.getSortedField("title")}
                >
                  Title {titleArrow}
                </th>
                <th
                  className="link small-font"
                  width="10%"
                  onClick={() => this.getSortedField("email")}
                >
                  Email {emailArrow}
                </th>
                <th className="small-font" width="10%">
                  Phone
                </th>
                <th
                  className="link small-font"
                  width="10%"
                  onClick={() => this.getSortedField("lastContactDate")}
                >
                  Last Contact {lcdArrow}
                </th>
                <th width="5%">Action</th>
              </tr>
            </thead>
            <tbody>{contactList}</tbody>
          </Table>
        </Container>
        <Container>
          <div>
            {pagination}
            <div className="row pageSize-dropDown mono-font">
              Items per page <span className="fieldSpace">{pagesDropdown}</span>
            </div>
          </div>
        </Container>
        <p>&nbsp;</p>
      </div>
    );
  }
}

export default withCookies(ContactList);
