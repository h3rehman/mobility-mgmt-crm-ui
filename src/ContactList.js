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
  CustomInput,
} from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";
import { instanceOf } from "prop-types";
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";

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
      sortedField: null,
      sortOrder: null,
      dropdownOpen: false,
    };
    this.createPageArray = this.createPageArray.bind(this);
    this.pageLink = this.pageLink.bind(this);
    this.pageSizeLink = this.pageSizeLink.bind(this);
    this.getSortedField = this.getSortedField.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    fetch("/api/contacts-sorted-default", { credentials: "include" })
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
    let pages = [];
    let totalPages = pagedContacts.totalPages;
    for (let i = 0; i < totalPages; i++) {
      pages.push(i + 1);
    }
    this.setState({ pages: pages });
  }

  async pageLink(page) {
    const { pagedContacts, sortedField, sortOrder } = this.state;
    const pageSize = pagedContacts.pageable.pageSize;

    const fetchedPage = await (
      await fetch(
        `/api/contacts-filtered-sorted/${page}/${pageSize}/${sortedField}/${sortOrder}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedContacts: fetchedPage, currentPage: page });
  }

  async pageSizeLink(size) {
    const { sortedField, sortOrder } = this.state;

    const fetchedPage = await (
      await fetch(
        `/api/contacts-filtered-sorted/0/${size}/${sortedField}/${sortOrder}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedContacts: fetchedPage, currentPage: 0 });
    this.createPageArray();
  }

  async getSortedField(fieldName) {
    const { sortedField, pagedContacts } = this.state;
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
        `/api/contacts-filtered-sorted/0/${pageSize}/${fieldName}/${sortOrder}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({
      pagedContacts: fetchedPage,
      currentPage: 0,
      sortedField: fieldName,
      sortOrder,
    });
  }

  render() {
    const {
      isLoading,
      pagedContacts,
      pages,
      currentPage,
      sortedField,
      sortOrder,
      dropdownOpen,
    } = this.state;

    if (isLoading) {
      return (
        <div>
          <img className="loading" src="/loading.gif" alt="Loading..." />
        </div>
      );
    }

    const firstPageCheck = currentPage > 0 ? "" : "disabled";
    const lastPageCheck =
      currentPage === pagedContacts.totalPages - 1 ? "disabled" : "";

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

    const pageSizeArray = [10, 20, 50, 100];
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
        <PaginationItem className={firstPageCheck}>
          <PaginationLink
            previous
            aria-label="First"
            onClick={() => this.pageLink(0)}
          />
        </PaginationItem>
        <PaginationItem className={firstPageCheck}>
          <PaginationLink
            aria-label="Previous"
            onClick={() => this.pageLink(currentPage - 1)}
          >
            {"<"}
          </PaginationLink>
        </PaginationItem>
        {pageNumbers}
        <PaginationItem className={lastPageCheck}>
          <PaginationLink
            aria-label="Next"
            onClick={() => this.pageLink(currentPage + 1)}
          >
            {">"}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem className={lastPageCheck}>
          <PaginationLink
            next
            aria-label="Last"
            onClick={() => this.pageLink(pagedContacts.totalPages - 1)}
          />
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
    let orgArrow = null;
    let titleArrow = null;
    let emailArrow = null;

    if (sortOrder !== null) {
      if (sortOrder === "asce") {
        if (sortedField === "contactOrgs.organization.orgname") {
          orgArrow = <ArrowUpwardIcon />;
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
          orgArrow = <ArrowDownwardIcon />;
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

    const contactList = pagedContacts.content.map((contact) => {
      // let lastContactDate = null;
      // if (contact.lastContact != null) {
      //   let lc = new Date(contact.lastContact);
      //   lastContactDate =
      //     lc.toLocaleDateString() +
      //     " " +
      //     lc.toLocaleTimeString([], {
      //       hour: "2-digit",
      //       minute: "2-digit",
      //     });
      // }

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
          <td>
            <ButtonGroup>
              <Button
                size="sm"
                color="primary"
                tag={Link}
                to={"/contacts/" + contact.contactId}
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
              Add Contact
            </Button>
          </div>
          <h3>Contacts</h3>
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
                  className="link small-font"
                  width="20%"
                  onClick={() =>
                    this.getSortedField("contactOrgs.organization.orgname")
                  }
                >
                  Org(s) Associated {orgArrow}
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
