import React from 'react';

const HomePage = () => {
    return (
        <div>
            <header>
                <h1>Welcome to Zulia TCG Community</h1>
                <p>Your hub for all things TCG!</p>
            </header>
            <main>
                <section>
                    <h2>Latest News</h2>
                    {/* Add latest news components here */}
                </section>
                <section>
                    <h2>Upcoming Tournaments</h2>
                    {/* Add upcoming tournaments components here */}
                </section>
                <section>
                    <h2>Top Decks</h2>
                    {/* Add top decks components here */}
                </section>
            </main>
            <footer>
                <p>&copy; {new Date().getFullYear()} Zulia TCG Community</p>
            </footer>
        </div>
    );
};

export default HomePage;