import React from 'react';
import { db } from '../../db';
import api from "../../axios";


async function SaveOrder() {
    const order = { 'item': 'product one', 'price': 100 };
    if (!navigator.onLine) {
        await db.queue.add({ url: '/orders', method: 'POST', payload: order });
    } else {
        await api.post('/orders', order);
    }
}

window.addEventListener('online', async () => {
    const all = await db.queue.toArray();
    for (const item of all) {
        await api({
            method: item.method,
            url: item.url,
            data: item.payload
        });
        await db.queue.delete(item.id);
    }
});


export default SaveOrder;
