import React, { Component } from "react";
import "./App.css";
import Home from "./Home";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AllOrgsList from "./AllOrgsList";
import EventList from "./EventList";
import MyEvents from "./MyEvents";
import OrgEdit from "./OrgEdit";
import OrgRead from "./OrgRead";
import ContactEdit from "./ContactEdit";
import EventEdit from "./EventEdit";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" exact={true} component={Home} />
          <Route path="/organizations" exact={true} component={AllOrgsList} />
          <Route path="/events" exact={true} component={EventList} />
          <Route path="/appointments/1" exact={true} component={MyEvents} />
          <Route path="/organizations/:id" component={OrgEdit} />
          <Route path="/organizations/read/:id" component={OrgRead} />
          <Route path="/contact/:id" component={ContactEdit} />
          <Route path="/events/:id" component={EventEdit} />
        </Switch>
      </Router>
    );
  }
}

export default App;
