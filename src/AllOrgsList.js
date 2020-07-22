import React, { Component } from "react";
import { Button, ButtonGroup, Container, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";

class AllOrgsList extends Component {
  constructor(props) {
    super(props);
    this.state = { orgs: [], isLoading: true };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    fetch("/api/organizations")
      .then((response) => response.json())
      .then((data) => this.setState({ orgs: data, isLoading: false }));
  }

  render() {
    const { orgs, isLoading } = this.state;

    if (isLoading) {
      return (
        <div>
          <img class="loading" src="/loading.gif" alt="Loading..." />
        </div>
      );
    }

    const orgList = orgs.map((org) => {
      return (
        <tr key={org.orgId}>
          <td style={{ whiteSpace: "nowrap" }}>{org.orgname}</td>
          <td>{org.city}</td>
          <td>{org.countyName}</td>
          <td>
            <ButtonGroup>
              <Button
                size="sm"
                color="primary"
                tag={Link}
                to={"/organizations/" + org.orgId}
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
        <Container fluid>
          <div className="float-right">
            <Button color="success" tag={Link} to="/organizations/new">
              Add Organization
            </Button>
          </div>
          <h3>Organizations</h3>
          <Table className="mt-4">
            <thead>
              <tr>
                <th width="20%">Name</th>
                <th width="20%">City</th>
                <th width="20%">County</th>
                <th width="10%">Action</th>
              </tr>
            </thead>
            <tbody>{orgList}</tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default AllOrgsList;
