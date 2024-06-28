import { View, Text, Button, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationProp } from "@react-navigation/native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../services/config";
import VerifyEmail from "./VerifyEmail"; 
import { collection, getDocs, query, where } from "firebase/firestore";

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const List = ({ navigation }: RouterProps) => {
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [amountPurchase, setAmountPurchase] = useState(0);
    const [amountExpense, setAmountExpense] = useState(0);
    const [currentUserTokens, setCurrentUserTokens] = useState(0);

    useEffect(() => {
        const checkEmailVerification = async () => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                setIsEmailVerified(user.emailVerified);
                setIsLoading(false);
            }
        };

        checkEmailVerification();
        getAvailableTokens();
    }, []);

    const sendTokenToBackend = async () => {
        try {
            const user = FIREBASE_AUTH.currentUser;
            const token = await user?.getIdToken();
          
            const response = await fetch('https://127.0.0.1:8000/verify-token', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
        
            console.log(await response.json());   
        } catch (error) {
            console.error("Error verifying token:", error);
        }
    };

    const getAvailableTokens = async () => {
        try {
            const user = FIREBASE_AUTH.currentUser;
        
            const userQuery = query(collection(FIRESTORE_DB, "users"), where("uid", "==", user?.uid));
            const userSnapshot = await getDocs(userQuery);
        
            if (userSnapshot.size > 0) {
              const userData = userSnapshot.docs[0].data();
              setCurrentUserTokens(userData.availableTokens);
            } else {
              console.log("No user document found with matching uid");
            }
          } catch (error) {
            console.error("Error fetching current user:", error);
          }
    }

    const addPurchase = async () => {
        const user = FIREBASE_AUTH.currentUser;
        const token = await user?.getIdToken();
    
        await fetch('https://127.0.0.1:8000/add-purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                payment_method: "card",
                purchase_date: new Date(),
                token_amount: amountPurchase,
                user_id: user?.uid
            })
        });
    
        getAvailableTokens();
    };

    const addExpense = async () => {
        const user = FIREBASE_AUTH.currentUser;
        const token = await user?.getIdToken();

        await fetch('https://127.0.0.1:8000/add-expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                expense_date: new Date(),
                image_id: "img_123",
                token_amount: amountExpense,
                user_id: user?.uid
            })
        });

        getAvailableTokens()
    };

    const handleSignOut = async () => {
        try {
            await FIREBASE_AUTH.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!isEmailVerified) {
        return <VerifyEmail />;
    }

    return (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ marginBottom: 15 }}>
                    <Button title="Verify token" onPress={sendTokenToBackend} />
                </View>
                <View style={{ marginBottom: 15 }}>
                    <Button title="Go to Details" onPress={() => navigation.navigate('Details')} />
                </View>
                <View style={{ marginBottom: 15 }}>
                    <Button title="Sign out" onPress={handleSignOut} />
                </View>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                        onChangeText={text => setAmountPurchase(Number(text))}
                        keyboardType="numeric"
                        placeholder="Enter amount"
                    />
                    <Button title="Add purchase" onPress={addPurchase} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                        onChangeText={text => setAmountExpense(Number(text))}
                        keyboardType="numeric"
                        placeholder="Enter amount"
                    />
                    <Button title="Add expense" onPress={addExpense} />
                </View>
                <Text style={{ fontSize: 20 }}>Current user tokens: <strong>{currentUserTokens}</strong></Text>
            </View>
        </View>
    );
};

export default List;
