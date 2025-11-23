import { collection, getDocs, query, orderBy, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";
import type { InventoryItem } from "./types";

const INVENTORY_COLLECTION = "inventory";

export const addInventoryItems = async (items: Omit<InventoryItem, 'id'>[]) => {
    const CHUNK_SIZE = 500;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        chunk.forEach((item) => {
            const docRef = doc(collection(db, INVENTORY_COLLECTION));
            batch.set(docRef, item);
        });

        await batch.commit();
    }
};

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
    const q = query(collection(db, INVENTORY_COLLECTION), orderBy("name"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as InventoryItem[];
};

export const clearInventory = async () => {
    const q = query(collection(db, INVENTORY_COLLECTION));
    const querySnapshot = await getDocs(q);
    const CHUNK_SIZE = 500;

    // Create chunks of docs to delete
    const docs = querySnapshot.docs;
    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        const chunk = docs.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        chunk.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    }
};
