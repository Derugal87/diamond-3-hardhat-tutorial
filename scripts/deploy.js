/* global ethers */
/* eslint prefer-const: "off" */

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployDiamond() {
  const accounts = await ethers.getSigners()
  const contractOwner = accounts[0]

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
  const diamondCutFacet = await DiamondCutFacet.deploy()
  await diamondCutFacet.deployed()
  console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond')
  const diamond = await Diamond.deploy(contractOwner.address, diamondCutFacet.address)
  await diamond.deployed()
  console.log('Diamond deployed:', diamond.address)

  return diamond;
}

async function deployA() {
  const Facet = await ethers.getContractFactory("A")
  const facet = await Facet.deploy()
  await facet.deployed()
  console.log(`A deployed: ${facet.address}`)
  return facet;
}

async function deleteA(diamond) {
  const cut = [];
  const facet = await deployA();
  cut.push({
    facetAddress: "0x0000000000000000000000000000000000000000",
    action: FacetCutAction.Remove,
    functionSelectors: getSelectors(facet)
  });

  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond)
  const tx = await diamondCut.diamondCut(cut, "0x0000000000000000000000000000000000000000", [])
  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
  return diamond

}

async function callA() {
  const diamondAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const a = await ethers.getContractAt("IA", diamondAddr);

  console.log("a", await a.getA());
}

//replaceA("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
//deleteA("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
callA();
//deployDiamond().then(addA);

