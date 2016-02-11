import React from 'react';
window.React = React; // export for http://fb.me/react-devtools

import Container from './containers';
import {Provider} from 'react-redux';
import configureStore from './store/configureStore';

import { render } from 'react-dom';

const store = configureStore();

render((
        <Provider store={store}>
            <Container />
        </Provider>
    ), document.getElementById('app')
);