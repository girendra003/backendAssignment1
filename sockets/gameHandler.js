const games = {}; // { gameId: { players: [socket1, socket2], turn: 0 } }

module.exports = function(io, socket) {
  socket.on('join_game', (gameId) => {
    if (!games[gameId]) games[gameId] = { players: [], turn: 0 };

    const game = games[gameId];

    if (game.players.length >= 2) {
      socket.emit('full_game');
      return;
    }

    game.players.push(socket);
    const playerNum = game.players.length;
    socket.emit('joined', { player: playerNum });

    if (game.players.length === 2) {
      game.players.forEach((s, index) => {
        s.emit('start_game', {
          yourTurn: index === game.turn,
          symbol: index === 0 ? 'O' : 'X'
        });
      });
    }

    socket.on('make_move', ({ gameId, move }) => {
      const game = games[gameId];
      if (!game || game.players.length < 2) return;
      if (game.players[game.turn].id !== socket.id) return;

      const nextTurn = (game.turn + 1) % 2;
      game.turn = nextTurn;

      game.players.forEach((s, index) => {
        s.emit('move_made', {
          move,
          from: socket.id,
          yourTurn: index === nextTurn
        });
      });
    });

    socket.on('disconnect', () => {
      if (!games[gameId]) return;
      game.players = game.players.filter(s => s.id !== socket.id);
      if (game.players.length === 0) delete games[gameId];
    });
  });
};
