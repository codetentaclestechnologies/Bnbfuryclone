import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ethers } from 'ethers';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from 'src/services/global.service';
import { Options } from '@angular-slider/ngx-slider';
import { WalletconnectComponent } from '../walletconnect/walletconnect.component';


type NewType = MatDialog;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  hidestar: boolean = false;
  value: number = 20;
  options: Options = {
    floor: 7,
    ceil: 30
  };
  contractaddress: any;
  url_id: string = '';
  account: any;
  erroroccured: boolean = false;
  emptyamount: boolean = true;
  isConnected: boolean = false;
  playerdetails: any;
  availableToWithdraw: any;
  userBalance: any;
  contractInfo: any;
  isBusd: any = false;
  base_url = location.origin;
  currency = 'BNB';
  getProjectInfo: any;
  getUserAvailable: any;
  getUserInfo: any;
  depositHistory: boolean = false;
  getDepositHistory: any;
  getUserDepositHistory: any;
  investment: any = 0;
  holdBonus: number = 20;
  profit: any = [];
  bnbamount: any;
  timer: any = {};
  milliSecondsInASecond = 1000;
  hoursInADay = 24;
  minutesInAnHour = 60;
  SecondsInAMinute = 60;

  erroroccuredaccount: boolean = true;
  plans: any = [20.00,18.75,17.77,17.00,16.36,15.83,15.38,15.00,14.66,14.37,14.11,13.88,13.68,13.50,13.33,13.18,13.04,12.91,12.80,12.69,12.59,12.50,12.41,12.33];
  totalprofit: number = 0;
  bnbPriceInUsd = 0;
  userHistory: any;
  display: Array<{ timestamp: string, duration: number, amount: number }> = [];
  userHistoryDisplay: Array<{ timestamp: string, duration: number, amount: number }> = [];
  o_deposits: any;
  starting_day: number=0;
  hrs_day: number=0;
  min_day: number=0;
  sec_day: number=0;
  hidecount: boolean=false;




  constructor(
    public cs: GlobalService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private httpClient: HttpClient
  ) { }


  ngOnInit(): void {
    this.countdown(1647961228);
    setTimeout(() => {
      this.hidestar = false;
    }, 5000);
    this.getaccount();
    let that: any = this;
    window.addEventListener(
      'message',
      function (e: any) {
        if (e.data.message && e.data.message.action == 'setAccount') {
          if (that.account != e.data.message.data.address) {
            that.account = e.data.message.data.address;
            that.getaccount();
            that.emptyamount = false;
            that.erroroccured = false;
            that.erroroccuredaccount = false;
          }
        }
      }.bind(this)
    );
    this.value = 20;
    this.url_id = this.cs.getUplineid(this.route);
    this.changeSlider();
    this.getPriceForBNB();
  }

  setValue(event: any) {
    this.investment = event.target.value;
    this.changeSlider()
  }

  changeSlider() {
    let days = this.value;
    this.holdBonus = (this.plans[(days - 7)]);
    this.totalprofit = this.plans[(days - 7)]*days;
    this.profit = (this.investment * (this.holdBonus / 100)) * days;
  }

  async getaccount() {
    try {
      this.cs.init();
      this.commonData();
      let that = this;
      setInterval(function () {
        that.commonData();
      }, 5000);
      this.cs.getWalletObs().subscribe((data: any) => {
        if (this.cs.isValidAddress(data)) {
          this.account = data;
          this.isConnected = true;
          
          setInterval(function () {
            that.loadData();
          }, 5000);

          this.loadData();
        } else {
          this.isConnected = false;
        }
      });
    } catch (e) {
      this.isConnected = false;
    }
  }

  async connect() {
    // if(walletType==1)
    // this.cs.connectToWallet();
    // else
    // this.cs.connectToWalletConnect();
    // let dialogRef = this.dialog.open(ConnectWalletComponent, {
    //   height: '320px',
    //   width: '340px',
    //   panelClass: 'custom-modalbox',
    // });
    this.cs.connectContract();
  }

  async commonData()
  {

    this.getProjectInfo = await this.cs.getProjectInfo();
    this.getDepositHistoryData();
  }

  async loadData() {
    this.isConnected = true;

    this.getUserAvailable = await this.cs.getUserAvailable(this.account);
    this.getUserInfo = await this.cs.getUserInfo(this.account);

    this.cs.getBalanceByAddress(this.account).then((balance: any) => (this.userBalance = balance));
  }

  async withdrawAmount() {
    try {
      await this.cs.withdraw();
    } catch (e: any) {
      this.toastr.error(e.data.message);
    }
  }

  async history() {
    this.depositHistory = true;
    this.getUserDepositHistory = await this.cs.getUserDepositHistory(this.account, 1);
    this.o_deposits = this.getUserDepositHistory.o_deposits.filter(function(hero:any) {
      console.log(hero.amount)
      return hero.amount>0;
    });
    // this.userHistoryDisplay = [];
    // var data = this.getDepositHistory.o_historyDeposits.length - 1;
    // for (let i = data; i >= 0; i--) {
    // }

  }

  async getDepositHistoryData() {
    this.getDepositHistory = await this.cs.getDepositHistory();
    this.display = [];
    var data = this.getDepositHistory.o_historyDeposits.length - 1;
    for (let i = data; i >= 0; i--) {
      if (this.getDepositHistory.o_historyDeposits[i].timestamp > 0) {
        var date1 = new Date(parseInt(this.getDepositHistory.o_timestamp) * 1000);
        var date2 = new Date(parseInt(this.getDepositHistory.o_historyDeposits[i].timestamp) * 1000);
        var Time = Math.ceil(((date1.getTime() - date2.getTime()) / 1000) / 60);
        var sendTime=Time+" Min";
        if (Time > 60) {
          Time = Math.ceil((((date1.getTime() - date2.getTime()) / 1000) / 60) / 60);
          sendTime=Time+" Hr";
          if (Time > 60) {
            Time = Math.ceil(((((date1.getTime() - date2.getTime()) / 1000) / 60) / 60) / 60);
            sendTime=Time+" D";
          }
        }
        this.display.push({ timestamp: sendTime.toString(), duration: (this.getDepositHistory.o_historyDeposits[i].duration/86400), amount: (this.getDepositHistory.o_historyDeposits[i].amount) / 1e18 });
      }
    }
    // this.userHistory = await this.cs.getUserDepositHistory(this.account, 1);
  }


  async setContractType(type: number) {
    localStorage.setItem('type', type.toString());
    location.reload();
  }

  copyInputMessage(inputElement: any) {
    debugger
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.toastr.success('Copied!');
  }

  async makeNewDeposit(amt: any) {
    try {
      var amount = ethers.utils.parseEther(amt);
      await this.cs.invest(this.url_id, this.value - 7, amount);
    } catch (e: any) {
      if(e.data!=undefined)
      this.toastr.error(e.data.message);
      else
      this.toastr.error(e.error.message);

    }
    return true;
  }

  getPriceForBNB() {
    return this.httpClient.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=USD').subscribe((response: any) => {
      this.bnbPriceInUsd = response.binancecoin.usd;
    })
  }
  
  async walletConnect(): Promise<void> {
    await this.cs.connectContract();
  }

  disconnect()
  {
    this.cs.disconnect();
  }

  private countdown(time: any) {

    try {
      setInterval(() => {
        let timeDifference = time * 1000 - new Date().getTime();
        if (timeDifference > 0) {
          let secondsToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond) % this.SecondsInAMinute);
          let minutesToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond * this.minutesInAnHour) % this.SecondsInAMinute);
          let hoursToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond * this.minutesInAnHour * this.SecondsInAMinute) % this.hoursInADay);
          let daysToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond * this.minutesInAnHour * this.SecondsInAMinute * this.hoursInADay));
          this.starting_day = daysToDday;
          this.hrs_day = hoursToDday;
          this.min_day = minutesToDday;
          this.sec_day = secondsToDday;
        }
        else {
          this.hidecount = true;
        }
      },
        1000)
    }
    catch (e) {
      console.log(e)
    }
  }
  
}
