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
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
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

  handleSelect(e, newValue) {
    let id = newValue ? newValue.OrgID : "-1";
    this.setState({ orgId: id });
    console.log("Handle Select Called" + " " + "New Value Id " + id);
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
    await fetch(`/api/event/${event.eventTypeDesc}/${orgId}`, {
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
    const { allOrgNames } = this.state;
    // Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
    const top100Films = [
      { title: "The Shawshank Redemption", id: 1 },
      { title: "The Godfather", id: 2 },
      { title: "The Godfather: Part II", id: 3 },
      { title: "The Dark Knight", id: 4 },
      { title: "12 Angry Men", id: 5 },
      { title: "Schindler's List", id: 6 },
      { title: "Pulp Fiction", id: 7 },
      { title: "The Lord of the Rings: The Return of the King", id: 8 },
    ];

    const title = <h3>{event.eventId ? "Edit Event" : "Add Event"}</h3>;

    let orgs = "";
    if (event.orgNames) {
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
                <Button size="sm" color="danger">
                  Remove Org
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
    }

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
