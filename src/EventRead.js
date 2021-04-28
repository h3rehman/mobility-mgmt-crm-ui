import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  ButtonGroup,
  Table,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput,
} from "reactstrap";
import EditableLabel from "react-inline-editing";
import DeleteIcon from "@material-ui/icons/Delete";
import InsertInvitationIcon from "@material-ui/icons/InsertInvitation";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import AppNavbar from "./AppNavbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import localConfig from "./localConfig.json";

class EventRead extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  emptyEvent = {
    eventId: "",
    eventName: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    startDateTime: "",
    endDateTime: "",
    rtaStaffCount: "",
    audienceCount: "",
    eventTypeDesc: "",
    eventPresenters: [],
    eventaudienceType: [],
    orgNames: {},
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
      event: this.emptyEvent,
      eventNotes: [],
      noteObj: this.emptyNote,
      noteFormCheck: false,
      emptyNoteAlert: false,
      newNoteAlert: false,
      noteUpdateAlert: false,
      noInviteeSelectedAlert: false,
      inviteSentAlert: false,
      inviteErrorAlert: false,
      noteEditMode: false,
      csrfToken: cookies.get("XSRF-TOKEN"),
      eventJoined: false,
      activePresenters: null,
      invitees: [],
      inviteMessage: "",
    };
    this.handleNoteSubmit = this.handleNoteSubmit.bind(this);
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this._handleFocusOut = this._handleFocusOut.bind(this);
    this.handleNoteEditClick = this.handleNoteEditClick.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
    this.getAcitvePresenters = this.getAcitvePresenters.bind(this);
    this.sendInvites = this.sendInvites.bind(this);
    this.addInvitees = this.addInvitees.bind(this);
    this.handleInviteAccordion = this.handleInviteAccordion.bind(this);
    this.handleInviteMessage = this.handleInviteMessage.bind(this);
  }

  async componentDidMount() {
    const exEvent = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/events/${this.props.match.params.id}`,
        {
          credentials: "include",
        }
      )
    ).json();

    this.setState({ event: exEvent });
    const eveJoined = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/checkPresenter/${this.props.match.params.id}`,
        {
          credentials: "include",
        }
      )
    ).json();

    const fetchedNotes = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/event/notes/${this.props.match.params.id}`,
        {
          credentials: "include",
        }
      )
    ).json();

    this.setState({ eventNotes: fetchedNotes, eventJoined: eveJoined });
  }

  async getAcitvePresenters() {
    const fetchedPresenters = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          "/api/activePresenters",
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ activePresenters: fetchedPresenters });
  }

  addInvitees = (presenterId) => (e) => {
    let { invitees } = this.state;
    if (e.target.checked === true) {
      invitees.push(presenterId);
    } else {
      invitees = invitees.filter((x) => x !== presenterId);
    }
    this.setState({ invitees });
  };

  async sendInvites() {
    let { event, invitees, inviteMessage } = this.state;

    if (invitees.length < 1) {
      this.setState({ noInviteeSelectedAlert: true });
      window.setTimeout(() => {
        this.setState({ noInviteeSelectedAlert: false });
      }, 8000);
    } else {
      const queryURLInvitees = invitees
        .map((presenterId) => {
          return "presenter=" + presenterId;
        })
        .join("&");

      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/send-invite/${event.eventName}/${inviteMessage}/${event.location}/${event.eventId}?${queryURLInvitees}`,
        {
          credentials: "include",
        }
      ).then(async (response) => {
        //const data = await response.json();
        // check for error response
        if (!response.ok) {
          this.setState({ inviteErrorAlert: true });
          window.setTimeout(() => {
            this.setState({ inviteErrorAlert: false });
          }, 10000);
        } else {
          this.setState({ inviteSentAlert: true });
          window.setTimeout(() => {
            this.setState({ inviteSentAlert: false });
          }, 10000);
        }
      });
    }
  }

  async handleInviteAccordion() {
    let { activePresenters } = this.state;
    if (activePresenters === null) {
      this.getAcitvePresenters();
    }
  }

  handleInviteMessage(e) {
    const target = e.target;
    const value = target.value;
    this.setState({ inviteMessage: value });
  }

  async joinEvent() {
    const { event } = this.state;

    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/joinevent/${event.eventId}`,
      {
        method: "PUT",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    ).then(() => {
      this.setState({ eventJoined: true });
    });
    window.location.href = "/event/read/" + event.eventId;
  }

  async removePresenter(eventId) {
    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/removePresenter/${eventId}`,
      {
        method: "DELETE",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    ).then(() => {
      this.setState({ eventJoined: false });
    });
    window.location.href = "/event/read/" + eventId;
  }

  async handleNoteSubmit(e) {
    e.preventDefault();
    const { noteObj, event } = this.state;

    if (noteObj.noteEntry === "") {
      //Empty field alert
      this.setState({ emptyNoteAlert: true });
      // window.setTimeout(() => {
      //   this.setState({ emptyNoteAlert: false });
      // }, 4000);
    } else {
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/event/newNote/${event.eventId}`,
        {
          method: "POST",
          headers: {
            "X-XSRF-TOKEN": this.state.csrfToken,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(noteObj),
        }
      ).then((response) => {
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
        let updatedEventNotes = [...this.state.eventNotes];
        updatedEventNotes.push(noteObj);
        this.setState({ newNoteAlert: true });
        window.setTimeout(() => {
          this.setState({ newNoteAlert: false });
        }, 4000);
        this.setState({ eventNotes: updatedEventNotes });
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
    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/editNote/${noteId}`,
      {
        method: "PUT",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(this.updatedNote),
      }
    ).then(() => {
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
    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/deleteNote/${noteId}`,
      {
        method: "DELETE",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    ).then(() => {
      let updatedEventNotes = [...this.state.eventNotes].filter(
        (i) => i.noteId !== noteId
      );
      this.setState({ eventNotes: updatedEventNotes });
    });
  }

  render() {
    const {
      event,
      eventNotes,
      noteFormCheck,
      emptyNoteAlert,
      newNoteAlert,
      noteUpdateAlert,
      noInviteeSelectedAlert,
      inviteSentAlert,
      inviteErrorAlert,
      noteEditMode,
      activePresenters,
      showPresentersToast,
    } = this.state;

    const dismissEmtpyNoteAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ emptyNoteAlert: false });
    };
    const dismissNewNoteAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ newNoteAlert: false });
    };
    const dismissNoteUpdateAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ noteUpdateAlert: false });
    };
    const dismissNoInviteeSelectedAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ noInviteeSelectedAlert: false });
    };
    const dismissInviteSentAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ inviteSentAlert: false });
    };
    const dismissInviteErrorAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ inviteErrorAlert: false });
    };

    const title = <h3>Event Details</h3>;

    let cd = new Date(event.startDateTime);
    let ld = new Date(event.endDateTime);

    let eventAudience = null;
    if (event.eventaudienceType.length > 0) {
      const audTypes = event.eventaudienceType.map((audType) => {
        return <li>{audType}</li>;
      });
      eventAudience = <ul>{audTypes}</ul>;
    } else {
      eventAudience = "No audience type specified for this event.";
    }

    //Orgs associated with this event
    let orgs = "";
    if (Object.keys(event.orgNames).length > 0) {
      let orgList = "";
      orgList = Object.entries(event.orgNames).map(([key, value]) => {
        return (
          <tr key={key}>
            <td>
              {" "}
              <Link
                style={{ color: "white" }}
                target="_blank"
                to={"/organization/read/" + key}
              >
                <b>{value[0]}</b>
              </Link>
            </td>
            <td>{value[1]}</td>
            <td>
              <ButtonGroup>
                <Button
                  size="sm"
                  color="primary"
                  tag={Link}
                  to={"/organizations/" + key}
                >
                  Edit
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        );
      });
      orgs = (
        <div>
          <h6>Organization(s) part of this Event</h6>
          <Table responsive bordered dark hover className="small">
            <thead>
              <tr>
                <th width="20%">Name</th>
                <th width="10%">Last Status</th>
                <th width="10%">Action</th>
              </tr>
            </thead>
            <tbody>{orgList}</tbody>
          </Table>
        </div>
      );
    } else {
      orgs = (
        <p>
          <br></br>
          <h6>
            <i>No Organization associated with this event.</i>
          </h6>
          <br></br>
        </p>
      );
    }

    let presenters = "";
    let presenterList = "";
    if (event.eventPresenters.length > 0) {
      presenterList = event.eventPresenters.map((presenter) => {
        return (
          <tr key={presenter}>
            <td style={{ whiteSpace: "nowrap" }}>{presenter}</td>
          </tr>
        );
      });
      presenters = (
        <div>
          <h6>Event Presenter(s)</h6>
          <Table responsive bordered hover className="small">
            <thead>
              <tr>
                <th width="5%">Name</th>
              </tr>
            </thead>
            <tbody>{presenterList}</tbody>
          </Table>
        </div>
      );
    } else {
      presenters = (
        <p>
          <h6>
            <i>No Presenter has joined this event.</i>
          </h6>
          <br></br>
          <p>&nbsp;</p>
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
      noteForm = (
        <Button size="sm" onClick={() => this.newNoteForm()}>
          Create event note
        </Button>
      );
    }

    //Event Notes table
    let notes = null;
    if (eventNotes.length > 0) {
      const noteList = eventNotes.map((note) => {
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
                inputMaxLength={100}
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
              {note.createdBy ? note.createdBy.name : null}{" "}
              {note.createdBy ? note.createdBy.lastName : null}
            </td>
            <td>
              {lmd.toLocaleDateString()}{" "}
              {lmd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td>
              {note.lastModifiedBy ? note.lastModifiedBy.name : null}{" "}
              {note.lastModifiedBy ? note.lastModifiedBy.lastName : null}
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
          <h6>Note(s) for {event.eventName}</h6>
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
            <i>No notes created.</i>
          </h6>
        </p>
      );
    }

    //Toast for sending event invites.
    let eventInviteSpace = null;
    if (activePresenters !== null) {
      eventInviteSpace = activePresenters.map((presenter) => {
        return (
          <CustomInput
            key={presenter.presenterId}
            type="checkbox"
            id={presenter.presenterId}
            label={
              presenter.name +
              " " +
              presenter.lastName +
              " (" +
              presenter.email +
              ")"
            }
            onChange={this.addInvitees(presenter.presenterId)}
          />
        );
      });
    } else if (showPresentersToast === true) {
      eventInviteSpace = (
        <div className="mono-font">
          Error occurred in retrieving Presenters.
        </div>
      );
    }

    return (
      <div>
        <AppNavbar />
        <Container>
          <div className="float-right">
            <Button color="primary" href={"/events/" + event.eventId}>
              Edit event
            </Button>
            &nbsp;&nbsp;
            <Button color="success" href="/events/new">
              Create new event?
            </Button>
          </div>
        </Container>
        <Container>
          {title}
          <div className="detailsBlock">
            <div className="row paraSpace">
              <span className="field">Event name: </span> {event.eventName}
            </div>
            <div className="row paraSpace">
              <span className="field">Location:</span> {event.location}
            </div>
            <div className="row paraSpace">
              <span className="field">Address:</span> {event.address}
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">City:</span> {event.city}
              </div>
              <div>
                <span className="field fieldSpace">State:</span> {event.state}
              </div>
              <div>
                <span className="field fieldSpace">Zip:</span> {event.zip}
              </div>
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">Start Date/Time:</span>
                {cd.toLocaleDateString()}{" "}
                {cd.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <span className="field fieldSpace">End Date/Time:</span>
                {ld.toLocaleDateString()}{" "}
                {ld.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">Audience Count:</span>
                {event.audienceCount}
              </div>
              <div>
                <span className="field fieldSpace">Event type:</span>
                {event.eventTypeDesc}
              </div>
              <div>
                <span className="field fieldSpace">Status:</span>
                {event.lastStatus}
              </div>
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">Audience Type(s):</span>
                {eventAudience}
              </div>
            </div>
          </div>
          <div>{orgs}</div>
          <div>{presenters}</div>

          <div className="headLineSpace">
            {this.state.eventJoined ? (
              <Button
                size="sm"
                color="warning"
                onClick={() => this.removePresenter(event.eventId)}
              >
                Remove me from Event
              </Button>
            ) : (
              <Button size="sm" color="info" onClick={() => this.joinEvent()}>
                <b>Join Event</b>
              </Button>
            )}
          </div>
          <div className="row headLineSpace">
            <div>
              <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={inviteSentAlert}
                autoHideDuration={12000}
                onClose={dismissInviteSentAlert}
              >
                <Alert
                  variant="outlined"
                  severity="success"
                  className="success-color"
                  onClose={dismissInviteSentAlert}
                >
                  <b>Invite sent!</b>
                </Alert>
              </Snackbar>
            </div>
            <div>
              <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={inviteErrorAlert}
                autoHideDuration={12000}
                onClose={dismissInviteErrorAlert}
              >
                <Alert
                  variant="outlined"
                  severity="error"
                  className="error-color"
                  onClose={dismissInviteErrorAlert}
                >
                  <strong>
                    SORRY! Something went wrong with the invite, please try
                    again or contact IT Support.
                  </strong>
                </Alert>
              </Snackbar>
            </div>
            <div>
              <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                open={noInviteeSelectedAlert}
                autoHideDuration={12000}
                onClose={dismissNoInviteeSelectedAlert}
              >
                <Alert
                  variant="outlined"
                  severity="warning"
                  className="warning-color"
                  onClose={dismissNoInviteeSelectedAlert}
                >
                  Please have atleast one Presenter selected to send the invite.
                </Alert>
              </Snackbar>
            </div>
            <Accordion>
              <AccordionSummary
                expandIcon={<InsertInvitationIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                onClick={() => this.handleInviteAccordion()}
              >
                <Typography>Send Calendar Invites... </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="paraSpace">{eventInviteSpace}</div>
                <div className="row">
                  <FormGroup>
                    <Label for="inviteMessage">Invite Message</Label>
                    <Input
                      cols="50"
                      type="textarea"
                      name="inviteMessage"
                      id="inviteMessage"
                      onChange={this.handleInviteMessage}
                    />
                  </FormGroup>
                </div>
                <div>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => this.sendInvites()}
                  >
                    <b>Send Invite</b>
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
          <div>
            <Snackbar
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              open={newNoteAlert}
              autoHideDuration={6000}
              onClose={dismissNewNoteAlert}
            >
              <Alert
                variant="outlined"
                severity="success"
                className="success-color"
                onClose={dismissNewNoteAlert}
              >
                <strong>A new note is created.</strong>
              </Alert>
            </Snackbar>
          </div>
          <div>
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              open={emptyNoteAlert}
              autoHideDuration={6000}
              onClose={dismissEmtpyNoteAlert}
            >
              <Alert
                variant="outlined"
                severity="warning"
                className="warning-color"
                onClose={dismissEmtpyNoteAlert}
              >
                <strong>Note cannot be empty!</strong>
              </Alert>
            </Snackbar>
          </div>
          <div>
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              open={noteUpdateAlert}
              autoHideDuration={6000}
              onClose={dismissNoteUpdateAlert}
            >
              <Alert
                variant="outlined"
                severity="info"
                className="info-color"
                onClose={dismissNoteUpdateAlert}
              >
                <strong>Note is updated.</strong>
              </Alert>
            </Snackbar>
          </div>
          <div>
            <div className="paraSpace">{noteForm}</div>
            <div className="paraSpace">{notes}</div>
          </div>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </Container>
      </div>
    );
  }
}

export default withCookies(EventRead);
