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
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/styles/rsuite-default.css";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import localConfig from "./localConfig.json";

class MyCallLogs extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      pagedCallLogs: {},
      pages: [],
      currentPage: 0,
      sortedField: null,
      sortOrder: null,
      dropdownOpen: false,
      dateRange: [],
      fromDate: null,
      toDate: null,
      callLogStatuses: [],
      statusFiltered: [],
      isLoading: true,
      csrfToken: cookies.get("XSRF-TOKEN"),
    };
    this.createPageArray = this.createPageArray.bind(this);
    this.toggle = this.toggle.bind(this);
    this.pageLink = this.pageLink.bind(this);
    this.pageSizeLink = this.pageSizeLink.bind(this);
    this.getSortedField = this.getSortedField.bind(this);
    this.setDateRange = this.setDateRange.bind(this);
    this.filterStatus = this.filterStatus.bind(this);
    this.callOrgStatuses = this.callOrgStatuses.bind(this);
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        "/api/call-logs-sorted-default",
      { credentials: "include" }
    )
      .then((response) => response.json())
      .then((data) => this.setState({ pagedCallLogs: data, isLoading: false }))
      .then(() => this.createPageArray());
  }

  async createPageArray() {
    const { pagedCallLogs } = this.state;
    let pages = [];
    let totalPages = pagedCallLogs.totalPages;
    for (let i = 0; i < totalPages; i++) {
      pages.push(i + 1);
    }
    this.setState({ pages: pages });
  }

  toggle() {
    this.setState((prevState) => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  statusesQueryURL(statusArray) {
    const queryURL = statusArray
      .map((status) => {
        return "status=" + status;
      })
      .join("&");
    return queryURL;
  }

  async callOrgStatuses() {
    let { callLogStatuses } = this.state;
    if (callLogStatuses.length === 0) {
      //load all Status types
      const fetchedStatusTypes = await (
        await fetch(
          "https://" +
            localConfig.SERVICE.URL +
            ":" +
            localConfig.SERVICE.PORT +
            `/api/orgStatusTypes`,
          { credentials: "include" }
        )
      ).json();
      this.setState({
        callLogStatuses: fetchedStatusTypes,
      });
    }
  }

  async pageLink(page) {
    const {
      pagedCallLogs,
      sortedField,
      sortOrder,
      fromDate,
      toDate,
      statusFiltered,
    } = this.state;
    const pageSize = pagedCallLogs.pageable.pageSize;

    let statusQuery = this.statusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/call-logs-filtered-sorted/${page}/${pageSize}/${sortedField}/${sortOrder}/${fromDate}/${toDate}?${statusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedCallLogs: fetchedPage, currentPage: page });
  }

  async pageSizeLink(size) {
    const {
      sortedField,
      sortOrder,
      fromDate,
      toDate,
      statusFiltered,
    } = this.state;

    let statusQuery = this.statusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/call-logs-filtered-sorted/0/${size}/${sortedField}/${sortOrder}/${fromDate}/${toDate}?${statusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedCallLogs: fetchedPage, currentPage: 0 });
    this.createPageArray();
  }

  async getSortedField(fieldName) {
    const {
      sortedField,
      pagedCallLogs,
      fromDate,
      toDate,
      statusFiltered,
    } = this.state;
    let { sortOrder } = this.state;

    let statusQuery = this.statusesQueryURL(statusFiltered);

    const pageSize = pagedCallLogs.pageable.pageSize;
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
          `/api/call-logs-filtered-sorted/0/${pageSize}/${fieldName}/${sortOrder}/${fromDate}/${toDate}?${statusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({
      pagedCallLogs: fetchedPage,
      currentPage: 0,
      sortedField: fieldName,
      sortOrder,
    });
  }

  async applyFilters() {
    const {
      pagedCallLogs,
      sortedField,
      sortOrder,
      fromDate,
      toDate,
      statusFiltered,
    } = this.state;

    const pageSize = pagedCallLogs.pageable.pageSize;

    let statusQuery = this.statusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/call-logs-filtered-sorted/0/${pageSize}/${sortedField}/${sortOrder}/${fromDate}/${toDate}?${statusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedCallLogs: fetchedPage, currentPage: 0 });
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
        to.getFullYear() + "-" + tMonth + "-" + tDate + " 23:59:00";

      this.setState({
        dateRange: newRange,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      });
    } else {
      this.setState({ dateRange: newRange, fromDate: null, toDate: null });
    }
  }

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
    const {
      pagedCallLogs,
      isLoading,
      pages,
      currentPage,
      dateRange,
      callLogStatuses,
      sortedField,
      sortOrder,
    } = this.state;

    const firstPageCheck = currentPage > 0 ? "" : "disabled";
    const lastPageCheck =
      currentPage === pagedCallLogs.totalPages - 1 ? "disabled" : "";
    const { dropdownOpen } = this.state;

    if (isLoading) {
      return (
        <div>
          <img class="loading" src="/loading.gif" alt="Loading..." />
        </div>
      );
    }

    let statusCheckBoxes = null;
    if (callLogStatuses.length > 0) {
      statusCheckBoxes = callLogStatuses.map((status) => {
        return (
          <CustomInput
            key={status.statusId}
            type="checkbox"
            id={status.statusId}
            label={status.statusDesc}
            onChange={this.filterStatus(status.statusDesc)}
          />
        );
      });
    } else {
      statusCheckBoxes = (
        <p>Something went wrong while fetching Status types.</p>
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
        size === pagedCallLogs.pageable.pagesize ? "disabled" : "";
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
            onClick={() => this.pageLink(pagedCallLogs.totalPages - 1)}
          />
        </PaginationItem>
      </Pagination>
    );

    const pagesDropdown = (
      <Dropdown size="sm" isOpen={dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>{pagedCallLogs.pageable.pageSize}</DropdownToggle>
        <DropdownMenu>{pageSizesDropDown}</DropdownMenu>
      </Dropdown>
    );

    //Sort Order arrows
    let cdArrow = null;
    let lmdArrow = null;
    let orgArrow = null;
    let statusArrow = null;
    if (sortOrder !== null) {
      if (sortOrder === "asce") {
        if (sortedField === "createDate") {
          cdArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "org.orgname") {
          orgArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "lastModifiedDate") {
          lmdArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "status.lastStatus") {
          statusArrow = <ArrowUpwardIcon />;
        }
      } else if (sortOrder === "desc") {
        if (sortedField === "createDate") {
          cdArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "org.orgname") {
          orgArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "lastModifiedDate") {
          lmdArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "status.lastStatus") {
          statusArrow = <ArrowDownwardIcon />;
        }
      }
    } else {
      cdArrow = <ArrowDownwardIcon />;
    }

    const dateRangePicker = (
      <DateRangePicker
        placeholder={"Last modified date range..."}
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
          onClick={this.callOrgStatuses}
        >
          <Typography>Filter</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="paraSpace">{dateRangePicker}</div>
          <div className="row fiter-spacing">
            <div className="paraSpace">
              <h5>Statuses</h5>
              {statusCheckBoxes}
            </div>
          </div>
          <div>
            <Button onClick={() => this.applyFilters()}>Apply Filters</Button>
          </div>
        </AccordionDetails>
      </Accordion>
    );

    const myCallLogs = pagedCallLogs.content.map((callLog) => {
      let cd = new Date(callLog.createDate);
      let ld = new Date(callLog.lastModifiedDate);
      return (
        <tr key={callLog.callId}>
          <td style={{ whiteSpace: "nowrap" }}>
            <Link to={"/callLog/" + callLog.callId}>
              {callLog.org ? callLog.org.orgName : null}
            </Link>
          </td>
          <td className="small-font">
            {callLog.status ? callLog.status.lastStatus : null}
          </td>
          <td className="small-font">{callLog.createdBy}</td>
          <td className="small-font">
            {cd.toLocaleDateString()}{" "}
            {cd.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td className="small-font">{callLog.lastModifiedBy}</td>
          <td className="small-font">
            {ld.toLocaleDateString()}{" "}
            {ld.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td>
            <ButtonGroup>
              <Button
                size="sm"
                color="primary"
                tag={Link}
                to={"/callLog/" + callLog.callId}
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
            <Button color="success" tag={Link} to="/callLog/new">
              Create Call Log
            </Button>
          </div>
        </Container>
        <Container>
          <h4>My Call Logs</h4>

          <div className="float-left">{filterAccordion}</div>
          <Table className="mt-4" responsive bordered hover>
            <thead>
              <tr className="small-font">
                <th
                  className="link"
                  width="20%"
                  onClick={() => this.getSortedField("org.orgname")}
                >
                  Org. Name {orgArrow}
                </th>
                <th
                  className="link"
                  width="10%"
                  onClick={() => this.getSortedField("status.lastStatus")}
                >
                  Status set {statusArrow}{" "}
                </th>
                <th width="15%">Created by</th>
                <th
                  className="link"
                  width="15%"
                  onClick={() => this.getSortedField("createDate")}
                >
                  Created on {cdArrow}{" "}
                </th>
                <th width="15%">Last Modified by</th>
                <th
                  className="link"
                  width="15%"
                  onClick={() => this.getSortedField("lastModifiedDate")}
                >
                  Last Modified {lmdArrow}{" "}
                </th>
                <th width="10%">Action</th>
              </tr>
            </thead>
            <tbody>{myCallLogs}</tbody>
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

export default withCookies(MyCallLogs);
