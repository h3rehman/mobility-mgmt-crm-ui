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

class AllOrgsList extends Component {
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
      pagedOrgs: {},
      pages: [],
      currentPage: 0,
      sortedField: null,
      sortOrder: null,
      dropdownOpen: false,
      counties: [],
      countiesFiltered: [],
      allStatus: [],
      statusFiltered: [],
    };
    this.createPageArray = this.createPageArray.bind(this);
    this.pageLink = this.pageLink.bind(this);
    this.pageSizeLink = this.pageSizeLink.bind(this);
    this.getSortedField = this.getSortedField.bind(this);
    this.toggle = this.toggle.bind(this);
    this.filterCounties = this.filterCounties.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.filterStatus = this.filterStatus.bind(this);
    this.countiesQueryURL = this.countiesQueryURL.bind(this);
    this.statusesQueryURL = this.statusesQueryURL.bind(this);
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    fetch("/api/orgs-sorted-default", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => this.setState({ pagedOrgs: data, isLoading: false }))
      .then(() => this.createPageArray());

    const fetchedCounties = await (
      await fetch("/api/counties", {
        credentials: "include",
      })
    ).json();
    const fetchedStatuses = await (
      await fetch("/api/allStatusTypes", {
        credentials: "include",
      })
    ).json();
    this.setState({ counties: fetchedCounties, allStatus: fetchedStatuses });
  }

  toggle() {
    this.setState((prevState) => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  countiesQueryURL(countyArray) {
    const queryURL = countyArray
      .map((countyName) => {
        return "county=" + countyName;
      })
      .join("&");
    return queryURL;
  }

  statusesQueryURL(statusArray) {
    const queryURL = statusArray
      .map((status) => {
        return "status=" + status;
      })
      .join("&");
    return queryURL;
  }

  async createPageArray() {
    const { pagedOrgs } = this.state;
    let pages = [];
    let totalPages = pagedOrgs.totalPages;
    for (let i = 0; i < totalPages; i++) {
      pages.push(i + 1);
    }
    this.setState({ pages: pages });
  }

  async pageLink(page) {
    const {
      pagedOrgs,
      sortedField,
      sortOrder,
      countiesFiltered,
      statusFiltered,
    } = this.state;
    const pageSize = pagedOrgs.pageable.pageSize;

    let countiesQuery = this.countiesQueryURL(countiesFiltered);
    let statusesQuery = this.statusesQueryURL(statusFiltered);
    const fetchedPage = await (
      await fetch(
        `/api/orgs-filtered-sorted/${page}/${pageSize}/${sortedField}/${sortOrder}?${countiesQuery}&${statusesQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedOrgs: fetchedPage, currentPage: page });
  }

  async pageSizeLink(size) {
    const {
      sortedField,
      sortOrder,
      countiesFiltered,
      statusFiltered,
    } = this.state;

    let countiesQuery = this.countiesQueryURL(countiesFiltered);
    let statusesQuery = this.statusesQueryURL(statusFiltered);
    const fetchedPage = await (
      await fetch(
        `/api/orgs-filtered-sorted/0/${size}/${sortedField}/${sortOrder}?${countiesQuery}&${statusesQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedOrgs: fetchedPage, currentPage: 0 });
    this.createPageArray();
  }

  async getSortedField(fieldName) {
    const {
      sortedField,
      pagedOrgs,
      countiesFiltered,
      statusFiltered,
    } = this.state;
    let { sortOrder } = this.state;

    let countiesQuery = this.countiesQueryURL(countiesFiltered);
    let statusesQuery = this.statusesQueryURL(statusFiltered);
    const pageSize = pagedOrgs.pageable.pageSize;
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
        `/api/orgs-filtered-sorted/0/${pageSize}/${fieldName}/${sortOrder}?${countiesQuery}&${statusesQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({
      pagedOrgs: fetchedPage,
      currentPage: 0,
      sortedField: fieldName,
      sortOrder,
    });
  }

  filterCounties = (county) => (e) => {
    let { countiesFiltered } = this.state;
    if (e.target.checked === true) {
      countiesFiltered.push(county);
    } else {
      countiesFiltered = countiesFiltered.filter((x) => x !== county);
    }
    this.setState({ countiesFiltered });
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

  async applyFilters() {
    const {
      pagedOrgs,
      countiesFiltered,
      sortedField,
      sortOrder,
      statusFiltered,
    } = this.state;

    const pageSize = pagedOrgs.pageable.pageSize;
    let countiesQuery = this.countiesQueryURL(countiesFiltered);
    let statusesQuery = this.statusesQueryURL(statusFiltered);
    const fetchedPage = await (
      await fetch(
        `/api/orgs-filtered-sorted/0/${pageSize}/${sortedField}/${sortOrder}?${countiesQuery}&${statusesQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedOrgs: fetchedPage, currentPage: 0 });
    this.createPageArray();
  }

  render() {
    const {
      isLoading,
      pagedOrgs,
      pages,
      currentPage,
      sortedField,
      sortOrder,
      counties,
      allStatus,
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
      currentPage === pagedOrgs.totalPages - 1 ? "disabled" : "";

    let countyCheckBoxes = null;

    if (counties !== null) {
      countyCheckBoxes = counties.map((county) => {
        return (
          <CustomInput
            key={county.countyId + "c"}
            // checked={type.eventTypeDesc}
            type="checkbox"
            id={county.countyId + "c"}
            label={county.countyDesc}
            onChange={this.filterCounties(county.countyDesc)}
          />
        );
      });
    } else {
      countyCheckBoxes = (
        <div className="mono-font">Error occurred in retrieving Counties</div>
      );
    }

    let statusCheckBoxes = null;

    if (allStatus !== null) {
      statusCheckBoxes = allStatus.map((status) => {
        return (
          <CustomInput
            key={status.statusId + "s"}
            type="checkbox"
            id={status.statusId + "s"}
            label={status.statusDesc}
            onChange={this.filterStatus(status.statusDesc)}
          />
        );
      });
    } else {
      statusCheckBoxes = (
        <div className="mono-font">Error occurred in retrieving Status</div>
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
      const sizeCheck = size === pagedOrgs.pageable.pageSize ? "disabled" : "";
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
            onClick={() => this.pageLink(pagedOrgs.totalPages - 1)}
          />
        </PaginationItem>
      </Pagination>
    );

    const pagesDropdown = (
      <Dropdown size="sm" isOpen={dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>{pagedOrgs.pageable.pageSize}</DropdownToggle>
        <DropdownMenu>{pageSizesDropDown}</DropdownMenu>
      </Dropdown>
    );

    //Sort Order arrows
    let orgArrow = null;
    let countyArrow = null;
    let citArrow = null;
    let statusArrow = null;
    let lastConArrow = null;

    if (sortOrder !== null) {
      if (sortOrder === "asce") {
        if (sortedField === "orgname") {
          orgArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "lastContact") {
          lastConArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "lastStatus.statusDesc") {
          statusArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "county.countyDesc") {
          countyArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "city") {
          citArrow = <ArrowUpwardIcon />;
        }
      } else if (sortOrder === "desc") {
        if (sortedField === "orgname") {
          orgArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "lastContact") {
          lastConArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "county.countyDesc") {
          countyArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "city") {
          citArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "lastStatus.statusDesc") {
          statusArrow = <ArrowDownwardIcon />;
        }
      }
    } else {
      orgArrow = <ArrowUpwardIcon />;
    }

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
          <div className="row fiter-spacing">
            <div className="paraSpace">
              <h5>Counties</h5>
              {countyCheckBoxes}
            </div>
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

    const orgList = pagedOrgs.content.map((org) => {
      let lastContactDate = null;
      if (org.lastContact != null) {
        let lc = new Date(org.lastContact);
        lastContactDate =
          lc.toLocaleDateString() +
          " " +
          lc.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
      }

      return (
        <tr key={org.orgId}>
          <td style={{ whiteSpace: "nowrap" }}>
            <Link target="_blank" to={"/organization/read/" + org.orgId}>
              {org.orgname}
            </Link>
          </td>
          <td className="small-font">{org.lastStatus}</td>
          <td className="small-font">{org.city}</td>
          <td className="small-font">{org.countyName}</td>
          <td className="small-font">{lastContactDate}</td>
          <td>
            <ButtonGroup>
              <Button
                size="sm"
                color="primary"
                tag={Link}
                to={"/organizations/" + org.orgId}
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
            <Button color="success" tag={Link} to="/organizations/new">
              Add Organization
            </Button>
          </div>
          <h3>Organizations</h3>
          <div className="float-left">{filterAccordion}</div>
          <Table className="mt-4" responsive bordered hover>
            <thead>
              <tr>
                <th
                  className="link"
                  width="20%"
                  onClick={() => this.getSortedField("orgname")}
                >
                  Name {orgArrow}
                </th>
                <th
                  className="link"
                  width="15%"
                  onClick={() => this.getSortedField("lastStatus.statusDesc")}
                >
                  Last Status {statusArrow}
                </th>
                <th
                  className="link"
                  width="10%"
                  onClick={() => this.getSortedField("city")}
                >
                  City {citArrow}
                </th>
                <th
                  className="link"
                  width="10%"
                  onClick={() => this.getSortedField("county.countyDesc")}
                >
                  County {countyArrow}
                </th>
                <th
                  className="link"
                  width="12%"
                  onClick={() => this.getSortedField("lastContact")}
                >
                  Last Contact {lastConArrow}
                </th>
                <th width="5%">Action</th>
              </tr>
            </thead>
            <tbody>{orgList}</tbody>
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

export default withCookies(AllOrgsList);
