import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function App() {
  const [game, setGame] = useState(new Chess());

  // PLAYER MOVE
  function onPieceDrop(sourceSquare, targetSquare) {
    const gameCopy = new Chess(game.fen());

    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    setGame(gameCopy);
    setTimeout(() => makeAIMove(gameCopy), 300);
    return true;
  }

  // AI EVALUATION
  function evaluateBoard(game) {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
    let score = 0;

    game.board().forEach(row =>
      row.forEach(piece => {
        if (!piece) return;
        score += piece.color === "w"
          ? values[piece.type]
          : -values[piece.type];
      })
    );
    return score;
  }

  // MINIMAX
  function minimax(game, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.isGameOver()) {
      return evaluateBoard(game);
    }

    const moves = game.moves();

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let move of moves) {
        game.move(move);
        const val = minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, val);
        alpha = Math.max(alpha, val);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of moves) {
        game.move(move);
        const val = minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, val);
        beta = Math.min(beta, val);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // AI MOVE
  function makeAIMove(currentGame) {
    const gameCopy = new Chess(currentGame.fen());
    let bestMove = null;
    let bestValue = Infinity;

    gameCopy.moves().forEach(move => {
      gameCopy.move(move);
      const value = minimax(gameCopy, 3, -Infinity, Infinity, true);
      gameCopy.undo();

      if (value < bestValue) {
        bestValue = value;
        bestMove = move;
      }
    });

    if (bestMove) {
      gameCopy.move(bestMove);
      setGame(gameCopy);
    }
  }

  // UNDO
  function undoMove() {
    const gameCopy = new Chess(game.fen());
    gameCopy.undo();
    gameCopy.undo();
    setGame(gameCopy);
  }

  // RESTART
  function restartGame() {
    setGame(new Chess());
  }

  // UI
  return (
    <div style={{ textAlign: "center", padding: "20px" , 
    border: "2px solid #ffffff", borderRadius: "10px", width: "520px", 
    margin: "20px auto" }}>

      <h2>♟️ Chess ♟️</h2>

      <Chessboard
        position={game.fen()}
        onPieceDrop={onPieceDrop}
        boardWidth={480}
      />

      <div style={{ marginTop: 15 }}>
        <button onClick={undoMove} style={{ marginRight: 10 }}>
          Undo
        </button>
        <button onClick={restartGame}>
          Restart
        </button>
      </div>

      <p style={{ marginTop: 10 }}>
        {game.isCheckmate() && "Checkmate!"}
        {game.isDraw() && "Draw!"}
        {game.isCheck() && "Check!"}
      </p>
    </div>
  );
}
