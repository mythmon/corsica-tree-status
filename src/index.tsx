// @flow
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

let target = document.getElementById("root");
if (target === null) {
  target = document.createElement("div");
  target.setAttribute("id", "root");
  document.appendChild(target);
}

ReactDOM.render(<App />, target);
