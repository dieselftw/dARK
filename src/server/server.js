const Hyperswarm = require('hyperswarm');
const crypto = require('crypto');

class Server {
    constructor() {
        this.swarm = new Hyperswarm();
        this.connections = new Set();
    }

    async run() {
        try {
            this.swarm.on('connection', (connection, info) => {
                console.log('New peer connected:', info.publicKey.toString('hex'));
                
                this.connections.add(connection);

                connection.on('data', (data) => {
                    console.log('Received data:', data.toString());
                });

                connection.on('close', () => {
                    console.log('Peer disconnected:', info.publicKey.toString('hex'));
                    this.connections.delete(connection);
                });

                connection.on('error', (err) => {
                    console.error('Connection error:', err);
                    this.connections.delete(connection);
                });
            });

            console.log('Server is running');
        } catch (error) {
            console.error('Error running server:', error);
            throw error;
        }
    }

    async join(topic) {
        try {
            await this.swarm.join(topic);
            console.log('Joined topic:', topic.toString('hex'));
        } catch (error) {
            console.error('Error joining topic:', error);
            throw error;
        }
    }

    async leave(topic) {
        try {
            await this.swarm.leave(topic);
            console.log('Left topic:', topic.toString('hex'));
        } catch (error) {
            console.error('Error leaving topic:', error);
            throw error;
        }
    }

    async destroy() {
        try {
            // Close all connections
            for (const connection of this.connections) {
                connection.end();
            }
            await this.swarm.destroy();
            console.log('Server destroyed');
        } catch (error) {
            console.error('Error destroying server:', error);
            throw error;
        }
    }

    // Method to broadcast message to all connections
    broadcast(message) {
        for (const connection of this.connections) {
            connection.write(message);
        }
    }

    // Get number of active connections
    getConnectionCount() {
        return this.connections.size;
    }
}

module.exports = Server;
