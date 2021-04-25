import React, { Component } from "react";
import { Link } from "react-router-dom";
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
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import localConfig from "./localConfig.json";

class OrgEdit extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

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

  emptyContact = {
    contactId: "",
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    altPhone: "",
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      item: this.emptyItem,
      conObj: this.emptyContact,
      counties: [],
      contactFormCheck: false,
      addContactButton: "none",
      orgUpdateAlert: false,
      newOrgAlert: false,
      newContactAlert: false,
      errorInContactAlert: false,
      csrfToken: cookies.get("XSRF-TOKEN"),
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
        await fetch(
          "https://" +
            localConfig.SERVICE.URL +
            ":" +
            localConfig.SERVICE.PORT +
            `/api/organizations/${this.props.match.params.id}`,
          {
            credentials: "include",
          }
        )
      ).json();
      this.setState({ item: org, addContactButton: "block" });
    }
    const fetchedCounties = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          "/api/counties",
        {
          credentials: "include",
        }
      )
    ).json();
    this.setState({ counties: fetchedCounties });
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
    const { conObj, item } = this.state;

    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/contact/${item.orgId}`,
      {
        method: "POST",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(conObj),
      }
    ).then((response) => {
      if (response.status === 201) {
        this.setState({ newContactAlert: true });

        let headerEntries = response.headers.entries();
        for (var pair of headerEntries) {
          if (pair[0] === "location") {
            let loc = pair[1].toString();
            let postId = loc.split("/").pop();
            conObj.contactId = postId;
            item.orgContacts.push(conObj);
            this.setState({
              item,
              conObj: this.emptyContact,
              contactFormCheck: false,
              addContactButton: "block",
            });
            window.setTimeout(() => {
              this.setState({ newContactAlert: false });
            }, 4000);
            break;
          }
        }
      } else {
        this.setState({ errorInContactAlert: true });
        window.setTimeout(() => {
          this.setState({ errorInContactAlert: false });
        }, 8000);
      }
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { item } = this.state;

    item.lastStatus = null;
    let headerEntries = "";
    let postId = "";
    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/organization/${item.countyName}`,
      {
        method: item.orgId ? "PUT" : "POST",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(item),
      }
    ).then((response) => {
      headerEntries = response.headers.entries();
    });

    if (item.orgId) {
      //For PUT Calls
      this.setState({ orgUpdateAlert: true });
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 2000));
      window.location.href = "/organization/read/" + item.orgId;
    } else {
      //For POST Calls
      this.setState({ newOrgAlert: true });
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 2000));
      for (var pair of headerEntries) {
        console.log(pair[0] + ": " + pair[1]);
        if (pair[0] === "location") {
          let loc = pair[1].toString();
          postId = loc.split("/").pop();
          window.location.href = "/organization/read/" + postId;
          break;
        }
      }
    }
  }

  async addContactRow() {
    this.setState({ contactFormCheck: true, addContactButton: "none" });
  }

  async cancelForm() {
    this.setState({ contactFormCheck: false, addContactButton: "block" });
  }

  async remove(orgId, contactId) {
    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/orgContact/${orgId}/${contactId}`,
      {
        method: "DELETE",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    ).then(() => {
      let updatedContacts = [...this.state.item.orgContacts].filter(
        (i) => i.contactId !== contactId
      );
      this.setState({
        item: { ...this.state.item, orgContacts: updatedContacts },
      });
    });
  }

  render() {
    const {
      item,
      conObj,
      counties,
      contactFormCheck,
      addContactButton,
      orgUpdateAlert,
      newOrgAlert,
      newContactAlert,
      errorInContactAlert,
    } = this.state;
    const dismissOrgUpdateAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ orgUpdateAlert: false });
    };
    const dismissNewOrgAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ newOrgAlert: false });
    };
    const dismissNewContactAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ newContactAlert: false });
    };
    const dismissErrorInContactAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ errorInContactAlert: false });
    };

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
              <Label for="lastName">Last Name</Label>
              <Input
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
              <Label for="email">Contact Email</Label>
              <Input
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
            <FormGroup className="col-md-2 mb-2">
              <Label for="altPhone">Alt. Phone</Label>
              <Input
                type="text"
                name="altPhone"
                id="altPhone"
                value={conObj.altPhone || ""}
                onChange={this.handleConChange}
                autoComplete="altPhone"
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
            <td>{contact.altPhone}</td>
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
          <Table size="sm" responsive bordered hover>
            <thead>
              <tr>
                <th width="5%">First Name</th>
                <th width="5%">Last Name</th>
                <th width="5%">Title</th>
                <th width="5%">Email</th>
                <th width="5%">Phone</th>
                <th width="5%">Alt. Phone</th>
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
            <h5>Upcoming Events with {item.orgname}</h5>
            <Table responsive>
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
    if (this.props.match.params.id !== "new" && eventCounter < 1) {
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
            <h5>Past Events with {item.orgname}</h5>
            <Table responsive>
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
    if (this.props.match.params.id !== "new" && eventCounter < 1) {
      pastEvents = (
        <p>
          <h6>
            <i>No Past Events with {item.orgname}.</i>
          </h6>
          <br></br>
        </p>
      );
    }

    let countyInputs = null;
    if (counties.length > 0) {
      countyInputs = counties.map((county) => {
        return <option>{county.countyDesc}</option>;
      });
    } else {
      countyInputs = <i>No County retrieved</i>;
    }

    return (
      <div>
        <AppNavbar />
        {item.orgId ? (
          <Container>
            <div className="float-right">
              <Button color="success" href="/organizations/new">
                Add new Organization?
              </Button>
            </div>
          </Container>
        ) : (
          ""
        )}
        <Container>
          {title}
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={orgUpdateAlert}
            autoHideDuration={6000}
            onClose={dismissOrgUpdateAlert}
          >
            <Alert
              variant="outlined"
              severity="info"
              className="info-color"
              onClose={dismissOrgUpdateAlert}
            >
              <strong>{item.orgname} has been updated!</strong>
            </Alert>
          </Snackbar>
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={newOrgAlert}
            autoHideDuration={3500}
            onClose={dismissNewOrgAlert}
          >
            <Alert
              variant="outlined"
              severity="success"
              className="success-color"
              onClose={dismissNewOrgAlert}
            >
              {item.orgname} is created!{" "}
              <strong>PLEASE WAIT FOR THE PAGE TO REFRESH!</strong>
            </Alert>
          </Snackbar>
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={newContactAlert}
            autoHideDuration={6000}
            onClose={dismissNewContactAlert}
          >
            <Alert
              variant="outlined"
              severity="success"
              className="success-color"
              onClose={dismissNewContactAlert}
            >
              <strong>New contact is created!</strong>
            </Alert>
          </Snackbar>
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={errorInContactAlert}
            autoHideDuration={12000}
            onClose={dismissErrorInContactAlert}
          >
            <Alert
              variant="outlined"
              severity="error"
              className="error-color"
              onClose={dismissErrorInContactAlert}
            >
              <strong>
                Something went wrong, please try again or contact IT Support.
              </strong>
            </Alert>
          </Snackbar>
          <div className="paraSpace">
            <Form onSubmit={this.handleSubmit}>
              <div className="row">
                <FormGroup className="col-md-9 mb-3">
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
              </div>
              <div className="row">
                <FormGroup className="col-md-6 mb-3">
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
                <FormGroup className="col-md-2 mb-3">
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
              </div>
              <div className="row">
                <FormGroup className="col-md-2 mb-3">
                  <Label for="phone">Organization Phone</Label>
                  <Input
                    type="text"
                    name="phone"
                    id="phone"
                    value={item.phone || ""}
                    onChange={this.handleChange}
                    autoComplete="address-level1"
                  />
                </FormGroup>
                <FormGroup className="col-md-2 mb-3">
                  <Label for="email">Organization Email</Label>
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
                    {countyInputs}
                  </Input>
                </FormGroup>
                <FormGroup className="col-md-2 mb-3">
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
          </div>
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

export default withCookies(OrgEdit);
