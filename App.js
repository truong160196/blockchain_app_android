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

import AsyncStorage from '@react-native-community/async-storage';
import './globals.js';

const Web3 = require('web3');

const web3 = new Web3(
  new Web3.providers.HttpProvider('https://mainnet.infura.io/'),
);

const {width} = Dimensions.get('screen');

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28bb',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f62',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d71',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28bk',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f6c',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d7m',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28by',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f6y',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d7y',
    date: '2019/12/20',
    title: 'First Item',
    cost: '30$',
  },
];

function Item({ title }) {
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      //variable to hold the qr value
      qrvalue: '',
      address: '',
      opneScanner: false,
    };
  }

  componentDidMount = async() => {
    this.getData();
   }

  storeData = async (value) => {
    try {
      await AsyncStorage.setItem('private_key', value)
      return true;
    } catch (e) {
      console.error('set data', e.message);
      return false;
      // saving error
    }
  }

  getData = async () => {
    try {
      const value = await AsyncStorage.getItem('private_key')
      if(value !== null) {
        console.log('get data', value);
        this.setState({ address: value });
        this.setState({ opneScanner: false });
        return value;
      }
    } catch(e) {
      console.error('get data', e.message);
      return false;
    }
  }

  removeItem = async () => {
    try {
      await AsyncStorage.removeItem('private_key')
      return true;
    } catch(e) {
      console.error('get data', e.message);
      return false;
    }
  }

  onOpenlink() {
    //Function to open URL, If scanned 
    Linking.openURL(this.state.address);
    //Linking used to open the URL in any browser that you have installed
  }

  onBarcodeScan(qrvalue) {
    //called after te successful scanning of QRCode/Barcode
    if (!qrvalue) {
      this.removeItem();
      this.setState({ address: '' });
    } else {
      const dataQR = JSON.parse(qrvalue);

      if (dataQR && dataQR.address) {
        console.log(dataQR.address);
        this.storeData(dataQR.address);
        this.setState({ address: dataQR.address });
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
            that.setState({ address: '' });
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
      that.setState({ address: '' });
      that.setState({ opneScanner: true });
    }    
  }
  componentWillMount() {
    web3.eth.getBlock('latest')
      .then(latestBlock => {
        console.log(latestBlock);
        this.setState({ latestBlock });
      });
  }
  render() {
    let displayModal;
    const {navigate} = this.props.navigation;
    //If qrvalue is set then return this view
    if (!this.state.opneScanner) {
      if (this.state.address) {
        return (
          <View style={{flex : 1}}>
            <LinearGradient
              start={{x: 0.0, y: 0.25}} 
              end={{x: 0.5, y: 1.0}}
              locations={[0,0.5,0.6]}
              colors={['#FFFFFF', '#d7d6d2',  '#d7d6d2']}
              style={styles.linearGradient, {flex: 1}}>
              <View style={{flex : 0.8}}>
                <Text style={{flex: 0.5, textAlign: 'center', paddingTop: 16, fontSize: 16, alignItems: 'center'}}>Name's Customer</Text>
                <Text style={{flex: 1, textAlign: 'center', fontSize: 24, paddingBottom: 16, fontWeight: 'bold'}}>Total Cost</Text>
              </View>
              <View style={{ borderBottomColor: 'black', borderBottomWidth: 0.5,}}/>
              <View style={{flex : 1.5, alignItems: 'center', padding: 16}}>
                <TouchableHighlight
                    // onPress={() => this.onBarcodeScan("")}>
                    onPress={() => this.onOpneScanner()}
                >
                <Image
                  style={{width: width/2, height: width/2}}
                  source={require('./Image/qr.png')}
                />
                </TouchableHighlight>
              </View>
              <View style={{flex : 3}}>
                <View style={styles.container, {flex : 1, paddingTop: 16}}>
                  <Text style={styles.header, {flex: 1, textAlign: 'left', paddingLeft: 16, fontSize: 24}}>History:</Text>
                  <SafeAreaView style={styles.container, {flex: 9, paddingTop: 16,paddingRight: 8, paddingLeft: 8}}>
                    <FlatList
                      data={DATA}
                      renderItem={({item}) => (
                          <View style={{flex: 1, flexDirection: 'row'}}>
                            <View style={{width: 48, height: 48, flex: 1, alignItems: 'center', margin: 4, borderRadius:10, flexDirection: 'row', backgroundColor: 'white'}}>
                              <Text style={{flex: 1,fontSize: 18, textAlign: 'center', paddingLeft: 8}}>{item.date}</Text>
                              <Text style={{flex: 1,fontSize: 18, textAlign: 'center'}}>{item.title}</Text>
                              <Text style={{flex: 1,fontSize: 18, textAlign: 'center', paddingRigt: 8}}>{item.cost}</Text>
                            </View>
                          </View>
                      )}
                      keyExtractor={item => item.id}
                    />
                  </SafeAreaView>
                </View>
              </View>
              <View style={{flex : 0.5, alignItems: 'center', paddingBottom: 16}}>
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
            <Text style={styles.simpleText}>{this.state.address ? 'Scanned QR Code: '+ this.state.address : ''}</Text>
            {this.state.address.includes("http") ? 
              <TouchableHighlight
                onPress={() => this.onOpenlink()}
                style={styles.button}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Open Link</Text>
              </TouchableHighlight>
              : null
            }
            <TouchableHighlight
              onPress={() => this.onOpneScanner()}
              style={styles.button}>
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                Scan Private Key
                </Text>
            </TouchableHighlight>
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