import React, { useState } from "react";
import { View, StyleSheet, TextInput, Button, KeyboardAvoidingView, Alert } from "react-native";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { setDoc, doc, addDoc, collection } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../services/config";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signUp = async () => {
        setLoading(true);
        try {
            if (password !== confirmPassword) {
              throw new Error("Passwords do not match");
            }
        
            const { user } = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            console.log('User registered', user);
        
            await sendEmailVerification(user);
            console.log('Verification email sent');
        
            await setDoc(doc(FIRESTORE_DB, "users", user.uid), {
              uid: user.uid,
              name: name,
              authProvider: "email/password",
              availableTokens: 10,
              email: email,
              imgUrl: '',
            });
            await addDoc(collection(FIRESTORE_DB, "logs"), {
                user: user.uid,
                client: "chrome",
                action: "signed in",
                created: new Date(),
            });
            console.log('User details saved to Firestore');
        
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        
            Alert.alert('Registration Successful', 'You have successfully registered. Please check your email for verification.');
        
          } catch (error) {
            console.error("Error registering user:", error);
            Alert.alert('Registration Error', 'Failed to register user. Please try again.');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>
                <TextInput
                    style={styles.input}
                    value={name}
                    placeholder="Name"
                    onChangeText={(text) => setName(text)}
                />
                <TextInput
                    style={styles.input}
                    value={email}
                    placeholder="Email"
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput
                    style={styles.input}
                    value={password}
                    placeholder="Password"
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    placeholder="Confirm Password"
                    onChangeText={(text) => setConfirmPassword(text)}
                    secureTextEntry
                />
                <Button title="Register" onPress={signUp} disabled={loading} />
            </KeyboardAvoidingView>
        </View>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 20,
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
    },
});
