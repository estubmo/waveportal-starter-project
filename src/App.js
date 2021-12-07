import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/WavePortal.json";

const Loader = () => (
  <span
    className="loader"
    style={{ fontSize: "32px" }}
    role="img"
    aria-label="avocado emoji"
  >
    🥑
  </span>
);

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [walletInstalled, setWalletInstalled] = useState(false);
  const [isWaitingForTxnToBeSigned, setIsWaitingForTxnToBeSigned] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMining, setIsMining] = useState(false);
  const [totalWaves, setTotalWaves] = useState("Loading...");
  const [signer, setSigner] = useState();

  const contractAddress = "0xE13Aef277a8f4321bcb4FdA6131ae45d3067bc62";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        setWalletInstalled(true);

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        setSigner(signer);

        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        setIsLoading(false);
        setTotalWaves(count.toNumber());
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        setWalletInstalled(false);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }, [contractABI]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(
        "Connected",
        accounts.find((x) => x !== undefined)
      );

      setCurrentAccount(accounts.find((x) => x !== undefined));
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        setIsWaitingForTxnToBeSigned(true);
        const waveTxn = await wavePortalContract.wave();
        setIsWaitingForTxnToBeSigned(false);
        setIsMining(true);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        setIsMining(false);
        console.log("Mined -- ", waveTxn.hash);

        setIsLoading(true);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setTotalWaves(count.toNumber());
        setIsLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setIsWaitingForTxnToBeSigned(false);
      setIsMining(false);
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

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
          I am Dauntless and I like avocados .
          {walletInstalled ? (
            <>
              {currentAccount ? (
                <div>Your wallet is connected.</div>
              ) : (
                <div>Connect your Ethereum wallet.</div>
              )}
            </>
          ) : (
            <div>Download an Ethereum Wallet</div>
          )}
        </div>

        <button className="waveButton" onClick={wave}>
          Send me an avocado{" "}
          <span role="img" aria-label="avocado emoji">
            🥑
          </span>
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {isWaitingForTxnToBeSigned && (
            <>
              <h3>Woooo! Avocado incoming! </h3>
              <Loader />
            </>
          )}
          {isMining && (
            <>
              <h3>Mining... </h3>
              <Loader />
            </>
          )}
        </div>
        <div style={{ marginTop: "20px" }}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <h3>Fetching avocadoes</h3>
              <Loader />
            </div>
          ) : (
            <h3>
              I am currently in the possession of {totalWaves} yummy{" "}
              {totalWaves > 1 ? "avocados" : "avocado"}{" "}
              <span role="img" aria-label="avocado emoji">
                🥑
              </span>
            </h3>
          )}
        </div>
      </div>
    </div>
  );
}
