const SpartanCouncil = artifacts.require("SpartanCouncil");

contract("SpartanCouncil", (accounts) => {
  describe("Ownership", () => {
    it("should have the super owner as the deployer", async () => {
      let instance = await SpartanCouncil.deployed();
      let superOwner = await instance.superOwner.call();

      assert.equal(superOwner, accounts[0]);
    });
  });

  describe("Minting", () => {
    it("should enable super owner to mint a token to themselves", async () => {});
    it("should enable super owner to mint a token to a second address", async () => {});
    it("should enable super owner to mint an already existing token", async () => {});
    it("should prevent non super owner to mint", async () => {});
  });

  describe("Transferring", () => {
    it("should enable super owner to transfer token they own", async () => {});
    it("should enable super owner to transfer token someone else owns", async () => {});
    it("should prevent non super owner to transfer token they own", async () => {});
    it("should prevent non super owner to transfer token someone else owns", async () => {});
  });

  describe("Burning", () => {
    it("should enable super owner to burn token they own", async () => {});
    it("should enable super owner to burn token someone else owns", async () => {});
    it("should prevent non super owner to burn a token they own", async () => {});
    it("should prevent non super owner to burn a token someone else owns", async () => {});
  });
});
