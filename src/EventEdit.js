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
  Alert,
} from "reactstrap";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Switch, FormControlLabel } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import AppNavbar from "./AppNavbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class EventEdit extends Component {
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
    eventAudienceType: [],
    orgNames: {},
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      event: this.emptyEvent,
      orgId: "-1",
      allOrgNames: [],
      eventUpdateAlert: false,
      newEventAlert: false,
      joinEve: false,
      csrfToken: cookies.get("XSRF-TOKEN"),
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.removeOrg = this.removeOrg.bind(this);
    this.joinEventSwitch = this.joinEventSwitch.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== "new") {
      const exEvent = await (
        await fetch(`/api/events/${this.props.match.params.id}`, {
          credentials: "include",
        })
      ).json();
      this.setState({ event: exEvent });
    }
    //load all Org names into this constant
    const fetchOrgs = await (
      await fetch(`/api/allorgnames`, { credentials: "include" })
    ).json();
    this.setState({ allOrgNames: fetchOrgs });
  }

  async removeOrg(eventId, orgId) {
    Object.filter = (obj, predicate) =>
      Object.fromEntries(Object.entries(obj).filter(predicate));

    await fetch(`/api/removeOrg/${eventId}/${orgId}`, {
      method: "DELETE",
      headers: {
        "X-XSRF-TOKEN": this.state.csrfToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(() => {
      let updatedOrgs = Object.filter(
        this.state.event.orgNames,
        ([id, name]) => id != orgId
      );
      this.setState({
        event: { ...this.state.event, orgNames: updatedOrgs },
      });
    });
  }

  joinEventSwitch() {
    console.log("Join Event Switch called: " + this.state.joinEve);
    if (this.state.joinEve === true) {
      const setSwitch = false;
      this.setState({ joinEve: setSwitch });
      console.log("Set to: " + this.state.joinEve);
      console.log("False called");
    } else {
      const setSwitch = true;
      this.setState({ joinEve: setSwitch });
      console.log("Set to: " + this.state.joinEve);
      console.log("True called");
      const { joinEve } = this.state;
      console.log(joinEve);
    }
    console.log("Switch set to: " + this.state.joinEve);
  }

  handleSelect(e, newValue) {
    let id = newValue ? newValue.OrgID : "-1";
    this.setState({ orgId: id });
  }

  handleStartDateChange(dateTime) {
    let dt = new Date(dateTime);
    let formattedDateTime = null;
    if (dateTime !== null) {
      let month =
        parseInt(dt.getMonth() + 1) > 9
          ? dt.getMonth() + 1
          : "0" + (dt.getMonth() + 1);
      let date = parseInt(dt.getDate()) > 9 ? dt.getDate() : "0" + dt.getDate();
      let hours =
        parseInt(dt.getHours()) > 9 ? dt.getHours() : "0" + dt.getHours();
      let minutes =
        parseInt(dt.getMinutes()) > 9 ? dt.getMinutes() : "0" + dt.getMinutes();
      formattedDateTime =
        dt.getFullYear() +
        "-" +
        month +
        "-" +
        date +
        "T" +
        hours +
        ":" +
        minutes +
        ":00";
    }
    console.log(formattedDateTime);
    let event = { ...this.state.event };
    event.startDateTime = formattedDateTime;
    this.setState({ event });
    console.log("Start Date time updated: " + event.startDateTime);
  }

  handleEndDateChange(dateTime) {
    let dt = new Date(dateTime);
    let formattedDateTime = null;
    if (dateTime !== null) {
      let month =
        parseInt(dt.getMonth() + 1) > 9
          ? dt.getMonth() + 1
          : "0" + (dt.getMonth() + 1);
      let date = parseInt(dt.getDate()) > 9 ? dt.getDate() : "0" + dt.getDate();
      let hours =
        parseInt(dt.getHours()) > 9 ? dt.getHours() : "0" + dt.getHours();
      let minutes =
        parseInt(dt.getMinutes()) > 9 ? dt.getMinutes() : "0" + dt.getMinutes();
      formattedDateTime =
        dt.getFullYear() +
        "-" +
        month +
        "-" +
        date +
        "T" +
        hours +
        ":" +
        minutes +
        ":00";
    }
    console.log(formattedDateTime);
    let event = { ...this.state.event };
    event.endDateTime = formattedDateTime;
    this.setState({ event });
    console.log("End Date time updated: " + event.endDateTime);
  }

  handleChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    let event = { ...this.state.event };
    console.log("Handle Change called: " + value + " " + name);
    event[name] = value;
    this.setState({ event });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { event } = this.state;
    const { orgId } = this.state;
    const { joinEve } = this.state;
    console.log("handleSubmit Called!");
    let headerEntries = "";
    let postId = "";

    event.eventPresenters = null; //making it null before the PUT call, creating a deserialization error in Jackson otherwise

    await fetch(`/api/event/${event.eventTypeDesc}/${orgId}/${joinEve}`, {
      method: event.eventId ? "PUT" : "POST",
      headers: {
        "X-XSRF-TOKEN": this.state.csrfToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(event),
    }).then((response) => {
      headerEntries = response.headers.entries();
    });

    if (event.eventId) {
      //For PUT Calls
      console.log("Alert condition called");
      this.setState({ eventUpdateAlert: true });
      window.scrollTo(0, 0);
      window.setTimeout(() => {
        this.setState({ eventUpdateAlert: false });
      }, 1000);
      await new Promise((r) => setTimeout(r, 1000));
      window.location.href = "/events/" + event.eventId;
    } else {
      //For POST Calls
      this.setState({ newEventAlert: true });
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 3000));
      for (var pair of headerEntries) {
        console.log(pair[0] + ": " + pair[1]);
        if (pair[0] === "location") {
          let loc = pair[1].toString();
          postId = loc.split("/").pop();
          console.log("Post Id: " + postId);
          window.location.href = "/event/read/" + postId;
          break;
        }
      }
    }
    // window.location.href = "/event/read/" + event.eventId;
  }

  render() {
    const { event } = this.state;
    const { allOrgNames } = this.state;
    const { eventUpdateAlert } = this.state;
    const { newEventAlert } = this.state;
    const dismissEventUpdateAlert = () =>
      this.setState({ eventUpdateAlert: false });
    const dismissNewEveAlert = () => this.setState({ newEventAlert: false });
    const title = <h3>{event.eventId ? "Edit Event" : "Add Event"}</h3>;

    let joinEventSwitch = "";

    if (!event.eventId) {
      joinEventSwitch = (
        <FormControlLabel
          control={
            <Switch
              checked={this.state.joinEve}
              onClick={() => this.joinEventSwitch()}
              name="joinEventSwitch"
              color="primary"
            />
          }
          label={<b>Join Event</b>}
        />
      );
    }

    //Orgs associated with this Event
    let orgs = "";
    if (Object.keys(event.orgNames).length > 0) {
      let orgList = "";
      orgList = Object.entries(event.orgNames).map(([key, value]) => {
        return (
          <tr key={key}>
            <td>{value}</td>
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
                <Button
                  size="sm"
                  color="danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to remove this Org.? Upon removing, the Org. will be disassociated from this Event but continue to exist in the Database."
                      )
                    )
                      this.removeOrg(event.eventId, key);
                  }}
                >
                  Remove
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        );
      });
      orgs = (
        <Container fluid>
          <div>
            <h5>Organization(s) part of this Event</h5>
            <Table responsive bordered dark hover>
              <thead>
                <tr>
                  <th width="20%">Name</th>
                  <th width="10%">Action</th>
                </tr>
              </thead>
              <tbody>{orgList}</tbody>
            </Table>
          </div>
        </Container>
      );
    } else if (this.props.match.params.id !== "new") {
      orgs = (
        <p>
          <br></br>
          <h6>
            <i>No Organization associated with this Event.</i>
          </h6>
          <br></br>
        </p>
      );
    } else {
      orgs = <p>&nbsp;</p>;
    }

    return (
      <div>
        <AppNavbar />
        {event.eventId ? (
          <Container>
            <div className="float-right">
              <Button color="success" href="/events/new">
                Add new event?
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
            isOpen={eventUpdateAlert}
            toggle={dismissEventUpdateAlert}
          >
            Event has been updated!
          </Alert>
          <Alert
            color="success"
            isOpen={newEventAlert}
            toggle={dismissNewEveAlert}
          >
            New Event is created! PLEASE WAIT FOR THE PAGE TO REFRESH!
          </Alert>
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label for="eventName">Name</Label>
              <Input
                type="text"
                name="eventName"
                id="eventName"
                value={event.eventName || ""}
                onChange={this.handleChange}
                autoComplete="eventName"
              />
            </FormGroup>
            <FormGroup>
              <Label for="location">
                Location <span className="required">*</span>
              </Label>
              <Input
                required
                type="text"
                name="location"
                id="location"
                value={event.location || ""}
                onChange={this.handleChange}
                autoComplete="location"
              />
            </FormGroup>
            <FormGroup>
              <Label for="address">Address</Label>
              <Input
                type="text"
                name="address"
                id="address"
                value={event.address || ""}
                onChange={this.handleChange}
                autoComplete="address-level1"
              />
            </FormGroup>
            <div className="row">
              <FormGroup className="col-md-3 mb-3">
                <Label for="city">City</Label>
                <Input
                  type="text"
                  name="city"
                  id="city"
                  value={event.city || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
              <FormGroup className="col-md-3 mb-3">
                <Label for="state">State</Label>
                <Input
                  type="text"
                  name="state"
                  id="state"
                  value={event.state || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>

              <FormGroup className="col-md-3 mb-3">
                <Label for="zip">Zip</Label>
                <Input
                  type="text"
                  name="zip"
                  id="zip"
                  value={event.zip || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
            </div>
            <div className="row">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker
                  clearable
                  label="Start Date/Time"
                  format="MM-dd-yyyy hh:mm a"
                  inputVariant="outlined"
                  value={event.startDateTime}
                  onChange={this.handleStartDateChange}
                />
                &nbsp;
                <DateTimePicker
                  clearable
                  label="End Date/Time"
                  format="MM-dd-yyyy hh:mm a"
                  inputVariant="outlined"
                  value={event.endDateTime}
                  onChange={this.handleEndDateChange}
                />
              </MuiPickersUtilsProvider>
            </div>
            <div className="row">
              <FormGroup className="col-md-2 mb-3">
                <Label for="audienceCount">Audience Count</Label>
                <Input
                  type="text"
                  name="audienceCount"
                  id="audienceCount"
                  value={event.audienceCount || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
              <FormGroup className="col-md-3 mb-3">
                <Label for="eventTypeDesc">
                  Event Type <span className="required">*</span>
                </Label>
                <Input
                  required
                  type="select"
                  name="eventTypeDesc"
                  id="eventTypeDesc"
                  value={event.eventTypeDesc || ""}
                  onChange={this.handleChange}
                  autoComplete="eventTypeDesc"
                >
                  <option></option>
                  <option>Presentation</option>
                  <option>Resource Fair</option>
                  <option>Virtual Presentation</option>
                </Input>
              </FormGroup>
            </div>
            <div className="row">
              <Autocomplete
                id="combo-box-demo"
                options={allOrgNames}
                getOptionLabel={(option) => option.orgname}
                renderOption={(option) => (
                  <React.Fragment>
                    {/* <span>{option.OrgID}</span> */}
                    {option.orgname}
                  </React.Fragment>
                )}
                onChange={this.handleSelect}
                style={{ width: 300 }}
                name="associatedOrg"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Link Org. with this Event"
                    variant="outlined"
                  />
                )}
              />
            </div>
            <React.Fragment>{orgs}</React.Fragment>
            <React.Fragment>{joinEventSwitch}</React.Fragment>
            <FormGroup>
              <Button color="primary" type="submit">
                Save Event
              </Button>{" "}
              <Button color="secondary" tag={Link} to="/events">
                Go back to Events
              </Button>
            </FormGroup>
          </Form>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </Container>
      </div>
    );
  }
}

export default withCookies(EventEdit);
