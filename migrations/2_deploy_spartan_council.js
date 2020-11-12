const SpartanCouncil = artifacts.require("SpartanCouncil");

module.exports = function (deployer, network, accounts) {
  const owners = [accounts[0], accounts[1]];
  deployer.deploy(SpartanCouncil, {
    name: "Spartan Council",
    symbol: "SC",
  });
};
