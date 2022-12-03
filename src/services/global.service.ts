import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ethers } from "ethers";
import Web3 from 'web3';
import { Observable, BehaviorSubject } from 'rxjs';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';


function _window(): any {
  return window;
}



declare let require: any;
declare let window: any;

const stakingBNBAbi = require('./../assets/token.json');
const insuranceAbi = require('./../assets/insurance.json');
const providerOptions = {
  rpc: {
    56: "https://bsc-dataseed1.binance.org",
 },
 network: "binance",
 chainId: 56,
 qrcode: true,
};
//  Create WalletConnect Provider
const provider = new WalletConnectProvider(providerOptions);
provider.networkId = 56;


@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  // public stakingBNBAddress: string = "0x33Fd9153497A967609F7A7C077fcb69ec20Bb730";
  public stakingBNBAddress: string = "0x3E4bFE6536D2674f4e6902Aba70Ac1Ff2C38D89e";
  public owner_address: string = "0x4Bb211C8a971Cc779a2B3Eb9A722aAc3b5E3b8e6";
  public _web3: any;
  stakingContract: any;
  _account: any;
  counter = 1;
  http!: HttpClient;
  provider: any;
  signer: any;

  public walletDetails$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  commonContract: any;

  constructor(private toaster:ToastrService) {

  }

  getWalletObs(): Observable<any> {
    return this.walletDetails$.asObservable();
  }

  setWalletObs(profile: any) {
    this.walletDetails$.next(profile);
  }


  init(): void {
    var web3 = new Web3( 'https://rpc.ankr.com/polygon_mumbai');
     this.commonContract =new web3.eth.Contract(stakingBNBAbi,this.stakingBNBAddress);
    
    // let isConnected = localStorage.getItem('wallet') == "1";
    // if (isConnected) {
      if((localStorage.getItem('wallet') ?? "1")=="1"){
      this.connectContract();
      }
      else if((localStorage.getItem('wallet') ?? "1")=="2")
      {
        this.connectAccountWalletConnect();
      }
    // }
  }

  async connectContract() {
     
    if ((typeof this.nativeWindow.ethereum) !== undefined && (typeof this.nativeWindow.ethereum) != undefined && (typeof this.nativeWindow.ethereum) != 'undefined') {
      await this.nativeWindow.ethereum.enable();
      this.provider = new ethers.providers.Web3Provider(this.nativeWindow.ethereum);

      await this.getAccountAddress();
      localStorage.setItem('wallet', '1');

      this.nativeWindow.ethereum.on("accountsChanged", (accounts: string[]) => {
        this.connectContract();
        location.reload();
      });

      this.nativeWindow.ethereum.on("networkChanged", (code: number, reason: string) => {
        this.connectContract();
        location.reload();
      });
    }
  }


  async connectAccountWalletConnect() {
try{

const provider = new WalletConnectProvider(providerOptions);
provider.networkId = 56;
  await provider.enable();
}    
catch(e)
{
  debugger;
  provider.disconnect();
}
    console.log("wallet connect");

    this.provider = new ethers.providers.Web3Provider(provider);
    await this.getAccountAddress();
    localStorage.setItem('wallet', '2');

      provider.on("accountsChanged",async (accounts: string[]) => {
        location.reload();
      });

      // Subscribe to session disconnection
      provider.on("disconnect", (code: number, reason: string) => {
        location.reload();
      });

      // Subscribe to session disconnection
      provider.on("networkChanged", (code: number, reason: string) => {
        this.connectAccountWalletConnect();
      });

  }

  disconnect()
  {
    localStorage.setItem("wallet","0");

    provider.disconnect();
    location.reload();
  }


  async getAccountAddress() {
    this.signer = this.provider.getSigner();
    this._account = await this.signer.getAddress();
    var network = await this.provider.getNetwork();
    localStorage.setItem('address', this._account);
    localStorage.setItem('chainId',network.chainId);
    if (network.chainId == environment.chainId) {
        this.stakingContract = new ethers.Contract(this.stakingBNBAddress, stakingBNBAbi, this.signer);
    }else{
      this.toaster.warning('You are on wrong network...')
    }
    this.setWalletObs(this._account);
  }

  get nativeWindow(): any {
    return _window();
  }

  async getAccount() {
    return this._account;
  }

  public async getUserBalance() {
    let account = await this.getAccount();
    return account;
  }

  public isValidAddress(address: any) {
    return ethers.utils.isAddress(address);
  }

  getUplineid(route: any): string {
    let url_id = this.owner_address;
    if (route.snapshot.url.length > 1)
      url_id = route.snapshot.url[1].path;


    return url_id;

  }





  public async UserInfo(): Promise<any> {
    return await this.stakingContract.userInfo(this._account);
  }

  public async contractInfo(): Promise<any> {
    return await this.commonContract.contractInfo();
  }


  async getBalanceByAddress(userAddress: string) {
    var balance: any = await this.provider.getBalance(userAddress);
    return balance;
  }


  public async userInfoBankA(userAddress: any): Promise<any> {
    return await this.stakingContract.userInfoBankA(userAddress);
  }

  public async userInfoBankB(userAddress: any): Promise<any> {
    return await this.stakingContract.userInfoBankB(userAddress);
  }

  public async userInfoBankC(userAddress: any): Promise<any> {
    return await this.stakingContract.userInfoBankC(userAddress);
  }

  public async getUserPercentRate(userAddress: any): Promise<any> {
    return await this.stakingContract.getUserPercentRate(userAddress);
  }


  public async getUserDividends(userAddress: any): Promise<any> {
    return await this.stakingContract.getUserDividends(userAddress);
  }
  weitoether(amount: any) {
    return amount / 1000000000000000000;
  }




  public async withdraw(): Promise<any> {
    debugger
   await this.stakingContract.withdraw();
  }

  public async deposit(days: number, upline: any, amount: any) {
    await this.stakingContract.deposit(days, upline, { value: amount });
  }

  public async depositInBusd(days: number, upline: any, amount: any) {
    await this.stakingContract.deposit(days, upline, amount, { value: 0 });
  }




  async  getProjectInfo() {
    return await this.commonContract.methods.getProjectInfo().call();
  }

  async  getUserAvailable(address:any) {
    return await this.stakingContract.getUserAvailable(address);
  }

  async  getUserInfo(address:any) {
    return await this.stakingContract.getUserInfo(address);
  }

  async  getDepositHistory() {
    return await this.commonContract.methods.getDepositHistory().call();
  }

  async  getUserDepositHistory(address:any,_numBack:number) {
    return await this.stakingContract.getUserDepositHistory(address,_numBack);
  }

  async _getUserDividends(address:any)
  {
    return await this.stakingContract._getUserDividends(address);
  }

  async  invest(url_id:any,days:any,value:any) {

    return await this.stakingContract.invest(url_id,days,{value:value});
  }


}
