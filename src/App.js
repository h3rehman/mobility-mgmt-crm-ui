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
import EventRead from "./EventRead";
import MyCallLogs from "./MyCallLogs";
import CallLogEdit from "./CallLogEdit";
import ContactList from "./ContactList";

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
            <Route path="/callLog/:id" component={CallLogEdit} />
            <Route path="/contacts" exact={true} component={ContactList} />
            <Route
              path="/callLogs/myLogs"
              exact={true}
              component={MyCallLogs}
            />
          </Switch>
        </Router>
      </CookiesProvider>
    );
  }
}

export default App;
