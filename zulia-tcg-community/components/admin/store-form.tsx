import React, { useState } from 'react';

const StoreForm = () => {
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemImage, setItemImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here, such as sending data to the API
        console.log({
            itemName,
            itemPrice,
            itemDescription,
            itemImage,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="itemName">Item Name:</label>
                <input
                    type="text"
                    id="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="itemPrice">Item Price:</label>
                <input
                    type="number"
                    id="itemPrice"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="itemDescription">Item Description:</label>
                <textarea
                    id="itemDescription"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="itemImage">Item Image:</label>
                <input
                    type="file"
                    id="itemImage"
                    onChange={(e) => setItemImage(e.target.files[0])}
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default StoreForm;