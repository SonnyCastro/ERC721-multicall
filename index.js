const Web3 = require("web3")
const ERC721ABI = require("./ABIs/ERC721.json")
const MULTICALL_ABI = require("./ABIs/MulticallABI.json")

;(async () => {
  const web3 = new Web3(
    "https://rinkeby.infura.io/v3/858f183c2d0b4483bc6c44cfbd9883bf"
  )

  const tokenIds = Array(15)
    .fill(null)
    .map((_, index) => index)

  // address of ERC721 NFT
  const nftAddress = "0xA31F5fE1ba5Ed36EefE20FAD40B2359eA90b1918"

  // interact with contract
  const nftContract = new web3.eth.Contract(ERC721ABI.abi, nftAddress)

  // ----------------------------------------------------------------------------------
  // multicall
  // ----------------------------------------------------------------------------------

  // address of multicall contract
  const multicallAddress = "0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821" //  Rinkeby
  // multicall abi to interact with contract

  // interact with multicall contract
  const multicallContract = new web3.eth.Contract(
    MULTICALL_ABI,
    multicallAddress
  )

  // provide args to multicall contract.
  // this will allow multicall to know who who and what to call
  const multicallArgs = tokenIds.map((tokenid) => ({
    target: nftAddress,
    callData: nftContract.methods["ownerOf"](tokenid).encodeABI(),
  }))

  // call
  const ownerOfs = await multicallContract.methods["aggregate"](
    multicallArgs
  ).call()

  function removeDuplicates(data) {
    return data.reduce(
      (acc, curr) => (acc.includes(curr) ? acc : [...acc, curr]),
      []
    )
  }

  const owners = []

  ownerOfs.returnData.forEach((_, index) => {
    // console.log(index)
    owners.push(
      web3.eth.abi.decodeParameter("address", ownerOfs.returnData[index])
    )
    // console.log(
    //   web3.eth.abi.decodeParameter("address", ownerOfs.returnData[index])
    // )
  })

  console.log("Unique Addresses:", removeDuplicates(owners))
})()
