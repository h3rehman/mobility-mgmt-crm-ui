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
    orgNames: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      event: this.emptyEvent,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== "new") {
      const exEvent = await (
        await fetch(`/api/events/${this.props.match.params.id}`)
      ).json();
      this.setState({ event: exEvent });
    }
  }

  handleChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    let event = { ...this.state.event };
    event[name] = value;
    this.setState({ event });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { event } = this.state;
    console.log("handleSubmit Called!");
    await fetch(`/api/event/${event.eventTypeDesc}`, {
      method: event.eventId ? "PUT" : "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
    // this.props.history.push("/events");
  }

  render() {
    const { event } = this.state;

    const title = <h3>{event.eventId ? "Edit Event" : "Add Event"}</h3>;

    return (
      <div>
        <AppNavbar />
        {event.eventId ? (
          <Container>
            <div className="float-right">
              <Button color="success" href="/events/new">
                Add new Event instead?
              </Button>
            </div>
          </Container>
        ) : (
          ""
        )}
        <Container>
          {title}

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
                Location <span class="required">*</span>
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
                  Event Type <span class="required">*</span>
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
                  <option>Vitual Presentation</option>
                </Input>
              </FormGroup>
            </div>

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
