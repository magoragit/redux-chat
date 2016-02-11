import React, {Component, PropTypes} from 'react';

import { Router, Route, DefaultRoute, NotFoundRoute } from 'react-router';
import RouterContainer from '../services/RouterContainer';

import App from '../components/App';
import NotFound from '../components/pages/NotFound';
import About from '../components/pages/About';
import ChatApp from '../components/pages/ChatApp';
import CreateRoom from '../components/pages/CreateRoom';
import Register from '../components/pages/Register';
import Login from '../components/pages/Login';
import Home from '../components/pages/Home';

export default class extends React.Component {
    constructor(props) {
        super(props);

        console.log('Container::Container')

        let token = sessionStorage.getItem("videoChat");

        if (token) {
            //LoginActions.loginUser(token);
        }
    }

    //noinspection JSMethodCanBeStatic
    render() {
        console.log('Container::render')

        return (
            <Router>
                <Route path="/" component={App}>
                    {/*<NotFoundRoute component={NotFound} />*/}
                    {/*<Route name="home" path="/" component={Home} />*/}
                     <Route name="about" component={About} />
                    {/*<Route name="chat" component={ChatApp} />
                     <Route name="create-room" component={CreateRoom} />
                     <Route name="signup" component={Register} />
                     <Route name="login" component={Login} />*/}
                </Route>
            </Router>
        );
    }
}