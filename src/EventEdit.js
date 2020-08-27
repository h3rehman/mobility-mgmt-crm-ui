import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
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
import AppNavbar from "./AppNavbar";

class EventEdit extends Component {
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
    this.state = {
      event: this.emptyEvent,
      orgId: "-1",
      allOrgNames: [],
      eventUpdateAlert: false,
      newEventAlert: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.removeOrg = this.removeOrg.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== "new") {
      const exEvent = await (
        await fetch(`/api/events/${this.props.match.params.id}`)
      ).json();
      this.setState({ event: exEvent });
    }
    //load all Org names into this constant
    const fetchOrgs = await (await fetch(`/api/allorgnames`)).json();
    this.setState({ allOrgNames: fetchOrgs });
  }

  async removeOrg(eventId, orgId) {
    Object.filter = (obj, predicate) =>
      Object.fromEntries(Object.entries(obj).filter(predicate));

    await fetch(`/api/removeOrg/${eventId}/${orgId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
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

  handleSelect(e, newValue) {
    let id = newValue ? newValue.OrgID : "-1";
    this.setState({ orgId: id });
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
    console.log("handleSubmit Called!");
    let headerEntries = "";
    let postId = "";
    await fetch(`/api/event/${event.eventTypeDesc}/${orgId}`, {
      method: event.eventId ? "PUT" : "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
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
          window.location.href = "/events/" + postId;
          break;
        }
      }
    }
    // this.props.history.push("/events");
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
              <FormGroup className="col-md-3 mb-3">
                <Label for="startDate">Start Date</Label>
                <Input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={event.startDateTime || ""}
                  onChange={this.handleChange}
                  autoComplete="startDate"
                ></Input>
              </FormGroup>
              <FormGroup className="col-md-3 mb-3">
                <Label for="endDate">End Date</Label>
                <Input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={event.endDateTime || ""}
                  onChange={this.handleChange}
                  autoComplete="endDate"
                ></Input>
              </FormGroup>
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
                    <span>{option.OrgID}</span>
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

export default withRouter(EventEdit);
