const SpartanCouncil = artifacts.require('SpartanCouncil');

const {
	BN, // Big Number support
	constants, // Common constants, like the zero address and largest integers
	expectEvent, // Assertions for emitted events
	expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract('SpartanCouncil', accounts => {
	const tokenIdOne = new BN(1);
	const tokenIdTwo = new BN(2);
	const tokenIdThree = new BN(3);
	const [ownerAddress, receiver, arbAddress] = accounts;
	describe('Minting', () => {
		let spartanCouncil;
		beforeEach(async () => {
			spartanCouncil = await SpartanCouncil.new('Spartan Council', 'SC', {
				from: ownerAddress,
			});
		});
		it('should enable super owner to mint a token to themselves', async () => {
			const tx = await spartanCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: ownerAddress,
				tokenId: tokenIdOne,
			});
		});
		it('should enable super owner to mint a token to a second address', async () => {
			const tx = await spartanCouncil.mint(receiver, tokenIdOne, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: tokenIdOne,
			});
		});
		it('should not enable super owner to mint an already existing token', async () => {
			await spartanCouncil.mint(receiver, tokenIdOne, {
				from: ownerAddress,
			});
			await expectRevert(
				spartanCouncil.mint(receiver, tokenIdOne, {
					from: ownerAddress,
				}),
				'ERC721: token already minted'
			);
		});
		it('should prevent non super owner to mint to themselves', async () => {
			await expectRevert(
				spartanCouncil.mint(receiver, tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to mint to another address', async () => {
			await expectRevert(
				spartanCouncil.mint(arbAddress, tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent minting with tokenId as 0', async () => {
			await expectRevert(
				spartanCouncil.mint(receiver, new BN(0), {
					from: ownerAddress,
				}),
				'Token ID must be greater than 0'
			);
		});
		it('should allow minting with tokenId as string', async () => {
			const tx = await spartanCouncil.mint(receiver, '1234', {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: '1234',
			});
		});
		it('should allow minting with tokenId as a large number', async () => {
			const tx = await spartanCouncil.mint(receiver, 1234, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: '1234',
			});
		});
		it('should prevent minting to zero address', async () => {
			await expectRevert(
				spartanCouncil.mint(constants.ZERO_ADDRESS, new BN('1234124'), {
					from: ownerAddress,
				}),
				'Method called with the zero address'
			);
		});
	});

	describe('Transferring', () => {
		let spartanCouncil;
		beforeEach(async () => {
			spartanCouncil = await SpartanCouncil.new('Spartan Council', 'SC', {
				from: ownerAddress,
			});
			await spartanCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			await spartanCouncil.mint(receiver, tokenIdTwo, {
				from: ownerAddress,
			});
		});
		it('should enable super owner to transfer token they own', async () => {
			const tx = await spartanCouncil.transfer(ownerAddress, arbAddress, tokenIdOne, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Transfer', {
				from: ownerAddress,
				to: arbAddress,
				tokenId: tokenIdOne,
			});
		});
		it('should enable super owner to transfer token someone else owns', async () => {
			const tx = await spartanCouncil.transfer(receiver, arbAddress, tokenIdTwo, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Transfer', {
				from: receiver,
				to: arbAddress,
				tokenId: tokenIdTwo,
			});
		});
		it('should prevent non super owner to transfer token they own', async () => {
			await expectRevert(
				spartanCouncil.transfer(receiver, arbAddress, tokenIdTwo, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to transfer token someone else owns', async () => {
			await expectRevert(
				spartanCouncil.transfer(ownerAddress, arbAddress, tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to transfer token someone else owns by inputing their address as from', async () => {
			await expectRevert(
				spartanCouncil.transfer(receiver, arbAddress, tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent transfer to user who already owns a token', async () => {
			await spartanCouncil.mint(arbAddress, tokenIdThree, {
				from: ownerAddress,
			});
			await expectRevert(
				spartanCouncil.transfer(arbAddress, receiver, tokenIdThree, {
					from: ownerAddress,
				}),
				'Destination address already owns a token.'
			);
		});
		it('should prevent transferring to zero address', async () => {
			await expectRevert(
				spartanCouncil.transfer(receiver, constants.ZERO_ADDRESS, tokenIdTwo, {
					from: ownerAddress,
				}),
				'Method called with the zero address'
			);
		});
	});

	describe('Burning', () => {
		let spartanCouncil;
		beforeEach(async () => {
			spartanCouncil = await SpartanCouncil.new('Spartan Council', 'SC', {
				from: ownerAddress,
			});
			await spartanCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			await spartanCouncil.mint(receiver, tokenIdTwo, {
				from: ownerAddress,
			});
		});
		it('should enable super owner to burn token they own', async () => {
			const previousOwner = await spartanCouncil.tokenOwner.call(tokenIdOne);
			const tx = await spartanCouncil.burn(tokenIdOne, { from: ownerAddress });
			expectEvent(tx, 'Burn', {
				tokenId: tokenIdOne,
			});
			assert(await spartanCouncil.tokenOwned.call(previousOwner), constants.ZERO_BYTES32);
			assert(await spartanCouncil.tokenOwner.call(tokenIdOne), constants.ZERO_ADDRESS);
		});
		it('should enable super owner to burn token someone else owns', async () => {
			const tx = await spartanCouncil.burn(tokenIdTwo, { from: ownerAddress });
			expectEvent(tx, 'Burn', {
				tokenId: tokenIdTwo,
			});
		});
		it('should prevent non super owner to burn a token they own', async () => {
			await expectRevert(
				spartanCouncil.burn(tokenIdTwo, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to burn a token someone else owns', async () => {
			await expectRevert(
				spartanCouncil.burn(tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent burning a token that does not exist', async () => {
			await expectRevert(
				spartanCouncil.burn(new BN(3), {
					from: ownerAddress,
				}),
				'ERC721: token does not exist'
			);
		});
		it('should delete metadata when burning a token', async () => {
			const uri = 'www.google.com';
			await spartanCouncil.setTokenURI(tokenIdOne, uri, {
				from: ownerAddress,
			});
			await spartanCouncil.burn(tokenIdOne, { from: ownerAddress });
			await expectRevert(spartanCouncil.tokenURI(tokenIdOne), 'ERC721: token does not exist');
		});
	});

	describe('Token features', () => {
		let spartanCouncil;
		beforeEach(async () => {
			spartanCouncil = await SpartanCouncil.new('Spartan Council', 'SC', {
				from: ownerAddress,
			});
			await spartanCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			await spartanCouncil.mint(receiver, tokenIdTwo, {
				from: ownerAddress,
			});
		});
		it('should return the correct total supply', async () => {
			assert(await spartanCouncil.totalSupply.call(), new BN(2));
			await spartanCouncil.burn(tokenIdOne, { from: ownerAddress });
			assert(await spartanCouncil.totalSupply.call(), new BN(1));
		});
		it('should allow owner setting metadata', async () => {
			const uri = 'www.google.com';
			const tx = await spartanCouncil.setTokenURI(tokenIdOne, uri, {
				from: ownerAddress,
			});
			expectEvent(tx, 'MetadataChanged', {
				tokenId: tokenIdOne,
				tokenURI: uri,
			});
			assert(await spartanCouncil.tokenURI(tokenIdOne), uri);
		});
		it('should prevent owner setting metadata', async () => {
			const uri = 'www.google.com';
			await expectRevert(
				spartanCouncil.setTokenURI(tokenIdTwo, uri, { from: receiver }),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent setting metadata on non-existing token', async () => {
			const uri = 'www.google.com';
			await expectRevert(
				spartanCouncil.setTokenURI(new BN(100), uri, { from: ownerAddress }),
				'ERC721: token does not exist'
			);
		});
		it('should return the correct balances', async () => {
			assert(await spartanCouncil.balanceOf.call(arbAddress), new BN(0));
			assert(await spartanCouncil.balanceOf.call(receiver), new BN(1));
		});
		it('should return the correct owner', async () => {
			assert(await spartanCouncil.ownerOf.call(tokenIdOne), ownerAddress);
			assert(await spartanCouncil.ownerOf.call(tokenIdTwo), receiver);
		});
		it('should prevent calling on zero address', async () => {
			await expectRevert(
				spartanCouncil.balanceOf.call(constants.ZERO_ADDRESS),
				'Method called with the zero address'
			);
		});
	});
});
