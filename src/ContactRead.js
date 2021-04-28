import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  ButtonGroup,
  Table,
} from "reactstrap";
import AppNavbar from "./AppNavbar";
import EditableLabel from "react-inline-editing";
import DeleteIcon from "@material-ui/icons/Delete";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import localConfig from "./localConfig.json";

class ContactRead extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  emptyContact = {
    contactId: "",
    firstName: "",
    lastName: "",
    title: "",
    phone: "",
    altPhone: "",
    email: "",
    contactOrgs: {},
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
      contact: this.emptyContact,
      contactNotes: [],
      noteObj: this.emptyNote,
      noteFormCheck: false,
      emptyNoteAlert: false,
      newNoteAlert: false,
      noteUpdateAlert: false,
      noteEditMode: false,
      csrfToken: cookies.get("XSRF-TOKEN"),
    };
    this.handleNoteSubmit = this.handleNoteSubmit.bind(this);
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this._handleFocusOut = this._handleFocusOut.bind(this);
    this.handleNoteEditClick = this.handleNoteEditClick.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
  }

  async componentDidMount() {
    const fetchedContact = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/contact/${this.props.match.params.id}`,
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
          `/api/contact/notes/${this.props.match.params.id}`,
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ contact: fetchedContact, contactNotes: fetchedNotes });
  }

  async handleNoteSubmit(e) {
    e.preventDefault();
    const { noteObj, contact } = this.state;

    if (noteObj.noteEntry === "") {
      this.setState({ emptyNoteAlert: true });
    } else {
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/contact/newNote/${contact.contactId}`,
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
        let updatedContactNotes = [...this.state.contactNotes];
        updatedContactNotes.push(noteObj);
        this.setState({ newNoteAlert: true });
        window.setTimeout(() => {
          this.setState({ newNoteAlert: false });
        }, 4000);
        this.setState({ contactNotes: updatedContactNotes });
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
      let updatedContactNotes = [...this.state.contactNotes].filter(
        (i) => i.noteId !== noteId
      );
      this.setState({ contactNotes: updatedContactNotes });
    });
  }

  render() {
    const {
      contact,
      contactNotes,
      noteFormCheck,
      emptyNoteAlert,
      newNoteAlert,
      noteUpdateAlert,
      noteEditMode,
    } = this.state;

    let cd = new Date(contact.createDate);
    let ld = new Date(contact.lastModifiedDate);

    const title = <h3>Contact Details</h3>;

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

    //Orgs associated with this Contact
    let orgs = "";
    if (Object.keys(contact.contactOrgs).length > 0) {
      let orgList = "";
      orgList = Object.entries(contact.contactOrgs).map(([key, value]) => {
        return (
          <tr key={key}>
            <td>
              {" "}
              <Link
                style={{ color: "white" }}
                target="_blank"
                to={"/organization/read/" + key}
              >
                <b>{value}</b>
              </Link>
            </td>
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
          <h5>Organization(s) the contact is part of:</h5>
          <Table responsive bordered dark hover className="small">
            <thead>
              <tr>
                <th width="75%">Name</th>
                <th width="25%">Action</th>
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
            <i>
              This contact is not associated with any Organization, click 'Edit
              Contact' to associate an Organization.
            </i>
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
      noteForm = (
        <Button size="sm" onClick={() => this.newNoteForm()}>
          Create contact note
        </Button>
      );
    }

    //Contact Notes table
    let notes = null;
    if (contactNotes.length > 0) {
      const noteList = contactNotes.map((note) => {
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
            <td className="small-font">
              {cd.toLocaleDateString()}{" "}
              {cd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td className="small-font">
              {note.createdBy ? note.createdBy.name : null}{" "}
              {note.createdBy ? note.createdBy.lastName : null}
            </td>
            <td className="small-font">
              {lmd.toLocaleDateString()}{" "}
              {lmd.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td className="small-font">
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
          <h6>Note(s) on {contact.firstName}</h6>
          <Table responsive className="small" bordered hover>
            <thead>
              <tr>
                <th width="44%">
                  Comments{" "}
                  <span className="mono-font">(Click on note to edit)</span>
                </th>
                <th width="5%">Date Created</th>
                <th width="10%">Created by</th>
                <th width="5%">Last modified</th>
                <th width="10%">Last modified by</th>
                <th width="5%">Action</th>
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

    return (
      <div>
        <AppNavbar />
        <Container>
          <div className="float-right">
            <Button
              color="primary"
              href={"/contact/" + this.props.match.params.id}
            >
              Edit Contact
            </Button>
            &nbsp;&nbsp;
            <Button color="success" href="/contact/new">
              Create new Contact?
            </Button>
          </div>
        </Container>
        <Container>
          {title}
          <div className="detailsBlock">
            <div className="row paraSpace">
              <div>
                <span className="field">First name: </span> {contact.firstName}
              </div>
              <div>
                <span className="field fieldSpace">Last name:</span>{" "}
                {contact.lastName}
              </div>
            </div>
            <div className="row paraSpace">
              <span className="field">Title:</span> {contact.title}
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">Email:</span> {contact.email}
              </div>
              <div>
                <span className="field fieldSpace">Phone:</span> {contact.phone}
              </div>
              <div>
                <span className="field fieldSpace">Alt. Phone:</span>{" "}
                {contact.altPhone}
              </div>
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">Created by:</span> {contact.createdBy}
              </div>
              <div>
                <span className="field fieldSpace">Created on:</span>
                {cd.toLocaleDateString()}{" "}
                {cd.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">Last modified by:</span>
                {contact.lastModifiedBy}
              </div>
              <div>
                <span className="field fieldSpace">Last modified on:</span>
                {ld.toLocaleDateString()}{" "}
                {ld.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div className="row paraSpace">{orgs}</div>
            <div>
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
              <div className="paraSpace">{noteForm}</div>
              <div className="headLineSpace">{notes}</div>
            </div>
            <p>&nbsp;</p>
          </div>
        </Container>
      </div>
    );
  }
}

export default withCookies(ContactRead);
