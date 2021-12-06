import * as React from "react";
import "./App.css";

export default function App() {
  const wave = () => {};

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="wave emoji">
            👋
          </span>{" "}
          Hey, hey, hello!
        </div>

        <div className="bio">
          I am Dauntless and I like avocados
          <span role="img" aria-label="avocado emoji">
            🥑
          </span>
          ? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
      </div>
    </div>
  );
}
