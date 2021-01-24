import React, { Component } from "react";
import { Button, ButtonGroup, Container, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";
import { instanceOf } from "prop-types";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { withCookies, Cookies } from "react-cookie";

class EventList extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      pagedEvents: {},
      csrfToken: cookies.get("XSRF-TOKEN"),
      isLoading: true,
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

  componentDidMount() {
    this.setState({ isLoading: true });
    //default pagination (1st page & 10 elements) and sorted by startDateTime
    fetch("/api/events-sorted-default/0/10", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => this.setState({ pagedEvents: data, isLoading: false }))
      .then(() => this.createPageArray());
  }

  toggle() {
    this.setState((prevState) => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  async createPageArray() {
    const { pagedEvents } = this.state;
    let pages = [];
    let totalPages = pagedEvents.totalPages;
    for (let i = 0; i < totalPages; i++) {
      pages.push(i + 1);
    }
    this.setState({ pages: pages });
  }

  async pageLink(page) {
    const { pagedEvents, sortedField, sortOrder } = this.state;
    const pageSize = pagedEvents.pageable.pageSize;
    const fetchedPage = await (
      await fetch(
        `/api/events-sorted-custom/${page}/${pageSize}/${sortedField}/${sortOrder}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedEvents: fetchedPage, currentPage: page });
  }

  async pageSizeLink(size) {
    const { sortedField, sortOrder } = this.state;
    const fetchedPage = await (
      await fetch(
        `/api/events-sorted-custom/0/${size}/${sortedField}/${sortOrder}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedEvents: fetchedPage, currentPage: 0 });
    this.createPageArray();
  }

  async getSortedField(fieldName) {
    const { pagedEvents, sortedField } = this.state;
    let { sortOrder } = this.state;
    const pageSize = pagedEvents.pageable.pageSize;
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
        `/api/events-sorted-custom/0/${pageSize}/${fieldName}/${sortOrder}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({
      pagedEvents: fetchedPage,
      currentPage: 0,
      sortedField: fieldName,
      sortOrder,
    });
  }

  render() {
    const { pagedEvents, isLoading, pages } = this.state;
    const { currentPage } = this.state;

    const firstPageCheck = currentPage > 0 ? "" : "disabled";
    const lastPageCheck =
      currentPage === pagedEvents.totalPages - 1 ? "disabled" : "";
    const { dropdownOpen } = this.state;

    if (isLoading) {
      return (
        <div>
          <img class="loading" src="/loading.gif" alt="Loading..." />
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

    const pageSizeArray = [10, 20, 50, 100];
    const pageSizesDropDown = pageSizeArray.map((size) => {
      const sizeCheck =
        size === pagedEvents.pageable.pageSize ? "disabled" : "";
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
            onClick={() => this.pageLink(pagedEvents.totalPages - 1)}
          />
        </PaginationItem>
      </Pagination>
    );

    const pagesDropdown = (
      <Dropdown size="sm" isOpen={dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>{pagedEvents.pageable.pageSize}</DropdownToggle>
        <DropdownMenu>{pageSizesDropDown}</DropdownMenu>
      </Dropdown>
    );

    const eventList = pagedEvents.content.map((event) => {
      let sd = new Date(event.startDateTime);
      let ld = new Date(event.endDateTime);
      return (
        <tr key={event.eventId}>
          <td style={{ whiteSpace: "nowrap" }}>
            <Link to={"/event/read/" + event.eventId}>{event.location}</Link>
          </td>
          <td>
            {event.eventPresenters.map((presenter) => {
              return (
                <div className="small-font">
                  {presenter} <br></br>
                </div>
              );
            })}
          </td>
          <td className="small-font">{event.city}</td>
          <td className="small-font">
            {sd.toLocaleDateString()}{" "}
            {sd.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td className="small-font">
            {ld.toLocaleDateString()}{" "}
            {ld.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td className="small-font">{event.eventTypeDesc}</td>
          <td>
            <ButtonGroup>
              <Button
                size="sm"
                color="primary"
                tag={Link}
                to={"/events/" + event.eventId}
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
            <Button color="success" tag={Link} to="/events/new">
              Add Event
            </Button>
          </div>
        </Container>
        <Container>
          <h3>Events</h3>
          <Table className="mt-4">
            <thead>
              <tr>
                <th width="15%" onClick={() => this.getSortedField("location")}>
                  Location
                </th>
                <th width="10%">Presenter(s)</th>
                <th width="10%" onClick={() => this.getSortedField("city")}>
                  City
                </th>
                <th
                  width="12%"
                  onClick={() => this.getSortedField("startDateTime")}
                >
                  Start Time
                </th>
                <th
                  width="12%"
                  onClick={() => this.getSortedField("endDateTime")}
                >
                  End Time
                </th>
                <th width="10%">Type</th>
                <th width="5%">Action</th>
              </tr>
            </thead>
            <tbody>{eventList}</tbody>
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

export default withCookies(EventList);
