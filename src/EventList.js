import React, { Component } from "react";
import { Button, ButtonGroup, Container, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class EventList extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      events: [],
      csrfToken: cookies.get("XSRF-TOKEN"),
      isLoading: true,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    fetch("/api/events", { credentials: "include" })
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

    const eventList = events.map((event) => {
      let cd = new Date(event.startDateTime);
      let ld = new Date(event.endDateTime);
      return (
        <tr key={event.eventId}>
          <td style={{ whiteSpace: "nowrap" }}>
            <Link to={"/event/read/" + event.eventId}>{event.location}</Link>
          </td>
          <td>
            {event.eventPresenters.map((presenter) => {
              return (
                <div className="small-font">
                  {presenter} <br></br>
                </div>
              );
            })}
          </td>
          <td className="small-font">{event.city}</td>
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
          <h3>Events</h3>
          <Table className="mt-4">
            <thead>
              <tr>
                <th width="15%">Location</th>
                <th width="10%">Presenter(s)</th>
                <th width="10%">City</th>
                <th width="12%">Start Time</th>
                <th width="12%">End Time</th>
                <th width="10%">Type</th>
                <th width="5%">Action</th>
              </tr>
            </thead>
            <tbody>{eventList}</tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default withCookies(EventList);
