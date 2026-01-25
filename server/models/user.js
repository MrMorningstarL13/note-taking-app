const db = require('../db');
const userCollection = db.collection('users');

const findById = async (id) => {
    const userDoc = await userCollection.doc(id).get();

    if (!userDoc.exists)
        return null;

    return {
        id: userDoc.id,
        ...userDoc.data()
    };
}

const findByEmail = async (email) => {
    const usersSnapshot = await userCollection.where('email', '==', email).get();

    if (usersSnapshot.empty)
        return null;

    const userDoc = usersSnapshot.docs[0]
    const user = {
        id: userDoc.id,
        ...userDoc.data()
    }

    return user;
}

const create = async (userData) => {
    const docRef = await userCollection.add(userData);
    return {
        id: docRef.id,
        ...userData
    };
}

const update = async (userId, updateData) => {
    await userCollection.doc(userId).update(updateData);
    const updatedDoc = await userCollection.doc(userId).get();
    return {
        id: updatedDoc.id,
        ...updatedDoc.data()
    };
}

module.exports = {
    findById,
    findByEmail,
    create,
    update
}