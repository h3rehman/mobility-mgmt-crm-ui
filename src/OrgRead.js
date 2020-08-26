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
} from "reactstrap";
import AppNavbar from "./AppNavbar";

class OrgRead extends Component {
  emptyItem = {
    orgId: "",
    orgname: "",
    address: "",
    city: "",
    phone: "",
    countyName: "",
    email: "",
    zip: "",
    orgContacts: [],
    eventOrgs: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      item: this.emptyItem,
    };
  }

  async componentDidMount() {
    const org = await (
      await fetch(`/api/organizations/${this.props.match.params.id}`)
    ).json();
    this.setState({ item: org });
  }

  render() {
    const { item } = this.state;
    const title = <h4>Organization Details</h4>;

    let contacts = "";

    if (item.orgContacts.length > 0) {
      const contactList = item.orgContacts.map((contact) => {
        return (
          <tr key={contact.contactId}>
            <td style={{ whiteSpace: "nowrap" }}>{contact.firstName}</td>
            <td>{contact.lastName}</td>
            <td>{contact.title}</td>
            <td>{contact.email}</td>
            <td>{contact.phone}</td>
            <td>
              <ButtonGroup>
                <Button
                  size="sm"
                  color="primary"
                  tag={Link}
                  to={"/contacts/" + contact.contactId}
                >
                  Edit
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        );
      });
      contacts = (
        <div>
          <h6>Contact List for {item.orgname}</h6>
          <Table responsive className="small" bordered hover>
            <thead>
              <tr>
                <th width="5%">First Name</th>
                <th width="5%">Last Name</th>
                <th width="5%">Title</th>
                <th width="5%">Email</th>
                <th width="5%">Phone</th>
                <th width="5%">Action</th>
              </tr>
            </thead>
            <tbody>{contactList}</tbody>
          </Table>
        </div>
      );
    } else {
      contacts = (
        <p>
          <h6>
            <i>
              No contact associated with this Organization, to add a contact
              click on Edit Org. button.
            </i>
          </h6>
          <br></br>
        </p>
      );
    }

    //Upcoming Events Table
    var eventCounter = 0;
    let date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth();
    let d = date.getDate();
    let today = new Date(y, m, d);
    let upEvents = "";
    let upEventsList = "";
    if (item.eventOrgs.length > 0) {
      upEventsList = item.eventOrgs.map((event) => {
        var eventDate = new Date(event.startDateTime);
        if (eventDate >= today) {
          eventCounter = eventCounter + 1;
          return (
            <tr key={event.eventId}>
              <td style={{ whiteSpace: "nowrap" }}>{event.location}</td>
              <td>{event.startDateTime}</td>
              <td>{event.endDateTime}</td>
              <td>{event.eventType}</td>
              <td>
                {event.eventPresenters.map((presenter) => {
                  return presenter;
                })}
              </td>
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
        }
      });
      if (eventCounter > 0) {
        upEvents = (
          <div>
            <h6>Upcoming Events with {item.orgname}</h6>
            <Table responsive className="small" bordered hover>
              <thead>
                <tr>
                  <th width="5%">Location</th>
                  <th width="5%">Start Date/Time</th>
                  <th width="5%">End Date/Time</th>
                  <th width="5%">Type</th>
                  <th width="5%">Presenter(s)</th>
                  <th width="5%">Action</th>
                </tr>
              </thead>
              <tbody>{upEventsList}</tbody>
            </Table>
          </div>
        );
      }
    }
    if (eventCounter < 1) {
      upEvents = (
        <p>
          <h6>
            <i>No Upcoming Events with {item.orgname}.</i>
          </h6>
          <br></br>
        </p>
      );
    }

    //Past events
    eventCounter = 0; //reset to zero
    let pastEvents = "";
    let pastEventsList = "";
    if (item.eventOrgs.length > 0) {
      pastEventsList = item.eventOrgs.map((event) => {
        var eventDate = new Date(event.startDateTime);
        if (eventDate < today) {
          eventCounter = eventCounter + 1;
          return (
            <tr key={event.eventId}>
              <td style={{ whiteSpace: "nowrap" }}>{event.location}</td>
              <td>{event.startDateTime}</td>
              <td>{event.endDateTime}</td>
              <td>{event.eventType}</td>
              <td>
                {event.eventPresenters.map((presenter) => {
                  return (
                    <div>
                      {presenter} <br></br>
                    </div>
                  );
                })}
              </td>
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
        }
      });
      if (eventCounter > 0) {
        pastEvents = (
          <div>
            <h6>Past Events with {item.orgname}</h6>
            <Table responsive className="small" bordered hover>
              <thead>
                <tr>
                  <th width="5%">Location</th>
                  <th width="5%">Start Date/Time</th>
                  <th width="5%">End Date/Time</th>
                  <th width="5%">Type</th>
                  <th width="5%">Presenter(s)</th>
                  <th width="5%">Action</th>
                </tr>
              </thead>
              <tbody>{pastEventsList}</tbody>
            </Table>
          </div>
        );
      }
    }
    if (eventCounter < 1) {
      pastEvents = (
        <p>
          <h6>
            <i>No Past Events with {item.orgname}.</i>
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
            <Button color="primary" href={"/organizations/" + item.orgId}>
              Edit Org.
            </Button>
            &nbsp;&nbsp;
            <Button color="success" href="/organizations/new">
              Add new Organization?
            </Button>
          </div>
        </Container>
        <Container>
          {title}
          <div className="detailsBlock">
            <div className="row paraSpace">
              <span className="field">Name:</span> {item.orgname}
            </div>
            <div className="row paraSpace">
              <span className="field">Address:</span> {item.address}
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">City:</span> {item.orgname}
              </div>
              <div>
                <span className="field fieldSpace">County:</span>{" "}
                {item.countyName}
              </div>
              <div>
                <span className="field fieldSpace">Zip:</span> {item.zip}
              </div>
            </div>
            <div className="row paraSpace">
              <div>
                <span className="field">Corporate Phone:</span> {item.phone}
              </div>
              <div>
                <span className="field fieldSpace">Corporate Email:</span>{" "}
                {item.email}
              </div>
            </div>
          </div>
          <div>{contacts}</div>
          <React.Fragment>
            <p>
              <div>{upEvents}</div>
            </p>
          </React.Fragment>
          <React.Fragment>
            <p>
              <div>{pastEvents}</div>
            </p>
          </React.Fragment>
        </Container>
      </div>
    );
  }
}
export default withRouter(OrgRead);
