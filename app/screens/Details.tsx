import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, addDoc, query, where } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../services/config";
  
  interface User {
    uid: string;
    name: string;
    email: string;
    authProvider: string;
  }
  
  const Details: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentUserModalVisible, setCurrentUserModalVisible] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "" });
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const fetchCurrentUser = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
    
        const userQuery = query(collection(FIRESTORE_DB, "users"), where("uid", "==", user?.uid));
        const userSnapshot = await getDocs(userQuery);
    
        if (userSnapshot.size > 0) {
          const userData = userSnapshot.docs[0].data() as User;
          setCurrentUser(userData);
        } else {
          console.log("No user document found with matching uid");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    useEffect(() => {
      fetchCurrentUser();
    }, []);
  
    const handleEdit = (id: string) => {
      alert(`Edit user with ID: ${id}`);
    };
  
    const handleDelete = async (id: string) => {
      try {
        await deleteDoc(doc(FIRESTORE_DB, "users", id));
        setUsers(users.filter((user) => user.uid !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    };
  
    const handleAddUser = async () => {
      try {
        const usersCollection = collection(FIRESTORE_DB, "users");
        await addDoc(usersCollection, {
          name: newUser.name,
          email: newUser.email,
        });
        setModalVisible(false);
        setNewUser({ name: "", email: "" });
      } catch (error) {
        console.error("Error adding user:", error);
      }
    };
  
    const renderActionButtons = (id: string) => (
      <View style={styles.actionButtons}>
        <Button title="Edit" onPress={() => handleEdit(id)} />
        <Button title="Delete" onPress={() => handleDelete(id)} color="red" />
      </View>
    );
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>User Details</Text>
        <Button title="Add User" onPress={() => setModalVisible(true)} />
        <Button
          title="View Current User"
          onPress={() => setCurrentUserModalVisible(true)}
        />
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>ID</Text>
          <Text style={styles.headerText}>Name</Text>
          <Text style={styles.headerText}>Email</Text>
          <Text style={styles.headerText}>Auth provider:</Text>
          <Text style={styles.headerText}>Actions</Text>
        </View>
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.cell}>{item.uid}</Text>
              <Text style={styles.cell}>{item.name}</Text>
              <Text style={styles.cell}>{item.email}</Text>
              <Text style={styles.cell}>{item.authProvider}</Text>
              <View style={styles.cell}>{renderActionButtons(item.uid)}</View>
            </View>
          )}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.button} onPress={handleAddUser}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={currentUserModalVisible}
          onRequestClose={() => setCurrentUserModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Current User Details</Text>
              {currentUser ? (
                <>
                  <Text>ID: {currentUser.uid}</Text>
                  <Text>Name: {currentUser.name}</Text>
                  <Text>Email: {currentUser.email}</Text>
                  <Text>Auth provider: {currentUser.authProvider}</Text>
                </>
              ) : (
                <Text>No user logged in</Text>
              )}
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setCurrentUserModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#fff",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      paddingBottom: 8,
      marginBottom: 8,
    },
    headerText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "bold",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    },
    cell: {
      flex: 1,
      fontSize: 14,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
      width: 300,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
    },
    input: {
      width: "100%",
      height: 40,
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    button: {
      backgroundColor: "#2196F3",
      borderRadius: 5,
      padding: 10,
      elevation: 2,
      flex: 1,
      marginHorizontal: 5,
    },
    buttonClose: {
      backgroundColor: "#f44336",
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center",
    },
  });
  
  export default Details;
  