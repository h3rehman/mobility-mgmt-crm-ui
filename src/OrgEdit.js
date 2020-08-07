import React, { Component, useState } from "react";
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

class OrgEdit extends Component {
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
    upcomingEvents: [],
    pastEvents: [],
  };

  emptyContact = {
    contactId: "",
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      item: this.emptyItem,
      conObj: this.emptyContact,
      contactFormCheck: false,
      addContactButton: "none",
      orgUpdateAlert: false,
      newOrgAlert: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.remove = this.remove.bind(this);
    this.addContactRow = this.addContactRow.bind(this);
    this.handleConChange = this.handleConChange.bind(this);
    this.handleConSubmit = this.handleConSubmit.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== "new") {
      const org = await (
        await fetch(`/api/organizations/${this.props.match.params.id}`)
      ).json();
      this.setState({ item: org });
      this.setState({ addContactButton: "block" });
    }
  }

  //manages state for contact form
  handleConChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let newConObj = { ...this.state.conObj };
    newConObj[name] = value;
    this.setState({ conObj: newConObj });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let item = { ...this.state.item };
    item[name] = value;
    this.setState({ item });
  }

  async handleConSubmit(event) {
    event.preventDefault();
    const { conObj } = this.state;
    const { item } = this.state;
    console.log("handleConSubmit Called!");

    await fetch(`/api/orgContact/${item.orgId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conObj),
    });
    window.location.href = "/organizations/" + item.orgId;
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { item } = this.state;
    console.log("handleSubmit Called!");
    let headerEntries = "";
    let postId = "";
    await fetch(`/api/organization/${item.countyName}`, {
      method: item.orgId ? "PUT" : "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    }).then((response) => {
      headerEntries = response.headers.entries();
    });

    if (item.orgId) {
      //For PUT Calls
      console.log("Alert condition called");
      this.setState({ orgUpdateAlert: true });
      window.scrollTo(0, 0);
      window.setTimeout(() => {
        this.setState({ orgUpdateAlert: false });
      }, 4000);
    } else {
      //For POST Calls
      this.setState({ newOrgAlert: true });
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 3000));
      for (var pair of headerEntries) {
        console.log(pair[0] + ": " + pair[1]);
        if (pair[0] === "location") {
          let loc = pair[1].toString();
          postId = loc.split("/").pop();
          console.log("Post Id: " + postId);

          window.location.href = "/organizations/" + postId;
          break;
        }
      }
    }
    // this.props.history.push("/organizations");   --> does not works the as requires a double GET instead used window.location above
  }

  async addContactRow() {
    await this.setState({ contactFormCheck: true });
    this.setState({ addContactButton: "none" });
  }

  async cancelForm() {
    await this.setState({ contactFormCheck: false });
    this.setState({ addContactButton: "block" });
  }

  async remove(orgId, contactId) {
    await fetch(`/api/orgContact/${orgId}/${contactId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then(() => {
      let updatedContacts = [...this.state.item.orgContacts].filter(
        (i) => i.contactId !== contactId
      );
      this.setState({
        item: { ...this.state.item, orgContacts: updatedContacts },
      });
    });
  }

  render() {
    const { item } = this.state;
    const { conObj } = this.state;
    const { contactFormCheck } = this.state;
    const { addContactButton } = this.state;
    const { orgUpdateAlert } = this.state;
    const { newOrgAlert } = this.state;
    const dismissOrgUpdateAlert = () =>
      this.setState({ orgUpdateAlert: false });
    const dismissNewOrgAlert = () => this.setState({ newOrgAlert: false });

    const title = (
      <h3>{item.orgId ? "Edit Organization" : "Add Organization"}</h3>
    );

    let contactForm = "";
    if (contactFormCheck) {
      contactForm = (
        <Form onSubmit={this.handleConSubmit}>
          <div className="row">
            <FormGroup className="col-md-2 mb-2">
              <Label for="firstName">
                First Name<span class="required">*</span>
              </Label>
              <Input
                required
                type="text"
                name="firstName"
                id="firstName"
                value={conObj.firstName || ""}
                onChange={this.handleConChange}
                autoComplete="firstName"
              />
            </FormGroup>
            <FormGroup className="col-md-2 mb-2">
              <Label for="lastName">
                Last Name <span class="required">*</span>
              </Label>
              <Input
                required
                type="text"
                name="lastName"
                id="lastName"
                value={conObj.lastName || ""}
                onChange={this.handleConChange}
                autoComplete="lastName"
              />
            </FormGroup>
            <FormGroup className="col-md-2 mb-2">
              <Label for="title">Title</Label>
              <Input
                type="text"
                name="title"
                id="title"
                value={conObj.title || ""}
                onChange={this.handleConChange}
                autoComplete="title"
              />
            </FormGroup>
            <FormGroup className="col-md-2 mb-2">
              <Label for="email">
                Contact Email <span class="required">*</span>
              </Label>
              <Input
                required
                type="text"
                name="email"
                id="email"
                value={conObj.email || ""}
                onChange={this.handleConChange}
                autoComplete="email"
              />
            </FormGroup>
            <FormGroup className="col-md-2 mb-2">
              <Label for="phone">Contact Phone</Label>
              <Input
                type="text"
                name="phone"
                id="phone"
                value={conObj.phone || ""}
                onChange={this.handleConChange}
                autoComplete="phone"
              />
            </FormGroup>
          </div>
          <FormGroup>
            <Button size="sm" color="primary" type="submit">
              Save Contact
            </Button>{" "}
            <Button size="sm" color="warning" onClick={() => this.cancelForm()}>
              Cancel
            </Button>
          </FormGroup>
        </Form>
      );
    } else if (this.props.match.params.id !== "new") {
      contactForm = (
        <p>
          Click <i>Add Contact </i> to add a contact for this Organization.
        </p>
      );
    }

    let contacts = "";
    let contactList = "";
    if (item.orgContacts.length > 0) {
      contactList = item.orgContacts.map((contact) => {
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
                  to={"/contact/" + contact.contactId}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to remove this contact? Upon removing, the contact will be disassociated from the Organization but continue to exist in the Database."
                      )
                    )
                      this.remove(item.orgId, contact.contactId);
                  }}
                >
                  Remove
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        );
      });
      contacts = (
        <div>
          <h5>Contact List for {item.orgname}</h5>
          <Table className="mt-1">
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
    } else if (this.props.match.params.id !== "new") {
      contacts = (
        <p>
          <h6>
            <i>No Contacts associated with this Organization.</i>
          </h6>
          <br></br>
        </p>
      );
    } else {
      contacts = (
        <p>
          <h6>
            <i>Add contacts after creating an Organization.</i>
          </h6>
          <br></br>
        </p>
      );
    }
    //Upcoming Events Table
    let upEvents = "";
    let upEventsList = "";
    if (item.upcomingEvents.length > 0) {
      upEventsList = item.upcomingEvents.map((event) => {
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
                  to={"/event/" + event.eventId}
                >
                  Edit
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        );
      });
      upEvents = (
        <div>
          <h5>Upcoming Events with {item.orgname}</h5>
          <Table className="mt-1">
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
    } else if (this.props.match.params.id !== "new") {
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
    let pastEvents = "";
    let pastEventsList = "";
    if (item.pastEvents.length > 0) {
      pastEventsList = item.pastEvents.map((event) => {
        return (
          <tr key={event.eventId}>
            <td style={{ whiteSpace: "nowrap" }}>{event.location}</td>
            <td>{event.startDateTime}</td>
            <td>{event.endDateTime}</td>
            <td>{event.eventType}</td>
            <td>
              {event.eventPresenters.map((presenter) => {
                return (
                  <ul>
                    <li>{presenter}</li>
                  </ul>
                );
              })}
            </td>
            <td>
              <ButtonGroup>
                <Button
                  size="sm"
                  color="primary"
                  tag={Link}
                  to={"/event/" + event.eventId}
                >
                  Edit
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        );
      });
      pastEvents = (
        <div>
          <h5>Past Events with {item.orgname}</h5>
          <Table className="mt-1">
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
    } else if (this.props.match.params.id !== "new") {
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
          {title}
          <Alert
            color="info"
            isOpen={orgUpdateAlert}
            toggle={dismissOrgUpdateAlert}
          >
            {item.orgname} has been updated!
          </Alert>
          <Alert
            color="success"
            isOpen={newOrgAlert}
            toggle={dismissNewOrgAlert}
          >
            {item.orgname} is created! PLEASE WAIT FOR THE PAGE TO REFRESH!
          </Alert>
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label for="orgname">
                Name <span class="required">*</span>
              </Label>
              <Input
                required
                type="text"
                name="orgname"
                id="orgname"
                value={item.orgname || ""}
                onChange={this.handleChange}
                autoComplete="orgname"
              />
            </FormGroup>
            <FormGroup>
              <Label for="address">Address</Label>
              <Input
                type="text"
                name="address"
                id="address"
                value={item.address || ""}
                onChange={this.handleChange}
                autoComplete="address-level1"
              />
            </FormGroup>
            <FormGroup>
              <Label for="city">City</Label>
              <Input
                type="text"
                name="city"
                id="city"
                value={item.city || ""}
                onChange={this.handleChange}
                autoComplete="address-level1"
              />
            </FormGroup>
            <div className="row">
              <FormGroup className="col-md-4 mb-3">
                <Label for="phone">Phone</Label>
                <Input
                  type="text"
                  name="phone"
                  id="phone"
                  value={item.phone || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
              <FormGroup className="col-md-5 mb-3">
                <Label for="email">Email</Label>
                <Input
                  type="text"
                  name="email"
                  id="email"
                  value={item.email || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
              <FormGroup className="col-md-3 mb-3">
                <Label for="countyName">
                  County <span class="required">*</span>
                </Label>
                <Input
                  required
                  type="select"
                  name="countyName"
                  id="countyName"
                  value={item.countyName || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                >
                  <option></option>
                  <option>Chicago - North</option>
                  <option>Chicago - South</option>
                  <option>McHenry</option>
                  <option>Lake</option>
                  <option>Kane</option>
                  <option>Will</option>
                  <option>DuPage</option>
                  <option>Northwest Cook</option>
                  <option>North Central Cook</option>
                  <option>Central Cook</option>
                  <option>Southwest Cook</option>
                  <option>South Cook</option>
                </Input>
              </FormGroup>
              <FormGroup className="col-md-3 mb-3">
                <Label for="zip">Zip</Label>
                <Input
                  type="text"
                  name="zip"
                  id="zip"
                  value={item.zip || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
            </div>
            <React.Fragment>{contacts}</React.Fragment>
            <React.Fragment>
              <p>
                <div>{upEvents}</div>
              </p>
            </React.Fragment>
            <FormGroup>
              <Button color="primary" type="submit">
                Save
              </Button>{" "}
              <Button color="secondary" tag={Link} to="/organizations">
                Go back to Organizations
              </Button>
            </FormGroup>
          </Form>
          <p>
            <div>{contactForm}</div>
          </p>
          <p>
            <Button
              style={{ display: addContactButton }}
              outline
              color="info"
              onClick={() => this.addContactRow()}
              size="sm"
            >
              Add Contact
            </Button>
          </p>
          <p>
            <div>{pastEvents}</div>
          </p>
          <p>&nbsp;</p>
        </Container>
      </div>
    );
  }
}

export default withRouter(OrgEdit);
