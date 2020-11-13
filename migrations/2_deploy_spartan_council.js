const SpartanCouncil = artifacts.require("SpartanCouncil");

module.exports = function (deployer, network, accounts) {
  const pDAO = accounts[0];

  const owner_1 = accounts[1];
  const owner_2 = accounts[2];
  const owner_3 = accounts[3];

  deployer.deploy(SpartanCouncil, "Spartan Council", "SC", {
    from: pDAO,
  });
};
