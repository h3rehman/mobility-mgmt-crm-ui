import React, { Component } from "react";
import { Button, ButtonGroup, Container, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";

class EventList extends Component {
  constructor(props) {
    super(props);
    this.state = { events: [], isLoading: true };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    fetch("/api/events")
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
      return (
        <tr key={event.eventId}>
          <td style={{ whiteSpace: "nowrap" }}>{event.location}</td>
          <td>
            {event.eventPresenters.map((presenter) => {
              return (
                <div>
                  {presenter} <br></br>
                </div>
              );
            })}
          </td>
          <td>{event.city}</td>
          <td>{event.startDateTime}</td>
          <td>{event.endDateTime}</td>
          <td>{event.eventTypeDesc}</td>
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
                <th width="10%">Start Time</th>
                <th width="10%">End Time</th>
                <th width="10%">Type</th>
                <th width="10%">Action</th>
              </tr>
            </thead>
            <tbody>{eventList}</tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default EventList;
