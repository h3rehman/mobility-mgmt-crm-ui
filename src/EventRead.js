import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Button, Container, ButtonGroup, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

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

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      event: this.emptyEvent,
      csrfToken: cookies.get("XSRF-TOKEN"),
      eventJoined: false,
    };
  }

  async componentDidMount() {
    const exEvent = await (
      await fetch(`/api/events/${this.props.match.params.id}`, {
        credentials: "include",
      })
    ).json();

    this.setState({ event: exEvent });
    const eveJoined = await (
      await fetch(`/api/checkPresenter/${this.props.match.params.id}`, {
        credentials: "include",
      })
    ).json();
    this.setState({ eventJoined: eveJoined });
  }

  async joinEvent() {
    const { event } = this.state;
    console.log("Join Event Called!");

    await fetch(`/api/joinevent/${event.eventId}`, {
      method: "PUT",
      headers: {
        "X-XSRF-TOKEN": this.state.csrfToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(() => {
      this.setState({ eventJoined: true });
    });
    window.location.href = "/event/read/" + event.eventId;
  }

  async removePresenter(eventId) {
    await fetch(`/api/removePresenter/${eventId}`, {
      method: "DELETE",
      headers: {
        "X-XSRF-TOKEN": this.state.csrfToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(() => {
      this.setState({ eventJoined: false });
    });
    window.location.href = "/event/read/" + eventId;
  }

  render() {
    const { event } = this.state;
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

          <div>
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
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </Container>
      </div>
    );
  }
}

export default withCookies(EventRead);
