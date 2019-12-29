/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

//This is an example code to Scan QR code//
import React, { Component } from 'react';
//import react in our code.
import { Text, SafeAreaView, View, FlatList, Linking, Image, TouchableHighlight, PermissionsAndroid, Platform, StyleSheet, Dimensions} from 'react-native';
// import all basic components
import { CameraKitCameraScreen, } from 'react-native-camera-kit';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
//import CameraKitCameraScreen we are going to use.
import LinearGradient from 'react-native-linear-gradient';

const Web3 = require('web3');

import './globals.js';

import { Transaction } from 'ethereumjs-tx';

import AsyncStorage from '@react-native-community/async-storage';

import abi from './contract.json';

const {width} = Dimensions.get('screen');

let DATA = [];

function Item({ title }) {
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const urlBase = 'https://ropsten.infura.io/v3/cde205b23d7d4a998f4ee02f652355b0';
const contractAddress = '0xb527FdE93d1dcC4F192E3eE42B219C0D81789F67';

class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      //variable to hold the qr value
      qrvalue: '',
      username: '',
      address: '',
      private_key: '',
      opneScanner: false,
      balance: 0,
      balanceDonate: 0,
      payment: false,
      order: {
        address: '',
        total: 0,
      }
    };
  }

  componentDidMount = async() => {
    await this.getData();

    await this.connectBlockchain();
   }


  connectBlockchain =  () => {
   try {
      if (!this.web3Provider) {
        const web3Url = new Web3.providers.HttpProvider(urlBase);

        this.web3Provider = new Web3(web3Url);

        const options = {
            gasPrice: 3000000,
        };

        this.contract = new this.web3Provider.eth.Contract(abi, contractAddress, options);

        this.getBalanceDonate();
    }
   } catch (error) {
      console.error(error.message)
      alert('can not connect blockchain network')
    }
  };

  getBalanceDonate = async() => {
    try {
        const address = this.state.address;
        if (!address) {
          alert('can not get balance user')
        } else{
            let balance = await this.contract.methods.balanceOf(address).call();

            const balanceConvert = await this.web3Provider.utils.fromWei(balance, 'wei');
            this.setState({
              balance: this.currencyFormat(balanceConvert),
              balanceDonate: balanceConvert,
            })
        }
    } catch (error) {
      console.error(error.message)
      alert('can not get balance user')
    }
  }

  reloadBalance = () => {
    this.getBalanceDonate();
    alert('Get new data success!!')
  }

  currencyFormat = (num) => {
    if (num) {
      return '$' + parseFloat(num).toFixed(2);
    }
    return 0;
  }

  getGasPrice = async () => {
    return await this.web3Provider.eth.getGasPrice();
  };

  sendTransactionDonate = async(toAddress, amount) => {
      try {
        const validAddress = this.web3Provider.utils.isAddress(toAddress);

        if (validAddress === true) {
            const addressFromLocal = this.state.address;
            const privateKeyLocal = this.state.private_key;

            if (addressFromLocal && privateKeyLocal) {
                const address = addressFromLocal;
                const privateKey = privateKeyLocal.replace('0x','');

                const balanceDonate = this.state.balanceDonate;

                if (amount > balanceDonate) {
                    console.error('have enough balance!!!');
                    alert('You don not have enough balance to cover this transaction')
                    return;
                }

                const gasPrice = await this.getGasPrice();

                const valueSend = await this.web3Provider.utils.toWei(amount.toString(), 'wei');

                this.web3Provider.eth.getTransactionCount(address, (err, txCount) => {
                    const txData = {
                        to: contractAddress,
                        gasPrice: this.web3Provider.utils.toHex(gasPrice),
                        nonce:    this.web3Provider.utils.toHex(txCount),
                    };

                    this.contract.methods.transfer(
                        toAddress,
                        valueSend,
                    ).estimateGas({from: address})
                        .then((gasAmount) => {
                            const dataInput =  this.contract.methods.transfer(
                                toAddress,
                                valueSend,
                            ).encodeABI();

                            txData.gasLimit = this.web3Provider.utils.toHex(gasAmount);
                            txData.data = dataInput;

                            const privateKey1 = Buffer.from(privateKey, 'hex');
            
                            const tx = new Transaction(txData, { chain: 'ropsten', hardfork: 'petersburg' });
      
                            tx.sign(privateKey1)
                          
                            const serializedTx = tx.serialize()
                            const raw = '0x' + serializedTx.toString('hex')

                            this.web3Provider.eth.sendSignedTransaction(raw, (err, txHash) => {
                                if (err) {
                                    console.error(err);
                                    alert('Payment bill error!!!')
                                }

                                DATA = [];

                                alert('Payment bill successfully, please check detail from hash: ' + txHash)

                            });
                        })
                });
            } else {
                alert('Can not get account')
            }
        } else {
          alert('Payment bill error!!!')
        }
    } catch (e) {
      console.error(e.message)
      alert('Payment bill error!!!')
    }
  };

  paymentOrder = async () => {
      const addressOrder = this.state.order.address;
      const amount = this.state.order.total;

      await this.sendTransactionDonate(addressOrder, amount)

      this.setState({
        payment: false,
        order: {
          address: '',
          total: 0,
        }
      })

  }

  storeData = async (data) => {
    try {
      await AsyncStorage.setItem('username', data.username)
      if (data.address) {
        await AsyncStorage.setItem('address', data.address)
      }

      if (data.username) {
        await AsyncStorage.setItem('username', data.username)
      }

      if (data.pk) {
        await AsyncStorage.setItem('private_key', data.pk)
      }
      return true;
    } catch (e) {
      console.error('set data', e.message);
      return false;
      // saving error
    }
  }

  getData = async () => {
    try {
      const username = await AsyncStorage.getItem('username')
      const address = await AsyncStorage.getItem('address')
      const private_key = await AsyncStorage.getItem('private_key')

      if(address && private_key && username) {
        this.setState({ 
           username: username,
           address: address,
           private_key: private_key,
           opneScanner: false
          });
      }
    } catch(e) {
      console.error('get data', e.message);
      return false;
    }
  }

  removeItem = async () => {
    try {
      await AsyncStorage.removeItem('private_key')
      await AsyncStorage.removeItem('address')
      await AsyncStorage.removeItem('username')

      this.setState({
        username: '',
        address: '',
        private_key: '',
      })
      alert('Logout successfully!')
    } catch(e) {
      console.error('remove data', e.message);
      return false;
    }
  }

  onOpenlink() {
    const urlWeb = 'http://localhost:8888/account';
    Linking.openURL(urlWeb);
  }

  onBarcodeScan = async (qrvalue) => {
    //called after te successful scanning of QRCode/Barcode
    if (!qrvalue) {
      this.removeItem();
    } else {
      const dataQR = JSON.parse(qrvalue);

      if (dataQR && dataQR.address && !dataQR.payment) {
        this.storeData(dataQR);
        this.setState({ 
          address: dataQR.address,
          private_key: dataQR.pk,
          username: dataQR.username
        });
      }

      if (dataQR && dataQR.amount && dataQR.payment === true) {
        if (dataQR.amount <= this.state.balanceDonate) {
          // await this.sendTransactionDonate(dataQR.address, dataQR.total);

          const idOrder = new Date().getTime();

          this.setState({
            payment: true,
            order: {
              address: dataQR.address,
              total: dataQR.amount,
              title: dataQR.title,
              idOrder: idOrder
            }
          });

          const timeNow = new Date().toLocaleTimeString('en-US', { hour12: false, 
            hour: "numeric", 
            minute: "numeric"});

          const history =   {
            id: idOrder,
            date: timeNow,
            title: dataQR.title,
            cost: dataQR.amount +'$',
            status: 'confirm'
          };

          DATA.unshift(history);
        } else {
          alert("Your account balance is not sufficient for payment");
        }
      }
    }

    this.setState({ opneScanner: false });
  }

  onOpneScanner() {
    var that =this;
    //To Start Scanning
    if(Platform.OS === 'android'){
      async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,{
              'title': 'CameraExample App Camera Permission',
              'message': 'CameraExample App needs access to your camera '
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //If CAMERA Permission is granted
            that.setState({ opneScanner: true });
          } else {
            alert("CAMERA permission denied");
          }
        } catch (err) {
          alert("Camera permission err",err);
          console.warn(err);
        }
      }
      //Calling the camera permission function
      requestCameraPermission();
    }else{
      that.setState({ opneScanner: true });
    }    
  }

  render() {
    let displayModal;
    const {navigate} = this.props.navigation;
    //If qrvalue is set then return this view
    if (!this.state.opneScanner) {
      if (this.state.address && this.state.private_key) {
        return (
          <View style={{flex : 1}}>
            <LinearGradient
              start={{x: 0.0, y: 0.25}} 
              end={{x: 0.5, y: 1.0}}
              locations={[0,0.5,0.6]}
              colors={['#FFFFFF', '#d7d6d2',  '#d7d6d2']}
              style={styles.linearGradient, {flex: 1}}>
              <View style={{flex : 0.8}}>
                <Text style={{flex: 0.5, textAlign: 'center', paddingTop: 16, fontSize: 16, alignItems: 'center'}}>
                  {this.state.username}
                </Text>
                <Text style={{flex: 1, textAlign: 'center', fontSize: 24, paddingBottom: 16, fontWeight: 'bold'}}>
                  {this.state.balance} USD
                </Text>
              </View>
              <View style={{ borderBottomColor: 'black', borderBottomWidth: 0.5,}}/>
              <View style={{flex : 1.5, alignItems: 'center', padding: 16}}>
              <TouchableHighlight
                  onPress={() => this.onOpneScanner()}
              >
              <Image
                style={{width: width/2, height: width/2}}
                source={require('./Image/qr.png')}
              />
              </TouchableHighlight>
              </View>
              <View style={{flex : 2}}>
              <View style={styles.container, {flex : 2, paddingTop: 16}}>
                <Text style={styles.header, {flex: 1, textAlign: 'left', paddingLeft: 16, fontSize: 24}}>Order Process:</Text>
                <SafeAreaView style={styles.container, {flex: 7, paddingTop: 16,paddingRight: 8, paddingLeft: 8}}>
                  <FlatList
                    data={DATA}
                    renderItem={({item}) => (
                      <TouchableHighlight
                        onPress={() => this.paymentOrder()}
                      >
                        <View style={{flex: 1, flexDirection: 'row'}}>
                          <View style={{width: 48, height: 48, flex: 1, alignItems: 'center', margin: 4, borderRadius:10, flexDirection: 'row', backgroundColor: 'white'}}>
                            <Text style={{flex: 1,fontSize: 18, textAlign: 'center', paddingLeft: 8}}>{item.date}</Text>
                            <Text style={{flex: 1,fontSize: 18, textAlign: 'center'}}>{item.title}</Text>
                            <Text style={{flex: 1,fontSize: 18, textAlign: 'center', paddingRigt: 8}}>{item.cost}</Text>
                            <Text style={{flex: 1,fontSize: 18, textAlign: 'center', paddingRigt: 8}}>{item.status}</Text>
                          </View>
                        </View>
                      </TouchableHighlight>
                    )}
                    keyExtractor={item => item.id}
                  />
                </SafeAreaView>
              </View>
              </View>
              <View style={{flex : 1, alignItems: 'center', paddingBottom: 16}}>
                  <TouchableHighlight
                      onPress={() => this.reloadBalance()}
                      style={styles.button}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                      Reload
                      </Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    onPress={() => this.onBarcodeScan("")}
                    style={styles.button}>
                      <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                      Logout
                      </Text>
                  </TouchableHighlight>
              </View>
              </LinearGradient>
          </View>
        );
      }
      return (
        <View style={styles.container}>
            <Text style={styles.heading}>HOMELESS FUND</Text>
            <Text style={styles.simpleText}>
              {this.state.address ? 'Scanned Accout '+ this.state.username : 
              ''}</Text>
             <TouchableHighlight
              onPress={() => this.onOpenlink()}
              style={styles.button}>
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Login account from web</Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => this.onOpneScanner()}
              style={styles.button}>
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                Scan Private Key
                </Text>
            </TouchableHighlight>
            <Text style={{textAlign: 'center', fontSize: 13}}>
                Please login account from web and scan QRCode
            </Text>
        </View>
      );
    }
    return (
      <View style={{flex : 1}}>
        <View style={{flex : 9}}>
          <CameraKitCameraScreen
            showFrame={false}
            //Show/hide scan frame
            scanBarcode={true}
            //Can restrict for the QR Code only
            laserColor={'blue'}
            //Color can be of your choice
            frameColor={'yellow'}
            //If frame is visible then frame color
            colorForScannerFrame={'black'}
            //Scanner Frame color
            onReadCode={event =>
              this.onBarcodeScan(event.nativeEvent.codeStringValue)
            }
          />
        </View>
        <View style={{flex : 1, alignItems : 'center'}}>
            <TouchableHighlight
              onPress={() => this.onBarcodeScan("")}
              style={styles.button}>
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                Go back
                </Text>
            </TouchableHighlight>
        </View>
      </View>
    );
  }
}

