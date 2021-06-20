import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
} from 'react-native';

import RNSimpleCrypto from 'react-native-simple-crypto';
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';

const pubKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxLAS/00oc/K5H06tmGJw
mTfRJ9UsBKontSw/SPGcLCtvxJSK5LnAajnm6Ce3mz2M7yz2Afz0ZOoF7k7QSWLV
HYxdrP5qVX7rjx0LVL6fXADcz1v0fq60r10Ou2T6+8rUD9er6zxXxpcXAnALsMcd
WlW79FYz7LLcM5AJeFWAjP9Kjn3I7zsUegco0nM6ZNNMB5tcawTxDzH+CH+st1LO
18IodPkXumbn9WF8VlWD55wxw5he5bgyMVTJILjjcCJtivPvDXnYCACSrbsxcM7C
pZR+UE7JMT1MNSyiCJ/2Ppvlw381J5s/zEUKws7prU1Wll0bAKuI69I4/pQtkE5U
At1EKaaeL/eSw1oGOMCXYIwBUeKiHfvER8eaasjcching8yCUggnA4xIgfY6vYv6
rAClWqO4ciscNT2clAsXHvp6JMUzO4oJyPh710vgQjYRsz2M6i8mAJkhBoIe12h6
FENDFWj85UdC87X42lQ3i4fCXEIszUAvxK2Pj8LJ5Vb5Kv5IuZWbB30k5Mzmxp1p
IxiXLLzJTNlKeFnh8wyuZvs6044sFFe5Rkw1uD8zCS6IdbjiBnkNaA8sTtRKWt7D
T18MUxLzJSQEYaULUI3Azp5AbgEem2poQvk0spyoPkqBnxHi5Q+yKLDdL/jsZ8Yp
tEStg0al1AM9DReLQsS2xbkCAwEAAQ==
-----END PUBLIC KEY-----`;

const plainText = {
  cpf: '103.327.004-02',
  expire: 123213123123,
  sub: '1lk1je1203x912i312p[12l3]',
};

const toHex = RNSimpleCrypto.utils.convertArrayBufferToHex;
const toUtf8 = RNSimpleCrypto.utils.convertArrayBufferToUtf8;
const toBase64 = RNSimpleCrypto.utils.convertArrayBufferToBase64;

const App = () => {
  const [currentState, setCurrentState] = useState({
    data: null,
  });

  const runIteration = React.useCallback(async () => {
    const aesKeyBuffer = await RNSimpleCrypto.utils.randomBytes(32);
    const aesIVBuffer = await RNSimpleCrypto.utils.randomBytes(16);
    const cypherBuffer = await RNSimpleCrypto.AES.encrypt(
      RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(JSON.stringify(plainText)),
      aesKeyBuffer,
      aesIVBuffer,
    );
    const aesKeyCypherBase64 = await RNSimpleCrypto.RSA.encrypt(
      toHex(aesKeyBuffer),
      pubKey,
    );

    setCurrentState({
      data: `${aesKeyCypherBase64}|${toBase64(aesIVBuffer)}|${toHex(
        cypherBuffer,
      )}`,
    });
  }, [setCurrentState]);

  React.useEffect(() => {
    runIteration();
    const interval = setInterval(runIteration, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [runIteration]);

  React.useEffect(() => {
    if (!currentState.data) {
      return;
    }

    axios
      .post('http://localhost:3000', {data: currentState.data})
      .then(res => console.log(res.data))
      .catch(() => {});
  }, [currentState.data]);

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {!currentState.data && <Text>Loading...</Text>}
      {currentState.data && <QRCode size={300} value={currentState.data} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
