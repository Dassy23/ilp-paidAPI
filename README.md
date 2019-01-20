# ILP Paid API with Bluzelle Integration


## Getting Started

Micropayment service that provides arbitrage opportunities across 10 cryptocurrency exchanges. API can be paid in XRP or ETH depending on with account you initialize your ILP router with.

### Prerequisites
```
Node.js
```
Use the following steps to get ILP configured locally

```
npm install -g moneyd 
npm install moneyd-uplink-xrp
npm install -g ilp-curl
moneyd xrp:configure --testnet
or
npm install moneyd-uplink-eth
moneyd eth:configure --testnet


```
Next run an instance of moneyd to allow access to the ILP

```
moneyd xrp:start --testnet
or 
moneyd eth:start --testnet

```
Install the bluzelle lib

```
npm install bluzelle

```

## Deployment

Moneyd should be running in one terminal as described above

In another terminal run the server
```
git clone https://github.com/Dassy23/ilp-paidAPI
cd ilp-paidAPI
node index
```
In another terminal run

```
ilp-curl http://{yourlocalhost}:8080/BTCUSD?volume=1

```
The market (BTCUSD) and volume can be changed to whatever you desire.

## Authors

- **Arun Dass** 
