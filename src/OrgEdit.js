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
  };

  constructor(props) {
    super(props);
    this.state = {
      item: this.emptyItem,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== "new") {
      const org = await (
        await fetch(`/api/organizations/${this.props.match.params.id}`)
      ).json();
      this.setState({ item: org });
    }
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let item = { ...this.state.item };
    item[name] = value;
    this.setState({ item });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { item } = this.state;

    await fetch(`/api/organization/${item.countyName}`, {
      method: item.orgId ? "PUT" : "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    this.props.history.push("/organizations");
  }

  render() {
    const { item } = this.state;
    const title = (
      <h3>{item.orgId ? "Edit Organization" : "Add Organization"}</h3>
    );

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
                <Button size="sm" color="danger" href="#">
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
    }

    return (
      <div>
        <AppNavbar />
        <Container>
          {title}
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label for="orgname">Name</Label>
              <Input
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
                <Label for="countyName">County</Label>
                <Input
                  type="text"
                  name="countyName"
                  id="countyName"
                  value={item.countyName || ""}
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
                  value={item.zip || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
            </div>
            <React.Fragment>{contacts}</React.Fragment>
            <FormGroup>
              <Button color="primary" type="submit">
                Save
              </Button>{" "}
              <Button color="secondary" tag={Link} to="/organizations">
                Cancel
              </Button>
            </FormGroup>
          </Form>
        </Container>
      </div>
    );
  }
}

export default withRouter(OrgEdit);
