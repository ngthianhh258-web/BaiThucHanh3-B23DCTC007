import { BrowserProvider, Contract, parseEther, formatEther, getAddress } from "ethers";import ABI from "../abi/DominionDAO.json";

export const CONTRACT_ADDRESS_DEFAULT = "0xDeE0885DBB51bd7b15F73C35c820bF1B8E9137A3";

export async function getProvider() {
  if (!window.ethereum) throw new Error("Vui lòng cài MetaMask");
  return new BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = await getProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export function getContract(address, signerOrProvider) {
  return new Contract(getAddress(address), ABI.abi ?? ABI, signerOrProvider);
}

export async function contribute(address, amountEth) {
  const signer = await getSigner();
  const c = getContract(address, signer);
  const tx = await c.contribute({ value: parseEther(amountEth) });
  return tx.wait();
}

export async function createProposal(address, title, desc, beneficiary, amountEth) {
  const signer = await getSigner();
  const c = getContract(address, signer);
  const tx = await c.createProposal(title, desc, beneficiary, parseEther(amountEth));
  return tx.wait();
}

export async function vote(address, id, support) {
  const signer = await getSigner();
  const c = getContract(address, signer);
  const tx = await c.performVote(id, support);
  return tx.wait();
}

export async function pay(address, id) {
  const signer = await getSigner();
  const c = getContract(address, signer);
  const tx = await c.payBeneficiary(id);
  return tx.wait();
}

export async function loadData(address, account) {
  const provider = await getProvider();
  const c = getContract(address, provider);
  const [daoBalance, myContribution, isSh, count] = await Promise.all([
    c.daoBalance(),
    account ? c.contributions(account) : Promise.resolve(0n),
    account ? c.isStakeholder(account) : Promise.resolve(false),
    c.proposalCount(),
  ]);
  const proposals = [];
  for (let i = 1; i <= Number(count); i++) {
    const p = await c.proposals(i);
    const voted = account ? await c.hasVoted(i, account) : false;
    proposals.push({
      id: Number(p.id),
      title: p.title,
      description: p.description,
      beneficiary: p.beneficiary,
      amount: formatEther(p.amount),
      upvotes: Number(p.upvotes),
      downvotes: Number(p.downvotes),
      paid: p.paid,
      proposer: p.proposer,
      deadline: Number(p.deadline),
      voted,
    });
  }
  return {
    daoBalance: formatEther(daoBalance),
    myContribution: formatEther(myContribution),
    isStakeholder: isSh,
    proposals,
  };
}