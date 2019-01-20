# ILP Paid API with Bluzelle Integration


## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

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
Use the following steps to connect into bluzelle testnet

```
npm install bluzelle

```



## Deployment

MoneyD should be running in one terminal as described above

In another terminal run the server
```
cd ilp-paidAPI
node index
```
In one more terminal run

```
ilp-curl http://{yourlocalhost}:8080/BTCUSD?volume=1

```
The market (BTCUSD) and volume can be changed to whatever you desire.

## Authors

- **Arun Dass** 
