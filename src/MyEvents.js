import React, { Component } from "react";
import { Button, ButtonGroup, Container, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import localConfig from "./localConfig.json";

class MyEvents extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      events: [],
      isLoading: true,
      csrfToken: cookies.get("XSRF-TOKEN"),
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        "/api/appointments",
      { credentials: "include" }
    )
      .then((response) => response.json())
      .then((data) => this.setState({ events: data, isLoading: false }));
  }

  render() {
    const { events, isLoading } = this.state;

    if (isLoading) {
      return (
        <div>
          <img class="loading" src="/loading.gif" alt="Loading..." />
        </div>
      );
    }

    const myEvents = events.map((event) => {
      let cd = new Date(event.startDateTime);
      let ld = new Date(event.endDateTime);
      return (
        <tr key={event.eventId}>
          <td className="small-font" style={{ whiteSpace: "nowrap" }}>
            {event.eventName}
          </td>
          <td className="small-font">
            <Link to={"/event/read/" + event.eventId}>{event.location}</Link>
          </td>
          <td className="small-font">{event.city}</td>
          <td className="small-font">{event.zip}</td>
          <td className="small-font">
            {cd.toLocaleDateString()}{" "}
            {cd.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td className="small-font">
            {ld.toLocaleDateString()}{" "}
            {ld.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td className="small-font">{event.eventTypeDesc}</td>
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
    });

    return (
      <div>
        <AppNavbar />
        <Container>
          <div className="float-right">
            <Button color="success" tag={Link} to="/events/new">
              Add Event
            </Button>
          </div>
        </Container>
        <Container>
          <h4>My Outreach Schedule</h4>
          <Table className="mt-4">
            <thead>
              <tr>
                <th width="10%">Event Name</th>
                <th width="18%">Location</th>
                <th width="10%">City</th>
                <th width="7%">Zip</th>
                <th width="13%">Start Time</th>
                <th width="13%">End Time</th>
                <th width="10%">Type</th>
                <th width="5%">Action</th>
              </tr>
            </thead>
            <tbody>{myEvents}</tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default withCookies(MyEvents);
