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
import phoneFormat from "./phoneFormat";
import cleanPhoneNumber from "./cleanPhoneNumber";
import AppNavbar from "./AppNavbar";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import localConfig from "./localConfig.json";

class ContactEdit extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  emptyContact = {
    contactId: "",
    firstName: "",
    lastName: "",
    title: "",
    phone: "",
    altPhone: "",
    email: "",
    contactOrgs: {},
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      contact: this.emptyContact,
      allOrgNames: [],
      orgId: "-1",
      newContactAlert: false,
      contactUpdateAlert: false,
      contactErrorAlert: false,
      submitCalled: false,
      associateOrgButtonBlock: "block",
      orgListBlock: "none",
      csrfToken: cookies.get("XSRF-TOKEN"),
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOrgSelect = this.handleOrgSelect.bind(this);
    this.associateOrg = this.associateOrg.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== "new") {
      const fetchedContact = await (
        await fetch(
          "https://" +
            localConfig.SERVICE.URL +
            ":" +
            localConfig.SERVICE.PORT +
            `/api/contact/${this.props.match.params.id}`,
          {
            credentials: "include",
          }
        )
      ).json();
      this.setState({ contact: fetchedContact });
    }
  }

  async associateOrg() {
    this.setState({ associateOrgButtonBlock: "none" });
    const fetchedOrgs = await (
      await fetch(
        "https://" +
          localConfig.SERVICE.URL +
          ":" +
          localConfig.SERVICE.PORT +
          `/api/allorgnames`,
        { credentials: "include" }
      )
    ).json();
    this.setState({ allOrgNames: fetchedOrgs, orgListBlock: "block" });
  }

  handleOrgSelect(e, newValue) {
    let id = newValue ? newValue.OrgID : "-1";
    this.setState({ orgId: id });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let contact = { ...this.state.contact };
    if (name === "phone" || name === "altPhone"){
      let cleanNumber = cleanPhoneNumber(value);
      console.log(name + " " + cleanNumber);
      contact[name] = cleanNumber;
    }
    else {
      contact[name] = value;
    }
    this.setState({ contact });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { contact, orgId } = this.state;
    contact.createdBy = null;
    contact.lastModifiedBy = null;
    contact.contactOrgs = null;
    let http_successful_call = null;
    let headerEntries = null;
    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/create-update-contact/${orgId}`,
      {
        method: contact.contactId ? "PUT" : "POST",
        headers: {
          "X-XSRF-TOKEN": this.state.csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(contact),
      }
    ).then((response) => {
      this.setState({ submitCalled: true });
      if (response.status === 201) {
        http_successful_call = "POST";
        headerEntries = response.headers.entries();
        this.setState({ newContactAlert: true });
        window.scrollTo(0, 0);
      } else if (response.status === 204) {
        http_successful_call = "PUT";
        this.setState({ contactUpdateAlert: true });
        window.scrollTo(0, 0);
      }
    });

    if (http_successful_call === "POST") {
      //POST -> redirect to /contact/read/...
      await new Promise((r) => setTimeout(r, 2000));
      for (var pair of headerEntries) {
        if (pair[0] === "location") {
          let loc = pair[1].toString();
          let postId = loc.split("/").pop();
          window.location.href = "/contact/read/" + postId;
          break;
        }
      }
    } else if (http_successful_call === "PUT") {
      //PUT -> redirect to previous page.
      await new Promise((r) => setTimeout(r, 2000));
      this.props.history.goBack();
    } else {
      //Raise error
      this.setState({ contactErrorAlert: true });
    }
  }

  render() {
    const {
      submitCalled,
      contact,
      allOrgNames,
      newContactAlert,
      contactUpdateAlert,
      contactErrorAlert,
      orgListBlock,
      associateOrgButtonBlock,
    } = this.state;
    const title = (
      <h3>{contact.contactId ? "Edit Contact" : "Create Contact"}</h3>
    );

    const dismissContactUpdateAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ contactUpdateAlert: false });
    };
    const dismissNewContactAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ newContactAlert: false });
    };
    const dismissContactErrorAlert = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      this.setState({ contactErrorAlert: false });
    };

    //Orgs associated with this Contact
    let orgs = "";
    if (submitCalled === false) {
      if (Object.keys(contact.contactOrgs).length > 0) {
        let orgList = "";
        orgList = Object.entries(contact.contactOrgs).map(([key, value]) => {
          return (
            <tr key={key}>
              <td>
                {" "}
                <Link
                  style={{ color: "white" }}
                  target="_blank"
                  to={"/organization/read/" + key}
                >
                  <b>{value}</b>
                </Link>
              </td>
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
            <h5>Organization(s) the contact is part of:</h5>
            <Table responsive bordered dark hover className="small">
              <thead>
                <tr>
                  <th width="75%">Name</th>
                  <th width="25%">Action</th>
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
              <i>This contact is not associated with any Organization.</i>
            </h6>
            <br></br>
          </p>
        );
      }
    } else {
      orgs = "";
    }

    return (
      <div>
        <AppNavbar />
        <Container>
          {title}
          <div>
            <Snackbar
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              open={newContactAlert}
              autoHideDuration={3000}
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
              open={contactUpdateAlert}
              autoHideDuration={3000}
              onClose={dismissContactUpdateAlert}
            >
              <Alert
                variant="outlined"
                severity="info"
                className="info-color"
                onClose={dismissContactUpdateAlert}
              >
                <strong>Contact is updated.</strong>
              </Alert>
            </Snackbar>
            <Snackbar
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              open={contactErrorAlert}
              onClose={dismissContactErrorAlert}
            >
              <Alert
                variant="outlined"
                severity="error"
                className="error-color"
                onClose={dismissContactErrorAlert}
              >
                <strong>
                  Something went wrong, it could be possible that the contact is
                  already associated with the Org., otherwise please try again
                  or contact IT Support.
                </strong>
              </Alert>
            </Snackbar>
          </div>
          <Form onSubmit={this.handleSubmit}>
            <div className="row">
              <FormGroup className="col-md-4 mb-3">
                <Label for="firstName">First Name</Label>
                <Input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={contact.firstName || ""}
                  onChange={this.handleChange}
                  autoComplete="firstName"
                />
              </FormGroup>
              <FormGroup className="col-md-4 mb-3">
                <Label for="lastName">Last Name</Label>
                <Input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={contact.lastName || ""}
                  onChange={this.handleChange}
                  autoComplete="lastName"
                />
              </FormGroup>
            </div>
            <div className="row">
              <FormGroup className="col-md-4 mb-3">
                <Label for="title">Title</Label>
                <Input
                  type="text"
                  name="title"
                  id="title"
                  value={contact.title || ""}
                  onChange={this.handleChange}
                  autoComplete="title"
                />
              </FormGroup>
            </div>
            <div className="row paraSpace">
              <FormGroup className="col-md-2 mb-3">
                <Label for="phone">Phone</Label>
                <Input
                  type="text"
                  name="phone"
                  id="phone"
                  value={phoneFormat(contact.phone) || ""}
                  onChange={this.handleChange}
                  autoComplete="phone"
                />
              </FormGroup>
              <FormGroup className="col-md-2 mb-3">
                <Label for="altPhone">Alternate Phone</Label>
                <Input
                  type="text"
                  name="altPhone"
                  id="altPhone"
                  value={phoneFormat(contact.altPhone) || ""}
                  onChange={this.handleChange}
                  autoComplete="altPhone"
                />
              </FormGroup>
              <FormGroup className="col-md-3 mb-3">
                <Label for="email">Email</Label>
                <Input
                  type="text"
                  name="email"
                  id="email"
                  value={contact.email || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
            </div>
            <div className="row headLineSpace">
              <Button
                style={{ display: associateOrgButtonBlock }}
                outline
                color="info"
                onClick={() => this.associateOrg()}
              >
                <b>Associate Organization</b>
              </Button>
            </div>
            <div
              className="row headLineSpace"
              style={{ display: orgListBlock }}
            >
              <Autocomplete
                id="combo-box-demo"
                options={allOrgNames}
                getOptionLabel={(option) => option.orgname}
                renderOption={(option) => (
                  <React.Fragment>{option.orgname}</React.Fragment>
                )}
                onChange={this.handleOrgSelect}
                style={{ width: 300 }}
                name="associatedOrg"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Link Org. with this Contact"
                    variant="outlined"
                  />
                )}
              />
            </div>
            <div className="row paraSpace">{orgs}</div>
            <FormGroup>
              <Button color="primary" type="submit">
                Save
              </Button>{" "}
              <Button color="secondary" onClick={this.props.history.goBack}>
                Cancel
              </Button>
            </FormGroup>
          </Form>
        </Container>
      </div>
    );
  }
}

export default withCookies(ContactEdit);
