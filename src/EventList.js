import React, { Component } from "react";
import { Button, ButtonGroup, Container, Table } from "reactstrap";
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
import { DateRangePicker } from "rsuite";
import "rsuite/dist/styles/rsuite-default.css";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CustomInput,
} from "reactstrap";
import { withCookies, Cookies } from "react-cookie";
import localConfig from "./localConfig.json";

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
      dateRange: [],
      fromDate: null,
      toDate: null,
      eventTypes: [],
      eventTypesFiltered: [],
      eventStatuses: [],
      statusFiltered: [],
    };
    this.createPageArray = this.createPageArray.bind(this);
    this.pageLink = this.pageLink.bind(this);
    this.pageSizeLink = this.pageSizeLink.bind(this);
    this.getSortedField = this.getSortedField.bind(this);
    this.toggle = this.toggle.bind(this);
    this.setDateRange = this.setDateRange.bind(this);
    this.filterEventTypes = this.filterEventTypes.bind(this);
    this.filterStatus = this.filterStatus.bind(this);
  }

  async componentDidMount() {
    this.setState({ isLoading: true });
    //default pagination (1st page & 10 elements) and sorted by startDateTime
    fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        "/api/events-sorted-default/0/10",
      { credentials: "include" }
    )
      .then((response) => response.json())
      .then((data) => this.setState({ pagedEvents: data, isLoading: false }))
      .then(() => this.createPageArray());

    const fetchedEventTypes = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          "/api/all-event-types",
        {
          credentials: "include",
        }
      )
    ).json();
    //load event status types
    const fetchedEventStatusTypes = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/eventStatusTypes`,
        { credentials: "include" }
      )
    ).json();
    this.setState({
      eventTypes: fetchedEventTypes,
      eventStatuses: fetchedEventStatusTypes,
    });
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

  eventTypesQueryURL(eveTypesArray) {
    const queryURL = eveTypesArray
      .map((type) => {
        return "eveType=" + type;
      })
      .join("&");
    return queryURL;
  }

  eventStatusesQueryURL(statusArray) {
    const queryURL = statusArray
      .map((status) => {
        return "eveStatus=" + status;
      })
      .join("&");
    return queryURL;
  }

  async pageLink(page) {
    const {
      pagedEvents,
      sortedField,
      sortOrder,
      fromDate,
      toDate,
      eventTypesFiltered,
      statusFiltered,
    } = this.state;
    const pageSize = pagedEvents.pageable.pageSize;

    let eveTypesQuery = this.eventTypesQueryURL(eventTypesFiltered);
    let eveStatusQuery = this.eventStatusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/events-filtered-sorted/${page}/${pageSize}/${sortedField}/${sortOrder}/${fromDate}/${toDate}?${eveTypesQuery}&${eveStatusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedEvents: fetchedPage, currentPage: page });
  }

  async pageSizeLink(size) {
    const {
      sortedField,
      sortOrder,
      fromDate,
      toDate,
      eventTypesFiltered,
      statusFiltered,
    } = this.state;

    let eveTypesQuery = this.eventTypesQueryURL(eventTypesFiltered);
    let eveStatusQuery = this.eventStatusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/events-filtered-sorted/0/${size}/${sortedField}/${sortOrder}/${fromDate}/${toDate}?${eveTypesQuery}&${eveStatusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedEvents: fetchedPage, currentPage: 0 });
    this.createPageArray();
  }

  async getSortedField(fieldName) {
    const {
      sortedField,
      pagedEvents,
      fromDate,
      toDate,
      eventTypesFiltered,
      statusFiltered,
    } = this.state;
    let { sortOrder } = this.state;

    let eveTypesQuery = this.eventTypesQueryURL(eventTypesFiltered);
    let eveStatusQuery = this.eventStatusesQueryURL(statusFiltered);

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
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/events-filtered-sorted/0/${pageSize}/${fieldName}/${sortOrder}/${fromDate}/${toDate}?${eveTypesQuery}&${eveStatusQuery}`,
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

  async applyFilters() {
    const {
      pagedEvents,
      sortedField,
      eventTypesFiltered,
      sortOrder,
      fromDate,
      toDate,
      statusFiltered,
    } = this.state;

    const pageSize = pagedEvents.pageable.pageSize;

    let eveTypesQuery = this.eventTypesQueryURL(eventTypesFiltered);
    let eveStatusQuery = this.eventStatusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/events-filtered-sorted/0/${pageSize}/${sortedField}/${sortOrder}/${fromDate}/${toDate}?${eveTypesQuery}&${eveStatusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedEvents: fetchedPage, currentPage: 0 });
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
        to.getFullYear() + "-" + tMonth + "-" + tDate + " 00:00:00";

      this.setState({
        dateRange: newRange,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      });
    } else {
      this.setState({ dateRange: newRange, fromDate: null, toDate: null });
    }
  }

  filterEventTypes = (eveType) => (e) => {
    let { eventTypesFiltered } = this.state;
    if (e.target.checked === true) {
      eventTypesFiltered.push(eveType);
    } else {
      eventTypesFiltered = eventTypesFiltered.filter((x) => x !== eveType);
    }
    this.setState({ eventTypesFiltered });
  };

  filterStatus = (status) => (e) => {
    let { statusFiltered } = this.state;
    if (e.target.checked === true) {
      statusFiltered.push(status);
    } else {
      statusFiltered = statusFiltered.filter((x) => x !== status);
    }
    this.setState({ statusFiltered });
  };

  render() {
    const { pagedEvents, isLoading, pages } = this.state;
    const {
      currentPage,
      dateRange,
      eventTypes,
      eventStatuses,
      sortedField,
      sortOrder,
    } = this.state;

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

    let eventTypesCheckBoxes = null;

    if (eventTypes !== null) {
      eventTypesCheckBoxes = eventTypes.map((type) => {
        return (
          <CustomInput
            key={type.eventTypeId}
            // checked={type.eventTypeDesc}
            type="checkbox"
            id={type.eventTypeId}
            label={type.eventTypeDesc}
            onChange={this.filterEventTypes(type.eventTypeDesc)}
          />
        );
      });
    } else {
      eventTypesCheckBoxes = (
        <div className="mono-font">
          Error occurred in retrieving Event types
        </div>
      );
    }

    let statusCheckBoxes = null;
    if (eventStatuses.length > 0) {
      statusCheckBoxes = eventStatuses.map((status) => {
        return (
          <CustomInput
            key={status.statusId}
            type="checkbox"
            id={status.statusId}
            label={status.statusdesc}
            onChange={this.filterStatus(status.statusdesc)}
          />
        );
      });
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

    //Sort Order arrows
    let sdArrow = null;
    let edArrow = null;
    let locArrow = null;
    let citArrow = null;
    let eveArrow = null;
    if (sortOrder !== null) {
      if (sortOrder === "asce") {
        if (sortedField === "startDateTime") {
          sdArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "location") {
          locArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "eventName") {
          eveArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "city") {
          citArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "endDateTime") {
          edArrow = <ArrowUpwardIcon />;
        }
      } else if (sortOrder === "desc") {
        if (sortedField === "startDateTime") {
          sdArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "location") {
          locArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "eventName") {
          eveArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "city") {
          citArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "endDateTime") {
          edArrow = <ArrowDownwardIcon />;
        }
      }
    } else {
      sdArrow = <ArrowDownwardIcon />;
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
          <div className="row fiter-spacing">
            <div className="paraSpace">
              <div>
                <h5>Event Types</h5>
                {eventTypesCheckBoxes}
              </div>
            </div>
            <div className="paraSpace fieldSpace">
              <div>
                <h5>Event Statuses</h5>
                {statusCheckBoxes}
              </div>
            </div>
          </div>
          <div>
            <Button onClick={() => this.applyFilters()}>Apply Filters</Button>
          </div>
        </AccordionDetails>
      </Accordion>
    );

    const eventList = pagedEvents.content.map((event) => {
      let sd = new Date(event.startDateTime);
      let ld = new Date(event.endDateTime);
      return (
        <tr key={event.eventId}>
          <td className="small-font" style={{ whiteSpace: "nowrap" }}>
            <Link to={"/event/read/" + event.eventId}>{event.location}</Link>
          </td>
          <td className="small-font">{event.eventName}</td>
          <td className="small-font">{event.lastStatus}</td>
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
              Create Event
            </Button>
          </div>
        </Container>
        <Container>
          <h3 className="headLineSpace">Events</h3>

          <div className="float-left">{filterAccordion}</div>
          <Table className="mt-4" responsive bordered hover>
            <thead>
              <tr>
                <th
                  className="link"
                  width="15%"
                  onClick={() => this.getSortedField("location")}
                >
                  Location {locArrow}
                </th>
                <th
                  className="link"
                  width="15%"
                  onClick={() => this.getSortedField("eventName")}
                >
                  Event Name {eveArrow}
                </th>
                <th width="18%">Event Status</th>
                <th width="15%">Presenter(s)</th>
                <th
                  className="link"
                  width="5%"
                  onClick={() => this.getSortedField("city")}
                >
                  City {citArrow}
                </th>
                <th
                  className="link"
                  width="20%"
                  onClick={() => this.getSortedField("startDateTime")}
                >
                  Start Time {sdArrow}
                </th>

                <th
                  className="link"
                  width="20%"
                  onClick={() => this.getSortedField("endDateTime")}
                >
                  End Time {edArrow}
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
