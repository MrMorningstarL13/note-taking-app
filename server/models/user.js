const db = require('../db');
const userCollection = db.collection('users');

const getAll = async () => {
    const usersSnapshot = await userCollection.get();

    if(usersSnapshot.empty) {
        return null;
    }

    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

const findByEmail = async(email) => {
    const usersSnapshot = await userCollection.where('email', '==', email).get();

    if(usersSnapshot.empty)
        return null;

    const userDoc = usersSnapshot.docs[0]
    const user = {
        id: userDoc.id,
        ...userDoc.data()
    }

    return user;
}

const create = async(userData) => {
    const docRef = await userCollection.add(userData);
    return {
        id: docRef.id,
        ...userData
    };
}

const update = async(userId, updateData) => {
    await userCollection.doc(userId).update(updateData);
    const updatedDoc = await userCollection.doc(userId).get();
    return {
        id: updatedDoc.id,
        ...updatedDoc.data()
    };
}

module.exports = {
    getAll,
    findByEmail,
    create,
    update
}