import React, { Component } from "react";
import "./App.css";
import AppNavbar from "./AppNavbar";
import { Jumbotron, Button, Container } from "reactstrap";

class Home extends Component {
  render() {
    return (
      <div>
        <AppNavbar />
        <div>
          <Container fluid>
            <Jumbotron>
              <h3 className="display-4">Mobility Management CRM</h3>
              <h3 className="display-4">Home</h3>
              <p className="lead">
                Book an Appointment or reach out to an Organization.
              </p>
              <hr className="my-2" />
              <p>
                See your future appointments by clicking below button or see all
                your appointments in the Events tab above.
              </p>
              <p className="lead">
                <Button color="primary">My Appointments</Button>
              </p>
            </Jumbotron>
          </Container>
        </div>
      </div>
    );
  }
}

export default Home;
