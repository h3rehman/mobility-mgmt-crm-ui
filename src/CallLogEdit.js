import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Alert,
} from "reactstrap";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AppNavbar from "./AppNavbar";
import EditableLabel from "react-inline-editing";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class CallLogEdit extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  emptyNote = {
    noteId: null,
    noteEntry: "",
    callLog: {
      callId: null,
      org: {
        orgId: null,
        orgName: null,
      },
      contact: {
        contactId: null,
        contactName: "",
      },
      createdBy: "",
      lastModifiedBy: "",
      lastStatusDate: "",
      createDate: "",
      lastModifiedDate: "",
      status: {
        lastStatusId: null,
        lastStatus: "",
      },
    },
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      allOrgNames: [],
      orgContacts: [],
      note: this.emptyNote,
      orgId: "-1",
      contactId: "-1",
      lastStatusId: "-1",
      keepContact: "none",
      keepOrg: "none",
      keepStatus: "none",
      noteFormCheck: false,
      logUpdateAlert: false,
      newLogAlert: false,
      orgButton: "none",
      contactButton: "none",
      statusButton: "none",
      orgStatusTypes: null,
      csrfToken: cookies.get("XSRF-TOKEN"),
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOrgSelect = this.handleOrgSelect.bind(this);
    this.handleContactSelect = this.handleContactSelect.bind(this);
    this.changeOrg = this.changeOrg.bind(this);
    this.changeContact = this.changeContact.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
    this._handleNoteFocusOut = this._handleNoteFocusOut.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== "new") {
      const exCallLogNote = await (
        await fetch(`/api/callLog-detail/${this.props.match.params.id}`, {
          credentials: "include",
        })
      ).json();
      this.setState({
        note: exCallLogNote,
        orgButton: "block",
        contactButton: "block",
        statusButton: "block",
      });
      //Update state on 2nd step as simultaneous state update would not effect below
      this.setState({
        orgId: this.state.note.callLog.org.orgId,
        contactId: this.state.note.callLog.contact.contactId,
        lastStatusId: this.state.note.callLog.status.lastStatusId,
      });
    }
    //load all Org names into this constant with a condition
    else {
      const fetchOrgs = await (
        await fetch(`/api/allorgnames`, { credentials: "include" })
      ).json();

      const fetchedOrgStatusType = await (
        await fetch(`/api/orgStatusTypes`, { credentials: "include" })
      ).json();

      this.setState({
        allOrgNames: fetchOrgs,
        orgStatusTypes: fetchedOrgStatusType,
        keepOrg: "block",
        keepStatus: "block",
        keepContact: "block",
      });
    }
  }

  _handleNoteFocusOut(updatedText) {
    this.setState({
      note: { ...this.state.note, noteEntry: updatedText },
    });
  }

  async handleOrgSelect(e, newValue) {
    let id = newValue ? newValue.OrgID : -1;
    this.setState({ orgId: id });
    if (id !== -1) {
      const exOrgContacts = await (
        await fetch(`/api/orgContacts/${id}`, {
          credentials: "include",
        })
      ).json();
      this.setState({ orgContacts: exOrgContacts, keepContact: "block" });
      if (this.props.match.params.id === "new") {
        this.setState({ noteFormCheck: true });
      }
      //Display Contact select options
    } else {
      this.setState({
        noteFormCheck: false,
        orgContacts: [],
        keepContact: "none",
      });
    }
  }

  handleContactSelect(e, newValue) {
    let id = newValue ? newValue.contactId : "-1";
    this.setState({ contactId: id });
  }

  handleChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    if (name === "noteEntry") {
      this.setState({
        note: { ...this.state.note, noteEntry: value },
      });
    } else if (name === "lastStatus") {
      console.log("Status: " + value);
      var index = e.nativeEvent.target.selectedIndex;
      console.log("Option ID: " + e.nativeEvent.target[index].id);
      this.setState({ lastStatusId: e.nativeEvent.target[index].id });
      let { note } = this.state;
      note.callLog.status.lastStatus = value;
      this.setState({ note });
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    let { note } = this.state;
    note.callLog.status.lastStatus = null;
    const { orgId } = this.state;
    const { contactId } = this.state;
    const { lastStatusId } = this.state;
    let headerEntries = "";
    let postId = "";

    await fetch(`/api/callLogChange/${orgId}/${contactId}/${lastStatusId}`, {
      method: note.callLog.callId ? "PUT" : "POST",
      headers: {
        "X-XSRF-TOKEN": this.state.csrfToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(note),
    }).then((response) => {
      headerEntries = response.headers.entries();
    });

    if (note.callLog.callId) {
      //For PUT Calls
      this.setState({ logUpdateAlert: true });
      window.scrollTo(0, 0);
      window.setTimeout(() => {
        this.setState({ logUpdateAlert: false });
      }, 1000);
      await new Promise((r) => setTimeout(r, 1000));
      window.location.href = "/callLog/" + note.callLog.callId;
    } else {
      //For POST Calls
      this.setState({ newLogAlert: true });
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 2000));
      for (var pair of headerEntries) {
        if (pair[0] === "location") {
          let loc = pair[1].toString();
          postId = loc.split("/").pop();
          console.log("Post Id: " + postId);
          window.location.href = "/callLog/" + postId;
          break;
        }
      }
    }
  }

  async changeOrg() {
    const { allOrgNames } = this.state;
    if (allOrgNames.length === 0) {
      const fetchOrgs = await (
        await fetch(`/api/allorgnames`, { credentials: "include" })
      ).json();
      this.setState({ allOrgNames: fetchOrgs });
    }
    this.setState({ keepOrg: "block", orgButton: "none" });
  }

  async changeContact() {
    const { orgContacts } = this.state;
    if (orgContacts.length === 0) {
      const { orgId } = this.state;
      console.log("OrgId: " + orgId);
      console.log("State OrgId: " + this.state.note.callLog.org.orgId);
      const exOrgContacts = await (
        await fetch(`/api/orgContacts/${orgId}`, {
          credentials: "include",
        })
      ).json();
      this.setState({ orgContacts: exOrgContacts });
    }
    this.setState({ keepContact: "block", contactButton: "none" });
  }

  async changeStatus() {
    const fetchedOrgStatusType = await (
      await fetch(`/api/orgStatusTypes`, { credentials: "include" })
    ).json();
    this.setState({
      orgStatusTypes: fetchedOrgStatusType,
      keepStatus: "block",
      statusButton: "none",
    });
  }

  render() {
    const { note } = this.state;
    const callLog = note.callLog;
    const { allOrgNames } = this.state;
    const { orgContacts } = this.state;
    const { orgStatusTypes } = this.state;
    const { logUpdateAlert } = this.state;
    const { newLogAlert } = this.state;
    const { noteFormCheck } = this.state;
    const { keepContact } = this.state;
    const { keepOrg } = this.state;
    const { keepStatus } = this.state;
    const { orgButton } = this.state;
    const { contactButton } = this.state;
    const { statusButton } = this.state;
    const noteMaxLength = 100;
    const dismissLogUpdateAlert = () =>
      this.setState({ logUpdateAlert: false });
    const dismissNewLogAlert = () => this.setState({ newLogAlert: false });
    const title = (
      <h4 className="paraSpace">
        {callLog.callId ? "Call Log" : "Add Call Log"}
      </h4>
    );

    let cd = new Date(callLog.createDate);
    let ld = new Date(callLog.lastModifiedDate);

    const logDetails = callLog.callId ? (
      <div className="detailsBlock">
        <div className="row paraSpace">
          <div>
            <span className="field">Organization:</span>{" "}
            <b>{callLog.org.orgName}</b>
          </div>
          <div className="field fieldSpace">
            <Button
              className="fieldSpace"
              outline
              style={{ display: orgButton }}
              size="sm"
              onClick={() => this.changeOrg()}
            >
              Edit Org.
            </Button>
          </div>
        </div>
        <div className="row paraSpace">
          <span className="field">Contact Person:</span>{" "}
          {callLog.contact.contactName}
          <div className="field fieldSpace">
            <Button
              outline
              style={{ display: contactButton }}
              size="sm"
              onClick={() => this.changeContact()}
            >
              Edit Contact
            </Button>
          </div>
        </div>
        <div className="row paraSpace">
          <span className="field">Status set:</span>
          {callLog.status.lastStatus}
          <div className="fieldSpace">
            <Button
              className="fieldSpace"
              outline
              style={{ display: statusButton }}
              size="sm"
              onClick={() => this.changeStatus()}
            >
              Edit Status
            </Button>
          </div>
        </div>
        <div className="row paraSpace">
          <div className="small-font">
            <span className="field">Created by:</span> {callLog.createdBy}
          </div>
          <div className="small-font">
            <span className="field fieldSpace">Created on:</span>
            {cd.toLocaleDateString()}{" "}
            {cd.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div className="row paraSpace">
          <div className="small-font">
            <span className="field">Last modified by:</span>{" "}
            {callLog.lastModifiedBy}
          </div>
          <div className="small-font">
            <span className="field fieldSpace">Last modified on:</span>
            {ld.toLocaleDateString()}{" "}
            {ld.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div className="row paraSpace">
          <div className="small-font">
            <span className="field">
              <span className="larger-font">
                <b>Note: </b>
              </span>
              <span className="mono-font">(Click below to edit note)</span>
            </span>{" "}
            <EditableLabel
              text={note.noteEntry}
              labelClassName={`callLog-note-label`}
              inputClassName={`callLog-note-class`}
              inputWidth="500px"
              inputHeight="100px"
              inputMaxLength={noteMaxLength}
              labelFontWeight="normal"
              inputFontWeight="bold"
              onFocusOut={this._handleNoteFocusOut}
            />
          </div>
        </div>
      </div>
    ) : (
      ""
    );

    //Note form
    let noteForm = null;
    if (noteFormCheck) {
      noteForm = (
        <div className="row">
          <FormGroup>
            <Label for="noteEntry">Note/Comments</Label>
            <Input
              type="textarea"
              name="noteEntry"
              id="noteEntry"
              onChange={this.handleChange}
            />
          </FormGroup>
        </div>
      );
    } else {
      noteForm = "";
    }

    //Iterating Status types options
    let statusOptions = null;
    if (orgStatusTypes !== null) {
      statusOptions = orgStatusTypes.map((status) => {
        return <option id={status.statusId}>{status.statusDesc}</option>;
      });
    } else {
      statusOptions = "";
    }

    //Set required for Org Status field if new form
    let statusRequireCheck = callLog.callId ? "required" : null;

    return (
      <div>
        <AppNavbar />
        {callLog.callId ? (
          <Container>
            <div className="float-right">
              <Button color="success" href="/callLog/new">
                Add new Call Log?
              </Button>
            </div>
          </Container>
        ) : (
          ""
        )}
        <Container>
          {title}
          <Alert
            color="info"
            isOpen={logUpdateAlert}
            toggle={dismissLogUpdateAlert}
          >
            Call Log has been updated!
          </Alert>
          <Alert
            color="success"
            isOpen={newLogAlert}
            toggle={dismissNewLogAlert}
          >
            New Call Log is created! PLEASE WAIT FOR THE PAGE TO REFRESH!
          </Alert>

          <Form onSubmit={this.handleSubmit}>
            <div className="row paraSpace">
              <div style={{ display: keepOrg }}>
                <Autocomplete
                  id="associatedOrg"
                  options={allOrgNames}
                  getOptionLabel={(option) => option.orgname}
                  renderOption={(option) => (
                    <React.Fragment>
                      {/* <span>{option.OrgID}</span> */}
                      {option.orgname}
                    </React.Fragment>
                  )}
                  onChange={this.handleOrgSelect}
                  style={{ width: 300 }}
                  name="associatedOrg"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Organization"
                      variant="outlined"
                    />
                  )}
                />
              </div>
            </div>
            <div className="row paraSpace">
              <div style={{ display: keepContact }}>
                <Autocomplete
                  id="associatedContact"
                  options={orgContacts}
                  getOptionLabel={(option) =>
                    option.firstName + " " + option.lastName
                  }
                  renderOption={(option) => (
                    <React.Fragment>
                      {option.firstName} {option.lastName} {" | "}{" "}
                      {option.title}
                    </React.Fragment>
                  )}
                  onChange={this.handleContactSelect}
                  style={{ width: 300 }}
                  name="associatedContact"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select contact person"
                      variant="outlined"
                    />
                  )}
                />
              </div>
            </div>
            <div className="row paraSpace" style={{ display: keepStatus }}>
              <FormGroup className="col-md-3 mb-3">
                <Label for="lastStatus">
                  Org. Status <span className="required">*</span>
                </Label>
                <Input
                  {...statusRequireCheck}
                  type="select"
                  name="lastStatus"
                  id="lastStatus"
                  value={callLog.status.lastStatus || ""}
                  onChange={this.handleChange}
                  autoComplete="lastStatus"
                >
                  {statusOptions}
                </Input>
              </FormGroup>
            </div>
            <div>{logDetails}</div>
            <div>{noteForm}</div>
            <FormGroup>
              <Button color="primary" type="submit">
                Save Call Log
              </Button>{" "}
              <Button color="secondary" tag={Link} to="/callLogs/myLogs">
                Go back to my call logs
              </Button>
            </FormGroup>
          </Form>
        </Container>
      </div>
    );
  }
}

export default withCookies(CallLogEdit);
