import React, { useState } from "react";
import { View, StyleSheet, TextInput, Button, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "@firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../services/config";
import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const Login = ({ navigation }: RouterProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const signInWithEmail = async () => {
        try {
            setLoading(true);
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            console.log('Logged in with email/password:', user);
            await addDoc(collection(FIRESTORE_DB, "logs"), {
                user: user.uid,
                client: "chrome",
                action: "logged in with email/password",
                created: new Date(),
            });
        } catch (error) {
            console.error('Error signing in with email/password:', error);
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const { user }= await signInWithPopup(auth, provider);
            const q = query(collection(FIRESTORE_DB, "users"), where("uid", "==", user.uid));
            const { docs } = await getDocs(q);
            if (docs.length === 0) {
                await setDoc(doc(FIRESTORE_DB, "users", user.uid), {
                    uid: user.uid,
                    name: user.displayName,
                    authProvider: "google",
                    availableTokens: 10,
                    email: user.email,
                    imgURL: user.photoURL,
                });
            }
            await addDoc(collection(FIRESTORE_DB, "logs"), {
                user: user.uid,
                client: "chrome",
                action: "logged in with google",
                created: new Date(),
            });
            console.log('Logged in with Google:', user);
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>
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
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                />

                {loading ? (
                    <ActivityIndicator size={'large'} color={'blue'} />
                ) : (
                    <>
                        <Button title="Sign in with Email" onPress={signInWithEmail} />
                        <Button title="Sign in with Google" onPress={signInWithGoogle} />
                        <Button title="Sign up" onPress={() => navigation.navigate('Register')} />
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

export default Login;

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