class ProfileScreen extends React.Component {
  render() {
    const {navigate} = this.props.navigation;
    return (
      <View style={{flex : 1}}>
        <View style={{flex : 9}}>
          <CameraKitCameraScreen
            showFrame={false}
            //Show/hide scan frame
            scanBarcode={true}
            //Can restrict for the QR Code only
            laserColor={'blue'}
            //Color can be of your choice
            frameColor={'yellow'}
            //If frame is visible then frame color
            colorForScannerFrame={'black'}
            //Scanner Frame color
            onReadCode={event =>
              this.onBarcodeScan(event.nativeEvent.codeStringValue)
            }
            onPress={() => navigate('Home')}
          />
        </View>
        <View style={{flex : 1, alignItems : 'center'}}>
            <TouchableHighlight
              onPress={() => navigate('Home')}
              style={styles.button}>
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                Go back
                </Text>
            </TouchableHighlight>
        </View>
      </View>
    );
  }
}

class HistoryScreen extends React.Component {
  render() {
    const {navigate} = this.props.navigation;
    return (
      <View style={{flex : 1}}>
        <View style={{flex : 9}}>
          <Image
            style={{width: 50, height: 50}}
            source={require('./Image/qr.png')}
          />
        </View>
        <View style={{flex : 1, alignItems : 'center'}}>
            <TouchableHighlight
              onPress={() => navigate('Home')}
              style={styles.button}>
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                Go back
                </Text>
            </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen,
    navigationOptions : {
      header : null
    }
  },
  Profile: {screen: ProfileScreen, 
    navigationOptions : {
      header : null
    }
  },
  History: {screen: HistoryScreen, 
    navigationOptions : {
      header : null
    }
  },
});

const App = createAppContainer(MainNavigator);

export default App;

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2c3539'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'white'
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2c3539',
    padding: 10,
    width:300,
    marginTop:16
  },
  heading: { 
    color: 'black', 
    fontSize: 24,
    fontWeight: 'bold', 
    alignSelf: 'center', 
    padding: 10, 
    marginTop: 30 
  },
  simpleText: { 
    color: 'black', 
    fontSize: 20, 
    alignSelf: 'center', 
    padding: 10, 
    marginTop: 16
  }
});