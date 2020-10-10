import React, { Component } from "react";
import { Button, ButtonGroup, Container, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class AllOrgsList extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      orgs: [],
      csrfToken: cookies.get("XSRF-TOKEN"),
      isLoading: true,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    fetch("/api/organizations", { credentials: "include" })
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
          <td style={{ whiteSpace: "nowrap" }}>
            <Link to={"/organization/read/" + org.orgId}>{org.orgname}</Link>
          </td>
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
        <Container>
          <div className="float-right">
            <Button color="success" tag={Link} to="/organizations/new">
              Add Organization
            </Button>
          </div>
          <h3>Organizations</h3>
          <Table className="mt-4" hover>
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

export default withCookies(AllOrgsList);
