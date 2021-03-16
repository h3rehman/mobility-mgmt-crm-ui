import React, { Component } from "react";
import { Button, ButtonGroup, Container, Table } from "reactstrap";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class MyCallLogs extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      callLogsArr: [],
      isLoading: true,
      csrfToken: cookies.get("XSRF-TOKEN"),
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    fetch("/api/myCallLogs", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => this.setState({ callLogsArr: data, isLoading: false }));
  }

  render() {
    const { callLogsArr, isLoading } = this.state;

    if (isLoading) {
      return (
        <div>
          <img class="loading" src="/loading.gif" alt="Loading..." />
        </div>
      );
    }

    const myCallLogs = callLogsArr.map((callLog) => {
      let cd = new Date(callLog.createDate);
      let ld = new Date(callLog.lastModifiedDate);
      return (
        <tr key={callLog.callId}>
          <td style={{ whiteSpace: "nowrap" }}>
            <Link to={"/callLog/" + callLog.callId}>
              {callLog.org ? callLog.org.orgName : null}
            </Link>
          </td>
          <td className="small-font">
            {callLog.status ? callLog.status.lastStatus : null}
          </td>
          <td className="small-font">{callLog.createdBy}</td>
          <td className="small-font">
            {cd.toLocaleDateString()}{" "}
            {cd.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td className="small-font">{callLog.lastModifiedBy}</td>
          <td className="small-font">
            {ld.toLocaleDateString()}{" "}
            {ld.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td>
            <ButtonGroup>
              <Button
                size="sm"
                color="primary"
                tag={Link}
                to={"/callLog/" + callLog.callId}
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
            <Button color="success" tag={Link} to="/callLog/new">
              Add Call Log
            </Button>
          </div>
        </Container>
        <Container>
          <h4>My Call Logs</h4>
          <Table className="mt-4">
            <thead>
              <tr className="small-font">
                <th width="20%">Org. Name</th>
                <th width="10%">Status set</th>
                <th width="15%">Created by</th>
                <th width="15%">Created on</th>
                <th width="15%">Last Modified by</th>
                <th width="15%">Last Modified</th>
                <th width="10%">Action</th>
              </tr>
            </thead>
            <tbody>{myCallLogs}</tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default withCookies(MyCallLogs);
