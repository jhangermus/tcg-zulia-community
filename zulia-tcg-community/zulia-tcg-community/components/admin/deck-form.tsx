import React, { useState } from 'react';

const DeckForm = ({ onSubmit, initialData }) => {
    const [deckName, setDeckName] = useState(initialData ? initialData.name : '');
    const [description, setDescription] = useState(initialData ? initialData.description : '');
    const [cards, setCards] = useState(initialData ? initialData.cards : []);

    const handleCardChange = (index, value) => {
        const updatedCards = [...cards];
        updatedCards[index] = value;
        setCards(updatedCards);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name: deckName, description, cards });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="deckName">Deck Name:</label>
                <input
                    type="text"
                    id="deckName"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div>
                <label>Cards:</label>
                {cards.map((card, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            value={card}
                            onChange={(e) => handleCardChange(index, e.target.value)}
                            placeholder={`Card ${index + 1}`}
                        />
                    </div>
                ))}
                <button type="button" onClick={() => setCards([...cards, ''])}>
                    Add Card
                </button>
            </div>
            <button type="submit">Save Deck</button>
        </form>
    );
};

export default DeckForm;