import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import { GlobalService } from 'src/services/global.service';


function _window(): any {
  return window;
}
declare let window: any;
const providerOptions = {
  rpc: {
    56: "https://bsc-dataseed1.binance.org",
 },
 network: "binance",
 chainId: 56,
};

const provider = new WalletConnectProvider(providerOptions);

@Component({
  selector: 'app-walletconnect',
  templateUrl: './walletconnect.component.html',
  styleUrls: ['./walletconnect.component.scss']
})
export class WalletconnectComponent implements OnInit {

  base_url = location.origin;
  _account: any;
  provider: any;
  signer: any;
  data: any;
  isConnected: boolean = false;
  constructor(public dialogRef: MatDialogRef<WalletconnectComponent>,private cs:GlobalService) { }

  ngOnInit(): void {
  }
 
  
  close(): void {
    this.dialogRef.close();
  }
  get nativeWindow(): any {
    return _window();
  }

  

  async getAccount() {
    return this._account;
  }
  async connectContract() {
    await this.cs.connectContract();
    this.close()
  }


  async connectAccountWalletConnect() {
    await this.cs.connectAccountWalletConnect();
    this.close();
  }

  async getAccountData() {
    await this.cs.getWalletObs().subscribe((data: any) => {
      if (ethers.utils.isAddress(data)) {
        this.isConnected = true;
        this.close();
      } else {
        this.isConnected = false;
      }
      this.data = data;
    });
  }

}
