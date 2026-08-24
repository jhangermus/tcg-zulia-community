import React from 'react';
import DeckForm from '../../../components/admin/deck-form';
import { getSession } from 'next-auth/react';

const DecksPage = () => {
    return (
        <div>
            <h1>Manage Decks</h1>
            <DeckForm />
        </div>
    );
};

export const getServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
};

export default DecksPage;