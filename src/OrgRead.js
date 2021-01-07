import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  ButtonGroup,
  Table,
  Form,
  FormGroup,
  Input,
  Label,
  Alert,
} from "reactstrap";
import EditableLabel from "react-inline-editing";
import DeleteIcon from "@material-ui/icons/Delete";
import AppNavbar from "./AppNavbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class OrgRead extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  emptyItem = {
    orgId: "",
    orgname: "",
    address: "",
    city: "",
    phone: "",
    countyName: "",
    email: "",
    zip: "",
    orgContacts: [],
    eventOrgs: [],
  };

  emptyNote = {
    noteId: null,
    noteEntry: "",
    createDate: null,
    lastModifiedDate: null,
  };

  updatedNote = {
    noteId: null,
    noteEntry: "",
  };

  focusedNoteId = null;

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      item: this.emptyItem,
      orgNotes: [],
      noteObj: this.emptyNote,
      noteFormCheck: false,
      emptyNoteAlert: false,
      newNoteAlert: false,
      noteUpdateAlert: false,
      noteEditMode: false,
      callLogsViewCheck: false,
      callLogList: [],
      csrfToken: cookies.get("XSRF-TOKEN"),
    };
    this.handleNoteSubmit = this.handleNoteSubmit.bind(this);
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this._handleFocusOut = this._handleFocusOut.bind(this);
    this.handleNoteEditClick = this.handleNoteEditClick.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
    this.enableCallLogView = this.enableCallLogView.bind(this);
  }

  async componentDidMount() {
    const org = await (
      await fetch(`/api/organizations/${this.props.match.params.id}`, {
        credentials: "include",
      })
    ).json();
    const notes = await (
      await fetch(`/api/org/notes/${this.props.match.params.id}`, {
        credentials: "include",
      })
    ).json();
    this.setState({ item: org, orgNotes: notes });
  }

  async handleNoteSubmit(event) {
    event.preventDefault();
    const { noteObj } = this.state;

    if (noteObj.noteEntry === "") {
      //Empty field alert
      this.setState({ emptyNoteAlert: true });
      window.setTimeout(() => {
        this.setState({ emptyNoteAlert: false });
      }, 4000);
    } else {
      const { item } = this.state;
      await fetch(`/api/org/newNote/${item.orgId}`, {
        method: "POST",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(noteObj),
      }).then((response) => {
        let headerEntries = response.headers.entries();
        for (var pair of headerEntries) {
          if (pair[0] === "location") {
            let loc = pair[1].toString();
            let newNoteId = loc.split("/").pop();
            noteObj.noteId = newNoteId;
            noteObj.createDate = new Date();
            noteObj.lastModifiedDate = new Date();
            break;
          }
        }
        let updatedOrgNotes = [...this.state.orgNotes];
        updatedOrgNotes.push(noteObj);
        this.setState({ newNoteAlert: true });
        window.setTimeout(() => {
          this.setState({ newNoteAlert: false });
        }, 4000);
        this.setState({ orgNotes: updatedOrgNotes });
        this.setState({ noteFormCheck: false, noteObj: this.emptyNote });
      });
    }
  }

  handleNoteChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let newNoteObj = { ...this.state.noteObj };
    newNoteObj[name] = value;
    this.setState({ noteObj: newNoteObj });
  }

  async newNoteForm() {
    await this.setState({ noteFormCheck: true });
  }

  _handleFocusOut(text) {
    this.updatedNote.noteEntry = text;
  }

  handleNoteEditClick(noteId) {
    this.focusedNoteId = noteId;
    this.setState({ noteEditMode: true });
  }

  async updateNote(noteId) {
    this.updatedNote.noteId = noteId;
    await fetch(`/api/editNote/${noteId}`, {
      method: "PUT",
      headers: {
        "X-XSRF-TOKEN": this.state.csrfToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(this.updatedNote),
    }).then(() => {
      //Alert Note updated
      this.setState({ noteUpdateAlert: true });
      this.updatedNote = this.emptyNote;
      window.setTimeout(() => {
        this.setState({ noteUpdateAlert: false });
      }, 4000);
      this.setState({ noteEditMode: false });
      this.focusedNoteId = null;
    });
  }

  async deleteNote(noteId) {
    await fetch(`/api/deleteNote/${noteId}`, {
      method: "DELETE",
      headers: {
        "X-XSRF-TOKEN": this.state.csrfToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(() => {
      let updatedOrgNotes = [...this.state.orgNotes].filter(
        (i) => i.noteId !== noteId
      );
      this.setState({ orgNotes: updatedOrgNotes });
    });
  }

  async enableCallLogView() {
    let callLogListResult = "";
    const fetchedCallLogList = await (
      await fetch(`/api/org/callLogNotes/${this.props.match.params.id}`, {
        credentials: "include",
      })
    ).json();
    if (fetchedCallLogList.length < 1) {
      callLogListResult = (
        <span className="mono-font larger-font">
          No call logs were found...
        </span>
      );
    } else {
      callLogListResult = fetchedCallLogList.map((note) => {
        let lmd = new Date(note.lastModifiedDate);
        let cd = new Date(note.createDate);
        return (
          <tr key={note.noteId}>
            <td style={{ whiteSpace: "nowrap" }}>{note.noteEntry}</td>
            <td>
              {cd.toLocaleDateString()}{" "}
              {cd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td>
              {note.createdByFirstName} {note.createdByLastName}
            </td>
            <td>
              {lmd.toLocaleDateString()}{" "}
              {lmd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td>
              {note.lastModifiedByFirstName} {note.lastModifiedByLastName}
            </td>
            <td>
              <ButtonGroup>
                <Button
                  size="sm"
                  color="primary"
                  href={"/callLog/" + note.callId}
                >
                  View Log
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        );
      });
    }
    this.setState({ callLogList: callLogListResult, callLogsViewCheck: true });
  }

  render() {
    const { item } = this.state;
    const { orgNotes } = this.state;
    const { emptyNoteAlert } = this.state;
    const { newNoteAlert } = this.state;
    const { noteUpdateAlert } = this.state;
    const dismissEmtpyNoteAlert = () =>
      this.setState({ emptyNoteAlert: false });
    const dismissNewNoteAlert = () => this.setState({ newNoteAlert: false });
    const dismissNoteUpdateAlert = () =>
      this.setState({ noteUpdateAlert: false });
    const { noteEditMode } = this.state;
    let { noteFormCheck } = this.state;
    const { callLogsViewCheck } = this.state;
    const { callLogList } = this.state;

    const title = <h4>Organization Details</h4>;

    let contacts = "";
    if (item.orgContacts.length > 0) {
      const contactList = item.orgContacts.map((contact) => {
        return (
          <tr key={contact.contactId}>
            <td style={{ whiteSpace: "nowrap" }}>{contact.firstName}</td>
            <td>{contact.lastName}</td>
            <td>{contact.title}</td>
            <td>{contact.email}</td>
            <td>{contact.phone}</td>
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
      contacts = (
        <div>
          <h6>Contact List for {item.orgname}</h6>
          <Table responsive className="small" bordered hover>
            <thead>
              <tr>
                <th width="5%">First Name</th>
                <th width="5%">Last Name</th>
                <th width="5%">Title</th>
                <th width="5%">Email</th>
                <th width="5%">Phone</th>
                <th width="5%">Action</th>
              </tr>
            </thead>
            <tbody>{contactList}</tbody>
          </Table>
        </div>
      );
    } else {
      contacts = (
        <p>
          <h6>
            <i>
              No contact associated with this Organization, to add a contact
              click on Edit Org. button.
            </i>
          </h6>
          <br></br>
        </p>
      );
    }

    //Upcoming Events Table
    var eventCounter = 0;
    let date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth();
    let d = date.getDate();
    let today = new Date(y, m, d);
    let upEvents = "";
    let upEventsList = "";
    if (item.eventOrgs.length > 0) {
      upEventsList = item.eventOrgs.map((event) => {
        var eventDate = new Date(event.startDateTime);
        if (eventDate >= today) {
          eventCounter = eventCounter + 1;
          return (
            <tr key={event.eventId}>
              <td style={{ whiteSpace: "nowrap" }}>{event.location}</td>
              <td>{event.startDateTime}</td>
              <td>{event.endDateTime}</td>
              <td>{event.eventTypeDesc}</td>
              <td>
                {event.eventPresenters.map((presenter) => {
                  return presenter;
                })}
              </td>
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
        }
      });
      if (eventCounter > 0) {
        upEvents = (
          <div>
            <h6>Upcoming Events with {item.orgname}</h6>
            <Table responsive className="small" bordered hover>
              <thead>
                <tr>
                  <th width="5%">Location</th>
                  <th width="5%">Start Date/Time</th>
                  <th width="5%">End Date/Time</th>
                  <th width="5%">Type</th>
                  <th width="5%">Presenter(s)</th>
                  <th width="5%">Action</th>
                </tr>
              </thead>
              <tbody>{upEventsList}</tbody>
            </Table>
          </div>
        );
      }
    }
    if (eventCounter < 1) {
      upEvents = (
        <p>
          <h6>
            <i>No Upcoming Events with {item.orgname}.</i>
          </h6>
          <br></br>
        </p>
      );
    }

    //Past events
    eventCounter = 0; //reset to zero
    let pastEvents = "";
    let pastEventsList = "";
    if (item.eventOrgs.length > 0) {
      pastEventsList = item.eventOrgs.map((event) => {
        var eventDate = new Date(event.startDateTime);
        if (eventDate < today) {
          eventCounter = eventCounter + 1;
          let sd = event.startDateTime ? new Date(event.startDateTime) : null;
          let ed = event.endDateTime ? new Date(event.endDateTime) : null;
          return (
            <tr key={event.eventId}>
              <td style={{ whiteSpace: "nowrap" }}>{event.location}</td>
              <td>
                {sd ? sd.toLocaleDateString() : null}{" "}
                {sd
                  ? sd.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null}
              </td>
              <td>
                {ed ? ed.toLocaleDateString() : null}{" "}
                {ed
                  ? ed.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null}
              </td>
              <td>{event.eventTypeDesc}</td>
              <td>
                {event.eventPresenters.map((presenter) => {
                  return (
                    <div>
                      {presenter} <br></br>
                    </div>
                  );
                })}
              </td>
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
        }
      });
      if (eventCounter > 0) {
        pastEvents = (
          <div>
            <h6>Past Events with {item.orgname}</h6>
            <Table responsive className="small" bordered hover>
              <thead>
                <tr>
                  <th width="5%">Location</th>
                  <th width="5%">Start Date/Time</th>
                  <th width="5%">End Date/Time</th>
                  <th width="5%">Type</th>
                  <th width="5%">Presenter(s)</th>
                  <th width="5%">Action</th>
                </tr>
              </thead>
              <tbody>{pastEventsList}</tbody>
            </Table>
          </div>
        );
      }
    }
    if (eventCounter < 1) {
      pastEvents = (
        <p>
          <h6>
            <i>No Past Events with {item.orgname}.</i>
          </h6>
          <br></br>
        </p>
      );
    }

    //Note form for new notes
    let noteForm = null;
    if (noteFormCheck) {
      noteForm = (
        <Form onSubmit={this.handleNoteSubmit}>
          <FormGroup>
            <Label for="noteEntry">New note</Label>
            <Input
              type="textarea"
              name="noteEntry"
              id="noteEntry"
              onChange={this.handleNoteChange}
            />
          </FormGroup>
          <FormGroup>
            <Button size="sm" color="primary" type="submit">
              Save Note
            </Button>
          </FormGroup>
        </Form>
      );
    } else {
      noteForm = <Button onClick={() => this.newNoteForm()}>Add Note</Button>;
    }

    //Organization Notes table
    let notes = null;
    if (orgNotes.length > 0) {
      const noteList = orgNotes.map((note) => {
        let lmd = new Date(note.lastModifiedDate);
        let cd = new Date(note.createDate);
        return (
          <tr key={note.noteId}>
            {/* <td style={{ whiteSpace: "nowrap" }}>{note.noteEntry}</td> */}
            <td style={{ whiteSpace: "nowrap" }}>
              <EditableLabel
                text={note.noteEntry}
                labelClassName={`note-label-${note.noteId}`}
                inputClassName={`note-class-${note.noteId}`}
                inputWidth="500px"
                inputHeight="30px"
                inputMaxLength="100"
                labelFontWeight="normal"
                inputFontWeight="bold"
                onFocus={() => this.handleNoteEditClick(note.noteId)}
                onFocusOut={this._handleFocusOut}
              />
            </td>
            <td>
              {cd.toLocaleDateString()}{" "}
              {cd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td>
              {note.createdByFirstName} {note.createdByLastName}
            </td>
            <td>
              {lmd.toLocaleDateString()}{" "}
              {lmd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td>
              {note.lastModifiedByFirstName} {note.lastModifiedByLastName}
            </td>
            <td>
              <ButtonGroup>
                <Button
                  style={{
                    display:
                      note.noteId === this.focusedNoteId && noteEditMode
                        ? "block"
                        : "none",
                  }}
                  size="sm"
                  color="primary"
                  onClick={() => this.updateNote(note.noteId)}
                >
                  Update
                </Button>{" "}
                <DeleteIcon
                  className="delete-icon"
                  color="action"
                  onClick={() => {
                    if (
                      window.confirm(
                        "This will permanently delete this note. Are you sure?"
                      )
                    )
                      this.deleteNote(note.noteId);
                  }}
                />
              </ButtonGroup>
            </td>
          </tr>
        );
      });
      notes = (
        <div>
          <h6>Note(s) for {item.orgname}</h6>
          <Table responsive className="small" bordered hover>
            <thead>
              <tr>
                <th width="44%">
                  Comments{" "}
                  <span className="mono-font">(Click on note to edit)</span>
                </th>
                <th width="5%">Date Created</th>
                <th width="13%">Created by</th>
                <th width="5%">Last modified</th>
                <th width="13%">Last modified by</th>
                <th width="20%">Action</th>
              </tr>
            </thead>
            <tbody>{noteList}</tbody>
          </Table>
        </div>
      );
    } else {
      notes = (
        <p>
          <h6>
            <i>Add Comments.</i>
          </h6>
        </p>
      );
    }

    //Call Logs Table for Org
    const callLogsView = callLogsViewCheck ? (
      <div>
        <h6>Call Log(s) for {item.orgname}</h6>
        <Table responsive className="small" bordered hover>
          <thead>
            <tr>
              <th width="40%">Comments </th>
              <th width="13%">Date Created</th>
              <th width="12%">Created by</th>
              <th width="13%">Last modified</th>
              <th width="12%">Last modified by</th>
              <th width="10%">Action</th>
            </tr>
          </thead>
          <tbody>{callLogList}</tbody>
        </Table>
      </div>
    ) : (
      <div>
        <Button size="sm" onClick={() => this.enableCallLogView()}>
          View Call Logs
        </Button>
      </div>
    );

    return (
      <div>
        <AppNavbar />
        <Container>
          <div className="float-right">
            <Button color="primary" href={"/organizations/" + item.orgId}>
              Edit Org.
            </Button>
            &nbsp;&nbsp;
            <Button color="success" href="/organizations/new">
              Add new Organization?
            </Button>
          </div>
        </Container>
        <Container>
          {title}
          <div className="detailsBlock">
            <div className="row paraSpace">
              <span className="field">Name:</span> {item.orgname}
            </div>
            <div className="row paraSpace">
              <span className="field">Address:</span> {item.address}
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">City:</span> {item.city}
              </div>
              <div>
                <span className="field fieldSpace">County:</span>
                {item.countyName}
              </div>
              <div>
                <span className="field fieldSpace">Zip:</span> {item.zip}
              </div>
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">Corporate Phone:</span> {item.phone}
              </div>
              <div>
                <span className="field fieldSpace">Corporate Email:</span>
                {item.email}
              </div>
            </div>
          </div>
          <div>{contacts}</div>
          <React.Fragment>
            <p>
              <div>{upEvents}</div>
            </p>
          </React.Fragment>
          <React.Fragment>
            <p>
              <div>{pastEvents}</div>
            </p>
          </React.Fragment>
          <div>
            <Alert
              color="success"
              isOpen={newNoteAlert}
              toggle={dismissNewNoteAlert}
            >
              A new note is created.
            </Alert>
          </div>
          <div>
            <Alert
              color="warning"
              isOpen={emptyNoteAlert}
              toggle={dismissEmtpyNoteAlert}
            >
              Note cannot be empty!
            </Alert>
          </div>
          <div>{noteForm}</div>
          <React.Fragment>
            <div>
              <Alert
                color="info"
                isOpen={noteUpdateAlert}
                toggle={dismissNoteUpdateAlert}
              >
                Note is updated.
              </Alert>
            </div>
            <div>{notes}</div>
          </React.Fragment>
          <div>{callLogsView}</div>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </Container>
      </div>
    );
  }
}
export default withCookies(OrgRead);
