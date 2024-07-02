import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './Components/App';

const docRoot = document.getElementById('root');
if (docRoot === null) {
    throw new Error("Unable to find document root.")
}
const root = ReactDOM.createRoot(docRoot);

root.render(
    <App />
);

