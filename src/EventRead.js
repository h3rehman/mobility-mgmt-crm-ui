import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Button, Container, ButtonGroup, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";

class EventRead extends Component {
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
    };
  }

  async componentDidMount() {
    const exEvent = await (
      await fetch(`/api/events/${this.props.match.params.id}`)
    ).json();
    this.setState({ event: exEvent });
  }

  render() {
    const { event } = this.state;
    const title = <h3>Event Details</h3>;
    //Orgs associated with this event
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
              Add new event?
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
                {event.startDateTime}
              </div>
              <div>
                <span className="field fieldSpace">End Date/Time:</span>
                {event.endDateTime}
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
            </div>
          </div>
          <div>{orgs}</div>
        </Container>
      </div>
    );
  }
}

export default withRouter(EventRead);
