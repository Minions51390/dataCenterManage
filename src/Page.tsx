import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import NotFound from './components/pages/NotFound';
import Login from './components/pages/Login';
import Dashboard from './components/dashboard/StudentDashboard';
import App from './App';

export default () => (
    <Router>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/app/class" push />} />
            <Route path="/app" component={App} />
            <Route path="/404" component={NotFound} />
            <Route path="/login" component={Login} />
            <Route path="/stu" component={Dashboard} />
            <Route component={NotFound} />
        </Switch>
    </Router>
);
