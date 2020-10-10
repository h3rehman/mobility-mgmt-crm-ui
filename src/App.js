import React, { Component } from "react";
import { CookiesProvider } from "react-cookie";
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
import TestMaterialUI from "./TestMaterialUI";
import EventRead from "./EventRead";

class App extends Component {
  render() {
    return (
      <CookiesProvider>
        <Router>
          <Switch>
            <Route path="/" exact={true} component={Home} />
            <Route path="/organizations" exact={true} component={AllOrgsList} />
            <Route path="/events" exact={true} component={EventList} />
            <Route path="/myoutreach" exact={true} component={MyEvents} />
            <Route path="/organizations/:id" component={OrgEdit} />
            <Route path="/organization/read/:id" component={OrgRead} />
            <Route path="/contact/:id" component={ContactEdit} />
            <Route path="/events/:id" component={EventEdit} />
            <Route path="/event/read/:id" component={EventRead} />
            <Route
              path="/test-material"
              exact={true}
              component={TestMaterialUI}
            />
          </Switch>
        </Router>
      </CookiesProvider>
    );
  }
}

export default App;
