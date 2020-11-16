pragma solidity ^0.5.16;

import "openzeppelin-solidity-2.3.0/contracts/introspection/ERC165.sol";
import "openzeppelin-solidity-2.3.0/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity-2.3.0/contracts/token/ERC721/ERC721Metadata.sol";
import "openzeppelin-solidity-2.3.0/contracts/ownership/Ownable.sol";

/**
 * @title ERC721 Non-Fungible Token Standard basic implementation
 * @dev see https://eips.ethereum.org/EIPS/eip-721
 */
contract SpartanCouncil is IERC721, IERC721Metadata, ERC165, Ownable {

    // Event that is emitted when a new SpartanCouncil token is minted
    event Mint(uint256 tokenId, address to);
    // Event that is emitted when an existing SpartanCouncil token is burned
    event Burn(uint256 tokenId);
    // Array of token ids
    uint256[] public tokens;
    // Map between a owner and their token
    mapping (address => uint256) internal tokenOwned;
    // Maps a token to the owner address
    mapping (uint256 => address) internal tokenOwner;
    // Optional mapping for token URIs
    mapping (uint256 => string) private tokenURIs;
    // Token name
    string public name;
    // Token symbol
    string public symbol;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory _name, string memory _symbol) public {
        name = _name;
        symbol = _symbol;
    }

    /**
     * @dev Modifier to check that an address is not the "0" address
     */
    modifier isValidAddress(address to) {
        require(to != address(0), "ERC721: transfer to the zero address");
        _;
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "ERC721: balance query for the zero address");
        return tokenOwned[owner];
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        return tokenOwner[tokenId];
    }

    /**
     * @dev Transfer function to move a specified token to another address, only callable by the Owner.
     */
    function transfer(
        address from,
        address to,
        uint256 tokenId
    ) public isValidAddress(to) onlyOwner {
        require(tokenOwned[to] == 0, "Destination address already owns a token");
        require(from != to, "Cannot transfer token to own wallet");

        tokenOwned[from] = 0;
        tokenOwned[to] = tokenId;

        tokenOwner[tokenId] = to; 

        emit Transfer(from, to, tokenId);
    }


    /**
     * @dev Mint function to mint a new token and assign it to an address
     */
    function mint(address to, uint256 tokenId) public onlyOwner isValidAddress(to) {
        require(tokens[tokenId] == 0, "ERC721: token already minted");

        tokens.push(tokenId);
        tokenOwned[to] = tokenId;
        tokenOwner[tokenId] = to;

        emit Mint(tokenId, to);
    }

    /**
     * @dev Burn function to burn an exisitng token
     */
    function burn(uint256 tokenId) public onlyOwner {
        require(tokens[tokenId] != 0, "ERC721: token does not exist");

        address previousOwner = tokenOwner[tokenId];

        tokenOwned[previousOwner] = 0;
        tokenOwner[tokenId] = address(0);

        tokens[tokenId] = tokens[tokens.length - 1];

        tokens.pop;

        // Clear metadata (if any)
        if (bytes(tokenURIs[tokenId]).length != 0) {
            delete tokenURIs[tokenId];
        }

        emit Burn(tokenId);
    }

    /**
     * @dev Total supply function to retrieve total tokens currently available
     */
    function totalSupply() public view returns (uint256) {
        return tokens.length;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(tokens[tokenId] != 0, "ERC721: token does not exist");

        string memory _tokenURI = tokenURIs[tokenId];

        return _tokenURI;
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(tokens[tokenId] != 0, "ERC721: token does not exist");
        tokenURIs[tokenId] = _tokenURI;
    }

    // Stub functions not implemented to conform to ERC721 standard
    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {}

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {}

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {}

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public {}

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view returns (bool) {}

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view returns (address) {}

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public {}
}
