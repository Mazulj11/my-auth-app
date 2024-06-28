import React from 'react';
import { View, Text, Button } from 'react-native';
import { sendEmailVerification } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../services/config';

const VerifyEmail = () => {
    const sendVerificationEmail = async () => {
        try {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                await sendEmailVerification(user);
            }
            console.log('Verification email sent.');
        } catch (error) {
            console.error('Error sending verification email:', error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Your email is not verified. Please check your email for verification link.</Text>
            <br />
            <Button title="Resend Verification Email" onPress={sendVerificationEmail} />
        </View>
    );
};

export default VerifyEmail;
