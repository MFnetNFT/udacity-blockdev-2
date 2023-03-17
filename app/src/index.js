import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    await createStar(name, id).send({from: this.account});
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  lookUp: async function() {
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const starId = document.getElementById("lookid").value;
    const starName = await lookUptokenIdToStarInfo(starId).call();
    App.setStatus(`Star name: ${starName}`);
  },

  putStarUpForSale: async function() {
    const { putStarUpForSale } = this.meta.methods;
    const id = document.getElementById("putStarUpForSaleTokenId").value;
    const price = document.getElementById("putStarUpForSalePrice").value;
    await putStarUpForSale(id, price).send({from: this.account});
    App.setStatus(`Star ${id} is now up for sale at ${price} ETH`);
  },

  buyStar: async function() {
    const { buyStar } = this.meta.methods;
    const id = document.getElementById("buyStarTokenId").value;
    const price = await this.meta.methods.starsForSale(id).call();
    await buyStar(id).send({from: this.account, value: price});
    App.setStatus(`Congratulations! You are now the owner of Star ${id}`);
  },

  exchangeStars: async function() {
    const { exchangeStars } = this.meta.methods;
    const id1 = document.getElementById("exchangeStarTokenId1").value;
    const id2 = document.getElementById("exchangeStarTokenId2").value;
    await exchangeStars(id1, id2).send({from: this.account});
    App.setStatus(`Exchange successful!`);
  },

  transferStar: async function() {
    const { transferStar } = this.meta.methods;
    const to = document.getElementById("transferStarTo").value;
    const id = document.getElementById("transferStarTokenId").value;
    await transferStar(to, id).send({from: this.account});
    App.setStatus(`Star ${id} transferred to ${to}`);
  }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});
