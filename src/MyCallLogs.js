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
import ReactExport from "react-export-excel";
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import DownloadIcon from '@material-ui/icons/GetApp';
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
      currentPaginationHop: 1,
      maxPaginationHops: 1,
      pageSelectionCount: 10,
      sortedField: null,
      sortOrder: null,
      dropdownOpen: false,
      onlyMyCallLogs: true,
      dateRange: [],
      fromDate: null,
      toDate: null,
      callLogStatuses: [],
      statusFiltered: [],
      isLoading: true,
      csrfToken: cookies.get("XSRF-TOKEN"),
      allExportedCallLogs: "",
      allMyExportedCallLogs:"",
      viewExportedCallLogs: "",
      allCallLogsExportTrigger: false,
      allMyCallLogsExportTrigger: false,
      callLogsViewExportTrigger: false, 
    };
    this.createPageArray = this.createPageArray.bind(this);
    this.createCustomPageArray = this.createCustomPageArray.bind(this);
    this.toggle = this.toggle.bind(this);
    this.pageLink = this.pageLink.bind(this);
    this.pageSizeLink = this.pageSizeLink.bind(this);
    this.getSortedField = this.getSortedField.bind(this);
    this.setDateRange = this.setDateRange.bind(this);
    this.filterStatus = this.filterStatus.bind(this);
    this.callOrgStatuses = this.callOrgStatuses.bind(this);
    this.handleOnlyMyCallLogsCheck = this.handleOnlyMyCallLogsCheck.bind(this);
    this.exportAllCallLogs = this.exportAllCallLogs.bind(this);
    this.exportAllMyCallLogs = this.exportAllMyCallLogs.bind(this);
    this.exportCurrentView = this.exportCurrentView.bind(this);
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
    let { maxPaginationHops, pageSelectionCount } = this.state;
    let pages = [];
    let totalPages = pagedCallLogs.totalPages;
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
    const { pagedCallLogs } = this.state;
    let { maxPaginationHops, pageSelectionCount } = this.state;
    let pages = [];
    let totalPages = pagedCallLogs.totalPages;
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
      onlyMyCallLogs,
    } = this.state;
    const pageSize = pagedCallLogs.pageable.pageSize;

    let statusQuery = this.statusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/call-logs-filtered-sorted/${page}/${pageSize}/${sortedField}/${sortOrder}/${fromDate}/${toDate}/${onlyMyCallLogs}?${statusQuery}`,
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
      onlyMyCallLogs,
    } = this.state;

    let statusQuery = this.statusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/call-logs-filtered-sorted/0/${size}/${sortedField}/${sortOrder}/${fromDate}/${toDate}/${onlyMyCallLogs}?${statusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedCallLogs: fetchedPage, currentPage: 0, currentPaginationHop: 1 });
    this.createPageArray();
  }

  async getSortedField(fieldName) {
    const {
      sortedField,
      pagedCallLogs,
      fromDate,
      toDate,
      statusFiltered,
      onlyMyCallLogs,
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
    `/api/call-logs-filtered-sorted/0/${pageSize}/${fieldName}/${sortOrder}/${fromDate}/${toDate}/${onlyMyCallLogs}?${statusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({
      pagedCallLogs: fetchedPage,
      currentPage: 0,
      currentPaginationHop: 1,
      sortedField: fieldName,
      sortOrder,
    });
    this.createPageArray();
  }

  async applyFilters() {
    const {
      pagedCallLogs,
      sortedField,
      sortOrder,
      fromDate,
      toDate,
      statusFiltered,
      onlyMyCallLogs,
    } = this.state;

    const pageSize = pagedCallLogs.pageable.pageSize;

    let statusQuery = this.statusesQueryURL(statusFiltered);

    const fetchedPage = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/call-logs-filtered-sorted/0/${pageSize}/${sortedField}/${sortOrder}/${fromDate}/${toDate}/${onlyMyCallLogs}?${statusQuery}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ pagedCallLogs: fetchedPage, currentPage: 0, currentPaginationHop: 1 });
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

  async handleOnlyMyCallLogsCheck (){
    let {onlyMyCallLogs} = this.state;
    console.log("Initial value: " + onlyMyCallLogs);
    await this.setState(prevState => ({
      onlyMyCallLogs: !prevState.onlyMyCallLogs
    }));
    let newState = this.state.onlyMyCallLogs;
    console.log("Final value: " + newState);
  }

  async exportAllCallLogs() {

    let { allCallLogsExportTrigger } = this.state;
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    if (allCallLogsExportTrigger === false){
 
      const exportedCallLogs = await (
        await fetch(
          "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          "/api/all-callLogs-export",
          {
            credentials: "include",
          }
          )
          ).json();
          
          const excelExport =  
          (
      <ExcelFile filename="All-CallLogs" hideElement={true} >
          <ExcelSheet data={exportedCallLogs} name="All-callLogs-export">
              <ExcelColumn label="Organization" value={(col) => col.callLog.org !== null ? col.callLog.org.orgName : ""}/>
              <ExcelColumn label="Contact" value={(col) => col.callLog.contact !== null ? col.callLog.contact.contactName : ""}/>
              <ExcelColumn label="Status" value={(col) => col.callLog.status !== null ? col.callLog.status.lastStatus : ""}/>
              <ExcelColumn label="Note" value="noteEntry"/>
              <ExcelColumn label="Date created" value="createDate"/>
              <ExcelColumn label="Created by" value={(col) => col.callLog.createdBy }/>
              <ExcelColumn label="Last modified on" value="lastModifiedDate"/>
              <ExcelColumn label="Last modified by" value={(col) => col.callLog.lastModifiedBy}/>
          </ExcelSheet>
      </ExcelFile> 
      );
      this.setState({allExportedCallLogs: excelExport, allCallLogsExportTrigger: true});
    }
    else {
      const excelExport = <span className="mono-font">"Please refresh browser & try again."</span> 
      this.setState({allExportedCallLogs: excelExport});
    }
  }

  async exportAllMyCallLogs() {

    let { allMyCallLogsExportTrigger } = this.state;
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    if (allMyCallLogsExportTrigger === false){
 
      const exportedCallLogs = await (
        await fetch(
          "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          "/api/all-my-callLogs-export",
          {
            credentials: "include",
          }
          )
          ).json();
          
          const excelExport =  
          (
      <ExcelFile filename="All-My-CallLogs" hideElement={true} >
          <ExcelSheet data={exportedCallLogs} name="All-my-callLogs-export">
              <ExcelColumn label="Organization" value={(col) => col.callLog.org !== null ? col.callLog.org.orgName : ""}/>
              <ExcelColumn label="Contact" value={(col) => col.callLog.contact !== null ? col.callLog.contact.contactName : ""}/>
              <ExcelColumn label="Status" value={(col) => col.callLog.status !== null ? col.callLog.status.lastStatus : ""}/>
              <ExcelColumn label="Note" value="noteEntry"/>
              <ExcelColumn label="Date created" value="createDate"/>
              <ExcelColumn label="Created by" value={(col) => col.callLog.createdBy }/>
              <ExcelColumn label="Last modified on" value="lastModifiedDate"/>
              <ExcelColumn label="Last modified by" value={(col) => col.callLog.lastModifiedBy}/>
          </ExcelSheet>
      </ExcelFile> 
      );
      this.setState({allMyExportedCallLogs: excelExport, allMyCallLogsExportTrigger: true});
    }
    else {
      const excelExport = <span className="mono-font">"Please refresh browser & try again."</span> 
      this.setState({allMyExportedCallLogs: excelExport});
    }
  }

  async exportCurrentView() {
    let {pagedCallLogs, callLogsViewExportTrigger} = this.state;
    let callLogsIdQueryURL = pagedCallLogs.content.map((callLog) => "cid=" + callLog.callId).join("&");

    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    if (callLogsViewExportTrigger === false){
 
      const exportedCallLogs = await (
        await fetch(
          "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/callLogs-view-export?${callLogsIdQueryURL}`,
          {
            credentials: "include",
          }
          )
          ).json();
          
          const excelExport =  
          (
      <ExcelFile filename="CallLogs-view" hideElement={true} >
          <ExcelSheet data={exportedCallLogs} name="callLogs-view-export">
              <ExcelColumn label="Organization" value={(col) => col.callLog.org !== null ? col.callLog.org.orgName : ""}/>
              <ExcelColumn label="Contact" value={(col) => col.callLog.contact !== null ? col.callLog.contact.contactName : ""}/>
              <ExcelColumn label="Status" value={(col) => col.callLog.status !== null ? col.callLog.status.lastStatus : ""}/>
              <ExcelColumn label="Note" value="noteEntry"/>
              <ExcelColumn label="Date created" value="createDate"/>
              <ExcelColumn label="Created by" value={(col) => col.callLog.createdBy }/>
              <ExcelColumn label="Last modified on" value="lastModifiedDate"/>
              <ExcelColumn label="Last modified by" value={(col) => col.callLog.lastModifiedBy}/>
          </ExcelSheet>
      </ExcelFile> 
      );
      this.setState({viewExportedCallLogs: excelExport, callLogsViewExportTrigger: true});
    }
    else {
      const excelExport = <span className="mono-font">"Please refresh browser & try again."</span> 
      this.setState({viewExportedCallLogs: excelExport});
    }
  }


  render() {
    const {
      pagedCallLogs,
      isLoading,
      pages,
      currentPage,
      currentPaginationHop,
      maxPaginationHops,
      dateRange,
      callLogStatuses,
      sortedField,
      sortOrder,
      dropdownOpen,
      onlyMyCallLogs,
    } = this.state;

    let { allExportedCallLogs, allMyExportedCallLogs, viewExportedCallLogs} = this.state;

    const firstPageHopCheck = currentPaginationHop > 1 ? "" : "disabled";
    const lastPageHopCheck =
      currentPaginationHop === maxPaginationHops ? "disabled" : "";
   
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
    const pageSizeArray = [10, 20, 50, 100, 200];
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
        <DropdownToggle caret>{pagedCallLogs.pageable.pageSize}</DropdownToggle>
        <DropdownMenu>{pageSizesDropDown}</DropdownMenu>
      </Dropdown>
    );

    //Sort Order arrows
    let cdArrow = null;
    let lmdArrow = null;
    let orgArrow = null;
    if (sortOrder !== null) {
      if (sortOrder === "asce") {
        if (sortedField === "createDate") {
          cdArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "org.orgname") {
          orgArrow = <ArrowUpwardIcon />;
        } else if (sortedField === "lastModifiedDate") {
          lmdArrow = <ArrowUpwardIcon />;
        } 
      } else if (sortOrder === "desc") {
        if (sortedField === "createDate") {
          cdArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "org.orgname") {
          orgArrow = <ArrowDownwardIcon />;
        } else if (sortedField === "lastModifiedDate") {
          lmdArrow = <ArrowDownwardIcon />;
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

    const onlyMyCallLogsCheckbox = (
      <CustomInput
      key={"onlyMyCallLogs"}
      bsSize="lg"
      checked={onlyMyCallLogs}
      type="checkbox"
      id={"onlyMyCallLogs"}
      label={"Show only my Call-Logs"}
      onChange={this.handleOnlyMyCallLogsCheck}
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
          <div className="paraSpace">{onlyMyCallLogsCheckbox}</div>
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
          <div className="headLineSpace float-right">
            <Button color="success" tag={Link} to="/callLog/new">
              Create Call Log
            </Button>
          </div>
          <div className="exportButton">
        <Accordion>
          <AccordionSummary
            expandIcon={<CloudDownloadIcon style={{ color: "#4287f5" }} />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
          <Typography className="petiteCaps">Export</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="row">
              <Button color="white" onClick={() => this.exportCurrentView()} ><DownloadIcon fontSize="small" /><span className="petiteCaps">Current View</span></Button>
              <div>{viewExportedCallLogs}</div>
            </div>
            <div className="row">
              <Button color="white" onClick={() => this.exportAllMyCallLogs()} ><DownloadIcon fontSize="small" /><span className="petiteCaps">All My Call-Logs</span></Button>
              <div>{allMyExportedCallLogs}</div>
            </div>
            <div className="row">
              <Button color="white" onClick={() => this.exportAllCallLogs()} ><DownloadIcon fontSize="small" /><span className="petiteCaps">All Call-Logs</span></Button>
              <div>{allExportedCallLogs}</div>
            </div>
          </AccordionDetails>
        </Accordion>
          </div>
        </Container>
        <Container>
          <h4 className="headLineSpace">My Call Logs</h4>

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
                <th width="10%">
                  Status set 
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
