import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Button, Container, Form, FormGroup, Input, Label } from "reactstrap";
import AppNavbar from "./AppNavbar";
import localConfig from "./localConfig.json";

class ContactEdit extends Component {
  emptyItem = {
    contactId: "",
    firstName: "",
    lastName: "",
    title: "",
    phone: "",
    email: "",
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
      const contact = await (
        await fetch(
          "https://" +
            localConfig.SERVICE.URL +
            ":" +
            localConfig.SERVICE.PORT +
            `/api/contact/${this.props.match.params.id}`
        )
      ).json();
      this.setState({ item: contact });
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

    await fetch(
      "https://" +
        localConfig.SERVICE.URL +
        ":" +
        localConfig.SERVICE.PORT +
        `/api/contact`,
      {
        method: item.contactId ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      }
    );
    this.props.history.push("/organizations");
  }

  render() {
    const { item } = this.state;
    const title = <h3>{item.orgId ? "Edit Contact" : "Add Contact"}</h3>;

    return (
      <div>
        <AppNavbar />
        <Container>
          {title}
          <Form onSubmit={this.handleSubmit}>
            <div className="row">
              <FormGroup className="col-md-4 mb-3">
                <Label for="firstName">First Name</Label>
                <Input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={item.firstName || ""}
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
                  value={item.lastName || ""}
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
                  value={item.title || ""}
                  onChange={this.handleChange}
                  autoComplete="title"
                />
              </FormGroup>
            </div>
            <div className="row">
              <FormGroup className="col-md-2 mb-3">
                <Label for="phone">Phone</Label>
                <Input
                  type="text"
                  name="phone"
                  id="phone"
                  value={item.phone || ""}
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
                  value={item.altPhone || ""}
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
                  value={item.email || ""}
                  onChange={this.handleChange}
                  autoComplete="address-level1"
                />
              </FormGroup>
            </div>
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

export default withRouter(ContactEdit);
