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
  constructor(props) {
    super(props);
    this.state = {
      item: this.emptyItem,
    };
  }
  render() {
    const { item } = this.state;
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
      </div>
    );
  }
}
export default withRouter(OrgRead);
