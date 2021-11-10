import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "dotenv/config";
import Modal from "react-modal";
import { verifyToken } from "util/JwtHelper";

Modal.setAppElement("#root");
verifyToken();
ReactDOM.render(<App />, document.getElementById("root"));
